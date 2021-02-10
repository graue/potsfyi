"use strict";

import {
  playTrack,
  pauseTrack,
} from '../actions/ActionCreators';
import cx from 'classnames';
import Icon from './Icon';
import invariant from '../utils/invariant';
import React from 'react';
import {connect} from 'react-redux';
import {
  canNext,
  canPause,
  canPlay,
  canPrev,
} from '../selectors/selectors';
import Srt from './Srt';

import './Nav.css';

function mapStateToProps(state) {
  return {
    index: state.playStatus.playingIndex,
    paused: state.playStatus.paused,
    canPrev: canPrev(state),
    canNext: canNext(state),
    canPlay: canPlay(state),
    canPause: canPause(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onPause: () => {
      dispatch(pauseTrack());
    },
    onPlay: (track) => {
      dispatch(playTrack(track));
    },
  };
}

class Nav extends React.Component {
  _handlePrevClick = () => {
    invariant(this.props.index != null, 'cannot prev when no track active');
    this.props.onPlay(this.props.index - 1);
  }

  _handleNextClick = () => {
    invariant(this.props.index != null, 'cannot next when no track active');
    this.props.onPlay(this.props.index + 1);
  }

  _handlePlayPauseClick = () => {
    if (this.props.index == null) {
      this.props.onPlay(0);
    } else if (this.props.paused) {
      this.props.onPlay(this.props.index);
    } else {
      this.props.onPause();
    }
  }

  render() {
    const {canPrev, canNext, canPlay, canPause} = this.props;

    return (
      <div className="Nav">
        <Icon
          className={cx({
            Nav_Button: true,
            Nav_ButtonDisabled: !canPrev,
          })}
          name={Icon.NAMES.PREVIOUS}
          alt="Previous Track"
          onClick={canPrev ? this._handlePrevClick : null}
        />
        <Srt text=" " />
        <Icon
          className={cx({
            Nav_Button: true,
            Nav_ButtonDisabled: !(canPlay || canPause),
          })}
          name={canPause ? Icon.NAMES.PAUSE : Icon.NAMES.PLAY}
          alt={canPause ? 'Pause' : 'Play'}
          onClick={canPlay || canPause ? this._handlePlayPauseClick : null}
        />
        <Srt text=" " />
        <Icon
          className={cx({
            Nav_Button: true,
            Nav_ButtonDisabled: !canNext,
          })}
          name={Icon.NAMES.NEXT}
          alt="Next Track"
          onClick={canNext ? this._handleNextClick : null}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Nav);
