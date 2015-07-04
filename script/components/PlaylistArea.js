"use strict";

import Playlist from './Playlist';
import React from 'react';

class PlaylistArea extends React.Component {
  render() {
    return (
      <div className="PlaylistArea">
        <Playlist {...this.props} />
      </div>
    );
  }
}

export default PlaylistArea;
