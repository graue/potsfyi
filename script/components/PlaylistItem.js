"use strict";

import Icon from './Icon';
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import './PlaylistItem.css';

class PlaylistItem extends React.Component {
  static propTypes = {
    isDragging: PropTypes.bool.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
    track: PropTypes.shape({
      artist: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const track = this.props.track;

    let playingIndicator = '';
    if (this.props.isPlaying) {
      // TODO: Maybe to be extra clever, make this a pause icon if the track
      // is playing, and allow clicking it to toggle play/pause state.
      // (Little confusing otherwise to see the same symbol here that's used
      // for the play button.)
      playingIndicator = (
        <span className="PlaylistItem_PlayingIndicator">
          <Icon name={Icon.NAMES.PLAY} alt="Current playing: " />
        </span>
      );
    }

    return (
      <li
        className={cx({
          PlaylistItem: true,
          PlaylistItem_Playing: this.props.isPlaying,
        })}
      >
        <span
          className={cx({
            PlaylistItem_DragTarget: true,
            "PlaylistItem_DragTarget-dragging": this.props.isDragging,
          })}
          onClick={this.props.onClick}
        >
          {playingIndicator}
          <span className="PlaylistItem_Artist">
            {track.artist}
          </span>
          {' — '}
          <span className="PlaylistItem_Title">
            {track.title}
          </span>
        </span>
        <Icon
          alt="Remove"
          className="PlaylistItem_RemoveLink"
          name={Icon.NAMES.X}
          onClick={this.props.onRemoveClick}
          />
      </li>
    );
  }
}

export default PlaylistItem;
