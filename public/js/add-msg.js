$(document).ready(() => {

  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    setTimeout(() => {
      $('.chat-ui input').css('left', '0')
    }, 2500)
    setTimeout(() => {
      $('.chat-ui img').css('right', '5vw')
    }, 5000)
  })

})
