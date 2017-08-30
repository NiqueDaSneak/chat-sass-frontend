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
