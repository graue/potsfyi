#!/usr/bin/env python
import os
from flask import Flask, request, render_template, jsonify
from flask.ext.sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tracks.db'
app.config['MUSIC_DIR'] = 'static/music'
db = SQLAlchemy(app)

app.config.update(
    DEBUG=(True if os.environ.get('DEBUG') in ['1', 'True'] else False),
    PORT=int(os.environ.get('PORT', 5000)),
    DB_URI=(os.environ.get('DB_URI', 'sqlite:///tracks.db')),
    MUSIC_DIR=(os.environ.get('MUSIC_DIR', 'static/music')),
)

class Track(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    artist   = db.Column(db.String(200))
    title    = db.Column(db.String(240))
    filename = db.Column(db.String(256))
    album_id = db.Column(db.Integer, db.ForeignKey('album.id'))
    album    = db.relationship('Album',
        backref=db.backref('tracks', lazy='dynamic'))

    def __init__(self, artist, title, album, filename):
        self.artist   = filename 
        self.title    = title
        self.album    = album
        self.filename = filename

    def __repr__(self):
        return u'<Track {0.artist} - {0.title}>'.format(self)

    @property
    def serialize(self):
        return {
            'artist'  : self.artist,
            'title'   : self.title,
            'album'   : self.album,
            'filename': self.filename
        }

class Album(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    album_artist = db.Column(db.String(200))
    album_title  = db.Column(db.String(240))
    # date format?
    release_date = db.Column(db.String(16))
    record_label = db.Column(db.String(240))
    cat_number   = db.Column(db.String(32))

    def __init__(self, album_artist, album_title, 
            release_date, record_label, cat_number):
        self.album_artist = album_artist
        self.album_title  = album_title
        self.release_date = release_date
        record_label      = record_label
        cat_number        = cat_number

    def __repr__(self):
        return u'<Album {0.album_title} - \
            {0.album_artist} ({0.release_date})>'.format(self)

    @property
    def serialize(self):
        return {
            'album_artist': self.album_artist,
            'album_title' : self.album_title,
            'release_date': self.release_date,
            'record_label': self.record_label,
            'cat_number'  : self.cat_number
        }

@app.route('/player')
def player_page():
    track_url = request.args.get('track_url', '')
    if track_url == '':
        return 'Not found', 404
    return render_template('player.html',
                           track_url = app.config['MUSIC_DIR'] \
                                   + '/' + track_url)


@app.route('/search')
def search_results():
    search_artist = request.args.get('artist', '')
    search_title = request.args.get('title', '')
    tracks = Track.query.filter(Track.artist.contains(search_artist),
                                Track.title.contains(search_title)).all()
    return jsonify(objects=[t.serialize for t in tracks])


@app.route('/')
def front_page():
    return render_template('index.html')

if __name__ == '__main__':
    app.run()
