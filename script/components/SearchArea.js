"use strict";

var Icon = require('./Icon');
var React = require('react');
var SearchBox = require('./SearchBox');

// Search box and magnifying glass next to it (which focuses).

var SearchArea = React.createClass({
  handleClick: function() {
    this.refs['box'].focus();
  },

  render: function() {
    return (
      <div className="SearchArea">
        <Icon
          name={Icon.NAMES.MAGNIFYING_GLASS}
          onClick={this.handleClick}
          className="SearchAreaGlass"
        />
        <SearchBox ref="box" {...this.props} />
      </div>
    );
  },
});

module.exports = SearchArea;
