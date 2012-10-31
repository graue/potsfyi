from __future__ import print_function
import os
import sys
import mutagen
from flask.ext.script import Manager
from potsfyi import db, Track, app

manager = Manager(app)


HANDLED_FILETYPES = ('.ogg', '.mp3', '.flac', '.m4a')


@manager.command
def createdb(verbose=False):
    db.create_all()
    music_dir = unicode(app.config['MUSIC_DIR'])

    for path, dirs, files in os.walk(music_dir, followlinks=True):
        for file in files:
            if not file.lower().endswith(HANDLED_FILETYPES):
                continue

            filename_with_musicdir = os.path.join(path, file)
            filename = filename_with_musicdir[len(music_dir) + 1:]

            try:
                tag_info = mutagen.File(filename_with_musicdir, easy=True)
                if tag_info is None:
                    raise Exception('Mutagen could not open file')
            except:
                print(u'Skipping {0} due to error: {1}'.format(filename),
                      sys.exc_info()[0])
                continue

            filename = os.path.join(path, file)[len(music_dir) + 1:]
            try:
                artist = tag_info.tags['artist'][0]
                title = tag_info.tags['title'][0]
            except (KeyError, IndexError):
                print(u'Skipping {0}: artist or title tag missing!'
                      .format(filename))
                continue
            new_track = Track(artist, title, filename)
            db.session.add(new_track)
            if verbose:
                print(u'Added {0}: {1} - {2}'.format(filename, artist, title))

    db.session.commit()


if __name__ == "__main__":
    manager.run()
