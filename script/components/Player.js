"use strict";

var PlayStatusStore = require('../stores/PlayStatusStore');
var PlaybackActionCreators = require('../actions/PlaybackActionCreators');
var React = require('react');
var invariant = require('../utils/invariant');
var supportedAudioFormats = require('../utils/supportedAudioFormats');

function getStateFromStores() {
  var index = PlayStatusStore.getPlayingIndex();

  if (index === PlayStatusStore.NO_PLAYING_INDEX) {
    return {haveTrack: false};
  }

  var trackId = PlayStatusStore.getPlaylist()[index];

  // In future we might depend on the TrackStore, call getTrack with the id,
  // and look up the resulting filename. However, for now, we can generate
  // the filename from just the ID and the server redirects us (or transcodes
  // on the fly).
  var filename = '/track/' + trackId + '/' + supportedAudioFormats();

  return {
    haveTrack: true,
    filename: filename,
    paused: PlayStatusStore.getTrackPlayStatus().paused,
  };
}

var Player = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    PlayStatusStore.addChangeListener(this.handleChange);

    // Attach event handlers. Sadly React doesn't support media element events.
    // Which sucks... I feel like I'm writing a Backbone view again. Alas.
    // Also when I had put a canplay event here it was never getting fired,
    // what's up with that? ended works though.
    this.getAudioElement().addEventListener('ended', this.handleEnded);

    if (this.state.haveTrack) {
      if (!this.state.paused) {
        this.getAudioElement().play();
      }
    }
  },

  componentWillUnmount: function() {
    // FIXME: Does this ever get called tho? <Player /> always rendered
    // in app...
    PlayStatusStore.removeChangeListener(this.handleChange);
    this.forceStopDownloading();
  },

  handleChange: function() {
    this.setState(getStateFromStores());
  },

  handleEnded: function() {
    PlaybackActionCreators.trackEnded();
  },

  getAudioElement: function() {
    invariant(
      this.isMounted(),
      'Attempted to get audio element, but component not mounted'
    );

    return this.refs.audioEl.getDOMNode();
  },

  forceStopDownloading: function() {
    // Force the browser to stop downloading the current track, if it's
    // downloading.
    //
    // TODO: Re-test whether this is all needed. I seem to recall it is — that
    // in the past, I had to both pause AND reset the src attribute or else
    // the file would keep downloading, even with the element removed from
    // the DOM. I might be misremembering and this is unnecessary...
    this.getAudioElement().pause();
    this.getAudioElement().src = '';
  },

  componentWillUpdate: function(nextProps, nextState) {
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
  },

  componentDidUpdate: function(prevProps, prevState) {
    // Handle pausing, unpausing, and loading new tracks. Ugly imperative mess.

    if (this.state.haveTrack) {
      if (!prevState.haveTrack || this.state.filename !== prevState.filename) {
        // new track
        if (!this.state.paused) {
          this.getAudioElement().play();
        }
      } else if (this.state.paused && !prevState.paused) {
        this.getAudioElement().pause();
      } else if (!this.state.paused && prevState.paused) {
        this.getAudioElement().play();
      }
    }
  },

  render: function() {
    return (
      <div>
        <audio
          ref="audioEl"
          src={this.state.haveTrack ? this.state.filename : ''}
        />
      </div>
    );
  }
});

module.exports = Player;
