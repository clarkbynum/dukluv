var setTimeout;
var clearTimeout;

(function() {
  var my_timers = {};
  var timer_id = 0;
  setTimeout = function(func, delay) {
    var cb_func;
    var bind_args;

    // Delay can be optional at least in some contexts, so tolerate that.
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
    if (typeof delay !== "number") {
      if (typeof delay === "undefined") {
        delay = 0;
      } else {
        throw new TypeError("invalid delay");
      }
    }

    if (typeof func === "string") {
      // Legacy case: callback is a string.
      cb_func = eval.bind(this, func);
    } else if (typeof func !== "function") {
      throw new TypeError("callback is not a function/string");
    } else if (arguments.length > 2) {
      // Special case: callback arguments are provided.
      bind_args = Array.prototype.slice.call(arguments, 2); // [ arg1, arg2, ... ]
      bind_args.unshift(this); // [ global(this), arg1, arg2, ... ]
      cb_func = func.bind.apply(func, bind_args);
    } else {
      // Normal case: callback given as a function without arguments.
      cb_func = func;
    }

    timer_id++;
    var context = {};
    var timer = uv.new_timer.call(context);
    my_timers[timer_id] = timer;

    uv.timer_start(timer, delay, 0, function() {
      uv.close.call(context, timer, function() {});
      delete my_timers[timer_id];
      cb_func();
    });

    return timer_id;
  };

  clearTimeout = function(timer_id) {
    if (typeof timer_id !== "number") {
      throw new TypeError("timer ID is not a number");
    }

    var timer = my_timers[timer_id];
    if (typeof timer === "undefined") {
      throw new ReferenceError("no timer with id " + "'" + timer_id + "'");
    }

    uv.timer_stop(timer);
    uv.close(timer);
    delete my_timers[timer_id];
  };
})();

console.log("before timeout");
setTimeout(function() {
  console.log("inside timeout");
  var id = setTimeout(function() {
    console.log("inside second timeout");
  }, 2000);
  console.log("after first", id);
  setTimeout(function() {
    console.log("inside faster timeout");
    clearTimeout(id);
  }, 1000);
}, 1000);
console.log("after timeout");
