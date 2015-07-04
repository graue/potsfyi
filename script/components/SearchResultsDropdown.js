"use strict";

import React, {PropTypes} from 'react';
import SearchResultItem from './SearchResultItem';

class SearchResultsDropdown extends React.Component {
  render() {
    let rows = this.props.items.map((item) => {
      let key = (item.isAlbum ? 'a' : 't') + item.id;
      return (
        <SearchResultItem
          key={key}
          onBlur={this.props.onBlur}
          {...item}
        />
      );
    });

    return (
      <ul className="SearchResultsDropdown">
        {rows}
      </ul>
    );
  }
}
SearchResultsDropdown.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    isAlbum: PropTypes.bool,
  })),
};

export default SearchResultsDropdown;
