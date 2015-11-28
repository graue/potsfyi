"use strict";
// @flow

import ActionConstants from './ActionConstants';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

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
}

export default PlaylistActionCreators;
