define(function (require) {
    "use strict";

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        tmplResult = require('hb!../app/template/result.html'),
        tmplPlaylistSong = require('hb!../app/template/playlistSong.html'),
        tmplPlayer = require('hb!../app/template/player.html'),
        models = require('app/models');

    var DEFAULT_BG = 'http://toxicsli.me/file/pattern.png';

    // M holds module contents for quick reference
    // and is returned at the end to define the module.
    var M = {};

    M.SearchResultView = Backbone.View.extend({
        tagName: 'li',
        className: 'result-song',
        events: {'click a': 'enqueue'},

        initialize: function() {
            _.bindAll(this, 'render', 'enqueue');
            this.render();
        },

        render: function() {
            this.$el.html(tmplResult({
                artist: this.model.get('artist'),
                title: this.model.get('title')}));
            return this;
        },

        enqueue: function(event) {
            event.preventDefault();
            models.Playlist.addSong(this.model.attributes);
        }
    });

    M.SearchResultListView = Backbone.View.extend({
        el: $('ul#search-results'),

        initialize: function() {
            _.bindAll(this, 'refresh', 'appendResult');

            this.collection = new models.SearchResultList();
            this.collection.on('reset', this.refresh);
        },

        appendResult: function(result) {
            var resultView = new M.SearchResultView({
                model: result
            });
            this.$el.append(resultView.render().el);
        },

        refresh: function() {
            this.$el.text('');
            var listView = this;
            _(this.collection.models).each(function(result) {
                listView.appendResult(result);
            }, this);
        }
    });

    M.PlaylistItemView = Backbone.View.extend({
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
            models.Playlist.seekToSong(this.model.cid);
        },

        removeFromPlaylist: function(event) {
            event.preventDefault();
            models.Playlist.removeSong(this.model);
        }
    });

    M.PlaylistView = Backbone.View.extend({
        el: $('ul#playlist'),

        initialize: function() {
            _.bindAll(this, 'addSong', 'removeSong', 'updateNowPlaying');

            this.collection = models.Playlist.get('songCollection');
            this.collection.on('add', this.addSong);
            this.collection.on('remove', this.removeSong);
            models.Playlist.on('change:position',
                               this.updateNowPlaying);
        },

        addSong: function(track) {
            var itemView = new M.PlaylistItemView({model: track});
            this.$el.append(itemView.render().el);
        },

        removeSong: function(track) {
            this.$('#' + track.get('htmlId')).remove();
            // XXX: update position, currently playing song
        },

        updateNowPlaying: function() {
            var oldPlayPos = models.Playlist.previous('position');
            var newPlayPos = models.Playlist.get('position');
            $('li:nth-child(' + (oldPlayPos + 1) + ')',
              this.$el).removeClass('now-playing');
            $('li:nth-child(' + (newPlayPos + 1) + ')',
              this.$el).addClass('now-playing');
        }
    });

    M.PlayingSongView = Backbone.View.extend({
        el: $('#player'),
        events: {
            'click #btn-play-pause': 'togglePlaying',
            'click #btn-prev': 'gotoPrevSong',
            'click #btn-next': 'gotoNextSong'
        },

        initialize: function() {
            _.bindAll(this, 'refresh', 'gotoNextSong', 'gotoPrevSong',
                            'togglePlaying');

            this.model = models.PlayingSong;
            this.model.on('change', this.refresh);
        },

        refresh: function() {
            var filename = this.model.get('filename');
            this.$el.html(tmplPlayer({
                encodedFilename: encodeURIComponent(filename),
                isPlaying: true
            }));

            // start the music
            $('audio', this.$el).trigger('play');

            // set up handler to move to next song when song finished
            $('audio', this.$el).on('ended', this.gotoNextSong);

            // update the cover art
            var bg = encodeURI(DEFAULT_BG);
            if (this.model.has('album')) {
                var album = this.model.get('album');
                if (typeof album === 'object' && 'cover_art' in album &&
                        typeof album.cover_art === 'string') {
                    bg = encodeURIComponent(album.cover_art);
                }
            }
            $('body').css('background-image', 'url(' + bg + ')');
        },

        gotoNextSong: function() {
            models.Playlist.nextSong();

            // In the case where we were already on the last song,
            // and nothing is playing now,
            // we need to update the play/pause button to say Play.
            if ($('audio', this.$el).get(0).paused)
                $('#btn-play-pause').text('Play');
        },

        gotoPrevSong: function() {
            models.Playlist.prevSong();
        },

        togglePlaying: function() {
            var audioEl = $('audio', this.$el).get(0);
            var playPauseBtnSel = $('#btn-play-pause', this.$el);
            if (audioEl && !audioEl.paused)
            {
                audioEl.pause();
                playPauseBtnSel.text('Play');
            } else if (audioEl) {
                audioEl.play();
                playPauseBtnSel.text('Pause');
            }
        }
    });

    return M;
});
