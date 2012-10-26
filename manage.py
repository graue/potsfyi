from __future__ import print_function
import os
import mutagen
from flask.ext.script import Manager
from potsfyi import db, Track, app

manager = Manager(app)


@manager.command
def createdb():
    db.create_all()
    music_dir = app.config['MUSIC_DIR']

    for path, dirs, files in os.walk(music_dir):
        for file in files:
            tag_info = mutagen.File(os.path.join(path, file), easy=True)
            if tag_info is not None:
                filename = os.path.join(path, file)[len(music_dir) + 1:]
                print(u'Adding {0}: '.format(unicode(filename,
                                                     errors='replace')),
                      end='')
                try:
                    artist = tag_info.tags['artist'][0]
                    title = tag_info.tags['title'][0]
                except KeyError:
                    print('artist or title tag missing!')
                    continue
                print(u'{0} - {1}'.format(artist, title))
                new_track = Track(artist, title, filename)
                db.session.add(new_track)

    db.session.commit()


if __name__ == "__main__":
    manager.run()
