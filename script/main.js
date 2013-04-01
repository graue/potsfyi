// Client side code for potsfyi

var $ = require('./lib/jquery.shim');

$(document).ready(function() {
    var models = require('./app/models'),
        views = require('./app/views');

    window.playingSong = new models.PlayingSongInfo();
    window.playlist = new models.Playlist(playingSong);

    var resultList = new models.SearchResultList();
    var resultListView = new views.SearchResultListView({
        collection: resultList
    });

    resultListView.on('song-clicked', playlist.addSong);
    resultListView.on('album-clicked', playlist.addAlbum);

    $('input#search-box').on('keyup', function() {
        var newValue = $('input#search-box').val();
        resultListView.collection.updateSearchString(newValue);
    });

    var playingSongView = new views.PlayingSongView({
        model: window.playingSong
    });
    var playlistView = new views.PlaylistView({model: window.playlist});
    window.playlist.getPlaylistFromLocalStorage();
    $('#search-card input').focus();

    window.resultListView = resultListView;  // For debugging only
});
