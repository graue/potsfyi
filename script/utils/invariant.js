"use strict";
// @flow

// TODO: Copy the invariant from React and add a __DEV__ check or something
// so the strings can be elided in production?

// Also, this formatter uses {} for stuff to fill in: copied from Python, and
// probably used in JavaScript by exactly zero other people, oops.

function invariant(
  condition: mixed,
  format: string,
  a: mixed,
  b: mixed,
  c: mixed,
  d: mixed,
  e: mixed,
  f: mixed,
  g: mixed,
  h: mixed,
  i: mixed,
  j: mixed
) {
  if (!condition) {
    const args = [a, b, c, d, e, f, g, h, i, j];
    let index = 0;
    const errString = format.replace(/{}/g, function() {
      return String(args[index++]);
    });
    throw new Error('Invariant violation: ' + errString);
  }
}

export default invariant;
