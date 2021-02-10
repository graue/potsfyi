"use strict";

import PropTypes from 'prop-types';
import React from 'react';
import Spinner from './Spinner';
import invariant from '../utils/invariant';

import './SearchResultItem.css';

class SearchResultItem extends React.Component {
  static propTypes = {
    artist: PropTypes.string.isRequired,
    hasSpinner: PropTypes.bool,
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    tracks: PropTypes.arrayOf(PropTypes.string),
    coverArt: PropTypes.string,
    onBlur: PropTypes.func,
    onClick: PropTypes.func.isRequired,
  };

  _handleClick = (e) => {
    e.preventDefault();
    this.props.onClick(e);
  }

  _maybeRenderSpinner() {
    if (this.props.hasSpinner) {
      return (
        <div className="SearchResultItem_Spinner">
          <Spinner />
        </div>
      );
    } else {
      return null;
    }
  }

  render() {
    // TODO: Render the cover art if present.
    // TODO: Show albums differently from tracks (even if they don't have
    // cover art).
    return (
      <li className="SearchResultItem">
        {this._maybeRenderSpinner()}
        <a
          className="SearchResultItem_Link"
          href="#"
          onBlur={this.props.onBlur}
          onClick={this._handleClick}>
          {this.props.artist}
          {' — '}
          {this.props.title}
        </a>
      </li>
    );
  }
}

export default SearchResultItem;
