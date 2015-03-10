"use strict";

var ActionConstants = require('../actions/ActionConstants');
var EventEmitter = require('events').EventEmitter;
var PotsDispatcher = require('../dispatcher/PotsDispatcher');
var ServerActionCreators = require('../actions/ServerActionCreators');
var _ = require('underscore');
var $ = require('../lib/jquery.shim');

var query = '';
var results = null;

var SearchStore = _.extend({}, EventEmitter.prototype, {
  _emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(cb) {
    this.on('change', cb);
  },

  removeChangeListener: function(cb) {
    this.removeListener('change', cb);
  },

  getQuery: function() {
    return query;
  },

  getResults: function() {
    return results;
  },
});

SearchStore.dispatchToken = PotsDispatcher.register(function(payload) {
  var action = payload.action;

  switch (action.type) {
    case ActionConstants.CHANGE_SEARCH_QUERY:
      if (action.query !== query) {
        query = action.query;

        if (query === '') {
          // Immediately throw away any results, since it would be clowny
          // to have them stick around (or to return after you type a new,
          // different letter).
          results = null;
        } else {
          $.get('/search', {q: query}, function(data, textStatus, xhr) {
            ServerActionCreators.receiveSearchResults(action.query, data);
          }, 'json');
        }
        SearchStore._emitChange();
      }
      break;

    case ActionConstants.RECEIVE_SEARCH_RESULTS:
      if (action.forQuery === query) {
        results = {
          forQuery: action.forQuery,
          items: action.results.map(function(rawItem) {
            return {
              id: rawItem[1] + '',
              isAlbum: rawItem[0] === 'album',
            };
          }),
        };
        SearchStore._emitChange();
      }
      break;
  }
});

module.exports = SearchStore;
