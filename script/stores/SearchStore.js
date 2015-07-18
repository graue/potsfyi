"use strict";

import ActionConstants from '../actions/ActionConstants';
import {EventEmitter} from 'events';
import PotsDispatcher from '../dispatcher/PotsDispatcher';
import ServerActionCreators from '../actions/ServerActionCreators';
import $ from '../lib/jquery.shim';

let query = '';
let results = null;
let pendingRequest = null;  // A jQuery "jqXHR" object.

class SearchStoreClass extends EventEmitter {
  _emitChange() {
    this.emit('change');
  }

  addChangeListener(cb) {
    this.on('change', cb);
  }

  removeChangeListener(cb) {
    this.removeListener('change', cb);
  }

  getQuery() {
    return query;
  }

  getResults() {
    return results;
  }

  isLoading() {
    return !!pendingRequest;
  }
}

let SearchStore = new SearchStoreClass();

function sendSearchRequest(query) {
  // Cancel any request currently being sent, to avoid wasting bandwidth or
  // server CPU.
  if (pendingRequest != null) {
    pendingRequest.abort();
  }

  pendingRequest = $.get(
    '/search',
    {q: query},
    onServerResponse.bind(null, query),
    'json'
  );
}

function onServerResponse(forQuery, data, textStatus, xhr) {
  // Ignore stale responses for old queries.
  if (xhr !== pendingRequest) {
    return;
  }
  pendingRequest = null;
  ServerActionCreators.receiveSearchResults(forQuery, data);
}

SearchStore.dispatchToken = PotsDispatcher.register(function(action) {
  switch (action.type) {
    case ActionConstants.CHANGE_SEARCH_QUERY:
      if (action.query !== query) {
        query = action.query;

        if (query === '') {
          // Immediately throw away any results, since it would be clowny
          // to have them stick around (or to return after you type a new,
          // different letter).
          results = null;
        } else {
          sendSearchRequest(query);
        }
        SearchStore._emitChange();
      }
      break;

    case ActionConstants.RECEIVE_SEARCH_RESULTS:
      results = {
        forQuery: action.forQuery,
        items: action.results.map(function(rawItem) {
          return {
            id: rawItem[1] + '',
            isAlbum: rawItem[0] === 'album',
          };
        }),
      };
      SearchStore._emitChange();
      break;
  }
});

export default SearchStore;
