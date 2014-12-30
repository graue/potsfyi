"use strict";

var ActionConstants = require('../actions/ActionConstants');
var PotsDispatcher = require('../dispatcher/PotsDispatcher');

var PlaylistActionCreators = {
  reorderPlaylist: function(fromIndex, toIndex) {
    PotsDispatcher.handleViewAction({
      type: ActionConstants.REORDER_PLAYLIST,
      from: fromIndex,
      to: toIndex,
    });
  },

  addToPlaylist: function(trackIds) {
    PotsDispatcher.handleViewAction({
      type: ActionConstants.ADD_TO_PLAYLIST,
      trackIds: trackIds,
    });
  },

  removeFromPlaylist: function(index) {
    PotsDispatcher.handleViewAction({
      type: ActionConstants.REMOVE_FROM_PLAYLIST,
      index: index,
    });
  },
};

module.exports = PlaylistActionCreators;
