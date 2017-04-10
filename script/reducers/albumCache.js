"use strict";
// @flow

import type {Action} from '../actions/ActionCreators';
import type {ServerAlbum} from '../types/server';

export type Album = {
  artist: string,
  coverArt: ?string,
  date: ?string,
  title: string,
  tracks: Array<string>,
};

function normalize(rawAlbum: ServerAlbum): Album {
  return {
    artist: rawAlbum.artist,
    coverArt: rawAlbum.cover_art,
    date: rawAlbum.date,
    title: rawAlbum.title,
    tracks: rawAlbum.track_ids.map((id) => id.toString()),
  };
}

export type AlbumCacheState = {
  cache: {[key: string]: Album},
};

const initialState: AlbumCacheState = {cache: {}};

export default function albumCache(
  state: AlbumCacheState = initialState,
  action: Action
): AlbumCacheState {
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
