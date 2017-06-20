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
