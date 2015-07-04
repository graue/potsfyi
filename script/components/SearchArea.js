"use strict";

import Icon from './Icon';
import React from 'react';
import SearchBox from './SearchBox';

// Search box and magnifying glass next to it (which focuses).

const SearchArea = React.createClass({
  handleClick() {
    this.refs['box'].focus();
  },

  render() {
    return (
      <div className="SearchArea">
        <Icon
          name={Icon.NAMES.MAGNIFYING_GLASS}
          onClick={this.handleClick}
          className="SearchAreaGlass"
        />
        <SearchBox ref="box" {...this.props} />
      </div>
    );
  },
});

export default SearchArea;
