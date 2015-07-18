"use strict";

function _detectFormats() {
  // Returns a comma-separated list of supported formats by
  // file extension, e.g. "mp3,ogg"

  let audio = document.createElement('audio');
  const mimetypes = {  // Maps file extensions to mime types.
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    mp3: 'audio/mpeg'
  };
  return Object.keys(mimetypes).filter(
    (t) => audio.canPlayType(mimetypes[t])
  ).join(',');
}

let _formats;

function supportedAudioFormats() {
  if (!_formats) {
    _formats = _detectFormats();
  }
  return _formats;
}

export default supportedAudioFormats;
