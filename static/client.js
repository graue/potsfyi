// Client side code for potsfyi

(function($) {
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
            this.model.bind('change', this.render);
        },

        render: function() {
            this.$el.html(this.model.get('artist')+' - '+
                this.model.get('title'));
            this.$el.append(' <button id="play">play</button>');
            return this;
        },

        play: function() {
            alert('not implemented, but would play track "'+
                  this.model.get('title')+'" by "'+
                  this.model.get('artist')+'"');
        }
    });

    var SearchResultListView = Backbone.View.extend({
        el: $('body'),
        events: {}, // nothing yet

        initialize: function() {
            _.bindAll(this, 'render', 'appendResult');

            this.collection = new SearchResultList();
            this.collection.bind('add', this.appendResult);

            this.render();
        },

        render: function() {
            var self = this;
            this.$el.append(
                '<form id="searchform">'+
                '<input type="text" id="artist"> Artist<br>'+
                '<input type="text" id="title"> Title</form>'+
                '<button id="searchbtn">search</button>');
            this.$el.append('<ul></ul>');
            _(this.collection.models).each(function(result) {
                self.appendResult(result);
            }, this);
        },

        appendResult: function(result) {
            var resultView = new SearchResultView({
                model: result
            });
            $('ul', this.el).append(resultView.render().el);
        }
    });

    var resultListView = new SearchResultListView();
})(jQuery);
