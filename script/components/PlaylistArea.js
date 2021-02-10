"use strict";

import ArtistList from './ArtistList';
import Playlist from './Playlist';
import React from 'react';
import {connect} from 'react-redux';
import {isPlaylistEmpty} from '../selectors/selectors';

import './PlaylistArea.css';

function mapStateToProps(state) {
  return {
    isPlaylistEmpty: isPlaylistEmpty(state),
  };
}

class PlaylistArea extends React.Component {
  render() {
    const content = this.props.isPlaylistEmpty ? <ArtistList /> : <Playlist />;
    return (
      <div className="PlaylistArea">
        {content}
      </div>
    );
  }
}

export default connect(mapStateToProps)(PlaylistArea);
