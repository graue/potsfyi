"use strict";
// @flow

import ActionConstants from './ActionConstants';
import PotsDispatcher from '../dispatcher/PotsDispatcher';
import type {SavedPlaylistItem} from '../utils/SavedState';
import $ from '../lib/jquery.shim';

class PlaylistActionCreators {
  static reorderPlaylist(fromIndex: number, toIndex: number) {
    PotsDispatcher.dispatch({
      type: ActionConstants.REORDER_PLAYLIST,
      from: fromIndex,
      to: toIndex,
    });
  }
  static addToPlaylist(trackIds: Array<number>) {
    PotsDispatcher.dispatch({
      type: ActionConstants.ADD_TO_PLAYLIST,
      trackIds,
    });
  }
  static removeFromPlaylist(index: number) {
    PotsDispatcher.dispatch({
      type: ActionConstants.REMOVE_FROM_PLAYLIST,
      index,
    });
  }
  static loadWithPlaylistData(
    savedPlaylistItems: Array<SavedPlaylistItem>,
    savedIndex: number,
    wasPaused: boolean,
    trackTime: number
  ) {
    if (savedPlaylistItems.length === 0) {
      return;
    }

    PotsDispatcher.dispatch({
      type: ActionConstants.LOAD_WITH_SAVED_PLAYLIST,
      savedPlaylistItems,
      savedIndex,
      wasPaused,
      trackTime,
    });
    $.get(
      '/hydrate',
      {
        tracks: savedPlaylistItems.map(item => item.id).join(','),
      },
      (data, textStatus, xhr) => {
        PotsDispatcher.dispatch({
          type: ActionConstants.HYDRATE_SAVED_PLAYLIST,
          savedPlaylistItems,
          savedIndex,
          wasPaused,
          trackTime,
          tracks: data.tracks,
          albums: data.albums,
        });
      },
      'json'
    );
  }
}

export default PlaylistActionCreators;
