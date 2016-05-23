"use strict";
// @flow

import $ from './lib/jquery.shim';

function ajaxPost(
  url: string,
  data: string | {[key: string]: string},
  success: Function,
  error: Function
) {
  $.ajax({
    type: 'POST',
    url: url,
    data: data,
    success: success,
    error: error
  });
}

function gotAssertion(assertion: string) {
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
  $('#browserid-login').on('click', function(event) {
    event.preventDefault();
    // $FlowFixMe added via monkey-patching by Persona script
    navigator.id.get(gotAssertion);
  });
}

export function logOut() {
  // $FlowFixMe added via monkey-patching by Persona script
  navigator.id.logout(logoutCallback);
}
