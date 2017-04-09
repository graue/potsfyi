"use strict";
// @flow

import PlayStatusStore from '../stores/PlayStatusStore';
import PlaybackActionCreators from '../actions/PlaybackActionCreators';
import React, {Component} from 'react';
import emptyTrackURI from '../utils/emptyTrackURI';
import invariant from '../utils/invariant';
import supportedAudioFormats from '../utils/supportedAudioFormats';

type PlayerProps = {};

type PlayerState = {
  haveTrack: boolean,
  filename?: string,
  paused?: boolean,
  initialTrackTime?: number,
};

function getStateFromStores(): PlayerState {
  const trackId = PlayStatusStore.getPlayingTrack();

  if (trackId == null) {
    return {haveTrack: false};
  }

  // In future we might depend on the TrackStore, call getTrack with the id,
  // and look up the resulting filename. However, for now, we can generate
  // the filename from just the ID and the server redirects us (or transcodes
  // on the fly).
  const filename = '/track/' + trackId + '/' + supportedAudioFormats();

  const initialTrackTime = PlayStatusStore.getInitialTrackTime();

  return {
    haveTrack: true,
    filename,
    paused: PlayStatusStore.getTrackPlayStatus().paused,
    initialTrackTime,
  };
}

class Player extends Component {
  props: PlayerProps;
  state: PlayerState;
  _audioEl: ?HTMLAudioElement;

  constructor(props: PlayerProps) {
    super(props);
    this.state = getStateFromStores();
  }

  componentDidMount() {
    PlayStatusStore.addChangeListener(this._handleChange);

    // Attach event handlers. Sadly React doesn't support media element events.
    // Which sucks... I feel like I'm writing a Backbone view again. Alas.
    // Also when I had put a canplay event here it was never getting fired,
    // what's up with that? ended works though.
    this.getAudioElement().addEventListener('ended', this._handleEnded);

    if (this.state.haveTrack) {
      this._startNewTrack();
    }
  }

  componentWillUnmount() {
    // FIXME: Does this ever get called tho? <Player /> always rendered
    // in app...
    PlayStatusStore.removeChangeListener(this._handleChange);
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

  // $FlowFixMe
  _handleChange = () => {
    this.setState(getStateFromStores());
  };

  // $FlowFixMe
  _handleEnded = () => {
    PlaybackActionCreators.trackEnded();
  };

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
      this.state.haveTrack && (
        !nextState.haveTrack ||
        nextState.filename !== this.state.filename
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

    if (this.state.haveTrack) {
      if (!prevState.haveTrack || this.state.filename !== prevState.filename) {
        // new track
        this._startNewTrack(this.state.initialTrackTime, this.state.paused);
      } else if (this.state.paused && !prevState.paused) {
        this.getAudioElement().pause();
      } else if (!this.state.paused && prevState.paused) {
        this.getAudioElement().play();
      }
    }
  }

  render(): React.Element<any> {
    return (
      <div>
        <audio
          ref={node => this._audioEl = node}
          src={this.state.haveTrack ? this.state.filename : emptyTrackURI}
        />
      </div>
    );
  }
}

export default Player;
