from sqlalchemy.orm import relationship, backref
from sqlalchemy import Column, Integer, String, ForeignKey
from flask.ext.sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # Imported and initialized in potsfyi.py.


class Track(db.Model):
    __tablename__ = 'track'

    id = Column(Integer, primary_key=True)
    artist = Column(String(200))
    title = Column(String(240))
    filename = Column(String(256))
    track_num = Column(Integer)
    mtime = Column(Integer)
    album_id = Column(Integer, ForeignKey('album.id'))
    album = relationship(
        'Album',
        backref=backref('tracks', lazy='dynamic')
    )

    def __init__(self, artist, title, filename, album, track_num, mtime):
        self.artist = artist
        self.title = title
        self.album = album
        self.filename = filename
        self.track_num = track_num
        self.mtime = int(mtime)  # get the floor of given float

    def __repr__(self):
        return u'<Track {0.artist} - {0.title}>'.format(self)

    @property
    def serialize(self):
        return {
            'artist': self.artist,
            'title': self.title,
            'album': self.album.serialize if self.album else '',
            'track': self.track_num,
            'id': self.id
        }


class Album(db.Model):
    __tablename__ = 'album'

    id = Column(Integer, primary_key=True)
    artist = Column(String(200))
    title = Column(String(240))
    # TODO: Use a real date format.
    date = Column(String(16))
    label = Column(String(240))
    cat_number = Column(String(32))
    cover_art = Column(String(256))  # Filename of cover art, jpg/png.

    def __init__(self, artist, title, date=None, label=None, cat_number=None,
                 cover_art=None):
        self.artist = artist
        self.title = title
        self.date = date
        self.label = label
        self.cat_number = cat_number
        self.cover_art = cover_art

    def __repr__(self):
        return (
            u'<Album {0.title} - ' + u'{0.artist} ({0.date})>'
        ).format(self)

    @property
    def serialize(self):
        return {
            'artist': self.artist,
            'title': self.title,
            'date': self.date,
            'label': self.label,
            'cat_number': self.cat_number,
            'has_cover_art': self.cover_art is not None,
            'id': self.id
        }
