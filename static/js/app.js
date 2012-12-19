// Client side code for potsfyi

requirejs.config({
    // By default, load module IDs from js/lib
    baseUrl: '/static/js/lib',

    // except if module ID starts with "app",
    // load it from the js/app directory
    paths: {
        app: '../app'
    },

    // Shim to properly load non-AMD modules (Backbone, Underscore)
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'json2', 'jquery'],
            exports: 'Backbone'
        }
    },
});

requirejs(['jquery', 'underscore', 'backbone'],
function(   $,        _,            Backbone) {
    var SearchResult = Backbone.Model.extend({
        defaults: {
            artist: '',
            title: '',
            filename: ''
        }
    });

    var SearchResultList = Backbone.Collection.extend({
        model: SearchResult,

        // Override because Flask requires an object at top level.
        parse: function(resp, xhr) {
            return resp.objects;
        }
    });

    var SearchResultView = Backbone.View.extend({
        tagName: 'li',
        events: {'click button.play': 'play'},

        initialize: function() {
            _.bindAll(this, 'render', 'play');
            this.model.on('change', this.render);
            this.render();
        },

        render: function() {
            this.$el.html(this.model.get('artist')+' - '+
                this.model.get('title'));
            this.$el.append(' <button class="play">play</button>');
            return this;
        },

        play: function() {
            window.location = '/player?track_url='+
                encodeURIComponent(this.model.get('filename'));
        }
    });

    var SearchResultListView = Backbone.View.extend({
        el: $('body'),
        events: {'click button#searchbtn': 'search'},

        initialize: function() {
            _.bindAll(this, 'render', 'search', 'appendResult',
                'refreshResults');

            this.collection = new SearchResultList();
            this.collection.on('reset', this.refreshResults);

            this.render();
        },

        render: function() {
            this.$el.append(
                '<form id="searchform">'+
                '<input type="text" id="artist"> Artist<br>'+
                '<input type="text" id="title"> Title</form>'+
                '<button id="searchbtn">search</button>');
            this.$el.append('<ul></ul>');
        },

        search: function() {
            this.collection.url = '/search?artist='+
                encodeURIComponent($('input#artist', this.el).val())+
                '&title='+
                encodeURIComponent($('input#title', this.el).val());
            this.collection.fetch();
        },

        appendResult: function(result) {
            var resultView = new SearchResultView({
                model: result
            });
            $('ul', this.el).append(resultView.render().el);
        },

        refreshResults: function() {
            $('ul', this.el).text('');
            var self = this;
            _(this.collection.models).each(function(result) {
                self.appendResult(result);
            }, this);
        }
    });

    var resultListView = new SearchResultListView();
});
