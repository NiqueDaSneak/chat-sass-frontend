$(document).ready(() => {

  // socket connection
  var socket = io.connect()

  $('.hamburger').click(() => {
    $('footer').toggleClass('sub')
    $('.submenu').toggleClass('inactive')
  })

  
})
