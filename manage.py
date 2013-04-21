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


@manager.command
def createdb(verbose=False):
    '''  initial creation of the tracks database '''
    try:
        if Track.query.all():
            print('db already exists. Try using the update command.')
            return
    except:
        db.create_all()

    music_dir = unicode(app.config['MUSIC_DIR'])

    last_album = None

    for path, dirs, files in os.walk(music_dir, followlinks=True):
        # See if there is cover art in this directory.
        # If so, apply it to any albums found in the dir.
        # XXX: does not correctly trickle down to 'CD1', 'CD2' subdirs
        cover_art = None
        for testfilename in ['folder.jpg', 'folder.png', 'folder.gif',
                             'cover.jpg', 'cover.png', 'cover.gif']:
            if testfilename in files:
                cover_art = os.path.relpath(os.path.join(path, testfilename),
                                            music_dir)

        for file in files:
            if not file.lower().endswith(HANDLED_FILETYPES):
                continue

            full_filename = os.path.join(path, file)
            relative_filename = os.path.relpath(full_filename, music_dir)

            try:
                tag_info = mutagen.File(full_filename, easy=True)
                if tag_info is None:
                    raise Exception('Mutagen could not open file')
            except:
                print(u'Skipping {0} due to error: {1}'.format(
                        relative_filename,
                        sys.exc_info()[0]))
                continue

            tags = tag_info.tags
            if tags is None:
                print(u'Skipping {0}: no tags!'.format(relative_filename))
                continue

            artist = multi_get_first(tags, 'artist')
            title = multi_get_first(tags, 'title')
            if artist == '' or title == '':
                print(u'Skipping {0}: empty artist or title tag'
                      .format(relative_filename))
                continue

            track_num = track_num_to_int(
                multi_get_first(tags, ['track', 'tracknumber'], '-1')
            )
            album_title = multi_get_first(tags, 'album')
            album_artist = multi_get_first(tags,
                    ['album artist', 'album_artist', 'albumartist',
                     'artist'])
            release_date = multi_get_first(tags, ['date', 'year'])

            # Same album as last added track?
            # XXX This method of grouping tracks together into an album
            # works if there is a 1:1 directory/album mapping,
            # but may fail otherwise.
            if last_album and (last_album.artist == album_artist
                               and last_album.title == album_title):
                album = last_album
            elif album_artist == '' or album_title == '':
                album = None  # no album
                if verbose and last_album is not None:
                    print('Non-album tracks:')
            else:
                album = Album(album_artist, album_title, date=release_date,
                              cover_art=cover_art)
                if verbose:
                    try:
                        print(u'Adding album {0} - {1}:'.format(album_artist,
                                                                album_title))
                    except UnicodeEncodeError:  # XXX needed on my RPi
                        print(u'Adding an album that can\'t be encoded:')

            new_track = Track(artist, title, relative_filename, album,
                              track_num)
            db.session.add(new_track)
            if verbose:
                try:
                    print(u'  {0}: {1} - {2}'.format(relative_filename,
                                                     artist, title))
                except UnicodeEncodeError:  # XXX needed on my RPi
                    print(u'  A song that cannot be encoded')

            # save album in case next track belongs to it as well
            last_album = album

    db.session.commit()


@manager.command
def update(verbose=False):
    ''' After createdb is run, this allows you to update the db without
        duplicating tracks already in the db '''
    db.drop_all()
    createdb(verbose)

if __name__ == "__main__":
    manager.run()
