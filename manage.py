import os
import re
import sys
from datetime import datetime
import mutagen
import click
from sqlalchemy.exc import OperationalError
from sqlalchemy.sql import select
from models import Track, Album, db


HANDLED_FILETYPES = ('.ogg', '.mp3', '.flac', '.m4a')


def track_num_to_int(track_num_str):
    """ Convert a track number tag value to an int.
        This function exists because the track number may be
        something like 01/12, i.e. first of 12 tracks,
        so we need to strip off the / and everything after.
        If the string can't be parsed as a number, -1 is returned. """

    if track_num_str == '':
        return -1

    if '/' in track_num_str:
        track_num_str = re.sub('(/(.*)$)', '', track_num_str)

    try:
        track_num = int(track_num_str)
    except ValueError:
        track_num = -1

    return track_num


def first_defined_tag(tag_dict, tags, default=''):
    """ Get first defined tag out of the list in tags.
        Example usage: tags=['track', 'tracknumber', 'track_number'] """

    # Allow just one tag to be passed instead of a list.
    if isinstance(tags, str):
        tags = [tags]

    for tag in tags:
        if tag in tag_dict:
            tag_obj = tag_dict[tag]
            tag_str = ''
            if type(tag_obj) == list:
                tag_str = tag_obj[0]
            else:  # Assume ID3 object
                tag_text = tag_obj.text[0]
                if type(tag_text) == str:
                    tag_str = tag_text
                else:  # ID3Timestamp
                    tag_str = tag_text.text
            if len(tag_str) >= 1:
                return tag_str.strip()

    return default


class MetadataError(Exception):
    """ Represents a failure to open a music file, missing metadata, or
    another problem that prevents the file's tags being sensibly added to
    the database. """

    def __init__(self, reason):
        self.reason = reason

    def __str__(self):
        return self.reason


def get_or_create_album(artist, title, **kwargs):
    """ Return the object or make it if the artist/title pair doesn't exist.
    """
    instance = Album.query.filter_by(artist=artist, title=title).first()
    if instance:
        # FIXME: This should update album characteristics. Since it doesn't, cannot fix
        # a misspelled album title etc. without blowing away DB
        return instance
    else:
        instance = Album(artist, title, **kwargs)
        db.session.add(instance)
        db.session.flush()
        return instance


def aggregate_metadata(full_filename, music_dir, cover_art):
    """ Take a full path to a file and the root music_dir. Return Track
    and Album objects (or None for no album) corresponding to that file.
    """
    mtime = os.path.getmtime(full_filename)
    relative_filename = os.path.relpath(full_filename, music_dir)
    try:
        tag_info = mutagen.File(full_filename)
        if tag_info is None:
            raise MetadataError('Mutagen could not open file')
    # Hack: Mutagen's exceptions don't inherit from a standard base class so
    # we kinda have to catch everything. But let's at least special-case
    # Ctrl-C and any code attempting to exit the program.
    except (KeyboardInterrupt, SystemExit):
        raise
    except:
        raise MetadataError('error: {0}'.format(str(sys.exc_info()[0])))

    tags = tag_info.tags
    if tags is None:
        raise MetadataError('no tags!')

    artist = first_defined_tag(tags, ['artist', 'TPE1'])
    title = first_defined_tag(tags, ['title', 'TIT2'])
    if artist == '' or title == '':
        raise MetadataError('empty artist or title tag')

    track_num = track_num_to_int(
        first_defined_tag(tags, ['track', 'tracknumber', 'TRCK'], '-1')
    )
    album_title = first_defined_tag(tags, ['album', 'TALB'])
    album_artist = first_defined_tag(
        tags,
        ['album artist', 'album_artist', 'albumartist',
            # FIXME: Is there an ID3 album artist tag that isn't for sorting? (presumably
            # this removes "The" which isn't actually desired here)
            'TSO2', 'TXXX:albumartistsort', 'TXXX:ALBUMARTISTSORT',
            # If no album artist, fall back to track artist
            'artist', 'TPE1']
    )
    release_date = first_defined_tag(tags, ['date', 'year', 'TDRC'])
    track_gain = parse_rg(first_defined_tag(tags,
        ['replaygain_track_gain', 'TXXX:REPLAYGAIN_TRACK_GAIN', 'TXXX:replaygain_track_gain']))

    album = None
    if album_title != '':
        album_gain = parse_rg(first_defined_tag(tags,
            ['replaygain_album_gain', 'TXXX:REPLAYGAIN_ALBUM_GAIN',
                'TXXX:replaygain_album_gain']))
        album = get_or_create_album(
            album_artist,
            album_title,
            date=release_date,
            cover_art=cover_art,
            replay_gain=album_gain,
        )

    track = Track(
        artist=artist,
        title=title,
        filename=relative_filename,
        album=album,
        track_num=track_num,
        mtime=mtime,
        replay_gain=track_gain,
    )
    return track, album


# "-6.70 dB" => -6.7
def parse_rg(replay_gain_string):
    if not replay_gain_string:
        return None
    try:
        return float(replay_gain_string.split()[0])
    except (ValueError, IndexError):
        return None


def get_cover_art(music_dir, path, file_list):
    """ Look for cover art among the files in `file_list`. If found,
    return a filename relative to the given `music_dir`. """

    for testfile in ['folder.jpg', 'folder.png', 'folder.gif',
                     'cover.jpg', 'cover.png', 'cover.gif']:
        if testfile in file_list:
            return os.path.relpath(os.path.join(path, testfile), music_dir)


def update_db(music_dir, quiet=True):
    """ Update the music database to reflect contents of `music_dir` (and
    its subdirectories). If `quiet`, no status line is printed.

    Note that for the CLI, quiet (-q) defaults to False, but for this
    internal function, it defaults to True. This is for convenience when
    writing tests.
    """

    # Create the appropriate DB tables if they don't exist.
    try:
        Track.query.all()
    except OperationalError:
        db.create_all()

    # In order to delete tracks that are in the DB but no longer
    # exist on disk, we keep track here of all track filenames
    # encountered. Others will be removed from the DB at the end.
    filenames_found = set()

    track_count = 0  # For printing status.
    start_time = datetime.today()

    for path, _, files in os.walk(music_dir, followlinks=True):
        # Find cover art to apply to any albums in this directory.
        cover_art = get_cover_art(music_dir, path, files)

        for file in files:
            if not file.lower().endswith(HANDLED_FILETYPES):
                continue

            full_filename = os.path.join(path, file)
            mtime = int(os.path.getmtime(full_filename))
            relative_filename = os.path.relpath(full_filename, music_dir)

            filenames_found.add(relative_filename)
            track = Track.query.filter_by(filename=relative_filename).first()

            # Add a track entry, or update it if the file's mtime changed.
            if track is None or track.mtime != mtime:
                try:
                    (_track, _album) = aggregate_metadata(full_filename,
                                                          music_dir,
                                                          cover_art)
                except MetadataError as e:
                    # Track doesn't have valid metadata.
                    # If it was in the DB previously, removing from
                    # filenames_found will get it removed when we clean the
                    # DB at the end.
                    filenames_found.remove(relative_filename)

                    sys.stderr.write('\r\033[KSkipping {0}: {1}\n'.format(
                        relative_filename, e))
                    continue

                if not quiet and _track.replay_gain is None:
                    sys.stderr.write('\r\033[KMissing ReplayGain: {0}\n'.format(
                        relative_filename))

                if track is not None:
                    db.session.delete(track)
                db.session.add(_track)

            # Increment the track count only in case of valid metadata,
            # so the final count will match the number in the database.
            track_count += 1

        # When we finish a directory, provide a status indicator.
        if not quiet:
            last_path_component = path[path.rfind('/') + 1:]
            sys.stderr.write('\r\033[K{0} tracks; in {1}'.format(
                track_count, last_path_component[:60]))

    # Purge the database entries that aren't in the music directory.
    for track in Track.query.all():
        if track.filename not in filenames_found:
            db.session.delete(track)
    db.session.flush()

    # Remove albums which contain no tracks.
    # FIXME: This is a naive approach, and we should instead do it with
    # foreign keys and an on-delete cascade clause. But SQLAlchemy claims
    # it doesn't support that on SQLite, despite SQLite having the feature
    # (sf, Dec 2014).
    orphaned_albums = Album.query.filter(
        ~Album.id.in_(select([Track.album_id], Track.album_id != None))
    ).all()
    for album in orphaned_albums:
        db.session.delete(album)

    db.session.commit()

    # TODO: empty the cache dir here to avoid returning the wrong track
    # in case an auto-generated track ID was reused.

    end_time = datetime.today()
    if not quiet:
        sys.stderr.write(
            '\r\033[KDone, {0} {1} processed in {2} sec.\n'
            .format(
                track_count,
                'track' + ('' if track_count == 1 else 's'),
                (end_time - start_time).total_seconds()
            )
        )
