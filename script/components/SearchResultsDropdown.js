"use strict";
// @flow

import PropTypes from 'prop-types';
import React from 'react';
import type {HydratedSearchResult} from './SearchBox';
import SearchResultItem from './SearchResultItem';
import Spinner from './Spinner';

import './SearchResultsDropdown.css';

type SearchResultsDropdownProps = {
  isLoading: boolean,
  items: Array<HydratedSearchResult>,
  onBlur: (e: SyntheticFocusEvent) => mixed,
  onItemClick: (index: number, e: SyntheticMouseEvent) => mixed,
};

class SearchResultsDropdown extends React.PureComponent {
  props: SearchResultsDropdownProps;

  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      isAlbum: PropTypes.bool.isRequired,
    })).isRequired,
    onBlur: PropTypes.func.isRequired,
    onItemClick: PropTypes.func.isRequired,
  };

  constructor(props: SearchResultsDropdownProps) {
    super(props);
  }

  render() {
    let {isLoading, items, onBlur} = this.props;

    let rows;
    if (items.length === 0 && isLoading) {
      rows = [
        <li className="SearchResultsDropdown_Spinner" key="spinner">
          <Spinner />
        </li>
      ];
    } else if (items.length === 0) {
      rows = [
        <li key="nothing">Nothing found.</li>
      ];
    } else {
      rows = items.map((item, index) => {
        const key = (item.isAlbum ? 'a' : 't') + item.id;
        return (
          <SearchResultItem
            hasSpinner={isLoading && index === 0}
            key={key}
            onBlur={onBlur}
            onClick={this.props.onItemClick.bind(null, index)}
            artist={item.artist}
            title={item.title}
            id={item.id}
            tracks={item.isAlbum ? item.tracks : undefined}
            coverArt={item.isAlbum ? item.coverArt : undefined}
          />
        );
      });
    }

    return (
      <ul className="SearchResultsDropdown">
        {rows}
      </ul>
    );
  }
}

export default SearchResultsDropdown;
