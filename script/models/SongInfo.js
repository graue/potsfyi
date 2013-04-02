"use strict";

var Backbone = require('backbone');

var SongInfo = Backbone.Model.extend({
    initialize: function() {
        // assign a unique ID (based on Backbone's cid)
        // for use in HTML lists
        this.set({ htmlId: 'song-' + this.cid });
    }
});

module.exports = SongInfo;
