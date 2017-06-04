"use strict";
// @flow

import Icon from './Icon';
import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import './PlaylistItem.css';

type PlaylistItemProps = {
  isPlaying: boolean,
  onClick: (e: SyntheticMouseEvent) => mixed,
  onRemoveClick: (e: SyntheticMouseEvent) => mixed,
  sortIndex: number,
  track: {
    artist: string,
    title: string,
  },
};

class PlaylistItem extends React.Component {
  props: PlaylistItemProps;
  static propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    onRemoveClick: PropTypes.func.isRequired,
    sortIndex: PropTypes.number.isRequired,
    track: PropTypes.shape({
      artist: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
  };

  render() {
    const track = this.props.track;

    const classes = cx({
      PlaylistItem: true,
      PlaylistItem_Playing: this.props.isPlaying,
    });

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
        className={classes}
        data-idx={this.props.sortIndex}>
        <span onClick={this.props.onClick}>
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
