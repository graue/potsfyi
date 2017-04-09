"use strict";
// @flow

import Nav from './Nav';
import React, {Component} from 'react';
import SearchArea from './SearchArea';

import './UIBar.css';

class UIBar extends Component {
  render() {
    return (
      <div className="UIBar">
        <Nav />
        <SearchArea />
      </div>
    );
  }
}

export default UIBar;
