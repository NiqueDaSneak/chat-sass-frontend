$(document).ready(() => {
  var initialScroll = false

  $(window).scroll(() => {
    if (initialScroll === false) {
      $('header').css('background-color', 'white')
      setTimeout(() => {
        $('header').css('box-shadow', '1px -1px 20px 0px rgba(0,0,0,0.75)')
      }, 800)
      initialScroll = true
    }
  })
})
