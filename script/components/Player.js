"use strict";

import {trackEnded} from '../actions/ActionCreators';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import emptyTrackURI from '../utils/emptyTrackURI';
import invariant from '../utils/invariant';
import {getPlayingTrack} from '../selectors/selectors';
import supportedAudioFormats from '../utils/supportedAudioFormats';

// If no ReplayGain info, default to amplifying by minus 6 decibels to make stuff
// less likely to blast.
const DEFAULT_GAIN = -6;

function mapStateToProps(state) {
  const trackId = getPlayingTrack(state);

  if (trackId == null) {
    return {haveTrack: false};
  }

  // get gain
  let gain = DEFAULT_GAIN;
  const track = state.trackCache.cache[trackId];
  const album = track.albumId != null ? state.albumCache.cache[track.albumId] : null;
  if (album && album.gain != null)
    gain = album.gain;
  else if (track.gain != null)
    gain = track.gain;

  const filename = '/track/' + trackId + '/' + supportedAudioFormats();

  const initialTrackTime = state.playStatus.initialTrackTime;

  return {
    haveTrack: true,
    filename,
    gain,
    paused: state.playStatus.paused,
    initialTrackTime,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onEnded() {
      dispatch(trackEnded());
    },
  };
}

const MEDIA_READY_STATE_HAVE_METADATA = 1;

class Player extends Component {
  componentDidMount() {
    // Attach event handlers. Sadly React doesn't support media element events.
    // Which sucks... I feel like I'm writing a Backbone view again. Alas.
    // Also when I had put a canplay event here it was never getting fired,
    // what's up with that? ended works though.
    // TODO When you upgrade React, use the built-in support for these events
    const audioEl = this.getAudioElement();
    audioEl.addEventListener('ended', this.props.onEnded);
    audioEl.addEventListener('loadedmetadata', this._handleLoadedMetadata);
  }

  componentWillUnmount() {
    // FIXME: Does this ever get called tho? <Player /> always rendered
    // in app...
    this.forceStopDownloading();
    const audioEl = this._audioEl;
    if (audioEl) {
      audioEl.removeEventListener('ended', this.props.onEnded);
      audioEl.removeEventListener('loadedmetadata', this._handleLoadedMetadata);
    }
  }

  _handleLoadedMetadata = () => {
    if (!this.props.haveTrack) {
      return;  // Ignore load of dummy audio
    }

    const {paused, initialTrackTime} = this.props;
    const audioEl = this.getAudioElement();
    if (initialTrackTime != null) {
      audioEl.currentTime = initialTrackTime;
    }
    // FIXME: This plays mono tracks 3 dB too loud. It's not immediately obvious to me how
    // to check if the audio file is mono or stereo.
    // FIXME: We cannot make tracks louder this way, only quieter. So a positive ReplayGain
    // (common with classical recordings) is ignored. Anyway it might clip. Need limiter or
    // else warn user to turn up their volume.
    audioEl.volume = Math.min(1, dbToRatio(this.props.gain));
    if (!paused) {
      audioEl.play();
    }
  }

  getAudioElement() {
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

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    // If the track is changing or there's no new track, stop downloading
    // the current one.
    // FIXME: This is tricky to write without WillUpdate. After the update, the src
    // will point to the new track so it's too late to do this.
    if (
      this.props.haveTrack && (
        !nextProps.haveTrack ||
        nextProps.filename !== this.props.filename
      )
    ) {
      this.forceStopDownloading();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Handle pausing, unpausing, and loading new tracks. Ugly imperative mess.

    if (this.props.haveTrack) {
      if (!prevProps.haveTrack || this.props.filename !== prevProps.filename) {
        // new track
        if (
          this.getAudioElement().readyState < MEDIA_READY_STATE_HAVE_METADATA
        ) {
          // Do nothing, we can't seek or play yet.
          // The loaded-metadata handler will seek.
        } else {
          this._handleLoadedMetadata();
        }
      } else if (this.props.paused && !prevProps.paused) {
        this.getAudioElement().pause();
      } else if (!this.props.paused && prevProps.paused) {
        this.getAudioElement().play();
      }
    }
  }

  render() {
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
  {forwardRef: true}
)(Player);

function dbToRatio(db) {
  return Math.pow(10, db / 20);
}
