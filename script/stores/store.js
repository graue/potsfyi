"use strict";
// @flow

import albumCache from '../reducers/albumCache';
import playStatus from '../reducers/playStatus';
import {
  combineReducers,
  createStore,
} from 'redux';
import search from '../reducers/search';
import trackCache from '../reducers/trackCache';

const store = createStore(combineReducers({
  albumCache,
  playStatus,
  search,
  trackCache,
}));

export default store;
