"use strict";

// Monkey-patch Backbone (which is not CommonJS-aware) to provide it with
// a working reference to jQuery.
var $ = require('./lib/jquery.shim');
require('backbone').$ = $;

// Monkey-patch React to have createBackboneClass.
var React = require('react');
require('./lib/react.backbone');

$(function() {
    if (window.loginEnabled) {
        require('./login').attachAuthHandlers();

        // Since the login page is currently a different, static page, served
        // from the backend, don't create any of the usual models or views if
        // we're running on that page.
        if (!window.loggedIn)
            return;
    }

    var PlayingSongInfo = require('./models/PlayingSongInfo'),
        Playlist = require('./models/Playlist'),
        SearchResultList = require('./models/SearchResultList'),
        AppView = require('./views/AppView');

    window.playingSong = new PlayingSongInfo();
    window.playlist = new Playlist(window.playingSong);
    var resultList = new SearchResultList();

    // FIXME: pass in songClickHandler, albumClickHandler so
    // SearchResultListView can use them. Check this list of props -
    // is anything missing?
    React.render(React.createElement(AppView, {
        resultList: resultList,
        playlist: window.playlist,
        playingSong: window.playingSong
    }), document.getElementById('app-container'));

    // FIXME: Where should this actually be set up? Here? Or should it live
    // in the AppView JSX? Consider this.
    $('input#search-box').on('keyup', function() {
        var newValue = $('input#search-box').val();
        resultList.updateSearchString(newValue);
    });

    window.playlist.getPlaylistFromLocalStorage();

    $('#search-card input').focus();
});
