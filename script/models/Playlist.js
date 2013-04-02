"use strict";

var _ = require('underscore'),
    Backbone = require('backbone'),
    BackboneLocalStorage = require('../lib/backbone.localStorage.shim'),
    SongInfo = require('./SongInfo'),
    SongCollection = require('./SongCollection');

var Playlist = Backbone.Model.extend({
    defaults: {
        songCollection: new SongCollection(),
        position: -1,
        id: 'playlist'
    },

    localStorage: new Backbone.LocalStorage('playlist'),

    getPlaylistFromLocalStorage: function() {
        this.fetch({
            error: function(model, resp, options) {
                // Reading the playlist from local storage failed.
                // This probably means no playlist is saved there to
                // begin with, so save the current (empty) playlist.
                Backbone.sync('create', model, {});
            },
            syncingFromLS: true
        });
    },

    syncToLocalStorage: function() {
        Backbone.sync('update', this, {
            error: function(xhr, status, error) {
                alert('Sync failed with status: ' + status);
            }
        });
    },

    initialize: function() {
        _.bindAll(this, 'getPlaylistFromLocalStorage', 'parse',
            'syncToLocalStorage', 'addSong', 'addAlbum');

        // Proxy the inner collection's "add" and "remove" events.
        var playlistModel = this;
        this.attributes.songCollection.on('add', function(mod, coll, opt) {
            playlistModel.trigger('add', mod, coll, opt);
        });
        this.attributes.songCollection.on('remove', function(mod, coll, opt) {
            playlistModel.trigger('remove', mod, coll, opt);
        });

        // Resync to localStorage when the playlist changes.
        var syncMethod = this.syncToLocalStorage;
        this.on('add remove', function(model, collection, options) {
            options.syncingFromLS || syncMethod();
        });

        // When the position changes, play the newly active song
        // and resync to localStorage.
        this.on('change:position', function(model, value, options) {
            var songColl = this.attributes.songCollection;

            if (value >= songColl.length) {
                alert('Error: Position ' + value + ' out of range; ' +
                    'last song is ' + (songColl.length - 1));
                return;
            }

            options.syncingFromLS || syncMethod();

            if (value == -1) {
                window.playingSong.changeSong(null);
                return;
            }

            var newSong = songColl.at(value);
            window.playingSong.changeSong(newSong);
        });
    },

    parse: function(resp, options) {
        // Called when we load the saved playlist out of LocalStorage.

        if (resp.songCollection) {
            // songCollection here is not actually a Backbone collection,
            // just the serialized form of its models' attributes.

            // We need to create a SongInfo model for each element,
            // then add the SongInfo models to this model's existing
            // SongCollection.

            // The playlist view is listening to this.songCollection,
            // so we can't simply replace this.songCollection with a
            // whole new collection.

            // Work around lack of 'this' in callback
            var songColl = this.attributes.songCollection;

            options.parse = false;  // avoid recursion!

            _.each(resp.songCollection, function(songAttrs) {
                songColl.add(new SongInfo(songAttrs), options);
            });

            delete resp.songCollection;
        }
        return resp;
    },

    seekToSong: function(cid) {
        // cid refers to the cid of a model in the Playlist.
        var newSong = this.get('songCollection').get(cid);
        this.set('position',
                    this.get('songCollection').indexOf(newSong));
    },

    nextSong: function() {
        var oldPos = this.get('position');

        // is there a next song?
        if (oldPos + 1 >= this.get('songCollection').size())
            return false;  // no next song

        this.seekToSong(this.get('songCollection').at(oldPos + 1).cid);
        return true;  // success
    },

    prevSong: function() {
        var oldPos = this.get('position');

        // is there a previous song?
        if (oldPos <= 0)
            return false;  // no previous song

        this.seekToSong(this.get('songCollection').at(oldPos - 1).cid);
        return true;  // success
    },

    addSong: function(spec) {
        this.attributes.songCollection.add(spec);
    },

    addAlbum: function(albumId) {
        this.attributes.songCollection.addAlbum(albumId);
    },

    removeSong: function(song) {
        var removedIndex = this.get('songCollection').indexOf(song);
        if (removedIndex == -1) {
            console.log('tried to remove song not in playlist!');
            return;
        }
        if (removedIndex === this.get('position')) {
            // removing currently playing song,
            // skip to next
            if (!this.nextSong()) {
                // already on last song
                this.seekToSong(-1);
            }
        }
        this.get('songCollection').remove(song);
        if (removedIndex < this.get('position')) {
            // update position index, since removed song was before
            // (or at) current
            this.set('position', this.get('position') - 1);
        }
    }
});

module.exports = Playlist;
