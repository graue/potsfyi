"use strict";
// @flow

import Dispatcher from './Dispatcher';
import {unstable_batchedUpdates as batchedUpdates} from 'react-dom';

class PotsDispatcherClass extends Dispatcher {
  _dispatch: (payload: Object) => void;

  constructor() {
    super();
    this._dispatch = Dispatcher.prototype.dispatch.bind(this);
  }
  dispatch(payload: Object) {
    batchedUpdates(this._dispatch, payload);
  }
}

const PotsDispatcher = new PotsDispatcherClass();

PotsDispatcher.register(action => console.info(action.type, action));

export default PotsDispatcher;
