import shutil
import os
from time import sleep
from mutagen.mp3 import EasyMP3 as MP3
from flask import Flask
from flask.ext.testing import TestCase
import unittest
import time
from models import db, Track
from manage import update_db


def filenames_unique(tracks):
    """ Return True if no filename appears more than once in the given list
    of tracks. """
    filenames = [t.filename for t in tracks]
    return sorted(filenames) == sorted(list(set(filenames)))


class MyTest(TestCase):

    def create_app(self):
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
        app.config['TESTING'] = True
        app.config['SECRET_KEY'] = 'xxx'  # XXX fix this
        db.init_app(app)
        return app

    def setUp(self):
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()


def create_mock_tracks(tracks, src_track="test/sinewave.mp3"):
    """ Create mock tracks with the given tags.
    Tracks are created by making copies of src_track, then tagging them.
    """
    for track in tracks.iterkeys():
        filename = 'test/' + track
        shutil.copyfile(src_track, filename)
        song_tag = MP3(filename)
        for k, v in tracks[track].iteritems():
            song_tag[k] = unicode(v)
        song_tag.save()


class TagTest(MyTest):
    mock_tracks = {
        'foo.mp3': {'artist': 'Foo', 'title': 'Bar'},
        'second_thing.mp3': {'artist': 'Someone', 'title': 'A song'},
        'another_one.mp3': {'artist': 'Third Artist', 'title': 'Blobs'}
    }

    def setUp(self):
        super(TagTest, self).setUp()
        create_mock_tracks(self.mock_tracks)

    def test_tags(self):
        update_db('test')
        tracks_in_db = Track.query.all()
        mock_tracks = self.mock_tracks
        for db_track in tracks_in_db:
            filename = db_track.filename
            assert filename in mock_tracks
            assert db_track.artist == mock_tracks[filename]['artist']
            assert db_track.title == mock_tracks[filename]['title']

        assert filenames_unique(tracks_in_db)  # no duplicates

    def tearDown(self):
        for track in self.mock_tracks:
            os.remove("test/" + track)
        super(TagTest, self).tearDown()


class UpdateTest(MyTest):
    mock_tracks = {
        'foo.mp3': {'artist': 'Foo', 'title': 'Bar'},
        'second_thing.mp3': {'artist': 'Someone', 'title': 'A song'},
    }

    def setUp(self):
        super(UpdateTest, self).setUp()
        create_mock_tracks(self.mock_tracks)

    def test_added_track_update(self):
        ''' db is updated to new files in music_dir '''
        added_filename = 'new_one.mp3'
        added_track = {'artist': 'Third Artist', 'title': 'Blobs'}
        create_mock_tracks({added_filename: added_track})
        update_db('test')
        found_track = Track.query.filter_by(
                                    artist=added_track['artist'],
                                    title=added_track['title'])
        assert found_track is not None
        assert filenames_unique(Track.query.all())  # no duplicates

    def test_updated_track_tags(self):
        """ Make sure when a track's tags are changed, the DB updates. """

        retagged_filename = 'blobs.mp3'
        before_tags = {'artist': 'Third Artist', 'title': 'Blobs'}
        after_tags = {'artist': '3rd Artist', 'title': 'Blobs (remix)'}

        create_mock_tracks({retagged_filename: before_tags})
        update_db('test')

        sleep(1.2)  # Sleep so rounded-down mtime is different.
        os.remove('test/' + retagged_filename)
        create_mock_tracks({retagged_filename: after_tags})
        update_db('test')

        found_track = Track.query.filter_by(filename=retagged_filename,
                                            artist=after_tags['artist'],
                                            title=after_tags['title']).first()
        assert found_track is not None
        assert filenames_unique(Track.query.all())

    def test_remove_track_update(self):
        ''' db doesn't included deleted tracks '''
        mock_tracks = self.mock_tracks
        # pop returns a tuple of (filename, file_info_dict)
        removed_filename = mock_tracks.keys()[0]
        os.remove(os.path.join('test', removed_filename))
        update_db('test')
        assert len(Track.query.filter_by(filename=removed_filename).all()) == 0
        assert filenames_unique(Track.query.all())  # no duplicates

    def test_mtime(self):
        ''' newest mtime is updated in db '''
        mock_tracks = self.mock_tracks
        now = int(time.time())
        for f in mock_tracks:
            filename = os.path.join('test', f)
            st = os.stat(filename)
            atime = st.st_atime
            new_mtime = now
            os.utime(filename, (atime, new_mtime))  # modify the timestamp
        update_db('test')
        tracks_in_db = Track.query.all()
        for track in tracks_in_db:
            assert track.mtime == now

    def tearDown(self):
        ''' remove all but sinewave.mp3 '''
        for track in os.listdir('test'):
            if track != 'sinewave.mp3':
                os.remove("test/" + track)
        super(UpdateTest, self).tearDown()


if __name__ == '__main__':
    unittest.main()
