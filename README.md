# Pots, fyi

Pots, fyi will be a music streaming app
intended to run on a personal server.

## Current status

It's a little ugly, and it's missing some obvious features.
But it can already search your collection, show cover art,
queue up tracks or albums to play in sequence,
and transcode tracks from formats your browser doesn't natively support.

All recent-ish versions of Firefox and Chrome work great with it.


### Dependencies

#### Server side

 * [Flask](http://flask.pocoo.org)
 * [Flask-SQLAlchemy](http://packages.python.org/Flask-SQLAlchemy/)
 * [Flask-Script](http://flask-script.readthedocs.org/)
 * [Flask-Login](https://pypi.python.org/pypi/Flask-Login)
 * [Flask-BrowserID](https://pypi.python.org/pypi/Flask-BrowserID)
 * [Mutagen](https://code.google.com/p/mutagen/) (for reading tags)
 * LibAV's [avconv](https://libav.org/avconv.html) (for transcoding)

#### Client side

Pots, fyi uses [Browserify](http://browserify.org/) to bundle together
its client-side dependencies (JQuery, Backbone, Underscore and Handlebars).
This requires [npm](http://npmjs.org/).

### Quick start

Install LibAV's avconv. On Ubuntu/Debian:

    sudo apt-get install libav-tools

Make sure you have pip, virtualenv and npm. Then:

    git clone https://github.com/graue/potsfyi
    cd potsfyi
    virtualenv venv
    . venv/bin/activate
    pip install -r requirements.pip
    ln -s /some/dir/that/has/music/in/it static/music
    ./manage.py createdb

Your server is now ready to go.
To build client-side scripts:

    (cd script && npm install)
    make

Finally, to start a debug server on http://localhost:5000:

    DEBUG=True ./potsfyi.py

To search, just start typing.
To queue, click on a search result.
To play, click on a song in the play queue (on the right).

### Running it for real

To start a "production" server, you'll want to leave off the `DEBUG=True`
and pass at least 2 more environment variables:

    SECRET_KEY="some long random string"
    ADMIN_EMAIL=your.email@example.com

The secret key keeps cookies secure,
and the email you supply is the only one allowed
to log in (via Mozilla Persona, aka BrowserID).
You can also supply:

 * `PORT`: port number to listen on, default 5000
 * `DB_URI`: database to connect to, default `sqlite:///tracks.db`
 * `MUSIC_DIR`: where the music lives, default `static/music`

Flask's default web server only processes one request at a time,
which can result in the rest of the webapp locking up
while songs download.
You can fix this by running the app via [gunicorn](http://gunicorn.org)
rather than directly. Install gunicorn via pip, then do something like:

    SECRET_KEY="..." ADMIN_EMAIL=your.email@example.com \
      gunicorn -w 4 --timeout 10000 -b 127.0.0.1:8000 potsfyi:app \
      >guni.log 2>&1

This spawns 4 worker processes, listens on port 8000, saves output to
guni.log, and sets a long timeout so that worker processes don't timeout
and get shut down while sending audio. (You can partially work around the
timeout issue by proxying your /static/ directory through nginx, but
transcoded audio files will still go through Python.)
