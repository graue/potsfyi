// Client side code for potsfyi

requirejs.config({
    // By default, load module IDs from js/lib
    baseUrl: '/static/js/lib',

    // except if module ID starts with "app",
    // load it from the js/app directory
    paths: {
        app: '../app',
        handlebars: 'handlebars',
        hb: 'hbtemplate',
    },

    // Shim to properly load non-AMD modules (Backbone, Underscore)
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['underscore', 'json2', 'jquery'],
            exports: 'Backbone'
        },
        handlebars: {
            exports: 'Handlebars'
        },
    },
});

requirejs(['app/models', 'app/views'],
function   (models,       views) {
    var resultListView = new views.SearchResultListView();
    $('input#search-box').on('keyup', function() {
        var newValue = $('input#search-box').val();
        resultListView.collection.updateSearchString(newValue);
    });
    var playingSongView = new views.PlayingSongView();
    var playlistView = new views.PlaylistView();
    $('#search-card input').focus();

    // for easier debugging, attach views to window object.
    // this allows you to examine view and model contents
    // in Firebug or the Chrome inspector
    window.resultListView = resultListView;
    window.playingSongView = playingSongView;
    window.playlistView = playlistView;
});
