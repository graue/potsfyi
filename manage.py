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

            filename_with_musicdir = os.path.join(path, file)
            filename = os.path.basename(filename_with_musicdir)

            try:
                tag_info = mutagen.File(filename_with_musicdir, easy=True)
                if tag_info is None:
                    raise Exception('Mutagen could not open file')
            except:
                print(u'Skipping {0} due to error: {1}'.format(filename,
                        sys.exc_info()[0]))
                continue

            try:
                artist = tag_info.tags['artist'][0]
                title = tag_info.tags['title'][0]
                album = tag_info.tags['album'][0]
            except (KeyError, IndexError):
                print(u'Skipping {0}: artist or title tag missing!'
                      .format(filename))
                continue
            # is it a new album?
            album = Album(artist, album)
            new_track = Track(artist, title, album, filename)
            db.session.add(new_track)
            if verbose:
                print(u'Added {0}: {1} - {2} from album: \
                        {3}'.format(filename, artist, title, album))

    db.session.commit()

@manager.command
def update(verbose=False):
    ''' After createdb is run, this allows you to update the db without
        duplicating tracks already in the db '''
    db.drop_all()
    createdb(verbose=False)

if __name__ == "__main__":
    manager.run()
