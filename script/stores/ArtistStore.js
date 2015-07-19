"use strict";

// The ArtistStore maps artist names (strings) to a list of IDs of their
// albums (which you can then look up in the AlbumStore). It also stores a
// list of all known artists who have albums.
//
// TODO: Make artist lookup case-insensitive, and store a canonical
// capitalization... real world data is messy so it would be nice for
// "System of a Down" and "System Of A Down" not to be treated separately.
// (It would perhaps be even nicer if you had better taste in music and didn't
// listen to them, but SOAD was the first example I thought of, so sue me.)
//
// TODO: Handle non-album tracks, and artists who only have non-album tracks.

import ActionConstants from '../actions/ActionConstants';
import {EventEmitter} from 'events';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

let albumsByArtist = {};

class ArtistStoreClass extends EventEmitter {
  _emitChange() {
    this.emit('change');
  }

  addChangeListener(cb) {
    this.on('change', cb);
  }

  removeChangeListener(cb) {
    this.removeListener('change', cb);
  }

  getAlbumsBy(artistName) {
    // TODO: Keep sorted by album release date? And/or sort here, before
    // returning?
    return albumsByArtist[artistName];
  }

  // TODO: Cache in sorted order? Paginate?
  getAll() {
    return Object.keys(albumsByArtist).sort();
  }
}

let ArtistStore = new ArtistStoreClass();

// Returns true if we didn't already know about the album.
function _addAlbum(artist, albumId) {
  if (!albumsByArtist[artist]) {
    albumsByArtist[artist] = [];
  }
  const albumsByThisArtist = albumsByArtist[artist];
  if (albumsByThisArtist.indexOf(albumId) !== -1) {
    // We already knew about this one.
    return false;
  }
  albumsByThisArtist.push(albumId);
  return true;
}

ArtistStore.dispatchToken = PotsDispatcher.register(function(action) {
  let dataChanged = false;

  switch (action.type) {
    case ActionConstants.RECEIVE_SEARCH_RESULTS:
      action.albums.forEach((rawAlbum) => {
        let isAlbumNew = _addAlbum(rawAlbum.artist, rawAlbum.id);
        if (isAlbumNew) {
          dataChanged = true;
        }
      });
      if (dataChanged) {
        ArtistStore._emitChange();
      }
      break;
  }
});

export default ArtistStore;
