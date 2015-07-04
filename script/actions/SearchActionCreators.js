"use strict";

var ActionConstants = require('../actions/ActionConstants');
var PotsDispatcher = require('../dispatcher/PotsDispatcher');

var SearchActionCreators = {
  changeQuery: function(query) {
    PotsDispatcher.dispatch({
      query: query,
      type: ActionConstants.CHANGE_SEARCH_QUERY,
    });
  },
};

module.exports = SearchActionCreators;
