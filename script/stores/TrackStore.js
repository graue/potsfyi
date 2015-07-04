"use strict";

var ActionConstants = require('../actions/ActionConstants');
var EventEmitter = require('events').EventEmitter;
var PotsDispatcher = require('../dispatcher/PotsDispatcher');
var _ = require('underscore');

var tracks = {};

var TrackStore = _.extend({}, EventEmitter.prototype, {
  _emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(cb) {
    this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    this.removeListener('change', cb);
  },

  getTrack: function(id) {
    return tracks[id];
  },
});

function _addTrackInfo(id, info) {
  tracks[id] = info;
}

TrackStore.dispatchToken = PotsDispatcher.register(function(action) {
  switch (action.type) {
    case ActionConstants.RECEIVE_SEARCH_RESULTS:
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

module.exports = TrackStore;
