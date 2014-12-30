"use strict";

var AlbumStore = require('../stores/AlbumStore');
var PlayStatusStore = require('../stores/PlayStatusStore');
var React = require('react');
var TrackStore = require('../stores/TrackStore');

function getStateFromStores() {
  var art = '/static/img/pattern.png';
  var index = PlayStatusStore.getPlayingIndex();
  if (index !== PlayStatusStore.NO_PLAYING_INDEX) {
    var trackId = PlayStatusStore.getPlaylist()[index];
    var track = TrackStore.getTrack(trackId);
    if (track.albumId != null) {
      var album = AlbumStore.getAlbum(track.albumId);
      if (album.coverArt) {
        art = album.coverArt;
      }
    }
  }
  return {art: art};
}

var CoverArt = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    AlbumStore.addChangeListener(this.handleChange);
    PlayStatusStore.addChangeListener(this.handleChange);
    TrackStore.addChangeListener(this.handleChange);
  },

  componentWillUnmount: function() {
    AlbumStore.removeChangeListener(this.handleChange);
    PlayStatusStore.removeChangeListener(this.handleChange);
    TrackStore.removeChangeListener(this.handleChange);
  },

  handleChange: function() {
    this.setState(getStateFromStores());
  },

  render: function() {
    var styles = {
      backgroundImage: 'url(' + encodeURI(this.state.art) + ')',
    };

    return (
      <div className="CoverArt" style={styles} />
    );
  }
});

module.exports = CoverArt;
