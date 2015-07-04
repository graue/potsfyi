"use strict";

var Icon = require('./Icon');
var PlaybackActionCreators = require('../actions/PlaybackActionCreators');
var PlaylistActionCreators = require('../actions/PlaylistActionCreators');
var React = require('react/addons');

var cx = require('classnames');

var PlaylistItem = React.createClass({
  handleClick: function() {
    // FIXME: sortIndex is the wrong name for the prop, since here we're using
    // it for something that clearly isn't sorting.
    PlaybackActionCreators.playTrack(this.props.sortIndex);
  },

  handleRemoveClick: function() {
    PlaylistActionCreators.removeFromPlaylist(this.props.sortIndex);
  },

  render: function() {
    var track = this.props.track;

    var classes = cx({
      PlaylistItem: true,
      PlaylistItemPlaying: this.props.isPlaying
    });

    var playingIndicator = '';
    if (this.props.isPlaying) {
      // TODO: Maybe to be extra clever, make this a pause icon if the track
      // is playing, and allow clicking it to toggle play/pause state.
      // (Little confusing otherwise to see the same symbol here that's used
      // for the play button.)
      playingIndicator = (
        <span className="PlaylistItemPlayingIndicator">
          <Icon name={Icon.NAMES.PLAY} alt="Current playing: " />
        </span>
      );
    }

    return (
      <li
        className={classes}
        data-idx={this.props.sortIndex}>
        <span onClick={this.handleClick}>
          {playingIndicator}
          <span className="PlaylistItemArtist">
            {track.artist}
          </span>
          {' — '}
          <span className="PlaylistItemTitle">
            {track.title}
          </span>
        </span>
        <Icon
          alt="Remove"
          className="PlaylistItemRemoveLink"
          name={Icon.NAMES.X}
          onClick={this.handleRemoveClick}
          />
      </li>
    );
  }
});

module.exports = PlaylistItem;
