# Pots, fyi

Pots, fyi will be a music streaming app
intended to run on a personal server.

## Current status

Very barebones and unfinished.

### Dependencies

 * [Flask](http://flask.pocoo.org)
 * [Flask-SQLAlchemy](http://packages.python.org/Flask-SQLAlchemy/)
 * [Flask-Script](http://flask-script.readthedocs.org/)
 * [Mutagen](https://code.google.com/p/mutagen/) (for reading tags)
 * LibAV's [avconv](https://libav.org/avconv.html) (for transcoding)

### Quick start

    sudo apt-get install libav-tools  # or equivalent
    git clone https://github.com/graue/potsfyi
    cd potsfyi
    virtualenv venv
    . venv/bin/activate
    pip install -r requirements.pip
    ln -s /some/dir/that/has/music/in/it static/music
    ./manage.py createdb
    DEBUG=True ./potsfyi.py

This will get you a server
at http://localhost:5000
where you can search for songs by artist and title
and play them in your browser.
To search, just start typing.
To queue, click on a search result.
To play, click on a song in the play queue (on the right).

Flask's default web server only processes one request at a time,
which can result in the rest of the webapp locking up
while songs download.
You can fix this by running the app via [gunicorn](http://gunicorn.org)
rather than directly. This listens on port 8000:

    pip install gunicorn  # one time
    DEBUG=True gunicorn --debug -w 4 potsfyi:app  # to launch
