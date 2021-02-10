"use strict";

import Icon from './Icon';
import React, {Component} from 'react';
import SearchBox from './SearchBox';

// Search box and magnifying glass next to it (which focuses).

class SearchArea extends Component {
  _handleClick = (e) => {
    if (this._box) {
      this._box.focus();
    }
  }

  render() {
    return (
      <div className="SearchArea">
        <Icon
          alt=""
          name={Icon.NAMES.MAGNIFYING_GLASS}
          onClick={this._handleClick}
          className="SearchAreaGlass"
        />
        <SearchBox
          {...this.props}
          ref={c => this._box = c}
        />
      </div>
    );
  }
}

export default SearchArea;
