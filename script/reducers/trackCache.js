"use strict";
// @flow

import type {Action} from '../actions/ActionCreators';
import type {ServerTrack} from '../types/server';

export type Track = {
  albumId: ?string,
  artist: string,
  title: string,
  trackNumber: ?number,
};

function normalize(rawTrack: ServerTrack): Track {
  return {
    albumId: rawTrack.album_id == null ? null : String(rawTrack.album_id),
    artist: rawTrack.artist,
    title: rawTrack.title,
    trackNumber: rawTrack.track,
  };
}

export type TrackCacheState = {
  cache: {[key: string]: Track},
};

const initialState: TrackCacheState = {cache: {}};

export default function trackCache(
  state: TrackCacheState = initialState,
  action: Action
): TrackCacheState {
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
