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
)

class Track(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    artist = db.Column(db.String(200))
    title = db.Column(db.String(240))
    filename = db.Column(db.String(256))

    def __init__(self, artist, title, filename):
        self.artist, self.title, self.filename = artist, title, filename

    def __repr__(self):
        return u'<Track {0.artist} - {0.title}>'.format(self)

    @property
    def serialize(self):
        return {
            'artist': self.artist,
            'title': self.title,
            'filename': self.filename
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
