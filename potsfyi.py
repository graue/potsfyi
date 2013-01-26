#!/usr/bin/env python
import os
from flask import Flask, request, render_template, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.ext.hybrid import hybrid_property


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tracks.db'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 10
db = SQLAlchemy(app)

app.config.update(
    DEBUG=(True if os.environ.get('DEBUG') in ['1', 'True'] else False),
    PORT=int(os.environ.get('PORT', 5000)),
    DB_URI=(os.environ.get('DB_URI', 'sqlite:///tracks.db')),
    MUSIC_DIR=(os.environ.get('MUSIC_DIR', 'static/music')),
)


class Track(db.Model):
    ''' artist, track, filename, album '''
    id = db.Column(db.Integer, primary_key=True)
    artist = db.Column(db.String(200))
    title = db.Column(db.String(240))
    filename = db.Column(db.String(256))
    track_num = db.Column(db.Integer)
    album_id = db.Column(db.Integer, db.ForeignKey('album.id'))
    album = db.relationship('Album',
        backref=db.backref('tracks', lazy='dynamic'))

    def __init__(self, artist, title, filename, album, track_num):
        self.artist = artist
        self.title = title
        self.album = album
        self.filename = filename
        self.track_num = track_num

    def __repr__(self):
        return u'<Track {0.artist} - {0.title}>'.format(self)

    @property
    def serialize(self):
        return {
            'artist': self.artist,
            'title': self.title,
            'album': self.album.serialize if self.album else '',
            'track': self.track_num,
            'filename': self.filename
        }

    @hybrid_property
    def artist_title(self):
        return self.artist + " " + self.title


class Album(db.Model):
    ''' artist, title, date, label, cat# '''
    id = db.Column(db.Integer, primary_key=True)
    artist = db.Column(db.String(200))
    title = db.Column(db.String(240))
    # date format?
    date = db.Column(db.String(16))
    label = db.Column(db.String(240))
    cat_number = db.Column(db.String(32))

    def __init__(self, artist, title, date=None, label=None, cat_number=None):
        self.artist = artist
        self.title = title
        self.date = date
        self.label = label
        self.cat_number = cat_number

    def __repr__(self):
        return (u'<Album {0.title} - ' +
            u'{0.artist} ({0.date})>').format(self)

    @property
    def serialize(self):
        return {
            'artist': self.artist,
            'title': self.title,
            'date': self.date,
            'label': self.label,
            'cat_number': self.cat_number
        }


@app.route('/search')
def search_results():
    # should be a general search encompassing artist, track, albums
    search_term = request.args.get('q', '')
    tracks = Track.query.filter(
        Track.artist_title.contains(search_term)
    ).all()

    serialized_tracks = [t.serialize for t in tracks]

    # prefix all track filenames with the music dir,
    # so the client-side app can find them
    for t in serialized_tracks:
        t['filename'] = os.path.join(app.config['MUSIC_DIR'], t['filename'])

    return jsonify(objects=serialized_tracks)


@app.route('/')
def front_page():
    return render_template('index.html')

if __name__ == '__main__':
    app.run()
