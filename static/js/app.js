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

requirejs(['app/models'],
function   (models) {
    var resultListView = new models.SearchResultListView();
    $('input#search-box').on('keyup', function() {
        var newValue = $('input#search-box').val();
        resultListView.collection.updateSearchString(newValue);
    });
});
