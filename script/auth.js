"use strict";

import $ from './lib/jquery.shim';

function ajaxPost(
  url,
  data,
  success,
  error,
) {
  $.ajax({
    type: 'POST',
    url: url,
    data: data,
    success: success,
    error: error
  });
}

function gotAssertion(assertion) {
  if (!assertion) {
    return;
  }

  ajaxPost(
    '/api/login',
    'assertion=' + encodeURIComponent(assertion),
    function() {
      location.reload(true);
    },
    function(xhr) {
      alert('Login error: code ' + xhr.status);
    }
  );
}

function logoutCallback() {
  ajaxPost(
    '/api/logout',
    '',
    function() {
      location.reload(true);
    },
    function(xhr) {
      alert('Logout error: code ' + xhr.status);
    }
  );
}

export function attachLoginButtonHandler() {
  // TODO rewrite for non-BrowserID login
}

export function logOut() {
  // TODO rewrite for non-BrowserID login
}
