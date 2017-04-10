"use strict";
// @flow

import ArtistList from './ArtistList';
import Playlist from './Playlist';
import React from 'react';
import {connect} from 'react-redux';
import {isPlaylistEmpty} from '../selectors/selectors';
import type {ReduxState} from '../stores/store';

import './PlaylistArea.css';

type PlaylistAreaProps = {
  isPlaylistEmpty: boolean,
};

function mapStateToProps(state: ReduxState) {
  return {
    isPlaylistEmpty: isPlaylistEmpty(state),
  };
}

class PlaylistArea extends React.Component {
  props: PlaylistAreaProps;

  constructor(props: PlaylistAreaProps) {
    super(props);
  }

  render(): React.Element<any> {
    const content = this.props.isPlaylistEmpty ? <ArtistList /> : <Playlist />;
    return (
      <div className="PlaylistArea">
        {content}
      </div>
    );
  }
}

export default connect(mapStateToProps)(PlaylistArea);
