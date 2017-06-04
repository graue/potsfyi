"use strict";
// @flow

import Icon from './Icon';
import React, {Component} from 'react';
import SearchBox from './SearchBox';

// Search box and magnifying glass next to it (which focuses).

class SearchArea extends Component {
  _box: ?SearchBox;  // FIXME: It's really a React-Redux wrapped version

  // $FlowFixMe: I think upgrading Flow will make this OK
  _handleClick = (e: SyntheticMouseEvent) => {
    if (this._box) {
      this._box.getWrappedInstance().focus();
    }
  };

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
