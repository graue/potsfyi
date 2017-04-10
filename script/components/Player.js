"use strict";
// @flow

import {trackEnded} from '../actions/ActionCreators';
import type {Action} from '../actions/ActionCreators';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import emptyTrackURI from '../utils/emptyTrackURI';
import invariant from '../utils/invariant';
import {getPlayingTrack} from '../selectors/selectors';
import type {ReduxState} from '../stores/store';
import supportedAudioFormats from '../utils/supportedAudioFormats';

type PlayerProps = {
  haveTrack: boolean,
  filename?: string,
  paused?: boolean,
  initialTrackTime?: ?number,
  onEnded: () => mixed,
};

type PlayerState = void;

function mapStateToProps(state: ReduxState) {
  const trackId = getPlayingTrack(state);

  if (trackId == null) {
    return {haveTrack: false};
  }

  // In future we might depend on the TrackStore, call getTrack with the id,
  // and look up the resulting filename. However, for now, we can generate
  // the filename from just the ID and the server redirects us (or transcodes
  // on the fly).
  const filename = '/track/' + trackId + '/' + supportedAudioFormats();

  const initialTrackTime = state.playStatus.initialTrackTime;

  return {
    haveTrack: true,
    filename,
    paused: state.playStatus.paused,
    initialTrackTime,
  };
}

function mapDispatchToProps(
  dispatch: (action: Action) => Action
) {
  return {
    onEnded() {
      dispatch(trackEnded());
    },
  };
}

class Player extends Component {
  props: PlayerProps;
  state: PlayerState;
  _audioEl: ?HTMLAudioElement;

  constructor(props: PlayerProps) {
    super(props);
  }

  componentDidMount() {
    // Attach event handlers. Sadly React doesn't support media element events.
    // Which sucks... I feel like I'm writing a Backbone view again. Alas.
    // Also when I had put a canplay event here it was never getting fired,
    // what's up with that? ended works though.
    this.getAudioElement().addEventListener('ended', this.props.onEnded);

    if (this.props.haveTrack) {
      this._startNewTrack();
    }
  }

  componentWillUnmount() {
    // FIXME: Does this ever get called tho? <Player /> always rendered
    // in app...
    this.forceStopDownloading();
  }

  _startNewTrack(
    time: ?number,
    paused: ?boolean
  ) {
    if (time != null) {
      this.getAudioElement().currentTime = time;
    }
    if (!paused) {
      this.getAudioElement().play();
    }
  }

  getAudioElement(): HTMLAudioElement {
    invariant(
      this._audioEl,
      'Attempted to get audio element, but it is not mounted'
    );

    return this._audioEl;
  }

  forceStopDownloading() {
    // Force the browser to stop downloading the current track, if it's
    // downloading.
    //
    // TODO: Re-test whether this is all needed. I seem to recall it is — that
    // in the past, I had to both pause AND reset the src attribute or else
    // the file would keep downloading, even with the element removed from
    // the DOM. I might be misremembering and this is unnecessary...
    this.getAudioElement().pause();
    this.getAudioElement().src = emptyTrackURI;
  }

  componentWillUpdate(
    nextProps: PlayerProps,
    nextState: PlayerState
  ) {
    // If the track is changing or there's no new track, stop downloading
    // the current one.
    if (
      this.props.haveTrack && (
        !nextProps.haveTrack ||
        nextProps.filename !== this.props.filename
      )
    ) {
      this.forceStopDownloading();
    }
  }

  componentDidUpdate(
    prevProps: PlayerProps,
    prevState: PlayerState
  ) {
    // Handle pausing, unpausing, and loading new tracks. Ugly imperative mess.

    if (this.props.haveTrack) {
      if (!prevProps.haveTrack || this.props.filename !== prevProps.filename) {
        // new track
        this._startNewTrack(this.props.initialTrackTime, this.props.paused);
      } else if (this.props.paused && !prevProps.paused) {
        this.getAudioElement().pause();
      } else if (!this.props.paused && prevProps.paused) {
        this.getAudioElement().play();
      }
    }
  }

  render(): React.Element<any> {
    return (
      <div>
        <audio
          ref={node => this._audioEl = node}
          src={this.props.haveTrack ? this.props.filename : emptyTrackURI}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => Object.assign(
    {},
    ownProps,
    stateProps,
    dispatchProps
  ),
  {withRef: true}
)(Player);
