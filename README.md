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
    pip install Flask Flask-SQLAlchemy Flask-Script mutagen
    mkdir static
    ln -s /some/dir/that/has/music/in/it static/music
    python manage.py createdb
    DEBUG=True python potsfyi.py

This will get you a server
at http://localhost:5000
where you can search for songs by artist and title
and play them in your browser (given codec support).
