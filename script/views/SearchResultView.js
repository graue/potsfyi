"use strict";

var _ = require('underscore'),
    Backbone = require('backbone'),
    tmplResult = require('../template/result.hbs');

var SearchResultView = Backbone.View.extend({
    tagName: 'li',
    className: function() {
        // XXX Pretty hacky... we test whether the response has a
        // has_cover_art attribute. If it does (even if the attribute
        // is false!), it's an album, otherwise it's a song result.
        if (this.model.get('has_cover_art') !== undefined)
            return 'result-album';

        return 'result-song';
    },
    events: {'click a': 'handleClick'},

    initialize: function() {
        _.bindAll(this, 'render', 'handleClick', 'className');
        this.render();
    },

    render: function() {
        this.$el.html(tmplResult({
            artist: this.model.get('artist'),
            title: this.model.get('title'),
            id: this.model.get('id'),
            has_cover_art: this.model.get('has_cover_art'),
            is_album: this.className() === 'result-album'}));
        return this;
    },

    handleClick: function(event) {
        event.preventDefault();
        this.trigger('click');
    }
});

module.exports = SearchResultView;
