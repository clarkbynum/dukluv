"use strict";

// uv.argv() returns the C argv[] array
uv.argv().forEach(function (v, i) {
  console.log('arg', i, v);
});
