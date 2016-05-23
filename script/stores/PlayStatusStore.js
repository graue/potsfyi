"use strict";

import ActionConstants from '../actions/ActionConstants';
import * as Adler32 from 'adler-32';
import AlbumStore from './AlbumStore';
import {EventEmitter} from 'events';
import PotsDispatcher from '../dispatcher/PotsDispatcher';
import TrackStore from './TrackStore';
import invariant from '../utils/invariant';

const NO_PLAYING_INDEX = -1;

// Every track in the playlist needs a unique ID associated with it, and
// we can't use track IDs because you can add a track to the playlist twice.
// Hence, we use nonces.
let _insertionCount = 1;
function createNonce() {
  return _insertionCount++;
}

let playlist = [];  // Tuples of [track ID, nonce].
let playingIndex = NO_PLAYING_INDEX;
let initialTrackTime = null;  // When hydrating a saved playlist.
let trackPlayStatus = {
  paused: false,
};

class PlayStatusStoreClass extends EventEmitter {
  _emitChange() {
    this.emit('change');
  }

  addChangeListener(cb) {
    this.on('change', cb);
  }

  removeChangeListener(cb) {
    this.removeListener('change', cb);
  }

  getTracksWithKeys() {
    return playlist;
  }

  getInitialTrackTime() {
    return initialTrackTime;
  }

  getPlayingIndex() {
    return playingIndex;
  }

  getPlayingTrack() {
    if (playingIndex === NO_PLAYING_INDEX) {
      return null;
    } else {
      return playlist[playingIndex][0];
    }
  }

  getTrackPlayStatus() {
    return trackPlayStatus;
  }

  isPlaylistEmpty() {
    return playlist.length === 0;
  }

  isAnythingPlaying() {
    return playingIndex !== NO_PLAYING_INDEX;
  }

  canPrev() {
    return this.isAnythingPlaying() && playingIndex > 0;
  }

  canNext() {
    return this.isAnythingPlaying() && playingIndex < playlist.length - 1;
  }

  canPlay() {
    return (
      !this.isPlaylistEmpty() && (
        !this.isAnythingPlaying() || trackPlayStatus.paused
      )
    );
  }

  canPause() {
    return this.isAnythingPlaying() && !trackPlayStatus.paused;
  }
}

let PlayStatusStore = new PlayStatusStoreClass();

PlayStatusStore.NO_PLAYING_INDEX = NO_PLAYING_INDEX;

PlayStatusStore.dispatchToken = PotsDispatcher.register(function(action) {
  switch (action.type) {
    case ActionConstants.REORDER_PLAYLIST:
      invariant(
        action.from != null && action.from >= 0 &&
          action.from < playlist.length &&
          action.to != null && action.to >= 0 && action.to < playlist.length,
        'Invalid from or to field in playlist reorder action'
      );

      if (action.to !== action.from) {
        const moved = playlist.splice(action.from, 1)[0];
        playlist.splice(action.to, 0, moved);

        if (playingIndex !== NO_PLAYING_INDEX) {
          const preChange = playingIndex;
          if (playingIndex === action.from) {
            playingIndex = action.to;
          } else if (playingIndex < action.from && playingIndex >= action.to) {
            playingIndex++;
          } else if (playingIndex > action.from && playingIndex <= action.to) {
            playingIndex--;
          }
        }

        PlayStatusStore._emitChange();
      }
      break;

    case ActionConstants.ADD_TO_PLAYLIST:
      playlist = playlist.concat(
        action.trackIds.map((trackId) => [trackId, createNonce()])
      );
      PlayStatusStore._emitChange();
      break;

    case ActionConstants.REMOVE_FROM_PLAYLIST:
      initialTrackTime = null;
      playlist.splice(action.index, 1);
      if (playingIndex !== NO_PLAYING_INDEX && playingIndex > action.index) {
        // We deleted a track before the currently playing track.
        playingIndex--;
      } else if (playingIndex === playlist.length) {
        // We deleted the last track, while it was playing.
        playingIndex = NO_PLAYING_INDEX;
      }

      PlayStatusStore._emitChange();
      break;

    case ActionConstants.PLAY_TRACK:
      invariant(
        action.index >= 0 && action.index < playlist.length,
        'Out of range track play'
      );
      if (trackPlayStatus.paused || action.index !== playingIndex) {
        initialTrackTime = null;
        trackPlayStatus.paused = false;
        playingIndex = action.index;
        // TODO: If index has changed, set time to 0 seconds (once time in
        // track is added to the store).
        PlayStatusStore._emitChange();
      }
      break;

    case ActionConstants.PAUSE_TRACK:
      if (!trackPlayStatus.paused) {
        initialTrackTime = null;
        trackPlayStatus.paused = true;
        PlayStatusStore._emitChange();
      }
      break;

    case ActionConstants.TRACK_ENDED:
      invariant(
        !trackPlayStatus.paused && playingIndex !== NO_PLAYING_INDEX,
        'Track ended action received while paused or stopped'
      );
      initialTrackTime = null;
      if (++playingIndex === playlist.length) {
        playingIndex = NO_PLAYING_INDEX;
      }
      PlayStatusStore._emitChange();
      break;

    case ActionConstants.HYDRATE_SAVED_PLAYLIST:
      hydrate(action);
      PlayStatusStore._emitChange();
      break;
  }
});

function hydrate(action) {
  const {
    savedPlaylistItems,
    savedIndex,
    wasPaused,
    trackTime,
    tracks,
  } = action;

  const tracksAsMap = tracks.reduce((obj, track) => {
    obj[track.id] = track;
    return obj;
  }, {});

  let filteredIndex = savedIndex;

  // Filter out any items not found or not matching
  const filteredTrackIds = savedPlaylistItems.filter((item, index) => {
    if (
      tracksAsMap[item.id]
      && Adler32.str(
        tracksAsMap[item.id].artist
        + tracksAsMap[item.id].title
      ) === item.checksum
    ) {
      return true;
    }
    // Update play head to account for removed track
    if (index === savedIndex) {
      filteredIndex = -1;
    } else if (index < savedIndex) {
      filteredIndex--;
    }
    return false;
  }).map(item => item.id);

  if (filteredTrackIds.length === 0) {
    return;
  }

  const startingPlaylistLength = playlist.length;
  playlist = playlist.concat(
    filteredTrackIds.map((trackId) => [trackId, createNonce()])
  );
  if (filteredIndex !== -1) {
    playingIndex = filteredIndex + startingPlaylistLength;
    trackPlayStatus.paused = wasPaused;
    // Only seek to the previous track time if we're going to start playing
    // immediately.
    if (!wasPaused) {
      initialTrackTime = trackTime;
    }
  }
}

export default PlayStatusStore;
