"use strict";

function _detectFormats() {
  // Returns a comma-separated list of supported formats by
  // file extension, e.g. "mp3,ogg"

  if (typeof document === undefined || !('createElement' in document)) {
    throw new Error('DOM API is unavailable, so can\'t detect formats');
  }

  var audio = document.createElement('audio');
  var mimetypes = {  // Maps file extensions to mime types.
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    mp3: 'audio/mpeg'
  };
  return Object.keys(mimetypes).filter(
    function(t) {
      return audio.canPlayType(mimetypes[t]);
    }
  ).join(',');
}

var _formats;

function supportedAudioFormats() {
  if (!_formats) {
    _formats = _detectFormats();
  }
  return _formats;
}

module.exports = supportedAudioFormats;
