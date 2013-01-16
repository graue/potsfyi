define(function (require) {
    var $ = require('jquery'),
        _ = require('underscore'),
        Backbone = require('backbone'),
        tmplResult = require('hb!../app/template/result.html');

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

    M.SearchResultView = Backbone.View.extend({
        tagName: 'li',
        className: 'result-song',
        events: {'click a': 'play'},

        initialize: function() {
            _.bindAll(this, 'render', 'play');
            this.render();
        },

        render: function() {
            this.$el.html(tmplResult({
                artist: this.model.get('artist'),
                title: this.model.get('title')}));
            return this;
        },

        play: function(event) {
            event.preventDefault();
            M.PlayingSong.set({
                artist: this.model.get('artist'),
                title: this.model.get('title'),
                filename: this.model.get('filename')
            });
            $('#player audio').get(0).play();
            console.log('playing: ' + this.model.get('filename'));
        }
    });

    M.SearchResultListView = Backbone.View.extend({
        el: $('ul#search-results'),

        initialize: function() {
            _.bindAll(this, 'refresh', 'appendResult');

            this.collection = new M.SearchResultList();
            this.collection.on('reset', this.refresh);
        },

        appendResult: function(result) {
            var resultView = new M.SearchResultView({
                model: result
            });
            this.$el.append(resultView.render().el);
        },

        refresh: function() {
            this.$el.text('');
            var listView = this;
            _(this.collection.models).each(function(result) {
                listView.appendResult(result);
            }, this);
        }
    });

    M.PlayingSong = new M.SongInfo();

    M.PlayingSongView = Backbone.View.extend({
        el: $('#player'),
        initialize: function() {
            _.bindAll(this, 'refresh');

            this.model = M.PlayingSong;
            this.model.on('change', this.refresh);
        },

        refresh: function() {
            var html = '';
            var filename = this.model.get('filename');
            if (filename != '') {
                html = '<audio src="static/music/'+ encodeURIComponent(filename)
                       + '"></audio>';
            }
            this.$el.html(html);
        }

    });

    return M;
});
