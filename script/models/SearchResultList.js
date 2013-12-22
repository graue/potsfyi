"use strict";

var Backbone = require('backbone'),
    _ = require('underscore'),
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
            this.search();
        }
    },

    search: _.throttle(function() {
        if (this.searchString === '') {
            // empty search string: display no results
            this.reset();
        } else {
            this.url = '/search?q=' + encodeURIComponent(this.searchString);
            this.fetch({reset: true});
        }
    // Throttle to prevent excessive requests while the user is still typing,
    // and avoid making a leading-edge request (which will usually just be a
    // single letter: not useful).
    }, 200, {leading: false})
});

module.exports = SearchResultList;
