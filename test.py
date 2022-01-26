import shutil
import os
from time import sleep
from mutagen.mp3 import EasyMP3 as MP3
from flask import Flask
from flask_testing import TestCase
import unittest
import time
from models import db, Track, Album
from manage import update_db

# relative location to where the mock tracks will be written
TRACK_DIR = 'test/tracks/'
if not os.path.exists(TRACK_DIR):
    os.mkdir(TRACK_DIR)


def filenames_unique(tracks):
    filenames = [t.filename for t in tracks]
    return len(set(filenames)) == len(filenames)


def create_mock_tracks(tracks, src_track="test/sinewave.mp3"):
    """ Create mock tracks with the given tags.
    Tracks are created by making copies of src_track, then tagging them.
    """
    for track in tracks.keys():
        filename = TRACK_DIR + track
        shutil.copyfile(src_track, filename)
        song_tag = MP3(filename)
        for k, v in tracks[track].items():
            song_tag[k] = str(v)
        song_tag.save()


def remove_mock_tracks(tracks):
    for track in tracks:
        os.remove(os.path.join(TRACK_DIR, track))


class DatabaseTest(TestCase):

    def create_app(self):
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://'
        app.config['TESTING'] = True
        db.init_app(app)
        return app

    def setUp(self):
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()


class TaggingTest(DatabaseTest):

    def setUp(self):
        self.mock_tracks = {
            'foo.mp3': {'artist': 'Foo', 'title': 'Bar'},
            'second_thing.mp3': {'artist': 'Someone', 'title': 'A song'},
            'another_one.mp3': {'artist': 'Third Artist', 'title': 'Blobs'}
        }
        create_mock_tracks(self.mock_tracks)

    def tearDown(self):
        # Remove all mock tracks except the source track sinewave.mp3.
        for track in os.listdir(TRACK_DIR):
            if track != 'sinewave.mp3':
                os.remove(TRACK_DIR + track)


class TestTagging(TaggingTest):

    def test_tags(self):
        update_db(TRACK_DIR)
        tracks_in_db = Track.query.all()
        mock_tracks = self.mock_tracks
        for db_track in tracks_in_db:
            filename = db_track.filename
            assert filename in mock_tracks
            assert db_track.artist == mock_tracks[filename]['artist']
            assert db_track.title == mock_tracks[filename]['title']

        assert filenames_unique(tracks_in_db)

    def test_non_album(self):
        """ Album objects aren't created if the album tag is empty. """
        mocks = {
            'tetrawub.mp3': {
                'artist': 'Adhesion',
                'title': 'tetrawub',
                'album': '',
                'date': 2013
            }
        }
        create_mock_tracks(mocks)
        update_db(TRACK_DIR)
        adhesion_albums = Album.query.filter_by(artist='Adhesion').all()
        assert len(adhesion_albums) == 0

    def test_albums(self):
        """ Tracks with same artist/album pair get put into an Album. """
        album_mock = {
            '01 - Bicycle Day.mp3': {
                'artist': 'Static Bass',
                'album': 'Bicycle Day',
                'tracknumber': '1/2',
                'title': 'Bicycle Day'
            },
            '02 - No Phuture.mp3': {
                'artist': 'Static Bass',
                'album': 'Bicycle Day',
                'tracknumber': '2/2',
                'title': 'No Phuture'
            }
        }
        create_mock_tracks(album_mock)
        update_db(TRACK_DIR)
        albums = Album.query.filter_by(
            title='Bicycle Day',
            artist='Static Bass'
        ).all()
        assert len(albums) == 1
        tracks = (Track.query.filter_by(album_id=albums[0].id)
                             .order_by(Track.track_num)
                             .all())
        assert len(tracks) == 2
        assert tracks[0].artist == 'Static Bass'
        assert tracks[0].track_num == 1
        assert tracks[0].title == 'Bicycle Day'
        assert tracks[1].artist == 'Static Bass'
        assert tracks[1].track_num == 2
        assert tracks[1].title == 'No Phuture'


class TestUpdate(TaggingTest):

    def test_added_track_update(self):
        """ Updates reflect newly added tracks. """
        added_filename = 'new_one.mp3'
        added_track = {'artist': 'Third Artist', 'title': 'Blobs'}
        create_mock_tracks({added_filename: added_track})
        update_db(TRACK_DIR)
        found_track = Track.query.filter_by(
            artist=added_track['artist'],
            title=added_track['title']
        )
        assert found_track is not None
        assert filenames_unique(Track.query.all())  # no duplicates

    def test_updated_track_tags(self):
        """ When a track's tags are changed, the DB updates. """

        retagged_filename = 'blobs.mp3'
        before_tags = {'artist': 'Third Artist', 'title': 'Blobs'}
        after_tags = {'artist': '3rd Artist', 'title': 'Blobs (remix)'}

        create_mock_tracks({retagged_filename: before_tags})
        update_db(TRACK_DIR)

        sleep(1.2)  # Sleep so rounded-down mtime is different.
        remove_mock_tracks([retagged_filename])
        create_mock_tracks({retagged_filename: after_tags})
        update_db(TRACK_DIR)

        found_track = Track.query.filter_by(filename=retagged_filename,
                                            artist=after_tags['artist'],
                                            title=after_tags['title']).first()
        assert found_track is not None
        assert filenames_unique(Track.query.all())

    def test_remove_track_update(self):
        """ Updates reflect deleted tracks. """
        mock_tracks = self.mock_tracks
        # pop returns a tuple of (filename, file_info_dict)
        removed_filename = list(mock_tracks.keys())[0]
        os.remove(os.path.join(TRACK_DIR, removed_filename))
        update_db(TRACK_DIR)
        assert len(Track.query.filter_by(filename=removed_filename).all()) == 0
        assert filenames_unique(Track.query.all())

    def test_mtime(self):
        """ Updates reflect each file's mtime accurately. """
        mock_tracks = self.mock_tracks
        now = int(time.time())
        for f in mock_tracks:
            filename = os.path.join(TRACK_DIR, f)
            st = os.stat(filename)
            atime = st.st_atime
            new_mtime = now
            os.utime(filename, (atime, new_mtime))  # Modify the timestamp.
        update_db('test/tracks')
        tracks_in_db = Track.query.all()
        for track in tracks_in_db:
            assert track.mtime == now

    def test_orphan_albums(self):
        """ Deleted tracks have their albums purged as well. """
        fname = 'blobs.mp3'
        tags = {
            'artist': 'Yet Another Fake Artist',
            'title': 'Fake Song #13',
            'album': 'Fake Songs Vol. 2: Counterfeit Boogaloo'
        }

        create_mock_tracks({fname: tags})
        update_db(TRACK_DIR)
        remove_mock_tracks([fname])
        update_db(TRACK_DIR)
        found_album = Album.query.filter_by(title=tags['album']).first()
        assert found_album is None


if __name__ == '__main__':
    unittest.main()
