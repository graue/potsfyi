"use strict";

var Playlist = require('./Playlist');
var React = require('react');

var PlaylistArea = React.createClass({
  render: function() {
    return (
      <div className="PlaylistArea">
        <Playlist {...this.props} />
      </div>
    );
  }
});

module.exports = PlaylistArea;
