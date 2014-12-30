"use strict";

var DropdownMenu = require('./DropdownMenu');
var Nav = require('./Nav');
var React = require('react');
var SearchArea = require('./SearchArea');

var UIBar = React.createClass({
  render: function() {
    return (
      <div className="UIBar">
        <Nav />
        <SearchArea {...this.props} />
        <DropdownMenu {...this.props} />
      </div>
    );
  }
});

module.exports = UIBar;
