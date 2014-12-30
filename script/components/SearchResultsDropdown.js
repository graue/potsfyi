"use strict";

var React = require('react');
var SearchResultItem = require('./SearchResultItem');

var SearchResultsDropdown = React.createClass({
  render: function() {
    var rows = this.props.items.map(function(item) {
      var key = (item.isAlbum ? 'a' : 't') + item.id;
      return <SearchResultItem key={key} {...item} />;
    });

    return (
      <ul className="SearchResultsDropdown">
        {rows}
      </ul>
    );
  }
});

module.exports = SearchResultsDropdown;
