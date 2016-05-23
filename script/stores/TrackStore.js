"use strict";

import ActionConstants from '../actions/ActionConstants';
import {EventEmitter} from 'events';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

let tracks = {};

class TrackStoreClass extends EventEmitter {
  _emitChange() {
    this.emit('change');
  }

  addChangeListener(cb) {
    this.on('change', cb);
  }

  removeChangeListener(cb) {
    this.removeListener('change', cb);
  }

  getTrack(id) {
    return tracks[id];
  }
}

let TrackStore = new TrackStoreClass();

function _addTrackInfo(id, info) {
  tracks[id] = info;
}

TrackStore.dispatchToken = PotsDispatcher.register(function(action) {
  switch (action.type) {
    case ActionConstants.RECEIVE_SEARCH_RESULTS:
    case ActionConstants.HYDRATE_SAVED_PLAYLIST:
      action.tracks.forEach(function(rawTrack) {
        _addTrackInfo(rawTrack.id, {
          albumId: rawTrack.album_id != null ? rawTrack.album_id : null,
          artist: rawTrack.artist,
          title: rawTrack.title,
          trackNumber: rawTrack.album_id != null ? rawTrack.track : null,
        });
      });
      break;
  }
});

export default TrackStore;
