"use strict";

import CoverArt from './CoverArt';
import PlaylistArea from './PlaylistArea';
import React from 'react';

class MainContentContainer extends React.Component {
  render() {
    return (
      <div className="MainContentContainer">
        <CoverArt {...this.props} />
        <PlaylistArea {...this.props} />
      </div>
    );
  }
}

export default MainContentContainer;
