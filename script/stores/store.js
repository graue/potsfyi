"use strict";
// @flow

import albumCache from '../reducers/albumCache';
import playStatus from '../reducers/playStatus';
import {
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';
import search from '../reducers/search';
import trackCache from '../reducers/trackCache';

const logger = store => next => action => {
  console.info(action.type, action);
};

const store = createStore(
  combineReducers({
    albumCache,
    playStatus,
    search,
    trackCache,
  }),
  applyMiddleware(logger)
);

export default store;
