var _ = require('underscore');

function detectFormats() {
    // Returns a comma-separated list of supported formats by
    // file extension, e.g. "mp3,ogg"
    var audio = document.createElement('audio');
    var mimetypes = {  // maps file extensions to mime types
        m4a: 'audio/mp4',
        ogg: 'audio/ogg',
        mp3: 'audio/mpeg'
    };
    return _.keys(mimetypes).filter(
            function(t) { return audio.canPlayType(mimetypes[t]); }
        ).join(',');
}

var formats;

exports.supportedFormats = function() {
    if (!formats)
        formats = detectFormats();
    return formats;
};
