"use strict";

var ActionConstants = require('../actions/ActionConstants');
var PotsDispatcher = require('../dispatcher/PotsDispatcher');

var ServerActionCreators = {
  receiveSearchResults: function(query, responseObj) {
    PotsDispatcher.dispatch({
      forQuery: query,
      albums: responseObj.albums,
      tracks: responseObj.tracks,
      results: responseObj.search_results,
      type: ActionConstants.RECEIVE_SEARCH_RESULTS,
    });
  },
};

module.exports = ServerActionCreators;
