"use strict";
// @flow

import type {Action} from '../actions/ActionCreators';
import type {ServerSearchResult} from '../types/server';

export type Result = {
  id: string,
  isAlbum: boolean,
};

type SearchState = {
  query: string,
  isLoading: boolean,
  results: {
    forQuery: string,
    items: Array<Result>,
  },
};

function normalizeResult(raw: ServerSearchResult): Result {
  return {
    id: raw[1],
    isAlbum: raw[0] === 'album',
  };
}

const initialState: SearchState = {
  query: '',
  isLoading: false,
  results: {
    forQuery: '',
    items: [],
  },
};

export default function search(
  state: SearchState = initialState,
  action: Action
): SearchState {
  if (action.type === 'searchSuccess') {
    state = {
      ...state,
      isLoading: action.forQuery !== state.query,
      results: {
        forQuery: action.forQuery,
        items: action.results.map(normalizeResult),
      },
    };
  } else if (action.type === 'searchAttempt') {
    state = {
      ...state,
      query: action.query,
      isLoading: action.query !== '',
    };
  }

  return state;
}
