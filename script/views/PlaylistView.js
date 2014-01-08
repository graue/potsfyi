/** @jsx React.DOM */
"use strict";

var $ = require('../lib/jquery.shim'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    React = require('react'),
    PlaylistItemView = require('./PlaylistItemView');

var PlaylistView = React.createBackboneClass({
    render: function() {
        var coll = this.getModel().get('songCollection');
        var position = this.getModel().get('position');
        var itemNodes = coll.map(function(song, index) {
            return <PlaylistItemView model={song} key={song.cid}
                       sortIndex={index}
                       playing={index === position}
                       clickHandler={this.props.clickHandler}
                       removeClickHandler={this.props.removeClickHandler} />;
        }.bind(this));

        return <ul id="playlist">{itemNodes}</ul>;
    },
    componentDidMount: function(rootNode) {
        this.makeSortable(rootNode);
    },
    componentDidUpdate: function(prevProps, prevState, rootNode) {
        this.makeSortable(rootNode);
    },
    makeSortable: function(rootNode) {
        $(rootNode)
            .disableSelection()
            .sortable({
                distance: 10,
                stop: function(event, ui) {
                    // jQuery UI doesn't give us the old (pre-drag) index,
                    // so use the data-idx attribute (which was set via the
                    // PlaylistItemView's sortIndex prop).
                    var fromIndex = ui.item.attr('data-idx');
                    var toIndex = ui.item.index();

                    // Prevent jQuery UI from actually moving the element,
                    // which would confuse React.
                    $(rootNode).sortable('cancel');

                    // Instead, reorder the playlist model and the DOM will
                    // update from there.
                    this.getModel().reorder(fromIndex, toIndex);
                }.bind(this)
            });
    },
    changeOptions: 'add remove change:position'
});

module.exports = PlaylistView;
