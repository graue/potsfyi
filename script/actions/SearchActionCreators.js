"use strict";

var ActionConstants = require('../actions/ActionConstants');
var PotsDispatcher = require('../dispatcher/PotsDispatcher');

var SearchActionCreators = {
  changeQuery: function(query) {
    PotsDispatcher.handleViewAction({
      query: query,
      type: ActionConstants.CHANGE_SEARCH_QUERY,
    });
  },
};

module.exports = SearchActionCreators;
