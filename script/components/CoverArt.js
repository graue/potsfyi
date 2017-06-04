"use strict";
// @flow

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {getPlayingTrack} from '../selectors/selectors';
import type {ReduxState} from '../stores/store';

import './CoverArt.css';

type CoverArtProps = {
  art: ?string,
};

function mapStateToProps(state: ReduxState): CoverArtProps {
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
  props: CoverArtProps;

  constructor(props: CoverArtProps) {
    super(props);
  }

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
