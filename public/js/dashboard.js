$(document).ready(() => {

  // INITIALIZERS
  // date variables
  var month = moment().format("MM")
  var day = "01"
  var year = moment().format("YYYY")

  var displayMonth = moment().format("MM")
  var displayMonthLong = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayDayNumber = Number(moment().format('D'))
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()

  // set date for toggle ui element
  $('.month').text(displayMonthLong)

  // set number for main-calendar
  $('.main-calendar').text(Number(displayDay))

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  console.log(org)

  // UI & INTERACTIONS

  $('.toggle').click(() => {
    $('footer').toggleClass('active')
    $('.toggle-calendar').toggleClass('active')
  })

  $('.left').click(() => {
    if (displayDayNumber === 1) {
      var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MM-DD").subtract('1', 'months').daysInMonth()
      displayDayNumber = daysInNextMonth
      displayMonth = moment(displayMonth + '-' + displayDay, "MM-DD").subtract('1', 'months').format('MM')
      displayMonthLong = moment(displayMonth + '-' + displayDay, "MM-DD").format('MMM')
      $('.month').text(displayMonthLong)
      $('.main-calendar').text(Number(daysInNextMonth))
      if (displayMonth === '01') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
      }
      generateMonthCalendar()
    } else {
      displayDayNumber = displayDayNumber - 1
      $('.main-calendar').text(Number(displayDayNumber))
    }
    // check if the display date is the first day of the month
    // if the display date is the 1st, check how many days are in the previous month and change it to that
    // change the display month
  })

  $('.right').click(() => {
     if (displayDayNumber === 30 && moment(displayMonthLong, "MMM").daysInMonth() === 30) {
       if (displayMonth === '12') {
         displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
       }
       displayMonth = moment(displayMonth + '-' + displayDay, "MM-DD").add('1', 'months').format('MM')
       displayMonthLong = moment(displayMonth + '-' + displayDay, "MM-DD").format('MMM')
       $('.month').text(displayMonthLong)
       $('.main-calendar').text(1)
       displayDayNumber = 1
       generateMonthCalendar()
    } else if (displayDayNumber === 31 && moment(displayMonthLong, "MMM").daysInMonth() === 31) {
        if (displayMonth === '12') {
          displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
        }
        displayMonth = moment(displayMonth + '-' + displayDay, "MM-DD").add('1', 'months').format('MM')
        displayMonthLong = moment(displayMonth + '-' + displayDay, "MM-DD").format('MMM')
        $('.month').text(displayMonthLong)
        $('.main-calendar').text(1)
        displayDayNumber = 1
        generateMonthCalendar()
    } else if (displayDayNumber === 28 && moment(displayMonthLong, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MM-DD").add('1', 'months').format('MM')
      displayMonthLong = moment(displayMonth + '-' + displayDay, "MM-DD").format('MMM')
      $('.month').text(displayMonthLong)
      $('.main-calendar').text(1)
      displayDayNumber = 1
      generateMonthCalendar()
    } else {
      displayDayNumber = displayDayNumber + 1
      $('.main-calendar').text(displayDayNumber)
    }
    // check if the display date is the last day of the month
    // if it is, change date to 1st
    // change the display month
  })

  $('.hamburger').click(() => {
    $('footer').toggleClass('active')
  })

  // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDay = moment(displayMonth + day + displayYear, "MM-DD-YYYY").format('dd')
    var days = ["Su","Mo", "Tu", "We", "Th", "Fr", "Sa"]
    var months = {
      "01": 31,
      "02": 28,
      "03": 31,
      "04": 30,
      "05": 31,
      "06": 30,
      "07": 31,
      "08": 31,
      "09": 30,
      "10": 31,
      "11": 30,
      "12": 31
    }
    if (firstDay === "Su") {
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
    if (firstDay === "Mo") {
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
    if (firstDay === "Tu") {
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
    if (firstDay === "We") {
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
    if (firstDay === "Th") {
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
    if (firstDay === "Fr") {
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
      $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDay === "Sa") {
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
      $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.sixth').append("<span>" + months[displayMonth] + "</span>")
    }

  }

// SOCKET CONNECTION AND DATA TRANSFER
var socket = io.connect();

})
