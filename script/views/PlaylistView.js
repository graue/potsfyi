"use strict";

var $ = require('../lib/jquery.shim'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    PlaylistItemView = require('./PlaylistItemView');

var PlaylistView = Backbone.View.extend({
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
        var itemView = new PlaylistItemView({model: track});
        this.$el.append(itemView.render().el);
    },

    removeSong: function(track) {
        this.$('#' + track.get('htmlId')).remove();
    },

    updateNowPlaying: function() {
        var oldPlayPos = this.model.previous('position');
        var newPlayPos = this.model.get('position');
        this.$('li:nth-child(' + (oldPlayPos+1) + ')')
            .removeClass('now-playing');
        this.$('li:nth-child(' + (newPlayPos+1) + ')')
            .addClass('now-playing');
    }
});

module.exports = PlaylistView;
