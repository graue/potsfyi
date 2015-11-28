"use strict";

import keyMirror from 'keymirror';

let ActionConstants = keyMirror({
  CHANGE_SEARCH_QUERY: null,
  RECEIVE_SEARCH_RESULTS: null,

  PAUSE_TRACK: null,
  PLAY_TRACK: null,
  TRACK_ENDED: null,

  ADD_TO_PLAYLIST: null,
  REMOVE_FROM_PLAYLIST: null,
  REORDER_PLAYLIST: null,
});

export default ActionConstants;
