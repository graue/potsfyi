#!/usr/bin/env python

from __future__ import print_function
import os
import re
import sys
import mutagen
from flask.ext.script import Manager
from sqlalchemy.exc import OperationalError
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
    """ Look for cover art among the files in `file_list`. If found,
    return a filename relative to the given `music_dir`. """

    for testfile in ['folder.jpg', 'folder.png', 'folder.gif',
                     'cover.jpg', 'cover.png', 'cover.gif']:
        if testfile in file_list:
            return os.path.relpath(os.path.join(path, testfile), music_dir)


@manager.command
def update(verbose=False):
    ''' After createdb is run, this allows you to update the db without
        duplicating tracks already in the db '''
    update_db(unicode(app.config['MUSIC_DIR']), verbose)


def update_db(music_dir, verbose=False):
    """ Update the music database to reflect contents of `music_dir` (and
    its subdirectories). If `verbose`, extra messages are printed to the
    standard output. """

    # Create the appropriate DB tables if they don't exist.
    try:
        Track.query.all()
    except OperationalError:
        db.create_all()

    # In order to delete tracks that are in the DB but no longer
    # exist on disk, we keep track here of all track filenames
    # encountered. Others will be removed from the DB at the end.
    filenames_found = set()

    for path, _, files in os.walk(music_dir, followlinks=True):
        # Find cover art to apply to any albums in this directory.
        cover_art = get_cover_art(music_dir, path, files)

        for file in files:
            if not file.lower().endswith(HANDLED_FILETYPES):
                continue

            full_filename = os.path.join(path, file)
            mtime = int(os.path.getmtime(full_filename))
            relative_filename = os.path.relpath(full_filename, music_dir)

            filenames_found.add(relative_filename)
            track = Track.query.filter_by(filename=relative_filename).first()

            if track is None:  # Track isn't in the DB yet.
                try:
                    (_track, _album) = aggregate_metadata(full_filename,
                                                          music_dir,
                                                          cover_art)
                except MetadataError:
                    continue
                db.session.add(_track)

            elif track.mtime != mtime:  # DB is out of date, update the entry
                try:
                    (_track, _album) = aggregate_metadata(full_filename,
                                                          music_dir,
                                                          cover_art)
                except MetadataError:
                    # Track no longer has valid metadata.
                    # By not counting it as "found", we'll get it removed
                    # from the DB.
                    filenames_found.remove(relative_filename)
                    continue

                db.session.delete(track)
                db.session.add(_track)

            # No need for an "else". If track is unchanged, do nothing.

    # Purge the database entries that aren't in the music directory.
    # XXX Should we handle orphan albums here? If all tracks belonging to an
    # album are removed, the album will remain.
    for track in db.session.query(Track).all():
        if track.filename not in filenames_found:
            db.session.delete(track)
    db.session.commit()

if __name__ == "__main__":
    manager.run()
