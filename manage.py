#!/usr/bin/env python

from __future__ import print_function
import os
import re
import sys
import mutagen
from flask.ext.script import Manager
from models import Track, Album, db
from potsfyi import app


manager = Manager(app)

HANDLED_FILETYPES = ('.ogg', '.mp3', '.flac', '.m4a')


def track_num_to_int(track_num_str):
    """ Convert a track number tag value to an int.
        This function exists because the track number may be
        something like 01/12, i.e. first of 12 tracks,
        so we need to strip off the / and everything after.
        If the string can't be parsed as a number, -1 is returned. """

    if track_num_str == '':
        return -1

    if '/' in track_num_str:
        track_num_str = re.sub('(/(.*)$)', '', track_num_str)

    try:
        track_num = int(track_num_str)
    except ValueError:
        track_num = -1

    return track_num


def multi_get_first(tag_dict, tags, default=''):
    """ Get first defined tag out of the list in tags.
        Example usage: tags=['track', 'tracknumber', 'track_number']
        To cope with Mutagen's data structures,
        tag_dict is assumed to be a dictionary of arrays,
        with only the first element of each array used. """

    # Allow just one tag to be passed instead of a list.
    if isinstance(tags, str):
        tags = [tags]

    for tag in tags:
        if tag in tag_dict and len(tag_dict[tag]) >= 1:
            return tag_dict[tag][0]

    return default


class MetadataError(Exception):
    ''' raised from aggregate_metadata in the case of
        failed metadata extraction '''
    #TODO give information with this exception rather than prints
    pass


def get_or_create(session, model, **kwargs):
    ''' return the object or make it if it doesn't exist
        filters only by artist and title at the moment
    '''

    instance = session.query(model).filter_by(artist=kwargs['artist'],
                                              title=kwargs['title']).first()
    if instance:
        return (instance, False)
    else:
        instance = model(**kwargs)
        session.add(instance)
        return (instance, True)


def aggregate_metadata(full_filename, music_dir, cover_art):
    ''' take a full path to a file and the directory containing it
        return Track and Album objects
    '''
    #TODO possibly move verbose prints from other methods into this
    mtime = os.path.getmtime(full_filename)
    relative_filename = os.path.relpath(full_filename, music_dir)
    try:
        tag_info = mutagen.File(full_filename, easy=True)
        if tag_info is None:
            raise Exception('Mutagen could not open file')
    except:
        print(u'Skipping {0} due to error: {1}'.format(
                relative_filename,
                sys.exc_info()[0]))
        raise MetadataError

    tags = tag_info.tags
    if tags is None:
        print(u'Skipping {0}: no tags!'.format(relative_filename))
        raise MetadataError

    artist = multi_get_first(tags, 'artist')
    title = multi_get_first(tags, 'title')
    if artist == '' or title == '':
        print(u'Skipping {0}: empty artist or title tag'
                .format(relative_filename))
        raise MetadataError

    track_num = track_num_to_int(
        multi_get_first(tags, ['track', 'tracknumber'], '-1')
    )
    album_title = multi_get_first(tags, 'album')
    album_artist = multi_get_first(tags,
            ['album artist', 'album_artist', 'albumartist',
                'artist'])
    release_date = multi_get_first(tags, ['date', 'year'])
    album, new = get_or_create(db.session, Album,
                               artist=album_artist,
                               title=album_title,
                               date=release_date,
                               cover_art=cover_art)
    #TODO do this the sqlalchemy way, if that exists
    if new:
        db.session.commit()
    track = Track(
                artist=artist,
                title=title,
                filename=relative_filename,
                album=album,
                track_num=track_num,
                mtime=mtime)
    return track, album


def get_cover_art(music_dir, path, file_list):
    ''' return path to cover art '''
    # See if there is cover art in this directory.
    # If so, apply it to any albums found in the dir.
    # XXX: does not correctly trickle down to 'CD1', 'CD2' subdirs
    cover_art = None
    for testfilename in ['folder.jpg', 'folder.png', 'folder.gif',
                            'cover.jpg', 'cover.png', 'cover.gif']:
        if testfilename in file_list:

            cover_art = os.path.relpath(os.path.join(path, testfilename),
                                        music_dir)
    return cover_art


@manager.command
def createdb(verbose=False):
    '''  initial creation of the tracks database '''
    try:
        if Track.query.all():
            print('db already exists. Try using the update command.')
            return
    except:
        db.create_all()

    populate_db(unicode(app.config['MUSIC_DIR']), verbose)


def populate_db(music_dir, verbose=False):
    for path, dirs, files in os.walk(music_dir, followlinks=True):
        # get cover art
        cover_art = get_cover_art(music_dir, path, files)
        if verbose and cover_art:
            print("found cover art: {}".format(cover_art))

        for file in files:
            if not file.lower().endswith(HANDLED_FILETYPES):
                continue

            full_filename = os.path.join(path, file)
            try:
                (new_track, album) = aggregate_metadata(full_filename,
                                                        music_dir,
                                                        cover_art)
            except MetadataError:
                continue

            if verbose and album:
                try:
                    print(u'Adding album {0} - {1}:\
                            '.format(album.artist,
                                        album.title))
                except UnicodeEncodeError:  # XXX needed on my RPi
                    print(u'Adding an album that can\'t be encoded:')

            db.session.add(new_track)
            if verbose:
                try:
                    print(u'  {0}: {1} - {2}\
                            '.format(new_track.filename,
                                     new_track.artist, new_track.title))
                except UnicodeEncodeError:  # XXX needed on my RPi
                    print(u'  A song that cannot be encoded')

        db.session.commit()


@manager.command
def update(verbose=False):
    ''' After createdb is run, this allows you to update the db without
        duplicating tracks already in the db '''
    # check db existence
    music_dir = unicode(app.config['MUSIC_DIR'])
    # check if db exists, if not, populate instead
    update_db(music_dir, verbose)


def update_db(music_dir, verbose):
    tracks_found = set()
    for path, dirs, files in os.walk(music_dir, followlinks=True):
        cover_art = get_cover_art(music_dir, path, files)
        if verbose and cover_art:
            print("found cover art: {}".format(cover_art))
        for file in files:
            if not file.lower().endswith(HANDLED_FILETYPES):
                continue

            full_filename = os.path.join(path, file)
            mtime = int(os.path.getmtime(full_filename))  # TODO
            relative_filename = os.path.relpath(full_filename, music_dir)

            tracks_found.add(relative_filename)
            track = Track.query.filter_by(filename=relative_filename).first()
            (_track, _album) = aggregate_metadata(full_filename,
                                                  music_dir,
                                                  cover_art)
            # track isn't in the db yet
            if track is None:
                db.session.add(_track)
            # db is out of date, update the entry
            elif track.mtime != mtime:
                print(track.mtime)
                print(mtime)
                print (track)
                track.update({
                    'artist': _track.artist,
                    'title': _track.title,
                    'filename': _track.filename,
                    'track_num': _track.track_num,
                    'mtime': mtime,
                    'album_id': _album.id,
                    'album': _album})
            else:
                #track is unchanged
                continue

    # Purge the database entries that aren't in the music directory
    #TODO will there be orphan Albums?
    for track in db.session.query(Track).all():
        if track.filename not in tracks_found:
            db.session.delete(track)
    db.session.commit()

if __name__ == "__main__":
    manager.run()
