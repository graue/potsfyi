# Pots, fyi

Pots, fyi is a music streaming app
intended to run on a personal server.
Set it up and listen to *your* music collection
wherever you might be, using only a web browser!

## Current status

Things you can already do in Pots:

* Search your collection with a typeahead
* Show cover art
* Queue up tracks and albums to play in sequence
* Transcode tracks on the fly from formats your browser doesn't
  natively support (i.e., FLAC)
* Enjoy the beautiful redesign that just happened

Things you can't do yet:

* Seek within tracks
* Browse all artists / all albums by an artist in order
* Click a button to log out (you have to open the console and enter
  `logout()` for now, dumb, I know)
* Use it in mobile browsers unless you're truly desperate

The things you can't do may be out of date; check the issues.

It works in Firefox, Chrome and possibly Safari/IE10+ but I haven't
tested.


### Dependencies

#### Server side

 * [Flask](http://flask.pocoo.org)
 * [Flask-SQLAlchemy](http://packages.python.org/Flask-SQLAlchemy/)
 * [Flask-Login](https://pypi.python.org/pypi/Flask-Login)
 * [Mutagen](https://code.google.com/p/mutagen/) (for reading tags)
 * LibAV's [avconv](https://libav.org/avconv.html) (for transcoding)

#### Client side

Pots, fyi uses Webpack to bundle together
its client-side dependencies.
This requires [npm](http://npmjs.org/).

### Quick start

Install FFMPEG and Python's pip and virtualenv. On Ubuntu/Debian:

    sudo apt-get install ffmpeg python3-pip python3-venv

You will also need Node.js and npm for later. There *is* an Ubuntu package
for Node.js, but it may not be a new enough version, so you may have to
compile your own.

On OS X you can install most of this stuff with brew, but when we
tried it, there was no brew package for the project then known as avconv
(now folded into FFMPEG). We had to compile that
from source and it was a little annoying. Sorry OS X users. You *can*
do it though! [There's some instructions on installing avconv on OS X
here](http://superuser.com/a/568465). I welcome ideas on how to make
this easier.

Anyway, once you've got pip and virtualenv, run:

    git clone https://github.com/graue/potsfyi
    cd potsfyi
    python3 -m venv venv
    . venv/bin/activate
    pip install -r requirements.pip
    ln -s /some/dir/that/has/music/in/it static/music
    flask update

(Replace `/some/dir/that/has/music/in/it` with an appropriate path.
Pots, fyi will make all supported music files
under this path (searching recursively) available through the web interface.
It won't create or change any files here, so don't worry about it
messing anything up.)

Your server is now ready to go.
To build client-side scripts (the part that requires Node):

    cd script
    npm install
    npm run watch

(The last command will watch JavaScript source files for changes and rebuild
if a change is made. If you don't plan to edit the code, just Ctrl-C it after
it builds once.)

Finally, to start a debug server on http://localhost:5000:

    NO_LOGIN=True flask run

To search, type in the box.
To queue, click on a search result.
To play, click on a song in the play queue (on the right).

### Running it for real

**You can't run it for real right now. The only implemented form of
authentication was based on a service that was discontinued. Disregard
the following historical information.**

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

### Making the most of it

Run it on either a virtual server with a big disk, or a home server
(I've used a Raspberry Pi with a USB hard drive attached). Reverse
proxy through nginx. For bonus points, get a [free SSL
cert](http://blog.ruilopes.com/from-http-to-https-with-free-certificates.html)
and configure HTTPS on Nginx, so no one can snoop on the music you're
listening to :)
