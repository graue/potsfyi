"use strict";

import PlaylistActionCreators from '../actions/PlaylistActionCreators';
import React, {PropTypes} from 'react';
import Spinner from './Spinner';

import './SearchResultItem.css';

const SearchResultItem = React.createClass({
  propTypes: {
    isAlbum: PropTypes.bool.isRequired,
    artist: PropTypes.string.isRequired,
    hasSpinner: PropTypes.bool,
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    tracks: PropTypes.arrayOf(PropTypes.string),
    coverArt: PropTypes.string,
  },

  handleClick() {
    const tracksToAdd = this.props.isAlbum ?
      this.props.tracks : [this.props.id];
    PlaylistActionCreators.addToPlaylist(tracksToAdd);
  },

  maybeRenderSpinner() {
    if (this.props.hasSpinner) {
      return (
        <div className="SearchResultItem_Spinner">
          <Spinner />
        </div>
      );
    } else {
      return null;
    }
  },

  render() {
    // TODO: Render the cover art if present.
    // TODO: Show albums differently from tracks (even if they don't have
    // cover art).
    return (
      <li className="SearchResultItem">
        {this.maybeRenderSpinner()}
        <a
          className="SearchResultItem_Link"
          href="#"
          onBlur={this.props.onBlur}
          onClick={this.handleClick}>
          {this.props.artist}
          {' — '}
          {this.props.title}
        </a>
      </li>
    );
  },
});

export default SearchResultItem;
