$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  console.log(org)

  // UI

  $('.toggle').click(() => {
    $('footer').toggleClass('active')
    $('#toggle-calendar').toggleClass('bottom')
  })

  // CALENDAR SETUP
  $('#toggle-calendar').fullCalendar({header: false})

  $('#main-calendar').fullCalendar({
    defaultView: 'basicDay',
    header: {
      left: '',
      center: 'title',
      right: ''
    }
  })

  $('.left').click(() => {
    $('#main-calendar').fullCalendar('prev')
  })

  $('.right').click(() => {
    $('#main-calendar').fullCalendar('next')
  })

  // SOCKET CONNECTION AND DATA TRANSFER
  var socket = io.connect();

})
