"use strict";

var $ = require('../lib/jquery.shim'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    PlaylistItemView = require('./PlaylistItemView');

var PlaylistView = Backbone.View.extend({
    el: $('ul#playlist'),

    initialize: function() {
        _.bindAll(this, 'addSong', 'removeSong', 'updateNowPlaying',
            'startSort', 'reorder');

        // The Playlist model proxies "add", "remove" and "sort" events
        // from its inner collection.
        this.model.on('add', this.addSong);
        this.model.on('remove', this.removeSong);
        this.model.on('change:position', this.updateNowPlaying);

        this.$el.sortable();
        this.$el.disableSelection();
        this.$el.on('sortstart', this.startSort);
        this.$el.on('sortupdate', this.reorder);
    },

    addSong: function(track, collection, options) {
        var itemView = new PlaylistItemView({model: track});
        var rendered = itemView.render().el;

        if (options.at === undefined) {
            this.$el.append(rendered);
        } else {
            // Added at a specific index. We need to put it in the proper
            // location.
            if (options.at === 0) {
                this.$el.prepend(rendered);
            } else {
                var previous = collection.at(options.at - 1);
                this.$('#' + previous.get('htmlId')).after(rendered);
            }
        }
    },

    removeSong: function(track) {
        this.$('#' + track.get('htmlId')).remove();
    },

    startSort: function(event, ui) {
        window.sortedItem = ui.item;
        window.myEl = this.$el;
        this.draggedIndex = ui.item.index();
    },

    reorder: function(event, ui) {
        var newIndex = ui.item.index();
        this.model.reorder(this.draggedIndex, newIndex);
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
