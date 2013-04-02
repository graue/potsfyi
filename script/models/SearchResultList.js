"use strict";

var Backbone = require('backbone'),
    SongInfo = require('./SongInfo');

var SearchResultList = Backbone.Collection.extend({
    searchString: '',

    initialize: function() {
        _.bindAll(this, 'search', 'updateSearchString');
    },

    model: SongInfo,

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

module.exports = SearchResultList;
