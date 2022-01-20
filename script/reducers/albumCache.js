"use strict";

function normalize(rawAlbum) {
  return {
    artist: rawAlbum.artist,
    coverArt: rawAlbum.cover_art,
    date: rawAlbum.date,
    title: rawAlbum.title,
    tracks: rawAlbum.track_ids.map((id) => id.toString()),
    gain: rawAlbum.replay_gain,
  };
}

const initialState = {cache: {}};

export default function albumCache(
  state = initialState,
  action
) {
  if (
    action.type === 'searchSuccess'
    || action.type === 'hydrateSavedPlaylistSuccess'
  ) {
    // New top-level state object to make it easy to see data has changed.
    // Note: state.cache is still updated in place, to keep things efficient
    // without using Immutable.
    state = {...state};

    const cache = state.cache;
    action.albums.forEach(rawAlbum => {
      cache[rawAlbum.id.toString()] = normalize(rawAlbum);
    });
  }

  return state;
}
