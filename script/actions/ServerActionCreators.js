"use strict";

import ActionConstants from './ActionConstants';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

class ServerActionCreators {
  static receiveSearchResults(query, responseObj) {
    PotsDispatcher.dispatch({
      forQuery: query,
      albums: responseObj.albums,
      tracks: responseObj.tracks,
      results: responseObj.search_results,
      type: ActionConstants.RECEIVE_SEARCH_RESULTS,
    });
  }
}

export default ServerActionCreators;
