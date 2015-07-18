// Implements a Flux dispatcher.
// See https://github.com/facebook/flux.
//
// tl;dr: It's like pubsub, but every listener gets every event, and a
// listener can wait for other listeners to complete first by calling
// waitFor() with those dependencies' IDs. (The ID is returned by register().)
// In Flux, the listeners are Stores, which update their own data in response
// to the payload, then emit change events that Views listen for.

"use strict";

class Dispatcher {
  constructor() {
    this._listeners = new Map();
    this._lastID = -1;

    this._pendingPayload = null;
    this._dispatching = false;
  }

  register(cb) {
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

  unregister(id) {
    if (!this._listeners.has(id)) {
      throw new Error('Not an active listener: ' + id);
    }
    // FIXME: What if we delete the listener from within a dispatch? Will
    // something bad happen?
    this._listeners.delete(id);
  }

  dispatch(payload) {
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

  waitFor(ids) {
    if (!this._dispatching) {
      throw new Error('waitFor can only be called within a dispatch');
    }

    ids.forEach((id) => {
      if (!this._listeners.has(id)) {
        throw new Error('Not an active listener: ' + id);
      }
      const listener = this._listeners.get(id);

      if (!listener.pending) {
        this._invoke(listener);
      } else if (!listener.handled) {
        throw new Error(
          'Circular dependency detected: ' + id + ' already pending'
        );
      }
    });
  }

  _invoke(listener) {
    listener.pending = true;
    listener.callback(this._pendingPayload);
    listener.handled = true;
  }

  _startDispatch(payload) {
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
