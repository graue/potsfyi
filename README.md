# Pots, fyi

Pots, fyi will be a music streaming app
intended to run on a personal server.

## Current status

Works well. Needs a better UI design and some obvious features (see
the issues on GitHub). But it can search your collection, show cover
art, queue up tracks or albums to play in sequence, and transcode
tracks from formats your browser doesn't natively support. I (Scott)
am already using it.

All recent versions of Firefox and Chrome work great with it. Safari
and IE9+ may work, but aren't tested. Older IE won't work because we
rely on the HTML5 `<audio>` tag — there is no Flash fallback.


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
This requires [npm](http://npmjs.org/) version >= 0.8.0.

### Quick start

Install LibAV's avconv and Python's pip and virtualenv. On Ubuntu/Debian:

    sudo apt-get install libav-tools python-pip python-virtualenv

You will also need Node.js and npm for later. There *is* an Ubuntu package
for Node.js, but it may not be a new enough version, so you may have to
compile your own.

On OS X you can install most of this stuff with brew, but when we
tried it, there was no brew package for avconv. We had to compile that
from source and it was a little annoying. Sorry OS X users. You *can*
do it though! [There's some instructions on installing avconv on OS X
here](http://superuser.com/a/568465). I welcome ideas on how to make
this easier.

Anyway, once you've got pip and virtualenv, run:

    git clone https://github.com/graue/potsfyi
    cd potsfyi
    virtualenv venv
    . venv/bin/activate
    pip install -r requirements.pip
    ln -s /some/dir/that/has/music/in/it static/music
    SECRET_KEY=foo ./manage.py update

(The symbolic link to `/some/dir/that/has/music/in/it` should obviously be
replaced with an actual path. Pots, fyi will make all supported music files
under this path (searching recursively) available through the web interface.
Currently, it won't create or change any files here, so don't worry about it
messing anything up. Also, don't worry about the specific `SECRET_KEY` in
the update command. It's just a bug that you have to provide one.)

Your server is now ready to go.
To build client-side scripts (the part that requires Node):

    cd script
    npm install
    npm run watch

(The last command will watch JavaScript source files for changes and rebuild
if a change is made. If you don't plan to edit the code, just Ctrl-C it after
it builds once.)

Finally, to start a debug server on http://localhost:5000:

    DEBUG=True ./potsfyi.py

At the login screen you can enter any valid email that you control.

To search, type in the box.
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
