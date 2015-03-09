"use strict";

var ActionConstants = require('../actions/ActionConstants');
var EventEmitter = require('events').EventEmitter;
var PotsDispatcher = require('../dispatcher/PotsDispatcher');
var _ = require('underscore');
var invariant = require('../utils/invariant');

var NO_PLAYING_INDEX = -1;

var playlist = [];  // IDs of tracks.
var playingIndex = NO_PLAYING_INDEX;
var trackPlayStatus = {
  paused: false,
  // TODO: Add time offset in track, to enable seeking.
};

var PlayStatusStore = _.extend({}, EventEmitter.prototype, {
  _emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(cb) {
    this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    this.removeListener('change', cb);
  },

  getPlaylist: function() {
    return playlist;
  },

  getPlayingIndex: function() {
    return playingIndex;
  },

  getTrackPlayStatus: function() {
    return trackPlayStatus;
  },
});

PlayStatusStore.NO_PLAYING_INDEX = NO_PLAYING_INDEX;

PlayStatusStore.dispatchToken = PotsDispatcher.register(function(payload) {
  var action = payload.action;

  switch (action.type) {
    case ActionConstants.REORDER_PLAYLIST:
      invariant(
        action.from != null && action.from >= 0 &&
          action.from < playlist.length &&
          action.to != null && action.to >= 0 && action.to < playlist.length,
        'Invalid from or to field in playlist reorder action'
      );

      if (action.to !== action.from) {
        var moved = playlist.splice(action.from, 1)[0];
        playlist.splice(action.to, 0, moved);

        if (playingIndex !== NO_PLAYING_INDEX) {
          var preChange = playingIndex;
          if (playingIndex === action.from) {
            playingIndex = action.to;
          } else if (playingIndex < action.from && playingIndex >= action.to) {
            playingIndex++;
          } else if (playingIndex > action.from && playingIndex <= action.to) {
            playingIndex--;
          }
        }

        PlayStatusStore._emitChange();
      }
      break;

    case ActionConstants.ADD_TO_PLAYLIST:
      playlist = playlist.concat(action.trackIds);
      PlayStatusStore._emitChange();
      break;

    case ActionConstants.REMOVE_FROM_PLAYLIST:
      playlist.splice(action.index, 1);
      if (playingIndex !== NO_PLAYING_INDEX && playingIndex > action.index) {
        // We deleted a track before the currently playing track.
        playingIndex--;
      } else if (playingIndex === playlist.length) {
        // We deleted the last track, while it was playing.
        playingIndex = NO_PLAYING_INDEX;
      }

      PlayStatusStore._emitChange();
      break;

    case ActionConstants.PLAY_TRACK:
      invariant(
        action.index >= 0 && action.index < playlist.length,
        'Out of range track play'
      );
      if (trackPlayStatus.paused || action.index !== playingIndex) {
        trackPlayStatus.paused = false;
        playingIndex = action.index;
        // TODO: If index has changed, set time to 0 seconds (once time in
        // track is added to the store).
        PlayStatusStore._emitChange();
      }
      break;

    case ActionConstants.PAUSE_TRACK:
      if (!trackPlayStatus.paused) {
        trackPlayStatus.paused = true;
        PlayStatusStore._emitChange();
      }
      break;

    case ActionConstants.TRACK_ENDED:
      invariant(
        !trackPlayStatus.paused && playingIndex !== NO_PLAYING_INDEX,
        'Track ended action received while paused or stopped'
      );
      if (++playingIndex === playlist.length) {
        playingIndex = NO_PLAYING_INDEX;
      }
      PlayStatusStore._emitChange();
      break;
  }
});

module.exports = PlayStatusStore;