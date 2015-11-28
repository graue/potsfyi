"use strict";
// @flow

import ActionConstants from './ActionConstants';
import PotsDispatcher from '../dispatcher/PotsDispatcher';

class ServerActionCreators {
  static receiveSearchResults(query: string, responseObj: Object) {
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
