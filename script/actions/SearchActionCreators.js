"use strict";
// @flow

import ActionConstants from './ActionConstants';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

class SearchActionCreators {
  static changeQuery(query: string) {
    PotsDispatcher.dispatch({
      query: query,
      type: ActionConstants.CHANGE_SEARCH_QUERY,
    });
  }
}

export default SearchActionCreators;
