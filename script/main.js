"use strict";

var App = require('./components/App');
var React = require('react');
var $ = require('./lib/jquery.shim');
var auth = require('./auth');

$(function() {
  if (window.loginEnabled) {
    if (window.location.pathname === '/login') {
      // This page isn't React rendered yet.
      auth.attachLoginButtonHandler();
      return;
    }

    if (!window.loggedIn) {
      return;
    }

    // Workaround for not having a logout link.
    // TODO: Remove this when there is a logout link.
    window.logout = () => { auth.logOut(); };
  }

  React.render(
    React.createElement(App),
    document.getElementById('app-container')
  );
});
