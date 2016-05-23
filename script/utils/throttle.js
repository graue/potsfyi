"use strict";
// @flow

export default function throttle(
  fn: (...args: Array<mixed>) => mixed,
  delay: number
) {
  let lastRunTime = 0;
  let lastArgs;
  let timerId = null;

  // TODO: Fix this any type. As written, we will lose type checking for the
  // args of any throttled function. I don't know if it's possible to
  // parameterize over the entire signature of a function, though.
  return function(...args: Array<any>) {
    const now = Date.now();
    if (now - lastRunTime >= delay) {
      // Last ran at least 'delay' msec ago -> run immediately.
      lastRunTime = now;
      fn(...args);
    } else {
      // Last ran within last 'delay' msec. Save the arguments...
      lastArgs = args;
      // ...and if a run isn't already scheduled...
      if (timerId == null) {
        // ...schedule one.
        timerId = setTimeout(() => {
          timerId = null;
          lastRunTime = Date.now();
          fn(...lastArgs);
        }, (lastRunTime + delay) - now);
      }
    }
  };
}
