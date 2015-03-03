"use strict";

function ajaxPost(url, data, success, error) {
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

function attachLoginButtonHandler() {
  $('#browserid-login').on('click', function(event) {
    event.preventDefault();
    navigator.id.get(gotAssertion);
  });

  // Logout button appears on a React-rendered page and can handle its own
  // damn click events. (It calls exports.logOut(), below)
}

function logOut() {
  navigator.id.logout(logoutCallback);
}

module.exports = {
  attachLoginButtonHandler,
  logOut,
};
