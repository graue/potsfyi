"use strict";

import Nav from './Nav';
import React from 'react';
import SearchArea from './SearchArea';

import './UIBar.css';

const UIBar = React.createClass({
  render() {
    return (
      <div className="UIBar">
        <Nav />
        <SearchArea {...this.props} />
      </div>
    );
  },
});

export default UIBar;
