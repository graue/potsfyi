"use strict";

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {getPlayingTrack} from '../selectors/selectors';

import './CoverArt.css';

function mapStateToProps(state) {
  let art = null;
  const trackId = getPlayingTrack(state);
  if (trackId != null) {
    const track = state.trackCache.cache[trackId];
    if (track.albumId != null) {
      const album = state.albumCache.cache[track.albumId];
      if (album.coverArt) {
        art = album.coverArt;
      }
    }
  }
  return {art};
}

class CoverArt extends React.Component {
  static propTypes = {
    art: PropTypes.string,
  };

  render() {
    const styles = {
      backgroundImage: this.props.art
        ? 'url(' + encodeURI(this.props.art) + ')'
        : '',
    };

    return (
      <div className="CoverArt" style={styles} />
    );
  }
}

export default connect(mapStateToProps)(CoverArt);
