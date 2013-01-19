define(function (require) {
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
            this.url = '/search?q=' + encodeURIComponent(this.searchString);
            this.fetch();
        },
    });

    M.PlayingSong = new M.SongInfo();

    return M;
});
