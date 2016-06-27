"use strict";

import React, {PropTypes} from 'react';
import SearchResultItem from './SearchResultItem';
import Spinner from './Spinner';

import './SearchResultsDropdown.css';

class SearchResultsDropdown extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      isAlbum: PropTypes.bool.isRequired,
    })).isRequired,
    onBlur: PropTypes.func.isRequired,
  };

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
        let key = (item.isAlbum ? 'a' : 't') + item.id;
        return (
          <SearchResultItem
            hasSpinner={isLoading && index === 0}
            key={key}
            onBlur={onBlur}
            {...item}
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
