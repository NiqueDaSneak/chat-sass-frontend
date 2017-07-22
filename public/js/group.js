$(document).ready(() => {

  $('.list div').click(() => {
    console.log('clicked')
    $('.list').toggleClass('rotate')
    $('.new').toggleClass('rotate')
  })

  $('.new button').click(() => {
    $('.list').toggleClass('rotate')
    $('.new').toggleClass('rotate')
  })

})
