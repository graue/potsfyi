#!/usr/bin/env python

from __future__ import print_function
import os
import sys
import mutagen
from flask.ext.script import Manager
from potsfyi import db, Track, Album, app

manager = Manager(app)


HANDLED_FILETYPES = ('.ogg', '.mp3', '.flac', '.m4a')


@manager.command
def createdb(verbose=False):
    '''  initial creation of the tracks database '''
    try:
        if Track.query.all():
            print('db already exists, run update if you\'d like to recreate the db') 
            return
    except:
        db.create_all()

    music_dir = unicode(app.config['MUSIC_DIR'])

    for path, dirs, files in os.walk(music_dir, followlinks=True):
        for file in files:
            if not file.lower().endswith(HANDLED_FILETYPES):
                continue

            full_filename = os.path.join(path, file)
            relative_filename = full_filename[len(music_dir) + 1:]

            try:
                tag_info = mutagen.File(full_filename, easy=True)
                if tag_info is None:
                    raise Exception('Mutagen could not open file')
            except:
                print(u'Skipping {0} due to error: {1}'.format(
                        relative_filename,
                        sys.exc_info()[0]))
                continue

            try:
                artist = tag_info.tags['artist'][0]
                title = tag_info.tags['title'][0]
                album = tag_info.tags['album'][0]
            except (KeyError, IndexError, TypeError):
                print(u'Skipping {0}: artist or title tag missing!'
                      .format(relative_filename))
                continue
            # is it a new album?
            album = Album(artist, album)
            new_track = Track(artist, title, album, relative_filename)
            db.session.add(new_track)
            if verbose:
                try:
                    print((u'Added {0}: {1} - {2} from album: ' +
                           u'{3}').format(relative_filename, artist, title,
                                          album))
                except UnicodeEncodeError:
                    print('Added a song that cannot be encoded');

    db.session.commit()

@manager.command
def update(verbose=False):
    ''' After createdb is run, this allows you to update the db without
        duplicating tracks already in the db '''
    db.drop_all()
    createdb(verbose=False)

if __name__ == "__main__":
    manager.run()
