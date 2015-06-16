import os
import re
from flask import Response
from subprocess import Popen, PIPE
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
        cache_file = None
        if cache_key:
            cache_filename = self.path_for_cache_key(cache_key)
            cache_file = open(cache_filename, 'w')

        # Transcode to ogg.
        # The filename should come out of the DB and *not* be user-specified
        # (through the web interface), so it can be trusted.
        command = [
            'avconv', '-v', 'quiet',
            '-i', full_filename,
            '-f', 'ogg', '-acodec', 'libvorbis', '-aq', '5', '-'
        ]
        pipe = Popen(command, stdout=PIPE)

        return Response(
            PipeWrapper(pipe, copy_to_file=cache_file),
            mimetype='audio/ogg',
            direct_passthrough=True
        )
