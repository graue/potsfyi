// TODO: Copy the invariant from React and add a __DEV__ check or something
// so the strings can be elided in production?

// Also, this formatter uses {} for stuff to fill in: copied from Python, and
// probably used in JavaScript by exactly zero other people, oops.

"use strict";

function invariant(condition, format, a, b, c, d, e, f, g, h, i, j) {
  if (!condition) {
    var args = [a, b, c, d, e, f, g, h, i, j];
    var index = 0;
    var errString = format.replace(/{}/g, function() {
      return args[index++];
    });
    throw new Error('Invariant violation: ' + errString);
  }
}

module.exports = invariant;