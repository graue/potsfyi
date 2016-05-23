"use strict";

import App from './components/App';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from './lib/jquery.shim';
import * as auth from './auth';

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

  ReactDOM.render(
    <App />,
    document.getElementById('app-container')
  );
});
