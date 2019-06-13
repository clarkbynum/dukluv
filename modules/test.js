"use strict";

var utils = require('./utils.js');
var stdout = utils.stdout;
var colorize = utils.colorize;

exports.test = test;
exports.errors = 0;

// Micro assert library
function assert(cond, message) {
  if (!cond) {
    throw new Error(message || "Assertion failed");
  }
}

// Mini test framework
function test(name, fn) {
  var cwd;
  cleanup();
  try {
    cwd = uv.cwd();
    var expects = [];
    console.log("\nStarting test: " + colorize("highlight", name));
    fn(assert, function (fn, left) {
      left = left || 1;
      expects.push(fn);
      return wrapped;
      function wrapped() {
        if (!--left) {
          var index = expects.indexOf(fn);
          if (index >= 0) {
            expects.splice(index, 1);
          }
        }
        if (left < 0) {
          throw new Error("Function called more than expected: " + fn);
        }
        return fn.apply(this, arguments);
      }
    });
    uv.run();
    uv.walk(function (handle) {
      if (handle === stdout) { return; }
      throw new Error("Unclosed handle: " + handle);
    });
    expects.forEach(function (fn) {
      throw new Error("Missing expected call: " + fn);
    });
    if (uv.cwd() !== cwd) {
      throw new Error("Test left cwd modified: " + cwd + " != " + uv.cwd());
    }
    console.log(colorize("success", "Passed!"));
  }
  catch (err) {
    exports.errors++;
    console.log(colorize("failure", "Failed!"));
    console.log(colorize("error", err.stack));
  }
  finally {
    uv.chdir(cwd);
    cleanup();
  }
}

function cleanup() {
  try {
    uv.run();
    uv.walk(function (handle) {
      if (handle === stdout) { return; }
      uv.close(handle);
    });
    uv.run();
  }
  catch (err) {
    exports.errors++;
    console.log(colorize("error", err.stack));
    cleanup();
  }
}
