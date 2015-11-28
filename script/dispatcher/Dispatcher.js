// @flow
// Implements a Flux dispatcher.
// See https://github.com/facebook/flux.
//
// tl;dr: It's like pubsub, but every listener gets every event, and a
// listener can wait for other listeners to complete first by calling
// waitFor() with those dependencies' IDs. (The ID is returned by register().)
// In Flux, the listeners are Stores, which update their own data in response
// to the payload, then emit change events that Views listen for.

"use strict";

type Listener = {
  callback: (payload: Object) => void,
  handled: boolean,
  pending: boolean,
};

class Dispatcher {
  _dispatching: boolean;
  _lastID: number;
  _listeners: Map<number, Listener>;
  _pendingPayload: ?Object;

  constructor() {
    this._listeners = new Map();
    this._lastID = -1;

    this._pendingPayload = null;
    this._dispatching = false;
  }

  register(cb: (payload: Object) => void): number {
    let id = ++this._lastID;

    // A listener is an object with a callback field plus bookkeeping fields
    // to allow listeners (stores) to wait for one another.
    this._listeners.set(id, {
      callback: cb,
      pending: false,
      handled: false,
    });

    return id;
  }

  unregister(id: number) {
    if (!this._listeners.has(id)) {
      throw new Error('Not an active listener: ' + id);
    }
    // FIXME: What if we delete the listener from within a dispatch? Will
    // something bad happen?
    this._listeners.delete(id);
  }

  dispatch(payload: Object) {
    if (this._dispatching) {
      throw new Error('Cannot dispatch from within a dispatch');
    }

    this._startDispatch(payload);
    try {
      for (let listener of this._listeners.values()) {
        if (!listener.pending) {
          this._invoke(listener);
        }
      }
    } finally {
      this._endDispatch();
    }
  }

  waitFor(ids: Array<number>) {
    if (!this._dispatching) {
      throw new Error('waitFor can only be called within a dispatch');
    }

    ids.forEach((id) => {
      const listener = this._listeners.get(id);
      if (!listener) {
        throw new Error('Not an active listener: ' + id);
      }

      if (!listener.pending) {
        this._invoke(listener);
      } else if (!listener.handled) {
        throw new Error(
          'Circular dependency detected: ' + id + ' already pending'
        );
      }
    });
  }

  _invoke(listener: Listener) {
    listener.pending = true;
    // $FlowFixMe: _pendingPayload should never be null during dispatch
    listener.callback(this._pendingPayload);
    listener.handled = true;
  }

  _startDispatch(payload: Object) {
    this._pendingPayload = payload;
    this._dispatching = true;

    for (let listener of this._listeners.values()) {
      listener.pending = false;
      listener.handled = false;
    }
  }

  _endDispatch() {
    this._pendingPayload = null;
    this._dispatching = false;
  }
}

export default Dispatcher;
