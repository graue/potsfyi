"use strict";
// @flow

import Dispatcher from './Dispatcher';
import {unstable_batchedUpdates as batchedUpdates} from 'react-dom';

class PotsDispatcher extends Dispatcher {
  _dispatch: (payload: Object) => void;

  constructor() {
    super();
    this._dispatch = Dispatcher.prototype.dispatch.bind(this);
  }
  dispatch(payload: Object) {
    batchedUpdates(this._dispatch, payload);
  }
}

export default new PotsDispatcher();
