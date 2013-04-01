"use strict";

var $ = require('../lib/jquery.shim'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    tmplResult = require('../template/result.hbs'),
    tmplPlaylistSong = require('../template/playlistSong.hbs'),
    tmplPlayer = require('../template/player.hbs');

var DEFAULT_BG = '/static/img/pattern.png';

exports.SearchResultView = Backbone.View.extend({
    tagName: 'li',
    className: function() {
        // XXX Pretty hacky... we test whether the response has a
        // has_cover_art attribute. If it does (even if the attribute
        // is false!), it's an album, otherwise it's a song result.
        if (this.model.get('has_cover_art') !== undefined)
            return 'result-album';

        return 'result-song';
    },
    events: {'click a': 'handleClick'},

    initialize: function() {
        _.bindAll(this, 'render', 'handleClick', 'className');
        this.render();
    },

    render: function() {
        this.$el.html(tmplResult({
            artist: this.model.get('artist'),
            title: this.model.get('title'),
            id: this.model.get('id'),
            has_cover_art: this.model.get('has_cover_art'),
            is_album: this.className() === 'result-album'}));
        return this;
    },

    handleClick: function(event) {
        event.preventDefault();
        this.trigger('click');
    }
});

exports.SearchResultListView = Backbone.View.extend({
    el: $('ul#search-results'),

    initialize: function() {
        _.bindAll(this, 'refresh', 'appendResult');
        this.collection.on('reset', this.refresh);
    },

    appendResult: function(result) {
        var resultView = new exports.SearchResultView({
            model: result
        });
        this.$el.append(resultView.render().el);

        var listView = this;
        resultView.on('click', function() {
            if (resultView.className() === 'result-album') {
                // Need to enqueue a whole album.
                listView.trigger('album-clicked', result.get('id'));
            } else {
                listView.trigger('song-clicked', result.attributes);
            }
        });
    },

    refresh: function() {
        this.$el.text('');
        var listView = this;
        _(this.collection.models).each(function(result) {
            listView.appendResult(result);
        }, this);
    }
});

exports.PlaylistItemView = Backbone.View.extend({
    tagName: 'li',
    className: 'solo-track',
    events: {'click span': 'play',
             'click a.remove-link': 'removeFromPlaylist'},

    initialize: function() {
        _.bindAll(this, 'render', 'play', 'removeFromPlaylist');
        this.$el.attr('id', this.model.get('htmlId'));
        this.render();
    },

    render: function() {
        this.$el.html(tmplPlaylistSong({
            artist: this.model.get('artist'),
            title: this.model.get('title')
        }));
        return this;
    },

    play: function(event) {
        window.playlist.seekToSong(this.model.cid);
    },

    removeFromPlaylist: function(event) {
        event.preventDefault();
        window.playlist.removeSong(this.model);
    }
});

exports.PlaylistView = Backbone.View.extend({
    el: $('ul#playlist'),

    initialize: function() {
        _.bindAll(this, 'addSong', 'removeSong', 'updateNowPlaying');

        // The Playlist model proxies "add" and "remove" events
        // from its inner collection.
        this.model.on('add', this.addSong);
        this.model.on('remove', this.removeSong);
        this.model.on('change:position', this.updateNowPlaying);
    },

    addSong: function(track) {
        var itemView = new exports.PlaylistItemView({model: track});
        this.$el.append(itemView.render().el);
    },

    removeSong: function(track) {
        this.$('#' + track.get('htmlId')).remove();
    },

    updateNowPlaying: function() {
        var oldPlayPos = this.model.previous('position');
        var newPlayPos = this.model.get('position');
        $('li:nth-child(' + (oldPlayPos + 1) + ')',
            this.$el).removeClass('now-playing');
        $('li:nth-child(' + (newPlayPos + 1) + ')',
            this.$el).addClass('now-playing');
    }
});

exports.PlayingSongView = Backbone.View.extend({
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
        $('audio', this.$el).trigger('pause');
        $('audio', this.$el).attr('src', '');

        if (songID == -1) {
            // This means no song is active.
            // Hide the player and buttons.
            this.$el.html('');

            // Reset the background image.
            $('body').css('background-image', 'url(' + DEFAULT_BG + ')');

            return;
        }

        var wantedFormats = this.model.get('supportedFormats');
        var filename = '/song/' + songID + '/' + wantedFormats;

        this.$el.html(tmplPlayer({
            encodedFilename: filename,
            isPlaying: true
        }));

        // start the music
        $('audio', this.$el).trigger('play');

        // set up handler to move to next song when song finished
        $('audio', this.$el).on('ended', this.gotoNextSong);

        // update the cover art
        var bg = DEFAULT_BG;
        if (this.model.has('album')) {
            var album = this.model.get('album');
            if (typeof album === 'object' && album.has_cover_art)
                bg = '/albumart/' + album.id;
        }
        $('body').css('background-image', 'url(' + bg + ')');
    },

    gotoNextSong: function() {
        if (!window.playlist.nextSong()) {
            // In the case where we were already on the last song,
            // and nothing is playing now,
            // we need to update the play/pause button to say Play.
            $('#btn-play-pause').text('Play');
        }
    },

    gotoPrevSong: function() {
        window.playlist.prevSong();
    },

    togglePlaying: function() {
        var audioEl = $('audio', this.$el).get(0);
        var playPauseBtnSel = $('#btn-play-pause', this.$el);
        if (audioEl && !audioEl.paused) {
            audioEl.pause();
            playPauseBtnSel.text('Play');
        } else if (audioEl) {
            audioEl.play();
            playPauseBtnSel.text('Pause');
        }
    }
});
