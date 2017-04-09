"use strict";
// @flow

import PlaylistActionCreators from '../actions/PlaylistActionCreators';
import React, {
  Component,
  PropTypes,
} from 'react';
import Spinner from './Spinner';
import invariant from 'invariant';

import './SearchResultItem.css';

type SearchResultItemProps = {
  isAlbum: boolean,
  artist: string,
  hasSpinner?: boolean,
  title: string,
  id: string,
  tracks?: Array<string>,
  coverArt?: string,
  onBlur?: (e: SyntheticFocusEvent) => mixed,
};

class SearchResultItem extends Component {
  props: SearchResultItemProps;

  static propTypes = {
    isAlbum: PropTypes.bool.isRequired,
    artist: PropTypes.string.isRequired,
    hasSpinner: PropTypes.bool,
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    tracks: PropTypes.arrayOf(PropTypes.string),
    coverArt: PropTypes.string,
  };

  // $FlowFixMe: need upgrade
  _handleClick = (e: SyntheticMouseEvent) => {
    const tracksToAdd = this.props.isAlbum ?
      this.props.tracks : [this.props.id];
    invariant(tracksToAdd, 'if isAlbum, should have tracks defined');
    PlaylistActionCreators.addToPlaylist(tracksToAdd);
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
