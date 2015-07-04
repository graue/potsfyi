"use strict";

import ActionConstants from './ActionConstants';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

class PlaylistActionCreators {
  static reorderPlaylist(fromIndex, toIndex) {
    PotsDispatcher.dispatch({
      type: ActionConstants.REORDER_PLAYLIST,
      from: fromIndex,
      to: toIndex,
    });
  }
  static addToPlaylist(trackIds) {
    PotsDispatcher.dispatch({
      type: ActionConstants.ADD_TO_PLAYLIST,
      trackIds,
    });
  }
  static removeFromPlaylist(index) {
    PotsDispatcher.dispatch({
      type: ActionConstants.REMOVE_FROM_PLAYLIST,
      index,
    });
  }
}

export default PlaylistActionCreators;
