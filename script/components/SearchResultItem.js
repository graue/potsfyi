"use strict";
// @flow

import React, {
  Component,
  PropTypes,
} from 'react';
import Spinner from './Spinner';
import invariant from 'invariant';

import './SearchResultItem.css';

type SearchResultItemProps = {
  artist: string,
  hasSpinner?: boolean,
  title: string,
  id: string,
  tracks?: Array<string>,
  coverArt?: ?string,
  onBlur?: (e: SyntheticFocusEvent) => mixed,
  onClick: (e: SyntheticMouseEvent) => mixed,
};

class SearchResultItem extends Component {
  props: SearchResultItemProps;

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

  _maybeRenderSpinner(): ?React.Element<any> {
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

  render(): React.Element<any> {
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
          onClick={this.props.onClick}>
          {this.props.artist}
          {' — '}
          {this.props.title}
        </a>
      </li>
    );
  }
}

export default SearchResultItem;
