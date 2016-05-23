"use strict";
// @flow

import * as Adler32 from 'adler-32';
import MainContentContainer from './MainContentContainer';
import PlayStatusStore from '../stores/PlayStatusStore';
import Player from './Player';
import React from 'react';
import * as SavedState from '../utils/SavedState';
import type {SavedPlaylistItem} from '../utils/SavedState';
import TrackStore from '../stores/TrackStore';
import UIBar from './UIBar';

class App extends React.Component {
  _player: Player;
  _interval: number;

  componentWillMount() {
    SavedState.read();
  }

  componentDidMount() {
    this._interval = setInterval(
      this._saveStateToLocalStorage.bind(this),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this._interval);
  }

  _saveStateToLocalStorage() {
    const items: Array<SavedPlaylistItem> = (
      PlayStatusStore.getTracksWithKeys().map(([trackId, nonce]) => ({
        id: trackId,
        checksum: Adler32.str(
          TrackStore.getTrack(trackId).artist +
          TrackStore.getTrack(trackId).title
        ),
      }))
    );
    SavedState.update(
      items,
      PlayStatusStore.getPlayingIndex(),
      PlayStatusStore.getTrackPlayStatus().paused,
      this._player.getAudioElement().currentTime
    );
  }

  render(): React.Element {
    return (
      <div id="app">
        <UIBar />
        <MainContentContainer />
        <Player ref={c => this._player = c} />
      </div>
    );
  }
}

export default App;
