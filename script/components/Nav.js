"use strict";

var Icon = require('./Icon');
var PlayStatusStore = require('../stores/PlayStatusStore');
var PlaybackActionCreators = require('../actions/PlaybackActionCreators');
var React = require('react/addons');
var Srt = require('./Srt');

var cx = require('classnames');

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

var Nav = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    PlayStatusStore.addChangeListener(this.handleChange);
  },

  componentWillMount: function() {
    PlayStatusStore.removeChangeListener(this.handleChange);
  },

  handleChange: function() {
    this.setState(getStateFromStores());
  },

  handlePrevClick: function() {
    PlaybackActionCreators.playTrack(this.state.index - 1);
  },

  handleNextClick: function() {
    PlaybackActionCreators.playTrack(this.state.index + 1);
  },

  handlePlayPauseClick: function() {
    if (this.state.index === PlayStatusStore.NO_PLAYING_INDEX) {
      PlaybackActionCreators.playTrack(0);
    } else if (this.state.paused) {
      PlaybackActionCreators.playTrack(this.state.index);
    } else {
      PlaybackActionCreators.pauseTrack();
    }
  },

  render: function() {
    var {canPrev, canNext, canPlay, canPause} = this.state;

    return (
      <div className="Nav">
        <Icon
          className={cx({
            NavButton: true,
            NavButtonDisabled: !canPrev,
          })}
          name={Icon.NAMES.PREVIOUS}
          alt="Previous Track"
          onClick={canPrev ? this.handlePrevClick : null}
        />
        <Srt text=" " />
        <Icon
          className={cx({
            NavButton: true,
            NavButtonDisabled: !(canPlay || canPause),
          })}
          name={canPause ? Icon.NAMES.PAUSE : Icon.NAMES.PLAY}
          alt={canPause ? 'Pause' : 'Play'}
          onClick={canPlay || canPause ? this.handlePlayPauseClick : null}
        />
        <Srt text=" " />
        <Icon
          className={cx({
            NavButton: true,
            NavButtonDisabled: !canNext,
          })}
          name={Icon.NAMES.NEXT}
          alt="Next Track"
          onClick={canNext ? this.handleNextClick : null}
        />
      </div>
    );
  },
});

module.exports = Nav;
