import re
from flask import Response
from subprocess import Popen, PIPE
from wsgi_utils import PipeWrapper

TRANSCODABLE_FORMATS = ['mp3', 'ogg', 'flac', 'm4a', 'wav']

def _format_of_file(filename):
    return re.search('\.([^.]+)$', filename).group(1)

def needs_transcode(filename, wanted_formats):
    return _format_of_file(filename) not in wanted_formats

def can_transcode(filename, wanted_formats):
    return (
        _format_of_file(filename) in TRANSCODABLE_FORMATS and
        'ogg' in wanted_formats
    )

def transcode_and_stream(filename):
    # Transcode to ogg.
    # The filename should come out of the DB and *not* be user-specified
    # (through the web interface), so it can be trusted.
    command = [
        'avconv', '-v', 'quiet',
        '-i', filename,
        '-f', 'ogg', '-acodec', 'libvorbis', '-aq', '5', '-'
    ]
    pipe = Popen(command, stdout=PIPE)

    return Response(
        PipeWrapper(pipe),
        mimetype='audio/ogg',
        direct_passthrough=True
    )
