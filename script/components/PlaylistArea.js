"use strict";

import ArtistList from './ArtistList';
import PlayStatusStore from '../stores/PlayStatusStore';
import Playlist from './Playlist';
import React from 'react';

function getStateFromStores() {
  return {
    Component: PlayStatusStore.isPlaylistEmpty() ? ArtistList : Playlist,
  };
}

class PlaylistArea extends React.Component {
  constructor() {
    super();
    this.state = getStateFromStores();
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    PlayStatusStore.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    PlayStatusStore.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState(getStateFromStores());
  }

  render() {
    const {Component} = this.state;
    return (
      <div className="PlaylistArea">
        <Component {...this.props} />
      </div>
    );
  }
}

export default PlaylistArea;
