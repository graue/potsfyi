"use strict";

import Icon from './Icon';
import PlayStatusStore from '../stores/PlayStatusStore';
import PlaybackActionCreators from '../actions/PlaybackActionCreators';
import React from 'react';
import Srt from './Srt';

import cx from 'classnames';

import './Nav.css';

function getStateFromStores() {
  return {
    index: PlayStatusStore.getPlayingIndex(),
    paused: PlayStatusStore.getTrackPlayStatus().paused,
    canPrev: PlayStatusStore.canPrev(),
    canNext: PlayStatusStore.canNext(),
    canPlay: PlayStatusStore.canPlay(),
    canPause: PlayStatusStore.canPause(),
  };
}

const Nav = React.createClass({
  getInitialState() {
    return getStateFromStores();
  },

  componentDidMount() {
    PlayStatusStore.addChangeListener(this.handleChange);
  },

  componentWillMount() {
    PlayStatusStore.removeChangeListener(this.handleChange);
  },

  handleChange() {
    this.setState(getStateFromStores());
  },

  handlePrevClick() {
    PlaybackActionCreators.playTrack(this.state.index - 1);
  },

  handleNextClick() {
    PlaybackActionCreators.playTrack(this.state.index + 1);
  },

  handlePlayPauseClick() {
    if (this.state.index === PlayStatusStore.NO_PLAYING_INDEX) {
      PlaybackActionCreators.playTrack(0);
    } else if (this.state.paused) {
      PlaybackActionCreators.playTrack(this.state.index);
    } else {
      PlaybackActionCreators.pauseTrack();
    }
  },

  render() {
    const {canPrev, canNext, canPlay, canPause} = this.state;

    return (
      <div className="Nav">
        <Icon
          className={cx({
            Nav_Button: true,
            Nav_ButtonDisabled: !canPrev,
          })}
          name={Icon.NAMES.PREVIOUS}
          alt="Previous Track"
          onClick={canPrev ? this.handlePrevClick : null}
        />
        <Srt text=" " />
        <Icon
          className={cx({
            Nav_Button: true,
            Nav_ButtonDisabled: !(canPlay || canPause),
          })}
          name={canPause ? Icon.NAMES.PAUSE : Icon.NAMES.PLAY}
          alt={canPause ? 'Pause' : 'Play'}
          onClick={canPlay || canPause ? this.handlePlayPauseClick : null}
        />
        <Srt text=" " />
        <Icon
          className={cx({
            Nav_Button: true,
            Nav_ButtonDisabled: !canNext,
          })}
          name={Icon.NAMES.NEXT}
          alt="Next Track"
          onClick={canNext ? this.handleNextClick : null}
        />
      </div>
    );
  },
});

export default Nav;
