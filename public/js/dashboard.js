$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  console.log(org)

  // CALENDAR SETUP
  $('#calendar').fullCalendar({
        // put your options and callbacks here
  })


  // SOCKET CONNECTION AND DATA TRANSFER
  var socket = io.connect();


})
