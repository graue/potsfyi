"use strict";

var PlaylistActionCreators = require('../actions/PlaylistActionCreators');
var React = require('react');

var SearchResultItem = React.createClass({
  propTypes: {
    isAlbum: React.PropTypes.bool.isRequired,
    artist: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired,
    id: React.PropTypes.string.isRequired,
    tracks: React.PropTypes.arrayOf(React.PropTypes.string),
    coverArt: React.PropTypes.string,
  },

  handleClick: function() {
    var tracksToAdd = this.props.isAlbum ? this.props.tracks : this.props.id;
    PlaylistActionCreators.addToPlaylist(tracksToAdd);
  },

  render: function() {
    // TODO: Render the cover art if present.
    // TODO: Show albums differently from tracks (even if they don't have
    // cover art).
    // TODO: Add a role attribute for accessibility.
    return (
      <li className="SearchResultItem" onClick={this.handleClick}>
        {this.props.artist}
        {' — '}
        {this.props.title}
      </li>
    );
  }
});

module.exports = SearchResultItem;
