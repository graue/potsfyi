function ajaxPost(url, data, success, error) {
  $.ajax({
    type: 'POST',
    url: url,
    data: data,
    success: success,
    error: error
  });
}

exports.gotAssertion = function(assertion) {
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

exports.logoutCallback = function() {
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

exports.attachAuthHandlers = function() {
  $('#browserid-login').on('click', function(event) {
    event.preventDefault();
    navigator.id.get(exports.gotAssertion);
  });

  $('#browserid-logout').on('click', function(event) {
    event.preventDefault();
    navigator.id.logout(exports.logoutCallback);
  });
};
