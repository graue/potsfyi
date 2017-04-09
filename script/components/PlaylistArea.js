"use strict";
// @flow

import ArtistList from './ArtistList';
import PlayStatusStore from '../stores/PlayStatusStore';
import Playlist from './Playlist';
import React from 'react';

import './PlaylistArea.css';

type PlaylistAreaProps = {};
type PlaylistAreaState = {
  isPlaylistEmpty: boolean,
};

function getStateFromStores() {
  return {
    isPlaylistEmpty: PlayStatusStore.isPlaylistEmpty(),
  };
}

class PlaylistArea extends React.Component {
  props: PlaylistAreaProps;
  state: PlaylistAreaState;

  constructor(props: PlaylistAreaProps) {
    super(props);
    this.state = getStateFromStores();
  }

  componentDidMount() {
    PlayStatusStore.addChangeListener(this._handleChange);
  }

  componentWillUnmount() {
    PlayStatusStore.removeChangeListener(this._handleChange);
  }

  // $FlowFixMe
  _handleChange = () => {
    this.setState(getStateFromStores());
  };

  render(): React.Element<any> {
    const Component = this.state.isPlaylistEmpty ? ArtistList : Playlist;
    return (
      <div className="PlaylistArea">
        <Component {...this.props} />
      </div>
    );
  }
}

export default PlaylistArea;
