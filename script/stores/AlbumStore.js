"use strict";

// The AlbumStore maps album IDs to album info, including IDs of tracks on
// the album (which you can then look up in the TrackStore).

import ActionConstants from '../actions/ActionConstants';
import {EventEmitter} from 'events';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

let albums = {};

class AlbumStoreClass extends EventEmitter {
  _emitChange() {
    this.emit('change');
  }

  addChangeListener(cb) {
    this.on('change', cb);
  }

  removeChangeListener(cb) {
    this.removeListener('change', cb);
  }

  getAlbum(id) {
    return albums[id];
  }
}

let AlbumStore = new AlbumStoreClass();

function _addAlbumInfo(id, info) {
  albums[id] = info;
}

function _addAlbumFromSerializedObject(rawAlbum) {
  _addAlbumInfo(rawAlbum.id, {
    artist: rawAlbum.artist,
    coverArt: rawAlbum.cover_art,
    date: rawAlbum.date,
    title: rawAlbum.title,
    tracks: rawAlbum.track_ids.map((id) => id.toString()),
  });
}

AlbumStore.dispatchToken = PotsDispatcher.register(function(action) {
  let dataChanged = false;

  switch (action.type) {
    case ActionConstants.RECEIVE_SEARCH_RESULTS:
      action.albums.forEach((rawAlbum) => {
        _addAlbumFromSerializedObject(rawAlbum);
        dataChanged = true;
      });
      if (dataChanged) {
        AlbumStore._emitChange();
      }
      break;
  }
});

export default AlbumStore;
