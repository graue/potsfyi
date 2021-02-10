"use strict";

import $ from '../lib/jquery.shim';

export function playTrack(indexOrNull) {
  return {
    type: 'playTrack',
    index: indexOrNull,
  };
}

export function pauseTrack() {
  return {type: 'pauseTrack'};
}

export function trackEnded() {
  return {type: 'trackEnded'};
}

export function searchAttempt(query) {
  return {
    type: 'searchAttempt',
    query,
  };
}

export function searchSuccess(
  query,
  responseObj
) {
  return {
    type: 'searchSuccess',
    forQuery: query,
    albums: responseObj.albums,
    tracks: responseObj.tracks,
    results: responseObj.search_results,
  };
}

let _pendingSearchRequest = null;
export function searchAsync(
  query
) {
  return (dispatch) => {
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

export function reorderPlaylist(from, to) {
  return {
    type: 'reorderPlaylist',
    from,
    to,
  };
}

export function addToPlaylist(trackIds) {
  return {
    type: 'addToPlaylist',
    trackIds,
  };
}

export function removeFromPlaylist(index) {
  return {
    type: 'removeFromPlaylist',
    index,
  };
}

export function hydrateSavedPlaylistAttempt(
  savedPlaylistItems,
  savedIndex,
  wasPaused,
  trackTime
) {
  return {
    type: 'hydrateSavedPlaylistAttempt',
    savedPlaylistItems,
    savedIndex,
    wasPaused,
    trackTime,
  };
}

export function hydrateSavedPlaylistSuccess(
  savedPlaylistItems,
  savedIndex,
  wasPaused,
  trackTime,
  tracks,
  albums
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
  savedPlaylistItems,
  savedIndex,
  wasPaused,
  trackTime
) {
  return (dispatch) => {
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
