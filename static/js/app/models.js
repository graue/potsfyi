define(function (require) {
    "use strict";

    var _ = require('underscore'),
        Backbone = require('backbone');

    // M holds module contents for quick reference
    // and is returned at the end to define the module.
    var M = {};

    M.SongInfo = Backbone.Model.extend({
        defaults: {
            artist: '',
            title: '',
            filename: ''
        },

        initialize: function() {
            // assign a unique ID (based on Backbone's cid)
            // for use in HTML lists
            this.set({ htmlId: 'song-' + this.cid });
        }
    });

    M.SearchResultList = Backbone.Collection.extend({
        searchString: '',

        initialize: function() {
            _.bindAll(this, 'search', 'updateSearchString');
        },

        model: M.SongInfo,

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

                // If search string is not blank, set a timer to search
                // after a short interval (unless the string changes again).
                if (newSearchString !== '')
                    this.timeout = setTimeout(this.search, 200);
            }
        },

        search: function() {
            this.url = '/search?q=' + encodeURIComponent(this.searchString);
            this.fetch();
        }
    });

    var SongCollection = Backbone.Collection.extend({
        model: M.SongInfo
    });

    var Playlist = Backbone.Model.extend({
        defaults: {
            songCollection: new SongCollection(),
            position: -1
        },

        seekToSong: function(cid) {
            // cid refers to the cid of a model in the Playlist.
            var newSong = this.get('songCollection').get(cid);
            this.set('position',
                     this.get('songCollection').indexOf(newSong));
            M.PlayingSong.changeSong(newSong);
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

        removeSong: function(song) {
            var removedIndex = this.get('songCollection').indexOf(song);
            if (removedIndex == -1) {
                console.log('tried to remove song not in playlist!');
                return;
            }
            if (removedIndex === this.get('position')) {
                // removing currently playing song
                // XXX is currently playing song last?
                //    if (pos + 1 === this.get('songCollection').size())
                //    { do something... }
                this.nextSong();
            }
            this.get('songCollection').remove(song);
            if (removedIndex < this.get('position')) {
                // update position index, since removed song was before
                // (or at) current
                this.set('position', this.get('position') - 1);
            }
        }
    });

    var PlayingSongInfo = M.SongInfo.extend({
        changeSong: function(newSong) {
            this.set({
                artist: newSong.get('artist'),
                title: newSong.get('title'),
                filename: newSong.get('filename')
            });
            // view should listen for the filename change and re-render
        }
    });

    // XXX these should probably be created in a central controller
    M.PlayingSong = new PlayingSongInfo();
    M.Playlist = new Playlist();

    return M;
});
