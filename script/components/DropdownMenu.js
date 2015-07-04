"use strict";

import Icon from './Icon';
import React from 'react';

const DropdownMenu = React.createClass({
  render() {
    // TODO: Make it actually bring down a menu when clicked
    return (
      <div className="DropdownMenuTrigger">
        <Icon name={Icon.NAMES.LIST} alt="Dropdown menu" />
      </div>
    );
  },
});

export default DropdownMenu;
