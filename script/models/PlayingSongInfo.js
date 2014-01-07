"use strict";

var Backbone = require('backbone'),
    SongInfo = require('./SongInfo');

var PlayingSongInfo = SongInfo.extend({
    defaults: {
        'id': -1
    },
    changeSong: function(newSong) {
        if (!newSong) {
            this.clear({silent: true});
            this.set('id', -1);
        } else {
            this.set(newSong.attributes);  // copy all attributes
        }

        // view should listen for the filename change and re-render
    }
});

module.exports = PlayingSongInfo;
