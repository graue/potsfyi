#!/usr/bin/env python
# coding: utf-8
import errno
import os
import re
import sys
from flask import (
    Flask,
    abort,
    jsonify,
    redirect,
    render_template,
    request,
    url_for
)
from flask.ext.login import (LoginManager, UserMixin, current_user,
                             login_required, login_user)
from flask.ext.browserid import BrowserID
from models import Track, Album, db
import transcode

app = Flask(__name__)
db.init_app(app)

app.config.update(
    DEBUG=(True if os.environ.get('DEBUG') in ['1', 'True'] else False),
    NO_LOGIN=(True if os.environ.get('NO_LOGIN') in ['1', 'True'] else False),
    PORT=int(os.environ.get('PORT', 5000)),
    SQLALCHEMY_DATABASE_URI=(os.environ.get('DB_URI', 'sqlite:///tracks.db')),
    CACHE_DIR=(os.environ.get('CACHE_DIR', 'static/cache')),
    MUSIC_DIR=(os.environ.get('MUSIC_DIR', 'static/music')),
    ADMIN_EMAIL=(os.environ.get('ADMIN_EMAIL', None)),
    SEND_FILE_MAX_AGE_DEFAULT=10
)

# Insecure, from the Flask manual - for testing and development only.
DEFAULT_SECRET_KEY = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'

# Checked below to make sure it's not the default in production.
app.secret_key = os.environ.get('SECRET_KEY', DEFAULT_SECRET_KEY)


class User(UserMixin):
    def __init__(self, user_id):
        UserMixin.__init__(self)
        self.user_id = user_id
        self.admin = (self.user_id == app.config['ADMIN_EMAIL'])

    def get_id(self):
        return unicode(self.user_id)


def get_user_by_id(user_id):
    return User(user_id)


def get_user(resp):
    """ Return a User object based on a BrowserID response. """
    if resp['status'] != 'okay':
        return None  # Login failed for some reason

    # If an admin email is set, and the BrowserID login doesn't match,
    # deny access.
    if (app.config['ADMIN_EMAIL'] and
            app.config['ADMIN_EMAIL'] != resp['email']):
        return None

    return User(resp['email'])  # Either admin, or anyone is allowed.


login_manager = LoginManager()
login_manager.user_loader(get_user_by_id)
login_manager.login_view = "login_view"
login_manager.setup_app(app)

browser_id = BrowserID()
browser_id.user_loader(get_user)
browser_id.init_app(app)

# Create cache dir if it doesn't exist
try:
    os.mkdir(app.config['CACHE_DIR'])
except OSError as e:
    # Re-raise the error unless the error is that the cache dir already
    # exists (that's okay).
    if e[0] != errno.EEXIST:
        raise


@app.route('/search')
@login_required
def search_results():
    """ Perform a general search encompassing artist, track, albums. """
    search_term = request.args.get('q', '')

    # split search term into up to 10 tokens (anything further is ignored)
    tokens = filter(None, re.split('\s+', search_term))[:10]

    filters = [Track.title.contains(token) | Track.artist.contains(token)
               for token in tokens]
    track_results = Track.query.filter(*filters).limit(30).all()

    album_filters = [Album.title.contains(token) |
                     Album.artist.contains(token) for token in tokens]
    album_results = Album.query.filter(*album_filters).limit(10).all()

    tracks_to_include = set([t.id for t in track_results])
    albums_to_include = set([t.album_id for t in track_results])
    albums_to_include.discard(None)  # Whoops, some tracks aren't on an album.

    albums_to_include |= set([a.id for a in album_results])
    tracks_to_include |= set(
        [t for a in album_results for t in a.serialize['track_ids']]
    )

    search_results = [['album', a.id] for a in album_results]
    search_results += [['track', t.id] for t in track_results]

    response = {
        'albums': [Album.query.filter(Album.id == a).one().serialize for a in albums_to_include],
        'tracks': [Track.query.filter(Track.id == t).one().serialize for t in tracks_to_include],
        'search_results': search_results
    }

    return jsonify(response)


@app.route('/artist')
@login_required
def get_artists():
    # Return artists lexicographically after 'start', if provided.
    # TODO: Come up with a solution for artists who only have non-album
    # tracks. For now, this only returns artists who have albums.
    start = request.args.get('start', '')

    limit = request.args.get('limit', 30)

    albums = (Album.query.filter(Album.artist > start).group_by(Album.artist)
              .order_by(Album.artist).limit(limit)).all()
    return jsonify(objects=[a.artist for a in albums])


@app.route('/artist/<artist>')
@login_required
def get_artist_albums(artist):
    # Return a list of an artist's albums.
    # TODO: Come up with a solution for surfacing non-album tracks as well.
    albums = (Album.query.filter(Album.artist == artist)
              .order_by(Album.title).order_by(Album.date))
    return jsonify(objects=[a.serialize for a in albums])


@app.route('/album/<int:album_id>')
@login_required
def get_album(album_id):
    """ Given an album ID, return its info, with a "tracks" attribute added
    that lists all the tracks. """
    album = Album.query.filter_by(id=album_id).first()
    if album is None:
        abort(404)
    tracks = Track.query.filter_by(album_id=album_id)\
                        .order_by(Track.track_num)

    response = album.serialize
    response['tracks'] = [t.serialize for t in tracks]
    return jsonify(response)


@app.route('/album/<int:album_id>/art')
@login_required
def get_album_art(album_id):
    album = Album.query.filter_by(id=album_id).first()
    if album is None or album.cover_art is None:
        abort(404)
    return redirect(os.path.join('/' + app.config['MUSIC_DIR'],
                                 album.cover_art))


@app.route('/track/<int:track_id>')
@login_required
def get_track(track_id):
    track = Track.query.filter_by(id=track_id).first()
    if track is None:
        abort(404)
    return jsonify(track.serialize)


@app.route('/track/<int:track_id>/<wanted_formats>')
@login_required
def get_track_audio(track_id, wanted_formats):
    """ Get a track's audio.
    If `wanted_formats` (a comma-separated list) includes the file's actual
    format, a redirect is sent (so the static file can be handled as such).
    Otherwise, if `wanted_formats` includes ogg, it's transcoded on the fly.
    """

    wanted_formats = re.split(',', wanted_formats)
    track = Track.query.filter_by(id=track_id).first()
    if track is None:
        abort(404)

    if not transcode.needs_transcode(track.filename, wanted_formats):
        return redirect(
            os.path.join(
                '/' + app.config['MUSIC_DIR'],
                track.filename
            )
        )

    if not transcode.can_transcode(track.filename, wanted_formats):
        abort(404)

    full_filename = os.path.join(app.config['MUSIC_DIR'], track.filename)
    return transcode.transcode_and_stream(full_filename)


@app.route('/')
@login_required
def front_page():
    return render_template('app.html', nologin=app.config['NO_LOGIN'])


@app.route('/login')
def login_view():
    if app.config['NO_LOGIN']:
        # Log the user in as a fake user object, to bypass the actual login
        # screen.
        #
        # FIXME: If you restart the server without NO_LOGIN, we should
        # invalidate "fake@example.com" users — currently they can still
        # reuse the session.
        login_user(User('fake@example.com'))

    if current_user.is_authenticated():
        return redirect(url_for('front_page'))
    return render_template('login.html')


def check_secret_key():
    if app.secret_key == DEFAULT_SECRET_KEY and not app.config['DEBUG']:
        sys.stderr.write("Error: You need to specify a SECRET_KEY\n")
        sys.exit(1)


if __name__ == '__main__':
    check_secret_key()
    app.run(port=app.config['PORT'])
