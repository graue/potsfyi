"use strict";
// @flow

import {
  playTrack,
  pauseTrack,
} from '../actions/ActionCreators';
import type {Action} from '../actions/ActionCreators';
import cx from 'classnames';
import Icon from './Icon';
import invariant from 'invariant';
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

type ReduxState = any;

type NavStateProps = {
  index: ?number,
  paused: boolean,
  canPrev: boolean,
  canNext: boolean,
  canPlay: boolean,
  canPause: boolean,
};

function mapStateToProps(state: ReduxState): NavStateProps {
  return {
    index: state.playStatus.playingIndex,
    paused: state.playStatus.paused,
    canPrev: canPrev(state),
    canNext: canNext(state),
    canPlay: canPlay(state),
    canPause: canPause(state),
  };
}

type NavCallbacks = {
  onPlay: (track: number) => void,
  onPause: () => void,
};

function mapDispatchToProps(
  dispatch: (action: Action) => Action
): NavCallbacks {
  return {
    onPause: () => {
      dispatch(pauseTrack());
    },
    onPlay: (track: number) => {
      dispatch(playTrack(track));
    },
  };
}

type NavProps = {
  index: ?number,
  paused: boolean,
  canPrev: boolean,
  canNext: boolean,
  canPlay: boolean,
  canPause: boolean,
  onPlay: (track: number) => void,
  onPause: () => void,
};

class Nav extends React.Component {
  props: NavProps;

  constructor(props: NavProps) {
    super(props);
  }

  _handlePrevClick: () => void = () => {
    invariant(this.props.index != null, 'cannot prev when no track active');
    this.props.onPlay(this.props.index - 1);
  };

  _handleNextClick: () => void = () => {
    invariant(this.props.index != null, 'cannot next when no track active');
    this.props.onPlay(this.props.index + 1);
  };

  _handlePlayPauseClick: () => void = () => {
    if (this.props.index == null) {
      this.props.onPlay(0);
    } else if (this.props.paused) {
      this.props.onPlay(this.props.index);
    } else {
      this.props.onPause();
    }
  };

  render(): React.Element {
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

export default Nav;
