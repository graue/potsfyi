"use strict";

import DropdownMenu from './DropdownMenu';
import Nav from './Nav';
import React from 'react';
import SearchArea from './SearchArea';

const UIBar = React.createClass({
  render() {
    return (
      <div className="UIBar">
        <Nav />
        <SearchArea {...this.props} />
        <DropdownMenu {...this.props} />
      </div>
    );
  },
});

export default UIBar;
