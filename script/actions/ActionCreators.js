"use strict";
// @flow

import type {SavedPlaylistItem} from '../utils/SavedState';
import type {
  ServerSearchResult,
  ServerTrack,
  ServerAlbum,
} from '../types/server';
import $ from '../lib/jquery.shim';

export type ActionPlayTrack = {
  type: 'playTrack',
  index: ?number,
};
export function playTrack(indexOrNull: ?number): ActionPlayTrack {
  return {
    type: 'playTrack',
    index: indexOrNull,
  };
}

export type ActionPauseTrack = {type: 'pauseTrack'};
export function pauseTrack(): ActionPauseTrack {
  return {type: 'pauseTrack'};
}

export type ActionTrackEnded = {type: 'trackEnded'};
export function trackEnded(): ActionTrackEnded {
  return {type: 'trackEnded'};
}

export type ActionSearchAttempt = {
  type: 'searchAttempt',
  query: string,
};
export function searchAttempt(query: string) {
  return {
    type: 'searchAttempt',
    query,
  };
}

export type ActionSearchSuccess = {
  type: 'searchSuccess',
  forQuery: string,
  albums: Array<ServerAlbum>,
  tracks: Array<ServerTrack>,
  results: Array<ServerSearchResult>,
};
export function searchSuccess(
  query: string,
  responseObj: Object
) {
  return {
    type: 'searchSuccess',
    forQuery: query,
    albums: responseObj.albums,
    tracks: responseObj.tracks,
    results: responseObj.search_results,
  };
}

let _pendingSearchRequest: ?XMLHttpRequest = null;
export function searchAsync(
  query: string
): (dispatch: (action: Action) => Action) => void {
  return (dispatch: (action: Action) => Action) => {
    dispatch(searchAttempt(query));

    // Cancel any request currently being sent, to avoid wasting bandwidth or
    // server CPU.
    if (_pendingSearchRequest) {
      _pendingSearchRequest.abort();
    }

    // If the query is empty, immediately "succeed" with no results.
    if (query === '') {
      dispatch(searchSuccess(
        query,
        {
          albums: [],
          tracks: [],
          search_results: [],
        }
      ));
      return;
    }

    _pendingSearchRequest = $.get(
      '/search',
      {q: query},
      (data, textStatus, xhr) => {
        // Ignore stale responses for old queries.
        if (xhr !== _pendingSearchRequest) {
          return;
        }
        _pendingSearchRequest = null;
        dispatch(searchSuccess(
          query,
          data
        ));
      },
      'json'
    );
  };
}

export type ActionReorderPlaylist = {
  type: 'reorderPlaylist',
  from: number,
  to: number,
};
export function reorderPlaylist(from: number, to: number) {
  return {
    type: 'reorderPlaylist',
    from,
    to,
  };
}

export type ActionAddToPlaylist = {
  type: 'addToPlaylist',
  trackIds: Array<string>,
};
export function addToPlaylist(trackIds: Array<string>) {
  return {
    type: 'addToPlaylist',
    trackIds,
  };
}

export type ActionRemoveFromPlaylist = {
  type: 'removeFromPlaylist',
  index: number,
};
export function removeFromPlaylist(index: number) {
  return {
    type: 'removeFromPlaylist',
    index,
  };
}

export type ActionHydrateSavedPlaylistAttempt = {
  type: 'hydrateSavedPlaylistAttempt',
  savedPlaylistItems: Array<SavedPlaylistItem>,
  savedIndex: ?number,
  wasPaused: boolean,
  trackTime: number,
};
export function hydrateSavedPlaylistAttempt(
  savedPlaylistItems: Array<SavedPlaylistItem>,
  savedIndex: ?number,
  wasPaused: boolean,
  trackTime: number
) {
  return {
    type: 'hydrateSavedPlaylistAttempt',
    savedPlaylistItems,
    savedIndex,
    wasPaused,
    trackTime,
  };
}

export type ActionHydrateSavedPlaylistSuccess = {
  type: 'hydrateSavedPlaylistSuccess',
  savedPlaylistItems: Array<SavedPlaylistItem>,
  savedIndex: ?number,
  wasPaused: boolean,
  trackTime: number,
  tracks: Array<ServerTrack>,
  albums: Array<ServerAlbum>,
};
export function hydrateSavedPlaylistSuccess(
  savedPlaylistItems: Array<SavedPlaylistItem>,
  savedIndex: ?number,
  wasPaused: boolean,
  trackTime: number,
  tracks: Array<ServerTrack>,
  albums: Array<ServerAlbum>
) {
  return {
    type: 'hydrateSavedPlaylistSuccess',
    savedPlaylistItems,
    savedIndex,
    wasPaused,
    trackTime,
    tracks,
    albums,
  };
}

export function hydrateSavedPlaylistAsync(
  savedPlaylistItems: Array<SavedPlaylistItem>,
  savedIndex: ?number,
  wasPaused: boolean,
  trackTime: number
): (dispatch: (action: Action) => Action) => void {
  return (dispatch: (action: Action) => Action) => {
    dispatch(hydrateSavedPlaylistAttempt(
      savedPlaylistItems,
      savedIndex,
      wasPaused,
      trackTime
    ));

    if (savedPlaylistItems.length === 0) {
      return;
    }

    $.get(
      '/hydrate',
      {
        tracks: savedPlaylistItems.map(item => item.id).join(','),
      },
      (data, textStatus, xhr) => {
        dispatch(hydrateSavedPlaylistSuccess(
          savedPlaylistItems,
          savedIndex,
          wasPaused,
          trackTime,
          data.tracks,
          data.albums
        ));
      },
      'json'
    );
  };
}

export type Action = (
  ActionAddToPlaylist
  | ActionHydrateSavedPlaylistAttempt
  | ActionHydrateSavedPlaylistSuccess
  | ActionPauseTrack
  | ActionPlayTrack
  | ActionRemoveFromPlaylist
  | ActionReorderPlaylist
  | ActionSearchAttempt
  | ActionSearchSuccess
  | ActionTrackEnded
);
