"use strict";

var ActionConstants = require('../actions/ActionConstants');
var PotsDispatcher = require('../dispatcher/PotsDispatcher');

var PlaylistActionCreators = {
  reorderPlaylist: function(fromIndex, toIndex) {
    PotsDispatcher.dispatch({
      type: ActionConstants.REORDER_PLAYLIST,
      from: fromIndex,
      to: toIndex,
    });
  },

  addToPlaylist: function(trackIds) {
    PotsDispatcher.dispatch({
      type: ActionConstants.ADD_TO_PLAYLIST,
      trackIds: trackIds,
    });
  },

  removeFromPlaylist: function(index) {
    PotsDispatcher.dispatch({
      type: ActionConstants.REMOVE_FROM_PLAYLIST,
      index: index,
    });
  },
};

module.exports = PlaylistActionCreators;
