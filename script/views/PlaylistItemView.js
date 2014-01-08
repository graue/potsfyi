/** @jsx React.DOM */
"use strict";

var _ = require('underscore'),
    Backbone = require('backbone'),
    React = require('react');

var PlaylistItemView = React.createBackboneClass({
    render: function() {
        var m = this.getModel();
        var clickHandler = function() {
            this.props.clickHandler(m.attributes);
        }.bind(this);
        var removeClickHandler = function() {
            this.props.removeClickHandler(m.attributes);
        }.bind(this);
        return (
            <li className={'solo-track'
                           + (this.props.playing ? ' now-playing' : '')}
                data-idx={this.props.sortIndex}>
                <a href="#" className="remove-link"
                   onClick={removeClickHandler}>{'☒'}</a>
                {' '}
                <span onClick={clickHandler}
                      className="artist-name">{m.get('artist')}</span>
                {' — '}
                <span onClick={clickHandler}
                      className="song-name">{m.get('title')}</span>
            </li>
        );
    }
});

module.exports = PlaylistItemView;
