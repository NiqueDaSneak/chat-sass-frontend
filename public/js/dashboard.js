$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  console.log(org)

  // UI

  $('.toggle').click(() => {
    $('footer').toggleClass('active')
    $('#calendar').toggleClass('bottom')
  })

  // CALENDAR SETUP
  $('#calendar').fullCalendar({
    header: false
  })

  // SOCKET CONNECTION AND DATA TRANSFER
  var socket = io.connect();

})
