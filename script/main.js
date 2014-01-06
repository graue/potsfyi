/** @jsx React.DOM */
"use strict";

var $ = require('./lib/jquery.shim');
require('backbone').$ = $;
var React = require('react');
require('./lib/react.backbone');

$(function() {
    if (window.loginEnabled)
        require('./login').attachAuthHandlers();

    if (!window.loggedIn)
        return;

    var PlayingSongInfo = require('./models/PlayingSongInfo'),
        Playlist = require('./models/Playlist'),
        SearchResultList = require('./models/SearchResultList'),
        SearchResultListView = require('./views/SearchResultListView'),
        PlayingSongView = require('./views/PlayingSongView'),
        PlaylistView = require('./views/PlaylistView');

    window.playingSong = new PlayingSongInfo();
    window.playlist = new Playlist(window.playingSong);

    var resultList = new SearchResultList();

    React.renderComponent(
        <SearchResultListView model={resultList}
            songClickHandler={playlist.addSong}
            albumClickHandler={playlist.addAlbum} />,
        document.getElementById('search-results-container'));

    $('input#search-box').on('keyup', function() {
        var newValue = $('input#search-box').val();
        resultList.updateSearchString(newValue);
    });

    var playingSongView = new PlayingSongView({
        model: window.playingSong
    });
    var playlistView = new PlaylistView({model: window.playlist});
    window.playlist.getPlaylistFromLocalStorage();
    $('#search-card input').focus();
});
