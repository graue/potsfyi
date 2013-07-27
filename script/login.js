;(function() {
    // Simulate jQuery's $(document).ready for modern browsers
    // Inspired by how ZeptoJS does it
    function documentReady(callback) {
        if (/complete|loaded|interactive/.test(document.readyState))
            callback();
        else
            document.addEventListener('DOMContentLoaded', callback, false);
    }

    function ajaxPost(url, data, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState != 4) return;
            xhr.onReadyStateChange = function() {};
            if (xhr.status >= 200 && xhr.status < 300)
                success(xhr.responseText, xhr);
            else
                error(xhr);
        }
        xhr.open('POST', '/api/login');
        xhr.setRequestHeader('Content-Type',
                             'application/x-www-form-urlencoded');
        xhr.send(data ? data : null);
    }

    function gotAssertion(assertion) {
        if (!assertion)
            return;

        ajaxPost('/api/login', 'assertion=' + encodeURIComponent(assertion),
                 function() { location.reload(true); },
                 function(xhr) { alert('Login error: code ' + xhr.status); });
    }

    function logoutCallback() {
        ajaxPost('/api/logout', '',
                 function() { location.reload(true); },
                 function(xhr) { alert('Logout error: code '
                                       + xhr.status); });
    }

    documentReady(function() {
        var loginEl = document.getElementById('browserid-login'),
            logoutEl = document.getElementById('browserid-logout');
        if (loginEl) loginEl.onclick = function() {
            navigator.id.get(gotAssertion);
            return false;
        };
        if (logoutEl) logoutEl.onclick = function() {
            navigator.id.logout(logoutCallback);
            return false;
        };
    });
})();
