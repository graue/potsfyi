"use strict";
// @flow

import CoverArt from './CoverArt';
import PlaylistArea from './PlaylistArea';
import React from 'react';

import './MainContentContainer.css';

class MainContentContainer extends React.Component {
  render() {
    return (
      <div className="MainContentContainer">
        <CoverArt />
        <PlaylistArea />
      </div>
    );
  }
}

export default MainContentContainer;
