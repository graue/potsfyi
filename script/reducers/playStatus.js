"use strict";
// @flow

import type {
  Action,
  ActionHydrateSavedPlaylistSuccess,
} from '../actions/ActionCreators';
import * as Adler32 from 'adler-32';
import invariant from '../utils/invariant';

// Every track in the playlist needs a unique ID associated with it, and
// we can't use track IDs because you can add a track to the playlist twice.
// Hence, we use nonces.
type Nonce = number;
let _insertionCount = Date.now();
function createNonce(): Nonce {
  return _insertionCount++;
}

type PlayStatus = {
  playlist: Array<[string, Nonce]>,  // [track ID, nonce] tuples
  playingIndex: ?number,
  initialTrackTime: ?number,  // Used when hydrating a saved playlist.
  paused: boolean,
};

const initialState: PlayStatus = {
  playlist: [],
  playingIndex: null,
  initialTrackTime: null,
  paused: false,
};

export default function playStatus(
  state: PlayStatus = initialState,
  action: Action
): PlayStatus {
  if (action.type === 'reorderPlaylist') {
    invariant(
      action.from != null && action.from >= 0
        && action.from < state.playlist.length
        && action.to != null && action.to >= 0
        && action.to < state.playlist.length,
      'Invalid from or to field in playlist reorder action'
    );
    if (action.to !== action.from) {
      let playlist = state.playlist.slice();
      const moved = playlist.splice(action.from, 1)[0];
      playlist.splice(action.to, 0, moved);

      let {playingIndex} = state
      if (playingIndex != null) {
        const preChange = playingIndex;
        if (playingIndex === action.from) {
          playingIndex = action.to;
        } else if (playingIndex < action.from && playingIndex >= action.to) {
          playingIndex++;
        } else if (playingIndex > action.from && playingIndex <= action.to) {
          playingIndex--;
        }
      }

      state = {
        ...state,
        playlist,
        playingIndex,
      };
    }
  } else if (action.type === 'addToPlaylist') {
    state = {
      ...state,
      playlist: [
        ...state.playlist,
        ...action.trackIds.map(trackId => [trackId, createNonce()]),
      ],
    };
  } else if (action.type === 'removeFromPlaylist') {
    const playlist = state.playlist.slice().splice(action.index, 1);
    let {playingIndex} = state;
    if (playingIndex != null && playingIndex > action.index) {
      // We deleted a track before the currently playing track.
      playingIndex--;
    } else if (playingIndex === playlist.length) {
      // We deleted the last track, while it was playing.
      playingIndex = null;
    }
    state = {
      ...state,
      playlist,
      playingIndex,
      initialTrackTime: null,
    };
  } else if (action.type === 'playTrack') {
    invariant(
      action.index == null
      || (action.index >= 0 && action.index < state.playlist.length),
      'Out of range track play'
    );
    if (state.paused || action.index !== state.playingIndex) {
      state = {
        ...state,
        paused: false,
        playingIndex: action.index,
        initialTrackTime: null,
      };
    }
  } else if (action.type === 'trackEnded') {
    invariant(
      !state.paused && state.playingIndex != null,
      'Track ended action received while paused or stopped'
    );
    state = {
      ...state,
      playingIndex: (
        state.playingIndex + 1 === state.playlist.length
          ? null : state.playingIndex + 1
      ),
      initialTrackTime: null,
    };
  } else if (action.type === 'hydrateSavedPlaylistSuccess') {
    state = hydrate(state, action);
  }

  return state;
}

function hydrate(
  state: PlayStatus,
  action: ActionHydrateSavedPlaylistSuccess
): PlayStatus {
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
    if (filteredIndex != null && savedIndex != null) {
      // Update play head to account for removed track
      if (index === savedIndex) {
        filteredIndex = null;
      } else if (index < savedIndex) {
        filteredIndex--;
      }
    }
    return false;
  }).map(item => item.id);

  if (filteredTrackIds.length === 0) {
    return state;
  }

  const startingPlaylistLength = state.playlist.length;

  return {
    ...state,
    playlist: state.playlist.concat(
      filteredTrackIds.map((trackId) => [trackId, createNonce()])
    ),
    playingIndex: (
      filteredIndex != null
        ? filteredIndex + startingPlaylistLength
        : state.playingIndex
    ),
    paused: wasPaused && filteredIndex != null,

    // Only seek to the previous track time if we're going to start playing
    // immediately.
    initialTrackTime: (
      filteredIndex != null && !wasPaused
        ? trackTime
        : null
    ),
  };
}
