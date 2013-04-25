import shutil
import os
from mutagen.mp3 import EasyMP3 as MP3
from flask import Flask
from flask.ext.testing import TestCase
import unittest
from models import db, Track
from manage import populate_db

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


class TagTest(MyTest):
    mock_tracks = {
        'foo.mp3': {'artist': 'Foo', 'title': 'Bar'},
        'second_thing.mp3': {'artist': 'Someone', 'title': 'A song'},
        'another_one.mp3': {'artist': 'Third Artist', 'title': 'Blobs'}
    }

    def setUp(self):
        super(TagTest, self).setUp()

        test_src = "test/sinewave.mp3"

        for track in self.mock_tracks.iterkeys():
            filename = 'test/' + track
            shutil.copyfile(test_src, filename)
            song_tag = MP3(filename)
            for k,v in self.mock_tracks[track].iteritems():
                song_tag[k] = unicode(v)
            song_tag.save()

    def test_tags(self):
        populate_db('test', False)
        tracks_in_db = Track.query.all()
        mock_tracks = self.mock_tracks
        for db_track in tracks_in_db:
            filename = db_track.filename
            assert filename in mock_tracks
            assert db_track.artist == mock_tracks[filename]['artist']
            assert db_track.title == mock_tracks[filename]['title']

    def tearDown(self):
        for track in self.mock_tracks.iterkeys():
            os.remove("test/" + track)
        super(TagTest, self).tearDown()


if __name__ == '__main__':
    unittest.main()
