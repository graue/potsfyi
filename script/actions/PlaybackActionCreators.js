"use strict";

import ActionConstants from './ActionConstants';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

class PlaybackActionCreators {
  static playTrack(indexOrNull) {
    PotsDispatcher.dispatch({
      type: ActionConstants.PLAY_TRACK,
      index: indexOrNull,
    });
  }
  static pauseTrack() {
    PotsDispatcher.dispatch({
      type: ActionConstants.PAUSE_TRACK,
    });
  }
  static trackEnded() {
    PotsDispatcher.dispatch({
      type: ActionConstants.TRACK_ENDED,
    });
  }
}

export default PlaybackActionCreators;
