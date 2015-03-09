"use strict";

var keyMirror = require('react/lib/keyMirror');

var ActionConstants = keyMirror({
  CHANGE_SEARCH_QUERY: null,
  RECEIVE_SEARCH_RESULTS: null,

  RECEIVE_TRACK_INFO: null,
  RECEIVE_ALBUM_INFO: null,

  PAUSE_TRACK: null,
  PLAY_TRACK: null,
  TRACK_ENDED: null,

  ADD_TO_PLAYLIST: null,
  REMOVE_FROM_PLAYLIST: null,
  REORDER_PLAYLIST: null,
});

module.exports = ActionConstants;