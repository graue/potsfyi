"use strict";

var Dispatcher = require('./Dispatcher');
var _ = require('underscore');

var PotsDispatcher = _.extend(new Dispatcher(), {
  handleViewAction: function(action) {
    this.dispatch({
      source: 'VIEW_ACTION',
      action: action,
    });
  },

  handleServerAction: function(action) {
    this.dispatch({
      source: 'SERVER_ACTION',
      action: action,
    });
  },
});

module.exports = PotsDispatcher;
