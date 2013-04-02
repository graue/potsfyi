"use strict";

var _ = require('underscore'),
    Backbone = require('backbone'),
    tmplPlaylistSong = require('../template/playlistSong.hbs');

var PlaylistItemView = Backbone.View.extend({
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

module.exports = PlaylistItemView;
