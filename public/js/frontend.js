"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  $('.msgGroupList').click((event) => {
    for (var i = 0; i < $("input[type='checkbox']").length; i++) {
      if ($("input[type='checkbox']")[i].checked === true) {
        $($("input[type='checkbox']")[i]).parent().parent().addClass('checked')
      }
      if ($("input[type='checkbox']")[i].checked === false) {
          $($("input[type='checkbox']")[i]).parent().parent().removeClass('checked')
      }
    }
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})

/*! asynquence
    v0.10.0 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	if (typeof define === "function" && define.amd) { define(definition); }
	else if (typeof module !== "undefined" && module.exports) { module.exports = definition(); }
	else { context[name] = definition(name,context); }
})("ASQ",this,function DEF(name,context){
	"use strict";

	var cycle, scheduling_queue,
		timer = (typeof setImmediate !== "undefined") ?
			function $$timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// Note: using a queue instead of array for efficiency
	function Queue() {
		var first, last, item;

		function Item(fn) {
			this.fn = fn;
			this.next = void 0;
		}

		return {
			add: function $$add(fn) {
				item = new Item(fn);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function $$drain() {
				var f = first;
				first = last = cycle = null;

				while (f) {
					f.fn();
					f = f.next;
				}
			}
		};
	}

	scheduling_queue = Queue();

	function schedule(fn) {
		scheduling_queue.add(fn);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	function tapSequence(def) {
		// temporary `trigger` which, if called before being replaced
		// above, creates replacement proxy sequence with the
		// success/error message(s) pre-injected
		function trigger() {
			def.seq = createSequence.apply(ø,arguments).defer();
		}

		// fail trigger
		trigger.fail = function $$trigger$fail() {
			var args = ARRAY_SLICE.call(arguments);
			def.seq = createSequence(function $$create$sequence(done){
				done.fail.apply(ø,args);
			})
			.defer();
		};

		// listen for signals from the sequence
		def.seq
		// note: cannot use `seq.pipe(trigger)` because we
		// need to be able to update the shared closure
		// to change `trigger`
		.val(function $$val(){
			trigger.apply(ø,arguments);
			return ASQmessages.apply(ø,arguments);
		})
		.or(function $$or(){
			trigger.fail.apply(ø,arguments);
		});

		// make a sequence to act as a proxy to the original
		// sequence
		def.seq = createSequence(function $$create$sequence(done){
			// replace the temporary trigger (created below)
			// with this proxy's trigger
			trigger = done;
		})
		.defer();
	}

	function createSequence() {

		function scheduleSequenceTick() {
			if (seq_aborted) {
				sequenceTick();
			}
			else if (!seq_tick) {
				seq_tick = schedule(sequenceTick);
			}
		}

		function throwSequenceErrors() {
			throw (sequence_errors.length === 1 ? sequence_errors[0] : sequence_errors);
		}

		function sequenceTick() {
			var fn, args;

			seq_tick = null;
			// remove the temporary `unpause()` hook, if any
			delete sequence_api.unpause;

			if (seq_aborted) {
				clearTimeout(seq_tick);
				seq_tick = null;
				then_queue.length = or_queue.length = sequence_messages.length = sequence_errors.length = 0;
			}
			else if (seq_error) {
				if (or_queue.length === 0 && !error_reported) {
					error_reported = true;
					throwSequenceErrors();
				}

				while (or_queue.length) {
					error_reported = true;
					fn = or_queue.shift();
					try {
						fn.apply(ø,sequence_errors);
					}
					catch (err) {
						if (isMessageWrapper(err)) {
							sequence_errors = sequence_errors.concat(err);
						}
						else {
							sequence_errors.push(err);
							if (err.stack) { sequence_errors.push(err.stack); }
						}
						if (or_queue.length === 0) {
							throwSequenceErrors();
						}
					}
				}
			}
			else if (then_ready && then_queue.length > 0) {
				then_ready = false;
				fn = then_queue.shift();
				args = sequence_messages.slice();
				sequence_messages.length = 0;
				args.unshift(createStepCompletion());

				try {
					fn.apply(ø,args);
				}
				catch (err) {
					if (isMessageWrapper(err)) {
						sequence_errors = sequence_errors.concat(err);
					}
					else {
						sequence_errors.push(err);
					}
					seq_error = true;
					scheduleSequenceTick();
				}
			}
		}

		function createStepCompletion() {

			function done() {
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				step_completed = true;
				then_ready = true;
				sequence_messages.push.apply(sequence_messages,arguments);
				sequence_errors.length = 0;

				scheduleSequenceTick();
			}

			done.fail = function $$step$fail(){
				// ignore this call?
				if (seq_error || seq_aborted || then_ready || step_completed) {
					return;
				}

				seq_error = true;
				sequence_messages.length = 0;
				sequence_errors.push.apply(sequence_errors,arguments);

				scheduleSequenceTick();
			};

			done.abort = function $$step$abort(){
				if (seq_error || seq_aborted) {
					return;
				}

				then_ready = false;
				seq_aborted = true;
				sequence_messages.length = sequence_errors.length = 0;

				scheduleSequenceTick();
			};

			// handles "error-first" (aka "node-style") callbacks
			done.errfcb = function $$step$errfcb(err){
				if (err) {
					done.fail(err);
				}
				else {
					done.apply(ø,ARRAY_SLICE.call(arguments,1));
				}
			};

			var step_completed = false;

			return done;
		}

		function createGate(stepCompletion,segments,seqMessages) {

			function resetGate() {
				clearTimeout(gate_tick);
				gate_tick = segment_completion =
					segment_messages = segment_error_message = null;
			}

			function scheduleGateTick() {
				if (gate_aborted) {
					return gateTick();
				}

				if (!gate_tick) {
					gate_tick = schedule(gateTick);
				}
			}

			function gateTick() {
				if (seq_error || seq_aborted || gate_completed) {
					return;
				}

				var msgs = [];

				gate_tick = null;

				if (gate_error) {
					stepCompletion.fail.apply(ø,segment_error_message);

					resetGate();
				}
				else if (gate_aborted) {
					stepCompletion.abort();

					resetGate();
				}
				else if (checkGate()) {
					gate_completed = true;

					// collect all the messages from the gate segments
					segment_completion
					.forEach(function $$each(sc,i){
						msgs.push(segment_messages["s" + i]);
					});

					stepCompletion.apply(ø,msgs);

					resetGate();
				}
			}

			function checkGate() {
				if (segment_completion.length === 0) {
					return;
				}

				var fulfilled = true;

				segment_completion.some(function $$some(segcom){
					if (segcom === null) {
						fulfilled = false;
						return true; // break
					}
				});

				return fulfilled;
			}

			function createSegmentCompletion() {

				function done() {
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					// put gate-segment messages into `messages`-branded
					// container
					var args = ASQmessages.apply(ø,arguments);

					segment_messages["s" + segment_completion_idx] =
						args.length > 1 ? args : args[0];
					segment_completion[segment_completion_idx] = true;

					scheduleGateTick();
				}

				var segment_completion_idx = segment_completion.length;

				done.fail = function $$segment$fail(){
					// ignore this call?
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed ||
						segment_completion[segment_completion_idx]
					) {
						return;
					}

					gate_error = true;
					segment_error_message = ARRAY_SLICE.call(arguments);

					scheduleGateTick();
				};

				done.abort = function $$segment$abort(){
					if (seq_error || seq_aborted || gate_error ||
						gate_aborted || gate_completed
					) {
						return;
					}

					gate_aborted = true;

					// abort() is an immediate/synchronous action
					gateTick();
				};

				// handles "error-first" (aka "node-style") callbacks
				done.errfcb = function $$segment$errfcb(err){
					if (err) {
						done.fail(err);
					}
					else {
						done.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
				};

				// placeholder for when a gate-segment completes
				segment_completion[segment_completion_idx] = null;

				return done;
			}

			var gate_error = false,
				gate_aborted = false,
				gate_completed = false,

				args,
				err_msg,

				segment_completion = [],
				segment_messages = {},
				segment_error_message,

				gate_tick
			;

			segments.some(function $$some(seg){
				if (gate_error || gate_aborted) {
					return true; // break
				}

				args = seqMessages.slice();
				args.unshift(createSegmentCompletion());
				try {
					seg.apply(ø,args);
				}
				catch (err) {
					err_msg = err;
					gate_error = true;
					return true; // break
				}
			});

			if (err_msg) {
				if (isMessageWrapper(err_msg)) {
					stepCompletion.fail.apply(ø,err_msg);
				}
				else {
					stepCompletion.fail(err_msg);
				}
			}
		}

		function then() {
			if (seq_error || seq_aborted ||	arguments.length === 0) {
				return sequence_api;
			}

			wrapArgs(arguments,thenWrapper)
			.forEach(function $$each(v){
				if (isSequence(v)) {
					seq(v);
				}
				else {
					then_queue.push(v);
				}
			});

			scheduleSequenceTick();

			return sequence_api;
		}

		function or() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			or_queue.push.apply(or_queue,arguments);

			scheduleSequenceTick();

			return sequence_api;
		}

		function gate() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			var fns = ARRAY_SLICE.call(arguments)
			// map any sequences to gate segments
			.map(function $$map(v){
				var def;

				// is `v` a sequence or iterable-sequence?
				if (isSequence(v)) {
					def = { seq: v };
					tapSequence(def);
					return function $$segment(done) {
						def.seq.pipe(done);
					};
				}
				else return v;
			});

			then(function $$then(done){
				var args = ARRAY_SLICE.call(arguments,1);
				createGate(done,fns,args);
			});

			return sequence_api;
		}

		function pipe() {
			if (seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(trigger){
				then(function $$then(done){
					trigger.apply(ø,ARRAY_SLICE.call(arguments,1));
					done();
				})
				.or(trigger.fail);
			});

			return sequence_api;
		}

		function seq() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(v){
				var def = { seq: v };

				// is `fn` a sequence or iterable-sequence?
				if (isSequence(v)) {
					tapSequence(def);
				}

				then(function $$then(done){
					var _v = def.seq;
					// check if this argument is not already a sequence?
					// if not, assume a function to invoke that will return
					// a sequence.
					if (!isSequence(_v)) {
						_v = def.seq.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// pipe the provided sequence into our current sequence
					_v.pipe(done);
				});
			});

			return sequence_api;
		}

		function val() {
			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(
				wrapArgs(arguments,valWrapper)
			)
			.forEach(function $$each(fn){
				then(function $$then(done){
					var msgs = fn.apply(ø,ARRAY_SLICE.call(arguments,1));
					if (!isMessageWrapper(msgs)) {
						msgs = ASQmessages(msgs);
					}
					done.apply(ø,msgs);
				});
			});

			return sequence_api;
		}

		function promise() {
			function wrap(fn) {
				return function $$fn(){
					fn.apply(ø,isMessageWrapper(arguments[0]) ? arguments[0] : arguments);
				};
			}

			if (seq_error || seq_aborted || arguments.length === 0) {
				return sequence_api;
			}

			ARRAY_SLICE.call(arguments)
			.forEach(function $$each(pr){
				then(function $$then(done){
					var _pr = pr;
					// check if this argument is a non-thenable function, and
					// if so, assume we shold invoke it to return a promise
					// NOTE: `then` duck-typing of promises is stupid.
					if (typeof pr === "function" && typeof pr.then !== "function") {
						_pr = pr.apply(ø,ARRAY_SLICE.call(arguments,1));
					}
					// now, hook up the promise to the sequence
					_pr.then(
						wrap(done),
						wrap(done.fail)
					);
				});
			});

			return sequence_api;
		}

		function fork() {
			var trigger;

			// listen for success at this point in the sequence
			val(function $$val(){
				if (trigger) {
					trigger.apply(ø,arguments);
				}
				else {
					trigger = createSequence.apply(ø,arguments).defer();
				}
				return ASQmessages.apply(ø,arguments);
			});
			// listen for error at this point in the sequence
			or(function $$or(){
				if (trigger) {
					trigger.fail.apply(ø,arguments);
				}
				else {
					var args = ARRAY_SLICE.call(arguments);
					trigger = createSequence().then(function $$then(done){
						done.fail.apply(ø,args);
					})
					.defer();
				}
			});

			// create the forked sequence which will receive
			// the success/error stream from the main sequence
			return createSequence()
			.then(function $$then(done){
				if (!trigger) {
					trigger = done;
				}
				else {
					trigger.pipe(done);
				}
			})
			.defer();
		}

		function abort() {
			if (seq_error) {
				return sequence_api;
			}

			seq_aborted = true;

			sequenceTick();

			return sequence_api;
		}

		function duplicate() {
			var sq;

			template = {
				then_queue: then_queue.slice(),
				or_queue: or_queue.slice()
			};
			sq = createSequence();
			template = null;

			return sq;
		}

		function unpause() {
			sequence_messages.push.apply(sequence_messages,arguments);
			if (seq_tick === true) seq_tick = null;
			scheduleSequenceTick();
		}

		// opt-out of global error reporting for this sequence
		function defer() {
			or_queue.push(function ignored(){});
			return sequence_api;
		}

		function internals(name,value) {
			var set = (arguments.length > 1);
			switch (name) {
				case "seq_error":
					if (set) { seq_error = value; }
					else { return seq_error; }
					break;
				case "seq_aborted":
					if (set) { seq_aborted = value; }
					else { return seq_aborted; }
					break;
				case "then_ready":
					if (set) { then_ready = value; }
					else { return then_ready; }
					break;
				case "then_queue":
					return then_queue;
				case "or_queue":
					return or_queue;
				case "sequence_messages":
					return sequence_messages;
				case "sequence_errors":
					return sequence_errors;
			}
		}

		function includeExtensions() {
			Object.keys(extensions)
			.forEach(function $$each(name){
				sequence_api[name] = sequence_api[name] ||
					extensions[name](sequence_api,internals);
			});
		}

		var seq_error = false,
			error_reported = false,
			seq_aborted = false,
			then_ready = true,

			then_queue = [],
			or_queue = [],

			sequence_messages = [],
			sequence_errors = [],

			seq_tick,

			// brand the sequence API so we can detect ASQ instances
			sequence_api = brandIt({
				then: then,
				or: or,
				// alias of `or(..)` to `onerror(..)`
				onerror: or,
				gate: gate,
				// alias of `gate(..)` to `all(..)` for symmetry
				// with native ES6 promises
				all: gate,
				pipe: pipe,
				seq: seq,
				val: val,
				promise: promise,
				fork: fork,
				abort: abort,
				duplicate: duplicate,
				defer: defer
			})
		;

		// include any extensions
		includeExtensions();

		// templating the sequence setup?
		if (template) {
			then_queue = template.then_queue.slice();
			or_queue = template.or_queue.slice();

			// templating a sequence starts it out paused
			// add temporary `unpause()` API hook
			sequence_api.unpause = unpause;
			seq_tick = true;
		}

		// treat ASQ() constructor parameters as having been
		// passed to `then()`
		sequence_api.then.apply(ø,arguments);

		return sequence_api;
	}


	// ***********************************************
	// Object branding utilities
	// ***********************************************
	function brandIt(obj) {
		return Object.defineProperty(obj,brand,{
			enumerable: false,
			value: true
		});
	}

	function checkBranding(val) {
		return !!(val != null && typeof val === "object" && val[brand]);
	}


	// ***********************************************
	// Value messages utilities
	// ***********************************************
	// wrapper helpers
	function valWrapper(numArgs) {
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		return ASQmessages.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function thenWrapper(numArgs) {
		// Because of bind() partial-application, will
		// receive pre-bound arguments before the `done()`,
		// rather than it being first as usual.
		// `numArgs` indicates how many pre-bound arguments
		// will be sent in.
		arguments[numArgs+1] // the `done()`
		.apply(ø,
			// pass along only the pre-bound arguments
			ARRAY_SLICE.call(arguments).slice(1,numArgs+1)
		);
	}

	function wrapArgs(args,wrapper) {
		var i, j;
		args = ARRAY_SLICE.call(args);
		for (i=0; i<args.length; i++) {
			if (isMessageWrapper(args[i])) {
				args[i] = wrapper.bind.apply(wrapper,
					// partial-application of arguments
					[/*this=*/null,/*numArgs=*/args[i].length]
					.concat(
						// pre-bound arguments
						args[i]
					)
				);
			}
			else if (typeof args[i] !== "function" &&
				(
					wrapper === valWrapper ||
					!isSequence(args[i])
				)
			) {
				for (j=i+1; j<args.length; j++) {
					if (typeof args[j] === "function" ||
						checkBranding(args[j])
					) {
						break;
					}
				}
				args.splice(
					/*start=*/i,
					/*howMany=*/j-i,
					/*replace=*/wrapper.bind.apply(wrapper,
						// partial-application of arguments
						[/*this=*/null,/*numArgs=*/(j-i)]
						.concat(
							// pre-bound arguments
							args.slice(i,j)
						)
					)
				);
			}
		}
		return args;
	}


	var extensions = {}, template,
		old_public_api = (context || {})[name],
		ARRAY_SLICE = [].slice,
		brand = "__ASQ__", ø = Object.create(null),
		ASQmessages, isSequence, isMessageWrapper
	;

	// ***********************************************
	// Setup the public API
	// ***********************************************
	createSequence.failed = function $$public$failed() {
		var args = ASQmessages.apply(ø,arguments);
		return createSequence(function $$failed(){ throw args; }).defer();
	};

	createSequence.extend = function $$public$extend(name,build) {
		extensions[name] = build;

		return createSequence;
	};

	createSequence.messages = ASQmessages = function $$public$messages() {
		var ret = ARRAY_SLICE.call(arguments);
		// brand the message wrapper so we can detect
		return brandIt(ret);
	};

	createSequence.isSequence = isSequence = function $$public$isSequence(val) {
		return checkBranding(val) && !Array.isArray(val);
	};

	createSequence.isMessageWrapper = isMessageWrapper = function $$public$isMessageWrapper(val) {
		return checkBranding(val) && Array.isArray(val);
	};

	createSequence.unpause = function $$public$unpause(sq) {
		if (sq.unpause) sq.unpause();
		return sq;
	};

	createSequence.noConflict = function $$public$noConflict() {
		if (context) {
			context[name] = old_public_api;
		}
		return createSequence;
	};

	// create a clone of the *asynquence* API
	// Note: does *not* include any registered extensions
	createSequence.clone = function $$public$clone() {
		return DEF(name,context);
	};

	// private utility exports: only for internal/plugin use!
	createSequence.__schedule = schedule;
	createSequence.__tapSequence = tapSequence;

	return createSequence;
});

$(document).ready(() => {

  // toggle forms
  $('.show-signup').click(() => {
    $('.login').addClass('rotate')
    $('.signup').removeClass('rotate')
  })

  $('.show-login').click(() => {
    $('.signup').addClass('rotate')
    $('.login').removeClass('rotate')
  })

})

$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    displayMonth = moment().format('MMM')
    displayYear = moment().format('YYYY')
    $('.header-month').text(displayMonth)
    $('.header-date').text(Number(displayDay))
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadTodayMsgs()
    loadActiveDay()
    loadMsgsForCal()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {

    } else if ($(event.target).is('div') || $(event.target).is('img') ) {

    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='edit' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='edit' data-id="+ msg._id +" src='/imgs/pen.svg' alt=''></div></div>")
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }
        $('.todays-msgs').prepend("<hr>")
      }
    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})

// $(document).ready(() => {
//
//   var socket = io.connect()
//
//   $('.todays-msgs').click('.edit', (event) => {
//     socket.emit('requestEdit', {data: $(event.target).data('id')})
//   })
//
//   socket.on('editData', (data) => {
//     console.log(data.data)
//   })
// })

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      console.log($('.promoteText').val)
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      console.log($('.promoteText').val)
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      console.log($('.promoteText').val())
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      // socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      console.log($('.promoteText').val())
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      // socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      console.log($('.promoteText').val())
      socket.emit('promoteOnFacebook', {post: $('.promoteText').val()})
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      // socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      console.log($('.promoteText').val())
      socket.emit('promoteOnFacebook', {post: $('.promoteText').val()})
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      // socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      console.log($('.promoteText').val())
      socket.emit('promoteOnFacebook', {post: $('.promoteText').val(), org: org})
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      // socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      console.log($('.promoteText').val())
      socket.emit('promoteOnFacebook', {post: $('.promoteText').val(), org: org})
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      // socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      socket.emit('promoteOnFacebook', {post: $('.promoteText').val(), org: org})
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})

$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
      var arr = []
      for (var i = 0; i < $('.names').children().length; i++) {
        if ($($('.names').children()[i]).hasClass('selected')) {
          arr.push($($('.names').children()[i]).data('fbid'))
        }
      }
      socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
      socket.emit('getList', {org: org})
      $('.new').toggleClass('hide')
      $('.list').toggleClass('hide')
      $('.names').empty()
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      socket.emit('promoteOnFacebook', {post: $('.promoteText').val(), org: org})
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})

$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})

$(document).ready(() => {

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
        $('.submenu').toggleClass('inactive')
      }
  })
})
