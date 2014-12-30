// Implements a Flux dispatcher.
// See https://github.com/facebook/flux.
//
// tl;dr: It's like pubsub, but every listener gets every event, and a
// listener can wait for other listeners to complete first by calling
// waitFor() with those dependencies' IDs. (The ID is returned by register().)
// In Flux, the listeners are Stores, which update their own data in response
// to the payload, then emit change events that Views listen for.

"use strict";

function Dispatcher() {
  this._listeners = {};
  this._lastID = -1;

  this._pendingPayload = null;
  this._dispatching = false;
}

Dispatcher.prototype.register = function(cb) {
  var id = 'cb' + (++this._lastID);

  // A listener is an object with a callback field plus bookkeeping fields
  // to allow listeners (stores) to wait for one another.
  this._listeners[id] = {
    callback: cb,
    pending: false,
    handled: false
  };

  return id;
};

Dispatcher.prototype.unregister = function(id) {
  if (!this._listeners[id]) {
    throw new Error('Not an active listener: ' + id);
  }
  // FIXME: What if we delete the listener from within a dispatch? Will
  // something bad happen?
  delete this._listeners[id];
};

Dispatcher.prototype.dispatch = function(payload) {
  if (this._dispatching) {
    throw new Error('Cannot dispatch from within a dispatch');
  }

  this._startDispatch(payload);
  try {
    for (var k in this._listeners) {
      var listener = this._listeners[k];
      if (!listener.pending) {
        this._invoke(listener);
      }
    }
  } finally {
    this._endDispatch();
  }
};

Dispatcher.prototype.waitFor = function(ids) {
  if (!this._dispatching) {
    throw new Error('waitFor can only be called within a dispatch');
  }

  var _this = this;
  ids.forEach(function(id) {
    if (!_this._listeners[id]) {
      throw new Error('Not an active listener: ' + id);
    }
    var listener = _this._listeners[id];

    if (!listener.pending) {
      this._invoke(listener);
    } else if (!listener.handled) {
      throw new Error(
        'Circular dependency detected: ' + id + ' already pending'
      );
    }
  });
};

Dispatcher.prototype._invoke = function(listener) {
  listener.pending = true;
  listener.callback(this._pendingPayload);
  listener.handled = true;
};

Dispatcher.prototype._startDispatch = function(payload) {
  this._pendingPayload = payload;
  this._dispatching = true;

  for (var k in this._listeners) {
    var listener = this._listeners[k];
    listener.pending = false;
    listener.handled = false;
  }
};

Dispatcher.prototype._endDispatch = function() {
  this._pendingPayload = null;
  this._dispatching = false;
};

module.exports = Dispatcher;
