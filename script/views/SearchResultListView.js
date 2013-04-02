"use strict";

var $ = require('../lib/jquery.shim'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    SearchResultView = require('./SearchResultView');

var SearchResultListView = Backbone.View.extend({
    el: $('ul#search-results'),

    initialize: function() {
        _.bindAll(this, 'refresh', 'appendResult');
        this.collection.on('reset', this.refresh);
    },

    appendResult: function(result) {
        var resultView = new SearchResultView({
            model: result
        });
        this.$el.append(resultView.render().el);

        var listView = this;
        resultView.on('click', function() {
            if (resultView.className() === 'result-album') {
                // Need to enqueue a whole album.
                listView.trigger('album-clicked', result.get('id'));
            } else {
                listView.trigger('song-clicked', result.attributes);
            }
        });
    },

    refresh: function() {
        this.$el.text('');
        var listView = this;
        _(this.collection.models).each(function(result) {
            listView.appendResult(result);
        }, this);
    }
});

module.exports = SearchResultListView;
