"use strict";
// @flow

import * as Adler32 from 'adler-32';
import MainContentContainer from './MainContentContainer';
import Player from './Player';
import React from 'react';
import {Provider} from 'react-redux';
import * as SavedState from '../utils/SavedState';
import type {SavedPlaylistItem} from '../utils/SavedState';
import store from '../stores/store';
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
    const state = store.getState();
    const items: Array<SavedPlaylistItem> = (
      state.playStatus.playlist.map(([trackId, nonce]) => ({
        id: trackId,
        checksum: Adler32.str(
          state.trackCache.cache[trackId].artist +
          state.trackCache.cache[trackId].title
        ),
      }))
    );
    SavedState.update(
      items,
      state.playStatus.playingIndex,
      state.playStatus.paused,
      this._player.getWrappedInstance().getAudioElement().currentTime
    );
  }

  render(): React.Element {
    return (
      <Provider store={store}>
        <div id="app">
          <UIBar />
          <MainContentContainer />
          <Player ref={c => this._player = c} />
        </div>
      </Provider>
    );
  }
}

export default App;
