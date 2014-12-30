"use strict";

var CoverArt = require('./CoverArt');
var PlaylistArea = require('./PlaylistArea');
var React = require('react');

var MainContentContainer = React.createClass({
  render: function() {
    return (
      <div className="MainContentContainer">
        <CoverArt {...this.props} />
        <PlaylistArea {...this.props} />
      </div>
    );
  }
});

module.exports = MainContentContainer;
