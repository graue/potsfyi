"use strict";

var _ = require('underscore'),
    Backbone = require('backbone'),
    BackboneLocalStorage = require('../lib/backbone.localStorage.shim.js');

exports.SongInfo = Backbone.Model.extend({
    initialize: function() {
        // assign a unique ID (based on Backbone's cid)
        // for use in HTML lists
        this.set({ htmlId: 'song-' + this.cid });
    }
});

exports.SearchResultList = Backbone.Collection.extend({
    searchString: '',

    initialize: function() {
        _.bindAll(this, 'search', 'updateSearchString');
    },

    model: exports.SongInfo,

    // Override because Flask requires an object at top level.
    parse: function(resp, xhr) {
        return resp.objects;
    },

    updateSearchString: function(newSearchString) {
        // Only update if search string has actually changed.
        if (newSearchString !== this.searchString) {
            this.searchString = newSearchString;

            // Clear the old search-as-you-type timer
            if (this.timeout)
                clearTimeout(this.timeout);

            // Set a timer to search
            // after a short interval (unless the string changes again).
            this.timeout = setTimeout(this.search, 200);
        }
    },

    search: function() {
        if (this.searchString === '') {
            // empty search string: display no results
            this.reset();
        } else {
            this.url = '/search?q=' + encodeURIComponent(this.searchString);
            this.fetch({reset: true});
        }
    }
});

var SongCollection = Backbone.Collection.extend({
    model: exports.SongInfo,

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
            options.remove = false;
            coll.set(resp, options);
        };
        Backbone.sync('read', this, options);
    },

    initialize: function() {
        _.bindAll(this, 'addAlbum');
    }
});

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
            'syncToLocalStorage');

        // Resync to localStorage when the playlist changes.
        var syncMethod = this.syncToLocalStorage;
        this.attributes.songCollection.on('add remove',
            function(model, collection, options) {
                options.syncingFromLS || syncMethod();
            }
        );

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
                exports.PlayingSong.changeSong(null);
                return;
            }

            var newSong = songColl.at(value);
            exports.PlayingSong.changeSong(newSong);
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
                songColl.add(new exports.SongInfo(songAttrs), options);
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
        this.get('songCollection').add(spec);
    },

    addAlbum: function(albumId) {
        this.get('songCollection').addAlbum(albumId);
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

var PlayingSongInfo = exports.SongInfo.extend({
    changeSong: function(newSong) {
        if (!newSong) {
            this.set('id', '-1');
        } else {
            this.set(newSong.attributes);  // copy all attributes
        }
        // view should listen for the filename change and re-render
    }
});

// XXX these should probably be created in a central controller
exports.PlayingSong = new PlayingSongInfo();
exports.Playlist = new Playlist();
