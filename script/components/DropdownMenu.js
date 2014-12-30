"use strict";

var Icon = require('./Icon');
var React = require('react');

var DropdownMenu = React.createClass({
  render: function() {
    // TODO: Make it actually bring down a menu when clicked
    return (
      <div className="DropdownMenuTrigger">
        <Icon name={Icon.NAMES.LIST} alt="Dropdown menu" />
      </div>
    );
  }
});

module.exports = DropdownMenu;
