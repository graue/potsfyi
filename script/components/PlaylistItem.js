"use strict";
// @flow

import Icon from './Icon';
import PlaybackActionCreators from '../actions/PlaybackActionCreators';
import PlaylistActionCreators from '../actions/PlaylistActionCreators';
import React, {
  Component,
  PropTypes,
} from 'react';
import cx from 'classnames';

import './PlaylistItem.css';

type PlaylistItemProps = {
  sortIndex: number,
  isPlaying: boolean,
  track: {
    artist: string,
    title: string,
  },
};

class PlaylistItem extends Component {
  props: PlaylistItemProps;
  static propTypes = {
    sortIndex: PropTypes.number.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    track: PropTypes.shape({
      artist: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }).isRequired,
  };

  // $FlowFixMe
  _handleClick = (e: SyntheticMouseEvent) => {
    // FIXME: sortIndex is the wrong name for the prop, since here we're using
    // it for something that clearly isn't sorting.
    PlaybackActionCreators.playTrack(this.props.sortIndex);
  };

  // $FlowFixMe
  _handleRemoveClick = (e: SyntheticMouseEvent) => {
    PlaylistActionCreators.removeFromPlaylist(this.props.sortIndex);
  };

  render(): React.Element<any> {
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
        <span onClick={this._handleClick}>
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
          onClick={this._handleRemoveClick}
          />
      </li>
    );
  }
}

export default PlaylistItem;
