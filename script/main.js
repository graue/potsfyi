"use strict";

var $ = require('./lib/jquery.shim');
require('backbone').$ = $;

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
    var resultListView = new SearchResultListView({
        collection: resultList
    });

    resultListView.on('song-clicked', window.playlist.addSong);
    resultListView.on('album-clicked', window.playlist.addAlbum);

    $('input#search-box').on('keyup', function() {
        var newValue = $('input#search-box').val();
        resultListView.collection.updateSearchString(newValue);
    });

    var playingSongView = new PlayingSongView({
        model: window.playingSong
    });
    var playlistView = new PlaylistView({model: window.playlist});
    window.playlist.getPlaylistFromLocalStorage();
    $('#search-card input').focus();

    window.resultListView = resultListView;  // For debugging only
});
