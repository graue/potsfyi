"use strict";

function normalizeResult(rawResult) {
  return {
    id: String(rawResult[1]),
    isAlbum: rawResult[0] === 'album',
  };
}

const initialState = {
  query: '',
  isLoading: false,
  results: {
    forQuery: '',
    items: [],
  },
};

export default function search(state = initialState, action) {
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
