"use strict";

var App = require('./components/App');
var React = require('react');
var $ = require('./lib/jquery.shim');

$(function() {
  if (window.loginEnabled) {
    // FIXME: Re-enable login. This currently probably doesn't work...
    require('./login').attachAuthHandlers();

    if (!window.loggedIn) {
      return;
    }
  }

  React.render(
    React.createElement(App),
    document.getElementById('app-container')
  );
});
