"use strict";

import CoverArt from './CoverArt';
import PlaylistArea from './PlaylistArea';
import React from 'react';

const MainContentContainer = React.createClass({
  render() {
    return (
      <div className="MainContentContainer">
        <CoverArt {...this.props} />
        <PlaylistArea {...this.props} />
      </div>
    );
  },
});

export default MainContentContainer;
