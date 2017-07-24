$(document).ready(() => {

  $('.hamburger').click(() => {
    $('footer').toggleClass('sub')
    $('.submenu').toggleClass('inactive')
  })
})
