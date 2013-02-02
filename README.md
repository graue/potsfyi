# Pots, fyi

Pots, fyi will be a music streaming app
intended to run on a personal server.

## Current status

Very barebones and unfinished.

Depends on [Flask](http://flask.pocoo.org),
the Python web microframework,
as well as Flask-SQLAlchemy, Flask-Script,
and Mutagen for reading tags.

    git clone https://github.com/graue/potsfyi
    cd potsfyi
    virtualenv venv
    . venv/bin/activate
    pip install -r requirements.pip
    ln -s /some/dir/that/has/music/in/it static/music
    python manage.py createdb
    DEBUG=True python potsfyi.py

This will get you a server
at http://localhost:5000
where you can search for songs by artist and title
and play them in your browser (given codec support).

### Note on non-responsiveness

In Chromium you may find that the interface
becomes non-responsive when a song is playing.
This appears to be because Chromium holds a connection
open to stream the song and won't finish the download
until you get near the end.
That connection locks up Flask's built-in web server
(meant for development only), which
apparently only handles one request at a time.

You can fix this by running the app via [gunicorn](http://gunicorn.org)
rather than directly. This listens on port 8000:

    pip install gunicorn  # one time
    DEBUG=True gunicorn --debug -w 4 potsfyi:app  # to launch

As of version 18 on Linux,
Firefox downloads the whole file immediately
so it does not have this problem.
