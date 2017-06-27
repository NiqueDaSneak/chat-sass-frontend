$(document).ready(() => {

  // INITIALIZERS
  // set date for toggle ui element
  $('.month').text(moment().format("MMMM"))
  // set color for today's date
  $('.fc-today').css('color', 'darkgrey')
  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  console.log(org)

  // UI & INTERACTIONS

  $('.toggle').click(() => {
    $('footer').toggleClass('active')
  })

  $('.left').click(() => {

  })

  $('.right').click(() => {

  })

  $('.hamburger').click(() => {
    $('footer').toggleClass('active')
  })

  // CALENDAR SETUP

  generateMonthCalendar()
  function generateMonthCalendar() {
    var month = "09"
    var day = "01"
    // var year = moment().format("YYYY")
    var year = 2018
    var firstDay = moment(month + day + year, "MM-DD-YYYY").format('dd')
    console.log(firstDay);
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
      for (var i = 1; i <= months[month]; i++) {
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
      for (var i = 1; i <= months[month]; i++) {
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
      $('.fifth').append("<span>" + months[month] + "</span>")
    }
    if (firstDay === "Tu") {
      for (var i = 1; i <= months[month]; i++) {
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
      $('.fifth').append("<span>" + (months[month] - 1) + "</span>")
      $('.fifth').append("<span>" + months[month] + "</span>")
    }
    if (firstDay === "We") {
      for (var i = 1; i <= months[month]; i++) {
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
      $('.fifth').append("<span>" + (months[month] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 1) + "</span>")
      $('.fifth').append("<span>" + months[month] + "</span>")
    }
    if (firstDay === "Th") {
      for (var i = 1; i <= months[month]; i++) {
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
      $('.fifth').append("<span>" + (months[month] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 1) + "</span>")
      $('.fifth').append("<span>" + months[month] + "</span>")
    }
    if (firstDay === "Fr") {
      for (var i = 1; i <= months[month]; i++) {
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
      $('.fifth').append("<span>" + (months[month] - 4) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 1) + "</span>")
      $('.fifth').append("<span>" + months[month] + "</span>")
    }
    if (firstDay === "Sa") {
      for (var i = 1; i <= months[month]; i++) {
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
      $('.fifth').append("<span>" + (months[month] - 5) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 4) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[month] - 1) + "</span>")
      $('.sixth').append("<span>" + months[month] + "</span>")
    }

  }

// SOCKET CONNECTION AND DATA TRANSFER
var socket = io.connect();

})
