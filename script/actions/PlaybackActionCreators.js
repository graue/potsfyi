"use strict";

var ActionConstants = require('../actions/ActionConstants');
var PotsDispatcher = require('../dispatcher/PotsDispatcher');

var PlaybackActionCreators = {
  playTrack: function(indexOrNull) {
    PotsDispatcher.dispatch({
      type: ActionConstants.PLAY_TRACK,
      index: indexOrNull,
    });
  },

  pauseTrack: function() {
    PotsDispatcher.dispatch({
      type: ActionConstants.PAUSE_TRACK,
    });
  },

  trackEnded: function() {
    // XXX: Is this really a view action? Unlike all the others, it's not
    // in direct response to user input.
    PotsDispatcher.dispatch({
      type: ActionConstants.TRACK_ENDED,
    });
  },
};

module.exports = PlaybackActionCreators;
