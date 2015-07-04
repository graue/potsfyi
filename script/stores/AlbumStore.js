"use strict";

var ActionConstants = require('../actions/ActionConstants');
var EventEmitter = require('events').EventEmitter;
var PotsDispatcher = require('../dispatcher/PotsDispatcher');
var _ = require('underscore');

var albums = {};

var AlbumStore = _.extend({}, EventEmitter.prototype, {
  _emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(cb) {
    this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    this.removeListener('change', cb);
  },

  getAlbum: function(id) {
    return albums[id];
  },
});

function _addAlbumInfo(id, info) {
  albums[id] = info;
}

function _addAlbumFromSerializedObject(rawAlbum) {
  _addAlbumInfo(rawAlbum.id, {
    artist: rawAlbum.artist,
    coverArt: rawAlbum.cover_art,
    date: rawAlbum.date,
    title: rawAlbum.title,
    tracks: rawAlbum.track_ids.map(function(n) { return '' + n; }),
  });
}

AlbumStore.dispatchToken = PotsDispatcher.register(function(action) {
  var dataChanged = false;

  switch (action.type) {
    case ActionConstants.RECEIVE_SEARCH_RESULTS:
      action.albums.forEach(function(rawAlbum) {
        _addAlbumFromSerializedObject(rawAlbum);
        dataChanged = true;
      });
      if (dataChanged) {
        AlbumStore._emitChange();
      }
      break;
  }
});

module.exports = AlbumStore;
