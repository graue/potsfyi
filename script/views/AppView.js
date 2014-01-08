/** @jsx React.DOM */
"use strict";

var React = require('react'),
    SearchResultListView = require('./SearchResultListView'),
    PlaylistView = require('./PlaylistView'),
    PlayingSongView = require('./PlayingSongView');

var AppView = require('react').createClass({
    render: function() {
        var playlistClick = function(attrs) {
            this.props.playlist.seekById(attrs.id);
        }.bind(this);

        var playlistRemove = function(attrs) {
            this.props.playlist.removeSongById(attrs.id);
        }.bind(this);

        return (<div id="app">
            <div id="selections-window">
                <div id="search-card">
                    <input type="text" name="search-query" id="search-box"
                           placeholder="Search for music" />
                    <SearchResultListView model={this.props.resultList}
                        songClickHandler={this.props.playlist.addSong}
                        albumClickHandler={this.props.playlist.addAlbum} />
                </div>
            </div>
            <div id="playlist-window">
                <PlaylistView model={this.props.playlist}
                    clickHandler={playlistClick}
                    removeClickHandler={playlistRemove}
                    onReorder={this.props.playlist.reorder} />
            </div>
            <PlayingSongView model={this.props.playingSong}
                nextSongHandler={this.props.playlist.nextSong}
                prevSongHandler={this.props.playlist.prevSong} />
        </div>);
    }
});

module.exports = AppView;
