"use strict";

function normalize(rawTrack) {
  return {
    albumId: rawTrack.album_id == null ? null : String(rawTrack.album_id),
    artist: rawTrack.artist,
    title: rawTrack.title,
    trackNumber: rawTrack.track,
  };
}

const initialState = {cache: {}};

export default function trackCache(state = initialState, action) {
  if (
    action.type === 'searchSuccess'
    || action.type === 'hydrateSavedPlaylistSuccess'
  ) {
    // New top-level state object to make it easy to see data has changed.
    // Note: state.cache is still updated in place, to keep things efficient
    // without using Immutable.
    state = {...state};

    const cache = state.cache;
    action.tracks.forEach(rawTrack => {
      cache[rawTrack.id.toString()] = normalize(rawTrack);
    });
  }

  return state;
}
