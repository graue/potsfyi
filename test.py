import shutil
import subprocess
import os
from mutagen.mp3 import EasyMP3 as MP3
from flask import Flask
from flask.ext.testing import TestCase
from models import db

class MyTest(TestCase):

    def create_app(self):
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///testing.db'
        app.config['TESTING'] = True
        db.init_app(app)
        return app

    def setUp(self):
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()

    def test_tags(self):
        test_src = "test/sinewave.mp3"

        for letter in ['a','b','c']:
            filename = "test/" + letter + ".mp3"
            shutil.copyfile(test_src, filename)
            song_tag = MP3(filename)
            song_tag['title'] = u"Song " + letter.upper()
            song_tag['artist'] = u"Artist " + letter.upper()
            song_tag.save()

        my_env = os.environ.copy()
        my_env['DB_URI'] = 'sqlite:///testing.db'
        my_env['SECRET_KEY'] = 'foobar'
        my_env['MUSIC_DIR'] = 'test'
        p = subprocess.Popen(['./manage.py', 'createdb'], env=my_env,
                        stdout=subprocess.PIPE)

        out, err = p.communicate()

