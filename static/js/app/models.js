define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        tmplResults = require('hb!../app/template/results.html');

    // M holds module contents for quick reference
    // and is returned at the end to define the module.
    var M = {};

    M.SearchResult = Backbone.Model.extend({
        defaults: {
            artist: '',
            title: '',
            filename: ''
        }
    });

    M.SearchResultList = Backbone.Collection.extend({
        model: M.SearchResult,

        // Override because Flask requires an object at top level.
        parse: function(resp, xhr) {
            return resp.objects;
        }
    });

    M.SearchResultListView = Backbone.View.extend({
        el: $('ul#search-results'),
        searchString: '',

        initialize: function() {
            _.bindAll(this, 'search', 'refresh', 'updateSearchString');

            this.collection = new M.SearchResultList();
            this.collection.on('reset', this.refresh);
        },

        updateSearchString: function(newSearchString) {
            // Only update if search string has actually changed.
            if (newSearchString != this.searchString) {
                this.searchString = newSearchString;

                // Clear the old search-as-you-type timer
                if (this.timeout)
                    clearTimeout(this.timeout);

                // If search string is not blank, set a timer to search
                // after a short interval (unless the string changes again).
                if (newSearchString != '')
                    this.timeout = setTimeout(this.search, 200);
            }
        },

        search: function() {
            // XXX: This searches title only, as a stopgap
            // until the backend for full searching is available.

            this.collection.url = '/search?q='+
                encodeURIComponent(this.searchString);
            this.collection.fetch();
        },

        refresh: function() {
            var resultArray = this.collection.toJSON();
            this.$el.html(tmplResults({ results: resultArray }));
        }
    });

    return M;
});
