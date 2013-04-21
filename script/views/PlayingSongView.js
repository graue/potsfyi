"use strict";

var $ = require('../lib/jquery.shim'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    tmplPlayer = require('../template/player.hbs'),
    DEFAULT_BG = '/static/img/pattern.png';

function setBG(file) {
    file = file || DEFAULT_BG;
    $('body').css('background-image', 'url(' + file + ')');
}

var PlayingSongView = Backbone.View.extend({
    el: $('#player'),
    events: {
        'click #btn-play-pause': 'togglePlaying',
        'click #btn-prev': 'gotoPrevSong',
        'click #btn-next': 'gotoNextSong'
    },

    initialize: function() {
        _.bindAll(this, 'refresh', 'gotoNextSong', 'gotoPrevSong',
                        'togglePlaying', 'detectFormats');

        this.model.set('supportedFormats', this.detectFormats());
        this.model.on('change', this.refresh);
    },

    detectFormats: function() {
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
    },

    refresh: function() {
        var songID = this.model.get('id');

        // Force the old track to stop downloading, if applicable
        this.$('audio').trigger('pause');
        this.$('audio').attr('src', '');

        if (songID == -1) {
            // This means no song is active.
            // Hide the player and buttons.
            this.$el.html('');

            // Reset the background image.
            setBG();

            return;
        }

        var wantedFormats = this.model.get('supportedFormats');
        var filename = '/song/' + songID + '/' + wantedFormats;

        this.$el.html(tmplPlayer({
            encodedFilename: filename,
            isPlaying: true
        }));

        // start the music
        this.$('audio').trigger('play');

        // set up handler to move to next song when song finished
        this.$('audio').on('ended', this.gotoNextSong);

        // update the cover art
        var bg = DEFAULT_BG;
        if (this.model.has('album')) {
            var album = this.model.get('album');
            if (typeof album === 'object' && album.has_cover_art)
                bg = '/albumart/' + album.id;
        }
        setBG(bg);
    },

    gotoNextSong: function() {
        if (!window.playlist.nextSong()) {
            // In the case where we were already on the last song,
            // and nothing is playing now,
            // we need to update the play/pause button to say Play.
            var audioEl = this.$('audio').get(0);
            if (audioEl && audioEl.paused)
                $('#btn-play-pause').text('Play');
        }
    },

    gotoPrevSong: function() {
        window.playlist.prevSong();
    },

    togglePlaying: function() {
        var audioEl = this.$('audio').get(0);
        var playPauseBtnSel = this.$('#btn-play-pause');
        if (audioEl && !audioEl.paused) {
            audioEl.pause();
            playPauseBtnSel.text('Play');
        } else if (audioEl) {
            audioEl.play();
            playPauseBtnSel.text('Pause');
        }
    }
});

module.exports = PlayingSongView;
