"use strict";

var Backbone = require('backbone'),
    SongInfo = require('./SongInfo');

var SongCollection = Backbone.Collection.extend({
    model: SongInfo,

    // Override because Flask requires an object at top level.
    // XXX code duplication: Also done for search results
    parse: function(resp, xhr) {
        return resp.objects;
    },

    addAlbum: function(albumId) {
        this.url = '/album/' + albumId;
        var options = {}, coll = this;
        options.parse = true;
        options.success = function(resp, status, xhr) {
            // Keep non-album tracks that are already in the playlist.
            options.remove = false;

            // If album tracks are already in the playlist, leave their
            // attributes unchanged.
            options.merge = false;

            coll.set(resp, options);
        };
        Backbone.sync('read', this, options);
    },

    initialize: function() {
        _.bindAll(this, 'addAlbum');
    }
});

module.exports = SongCollection;
