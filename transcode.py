import os
import re
from flask import Response, redirect
from subprocess import PIPE, Popen
from wsgi_utils import PipeWrapper

TRANSCODABLE_FORMATS = ['mp3', 'ogg', 'flac', 'm4a', 'wav']

def _format_of_file(filename):
    return re.search('\.([^.]+)$', filename).group(1)

class Transcoder(object):
    def __init__(self, music_dir, cache_dir):
        self.music_dir = music_dir
        self.cache_dir = cache_dir

    def needs_transcode(self, filename, wanted_formats):
        return _format_of_file(filename) not in wanted_formats

    def can_transcode(self, filename, wanted_formats):
        return (
            _format_of_file(filename) in TRANSCODABLE_FORMATS and
            'ogg' in wanted_formats
        )

    def path_for_cache_key(self, cache_key):
        return os.path.join(self.cache_dir, 'tx' + cache_key + '.ogg')

    def transcode_and_stream(self, filename, cache_key=None):
        full_filename = os.path.join(self.music_dir, filename)
        cache_filename = None
        if cache_key:
            cache_filename = self.path_for_cache_key(cache_key)

            # See if the transcode is already cached.
            try:
                os.stat(cache_filename)
                return redirect(os.path.join('/', cache_filename))
            except OSError:
                pass

        # TODO: maintain a set of tasks for currently ongoing transcodes
        # to avoid transcoding a track twice at the same time. Then try
        # sending Accept-Ranges: bytes and honoring range requests, while
        # not providing a Content-Length. See if this makes Firefox's
        # media file fetching happy.

        # Transcode to ogg.
        # The filename should come out of the DB and *not* be user-specified
        # (through the web interface), so it can be trusted.
        command = [
            'ffmpeg', '-v', 'quiet',
            '-i', full_filename,
            '-f', 'ogg', '-acodec', 'libvorbis', '-aq', '5', '-'
        ]
        pipe = Popen(command, stdout=PIPE)

        return Response(
            PipeWrapper(pipe, copy_to_filename=cache_filename),
            mimetype='audio/ogg',
            direct_passthrough=True
        )
