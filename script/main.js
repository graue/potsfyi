// Client side code for potsfyi

var $ = require('./lib/jquery.shim');

$(document).ready(function() {
    var models = require('./app/models'),
        views = require('./app/views');

    var resultListView = new views.SearchResultListView();
    $('input#search-box').on('keyup', function() {
        var newValue = $('input#search-box').val();
        resultListView.collection.updateSearchString(newValue);
    });
    var playingSongView = new views.PlayingSongView();
    var playlistView = new views.PlaylistView();
    models.Playlist.getPlaylistFromLocalStorage();
    $('#search-card input').focus();

    // for easier debugging, attach views to window object.
    // this allows you to examine view and model contents
    // in Firebug or the Chrome inspector
    window.resultListView = resultListView;
    window.playingSongView = playingSongView;
    window.playlistView = playlistView;
    window.playlistModel = models.Playlist;
});
