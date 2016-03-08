"use strict";
// @flow

import AlbumStore from '../stores/AlbumStore';
import PlayStatusStore from '../stores/PlayStatusStore';
import React from 'react';
import TrackStore from '../stores/TrackStore';

type Props = {};
type State = {art: ?string};

function getStateFromStores(): State {
  let art = null;
  const trackId = PlayStatusStore.getPlayingTrack();
  if (trackId != null) {
    const track = TrackStore.getTrack(trackId);
    if (track.albumId != null) {
      const album = AlbumStore.getAlbum(track.albumId);
      if (album.coverArt) {
        art = album.coverArt;
      }
    }
  }
  return {art};
}

class CoverArt extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = getStateFromStores();
  }

  componentDidMount() {
    AlbumStore.addChangeListener(this.handleChange);
    PlayStatusStore.addChangeListener(this.handleChange);
    TrackStore.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    AlbumStore.removeChangeListener(this.handleChange);
    PlayStatusStore.removeChangeListener(this.handleChange);
    TrackStore.removeChangeListener(this.handleChange);
  }

  handleChange: () => void = () => {
    this.setState(getStateFromStores());
  };

  render(): React.Element {
    const styles = {
      backgroundImage: this.state.art
        ? 'url(' + encodeURI(this.state.art) + ')'
        : '',
    };

    return (
      <div className="CoverArt" style={styles} />
    );
  }
}

export default CoverArt;
