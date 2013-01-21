define(function (require) {
    "use strict";

    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        tmplResult = require('hb!../app/template/result.html'),
        tmplPlaylistSong = require('hb!../app/template/playlistSong.html'),
        models = require('app/models');

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
            models.Playlist.add({
                artist: this.model.get('artist'),
                title: this.model.get('title'),
                filename: this.model.get('filename')
            });
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
            models.PlayingSong.changeSong(this.model.cid);
        },

        removeFromPlaylist: function(event) {
            event.preventDefault();
            models.Playlist.remove(this.model);
        }
    });

    M.PlaylistView = Backbone.View.extend({
        el: $('ul#playlist'),

        initialize: function() {
            _.bindAll(this, 'addTrack', 'removeTrack');

            this.collection = models.Playlist;
            this.collection.on('add', this.addTrack);
            this.collection.on('remove', this.removeTrack);
        },

        addTrack: function(track) {
            var itemView = new M.PlaylistItemView({model: track});
            this.$el.append(itemView.render().el);
        },

        removeTrack: function(track) {
            this.$('#' + track.get('htmlId')).remove();
            // XXX: update position, currently playing song
        }
    });

    M.PlayingSongView = Backbone.View.extend({
        el: $('#player'),
        initialize: function() {
            _.bindAll(this, 'refresh');

            this.model = models.PlayingSong;
            this.model.on('change', this.refresh);
        },

        refresh: function() {
            var html = '';
            var filename = this.model.get('filename');
            if (filename !== '') {
                html = '<audio src="' + encodeURIComponent(filename) +
                       '"></audio>';
            }
            this.$el.html(html);

            // start the music
            $('audio', this.$el).trigger('play');
        }

    });

    return M;
});
