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
                       playing={index === position}
                       clickHandler={this.props.clickHandler}
                       removeClickHandler={this.props.removeClickHandler} />;
        }.bind(this));

        return <ul id="playlist">{itemNodes}</ul>;
    },
    changeOptions: 'add remove change:position'
});

// TODO: add sorting like it was in the pre-React version
// see https://gist.github.com/petehunt/7882164

module.exports = PlaylistView;
