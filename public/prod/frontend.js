/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


$(document).ready(() => {
  __webpack_require__(1)
  __webpack_require__(2)
  __webpack_require__(3)
  __webpack_require__(4)
  __webpack_require__(5)
  __webpack_require__(6)
  __webpack_require__(7)
})


/***/ }),
/* 1 */
/***/ (function(module, exports) {


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

  // hide button because it loads on today
  $('.go-to-today').css('color', '#150958')

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
    if (displayDay === moment().format('D') && displayMonth === moment().format('MMM')) {
      $('.go-to-today').css('color', '#150958')
    } else {
      $('.go-to-today').css('color', 'white')
    }
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
      if (Number(day) === Number(displayDay) && moment(month).format('MMM') === displayMonth) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='delete' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/delete.svg' alt=''></div></div>")
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img class='delete' data-id="+ msg._id +" src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.image) {
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='delete' data-id="+ msg._id +" src='/imgs/delete.svg' alt=''></div></div>")
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

        }

        if (msg.text) {
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img class='delete' data-id="+ msg._id +" src='/imgs/delete.svg' alt=''></div></div>")
          // $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span></div></div>")

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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



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
    if ($('.send-now').hasClass('selected')) {
      $("input[type='time']").val(moment().add(2,'m').format('hh:mm'))
      $("input[type='date']").val(moment().format('YYYY-MM-DD'))
      $('.loading').fadeIn()
      $('.msg-data').submit()
    } else {
      $('.loading').fadeIn()
      $('.msg-data').submit()
    }
  })

  $('.send-now').click(() => {
    $('.send-now').toggleClass('selected')
    $('.chat-ui form span:nth-of-type(4)').toggle('fast')
    $(".chat-ui form input[type='date']").toggle('fast')
    $('.chat-ui form span:nth-of-type(5)').toggle('fast')
    $(".chat-ui form input[type='time']").toggle('fast')
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


/***/ }),
/* 3 */
/***/ (function(module, exports) {


  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var socket = io.connect()

  socket.emit('getUsername', {data: org})

  new Clipboard('.clipboard-link')

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
      $('.submenu').toggleClass('inactive')
    }
  })

  $('.clipboard-link').click(() => {
    $('.submenu div:nth-of-type(3)').css('background-color', 'green')
    setTimeout(() => {
      $('.submenu').addClass('inactive')
    }, 1000)
    setTimeout(() => {
      $('.submenu div:nth-of-type(3)').css('background-color', '#00AEEF')
    }, 1000)
  })

  $('.submenu div').click((event) => {
    switch ($(event.target).text()) {
      case 'Help':
        socket.emit('onboardUserAgain', {data: org})
        setTimeout(() => {
          $('.submenu').addClass('inactive')
        }, 1000)
        break;
      case 'Share Templates':
        console.log($(event.target).text())
        break;
      case 'Account Settings':
        console.log($(event.target).text())
        break;
      default:

    }
  })

  socket.on('addToClipboard', (data) => {
    $('.clipboard-link').attr('data-clipboard-text', $('.clipboard-link').data('clipboard-text') + data.data)
  })

  socket.on('onboardingAgain', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button><button class='promote-later' type='button' name='button'>Post Later</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })


/***/ }),
/* 4 */
/***/ (function(module, exports) {


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

  $('.addGroup').click(() => {
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

  $('.list').on('click', 'p', (event) => {
      socket.emit('findGroup', { name: $(event.target).data('name'), organization: org })
  })

  socket.on('editGroupMembers', (data) => {
    let hidePromise = new Promise(function(resolve, reject) {
      $('.list').toggleClass('hide')
      $('.new').toggleClass('hide')
      $(this).scrollTop(0)
    })

    let addMembers = new Promise(function(resolve, reject) {
      $('.groupName').val(data.name)
      for (var i = 0; i < data.members.length; i++) {
        $('.new .names').prepend("<div data-fbid=" + data.members[i].fbID + "><img src='" + data.members[i].photo + "' alt='profile photo'><p>" + data.members[i].fullName + "</p></div>")
      }

      for (var i = 0; i < data.group.groupMembers.length; i++) {
        for (var x = 0; x < $('.names').children().length; x++) {
          console.log(data.group.groupMembers[i].fbID)
          console.log($($('.names').children()[x]).data('fbid'))
          if (data.group.groupMembers[i] === $($('.names').children()[x]).data('fbid')) {
            console.log('match')
            $($('.names').children()[x]).addClass('selected')
          }
        }
      }

    })

    hidePromise.then(() => {
      addMembers
    })

  })

  $('.list').on('click', '.deleteGroup', (event) => {
    socket.emit('deleteGroup', { groupName: $(event.target).data('groupname'), org: org })
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    if (data.data.createdDate) {
      let day = data.data.createdDate.split("-")[2].split('T')[0]
      let month = data.data.createdDate.split("-")[1]
      let year = data.data.createdDate.split("-")[0]
      if (moment(month + '-' + day + '-' + year ).diff(moment(), 'days') >= -12) {
        $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p><img class='new-user-icon' src='/imgs/star-icon.svg' alt='New User'></div>")
      } else {
        $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
      }
    } else {
      $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
    }
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<div><img class='deleteGroup' data-groupname='"+ data.data[i].groupName + "' src='/imgs/delete.svg' alt='Delete Icon'><p class='name' data-name='"+ data.data[i].groupName +"'>" + data.data[i].groupName + "</p></div>")
    }
  })


/***/ }),
/* 5 */
/***/ (function(module, exports) {


  var socket = io.connect()
  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  $('.todays-msgs').click('.delete', (event) => {
    if ($(event.target).hasClass('delete')) {
      $('body').prepend("<div class='onboard-dark'></div>")
      $('body').prepend("<div class='are-you-sure'><p>Are you sure?</p><button class='delete-msg' data-id=" + $(event.target).data('id') + " type='button' name='Delete'>Delete</button><button class='cancel-delete-msg' type='button' name='cancel'>Cancel</button></div>")
    }
  })

  $('button').click('.delete-msg', (event) => {
  })

  $('body').click((event) => {
    if ($(event.target).hasClass('cancel-delete-msg')) {
      let areYouSurePromise = new Promise(function(resolve, reject) {
        $('.are-you-sure').fadeOut()
        resolve()
      })
      let hideOverlay = new Promise(function(resolve, reject) {
        $('.onboard-dark').fadeOut()
        resolve()
      })

      areYouSurePromise.then(() => {
        $('.are-you-sure').remove()
      })

      hideOverlay.then(() => {
        $('.onboard-dark').remove()
      })
    }

    if ($(event.target).hasClass('delete-msg')) {
      console.log($(event.target).data('id'))
      socket.emit('requestDelete', { data: $(event.target).data('id'), org: org })
    }
  })

  socket.on('reloadPage', () => {
    location.reload(true)
  })


/***/ }),
/* 6 */
/***/ (function(module, exports) {


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
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button><button class='promote-later' type='button' name='button'>Post Later</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      socket.emit('promoteOnFacebook', {post: $('.promoteText').val(), org: org})
      $('.onboarding').remove()
      $('body').prepend("<img class='success-check' src='/imgs/checkmark.svg' alt='Success Check'>")
      setTimeout(() => {
        $('.success-check').fadeOut('slow')
        $('.onboard-dark').fadeOut('slow')
      }, 800)
      setTimeout(() => {
        $('.success-check').remove()
        $('.onboard-dark').remove()
      }, 1000)
      socket.emit('onboardComplete', {data: org})
    } else if ($(event.target).hasClass('promote-later')) {
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })


/***/ }),
/* 7 */
/***/ (function(module, exports) {


  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  var socket = io.connect()

  $('.quick-view').click(() => {
    $('body').prepend("<section class='quick-view-holder'><div class='quick-view-header'><img src='/imgs/x.svg' alt='Close icon'><img src='/imgs/home.svg' alt='Home Icon'><span>Quick View</span></div><div class='new-users'><span>New Users, Past 2 Weeks: </span><span></span></div><div class='next-msg-preview'><span>Next Scheduled Message: </span><span></span></div><div class='onboard-dark'></div></section>")
    $('.onboard-dark').css('opacity', '.97').css('background-color', '#150958')
    socket.emit('getMembersAndNewMsg', {
      data: org
    })
  })
  $('body').on('click', '.quick-view-header img:first-of-type', () =>{
    $('.quick-view-holder').remove()
  })

  socket.on('quickViewNextMsg', (data) => {
    if (data.data === undefined) {
      $('.next-msg-preview span:last-of-type').text('None')
    } else {
      $('.next-msg-preview span:last-of-type').text(moment(data.data.date, 'YYYY-MM-DD').format('MM/DD'))
    }

  })

  socket.on('quickViewMembers', (data) => {
    $('.new-users span:last-of-type').text(data.members.length)
  })


/***/ })
/******/ ]);