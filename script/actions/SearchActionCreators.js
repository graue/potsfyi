"use strict";

import ActionConstants from './ActionConstants';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

class SearchActionCreators {
  static changeQuery(query) {
    PotsDispatcher.dispatch({
      query: query,
      type: ActionConstants.CHANGE_SEARCH_QUERY,
    });
  }
}

export default SearchActionCreators;
