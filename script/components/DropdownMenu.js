"use strict";

import Icon from './Icon';
import React from 'react';

class DropdownMenu extends React.Component {
  render() {
    // TODO: Make it actually bring down a menu when clicked
    return (
      <div className="DropdownMenuTrigger">
        <Icon name={Icon.NAMES.LIST} alt="Dropdown menu" />
      </div>
    );
  }
}

export default DropdownMenu;
