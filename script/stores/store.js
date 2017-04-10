"use strict";
// @flow

import ReduxThunk from 'redux-thunk';
import albumCache from '../reducers/albumCache';
import type {AlbumCacheState} from '../reducers/albumCache';
import playStatus from '../reducers/playStatus';
import type {PlayStatusState} from '../reducers/playStatus';
import {
  applyMiddleware,
  combineReducers,
  createStore,
} from 'redux';
import search from '../reducers/search';
import type {SearchState} from '../reducers/search';
import trackCache from '../reducers/trackCache';
import type {TrackCacheState} from '../reducers/trackCache';

const logger = store => next => action => {
  console.info(action.type, action);
  next(action);
};

// TODO: Add full typing to this after upgrading Redux.
// See https://github.com/flowtype/flow-typed/tree/master/definitions/npm/redux_v3.x.x

export type ReduxState = {
  albumCache: AlbumCacheState,
  playStatus: PlayStatusState,
  search: SearchState,
  trackCache: TrackCacheState,
};

const store = createStore(
  combineReducers({
    albumCache,
    playStatus,
    search,
    trackCache,
  }),
  applyMiddleware(ReduxThunk, logger)
);

export default store;
