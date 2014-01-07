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
            'syncToLocalStorage', 'addSong', 'addAlbum', 'reorder',
            'seekByIndex', 'seekById', 'removeSongById', 'removeSong',
            'nextSong', 'prevSong');

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

    seekByIndex: function(index) {
        this.set('position', index);
    },

    seekById: function(id) {
        var matchedSongs = this.get('songCollection').where({id: id});
        if (matchedSongs.length !== 1)
            throw ("ID " + id + " matches " + matchedSongs.length + " songs,"
                   + " expected 1");
        this.seekByIndex(this.get('songCollection').indexOf(matchedSongs[0]));
    },

    nextSong: function() {
        var oldPos = this.get('position');

        // If there is no next song, seek to -1, which stops the music.
        if (oldPos + 1 >= this.get('songCollection').size()) {
            this.seekByIndex(-1);
            return;
        }

        this.seekByIndex(oldPos + 1);
    },

    prevSong: function() {
        var oldPos = this.get('position');

        // is there a previous song?
        if (oldPos <= 0)
            return false;  // no previous song

        this.seekByIndex(oldPos - 1);
        return true;  // success
    },

    addSong: function(spec) {
        this.attributes.songCollection.add(spec);
    },

    addAlbum: function(albumId) {
        this.attributes.songCollection.addAlbum(albumId);
    },

    removeSongById: function(id) {
        this.removeSong(this.get('songCollection').where({id: id})[0]);
    },

    removeSong: function(song) {
        var removedIndex = this.get('songCollection').indexOf(song);
        if (removedIndex == -1) {
            console.warn('tried to remove song not in playlist!');
            return;
        }
        if (removedIndex === this.get('position')) {
            // removing currently playing song,
            // skip to next
            this.nextSong();
        }
        this.get('songCollection').remove(song);
        if (removedIndex < this.get('position')) {
            // update position index, since removed song was before
            // (or at) current
            this.set('position', this.get('position') - 1);
        }
    },

    reorder: function(oldPos, newPos) {
        var coll = this.attributes.songCollection;
        var positionId = coll.at(this.get('position')).get('id');
        var model = coll.at(oldPos);
        coll.remove(model);
        coll.add(model, {at: newPos});
        this.set('position', coll.indexOf(coll.where({id: positionId})[0]));
    }
});

module.exports = Playlist;
