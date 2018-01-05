'use strict'

$(document).ready(() => {

  // initial animation

  // make first img show up, but still off screen on mobile
  setTimeout(() => {
    $('.imgs img:first-of-type').css('display', 'initial')
  }, 300)

  // start loop of email icons
  setTimeout(() => {
    $('.email-icon').remove()
  }, 3500)

  // slide messenger icon in
  setTimeout(() => {
    $('.imgs img:first-of-type').addClass('active')
  }, 2000)

  // change subheads
  // setTimeout(() => {
  //   $('.subheads p:first-child').remove()
  //   // $('.subheads').append('<p>Transform Messenger into an interactive, all-in-one e-commerce tool to maximize engagement, foster relationships and sell more.</p>')
  // }, 4000)

  var messengerIcon = true

  $('.landing-nav').click((event) => {
    if (messengerIcon === true) {
      $('.initial-hide').css('display', 'initial')
      console.log('...remove messenger icon')

      $('.subheads').css('opacity', '0')
      messengerIcon = false
      console.log(messengerIcon)
      $('.landing-nav span:last-of-type').addClass('active')
      $('.landing-nav span:first-of-type').removeClass('active')
      $('.down-chevron').css('opacity', '1')
      $('.alert').css('left', '-77.5vw')
      $('.imgs img.active').toggleClass('active')

      setTimeout(() => {
        $('.imgs img:first-of-type').css('display', 'none')
      }, 500)

      $('.imgs img:last-of-type').css('display', 'initial')
      setTimeout(() => {
        $('.imgs img:last-of-type').toggleClass('active')
      }, 200)

    } else {
      messengerIcon = true
      console.log('...add messenger icon')
      $('.subheads').css('opacity', '1')
      $('.landing-nav span:last-of-type').removeClass('active')
      $('.landing-nav span:first-of-type').addClass('active')

      $('.imgs img.active').toggleClass('active')
      setTimeout(() => {
        $('.imgs img:last-of-type').css('display', 'none')
      }, 500)

      $('.imgs img:first-of-type').css('display', 'initial')
      setTimeout(() => {
        $('.imgs img:first-of-type').toggleClass('active')
      }, 200)
    }

  })

  // $('.landing-nav').click((event) => {
  //
  //   function slideOut() {
  //     return new Promise(function(resolve, reject) {
  //       $('.imgs img.active').addClass('inactive')
  //       $('.alert').css('left', '-77.5vw')
  //       resolve()
  //     })
  //   }
  //
  //   if ($(event.target).hasClass('fwd')) {
  //
  //     if (landingCount === 1) {
  //       $('.landing-nav span:first-of-type').removeClass('active')
  //       $('.subheads').css('opacity', '0')
  //
  //       slideOut().then(() => {
  //         setTimeout(() => {
  //           $('.imgs img:first-of-type').css('display', 'none')
  //           $('.imgs img:first-of-type').removeClass()
  //         }, 1000)
  //       })
  //
  //       landingCount++
  //       $('.landing-nav span:nth-of-type(' + landingCount + ')').addClass('active')
  //       $('.headers span').remove()
  //       $('.imgs img:nth-of-type(' + landingCount + ')').css('display', 'initial')
  //       setTimeout(() => {
  //         $('.imgs img:nth-of-type(' + landingCount + ')').addClass('active')
  //       }, 200)
  //       $('.fwd').remove()
  //       $('.back').remove()
  //       $('.down-chevron').css('opacity', '1')
  //       $('.initial-hide').css('display', 'initial')
  //     }
  //
  //   }
  // })

  let touchstartX = 0;
  let touchstartY = 0;
  let touchendX = 0;
  let touchendY = 0;

  const gestureZone = document.getElementById('gestureZone');

  gestureZone.addEventListener('touchstart', function(event) {
      touchstartX = event.changedTouches[0].screenX;
      touchstartY = event.changedTouches[0].screenY;
  }, false);

  gestureZone.addEventListener('touchend', function(event) {
      touchendX = event.changedTouches[0].screenX;
      touchendY = event.changedTouches[0].screenY;
      handleGesture();
  }, false);

  function slideOut() {
    return new Promise(function(resolve, reject) {
      $('.imgs img.active').addClass('inactive')
      $('.alert').css('left', '-77.5vw')
      resolve()
    })
  }

  function handleGesture() {
      if (touchendX <= touchstartX) {
          console.log('Swiped left')

          if (messengerIcon === true) {
            $('.initial-hide').css('display', 'initial')
            console.log('...remove messenger icon')

            $('.subheads').css('opacity', '0')
            messengerIcon = false
            console.log(messengerIcon)
            $('.landing-nav span:last-of-type').addClass('active')
            $('.landing-nav span:first-of-type').removeClass('active')
            $('.down-chevron').css('opacity', '1')
            $('.alert').css('left', '-77.5vw')
            $('.imgs img.active').toggleClass('active')

            setTimeout(() => {
              $('.imgs img:first-of-type').css('display', 'none')
            }, 500)

            $('.imgs img:last-of-type').css('display', 'initial')
            setTimeout(() => {
              $('.imgs img:last-of-type').toggleClass('active')
            }, 200)
          } else {
            messengerIcon = true
            console.log('...add messenger icon')
            $('.subheads').css('opacity', '1')
            $('.landing-nav span:last-of-type').removeClass('active')
            $('.landing-nav span:first-of-type').addClass('active')

            $('.imgs img.active').toggleClass('active')
            setTimeout(() => {
              $('.imgs img:last-of-type').css('display', 'none')
            }, 500)

            $('.imgs img:first-of-type').css('display', 'initial')
            setTimeout(() => {
              $('.imgs img:first-of-type').toggleClass('active')
            }, 200)
          }

      }

      if (touchendX >= touchstartX) {
          console.log('Swiped right');
          if (messengerIcon === true) {
            $('.initial-hide').css('display', 'initial')
            console.log('...remove messenger icon')

            $('.subheads').css('opacity', '0')
            messengerIcon = false
            console.log(messengerIcon)
            $('.landing-nav span:last-of-type').addClass('active')
            $('.landing-nav span:first-of-type').removeClass('active')
            $('.down-chevron').css('opacity', '1')
            $('.alert').css('left', '-77.5vw')
            $('.imgs img.active').toggleClass('active')

            setTimeout(() => {
              $('.imgs img:first-of-type').css('display', 'none')
            }, 500)

            $('.imgs img:last-of-type').css('display', 'initial')
            setTimeout(() => {
              $('.imgs img:last-of-type').toggleClass('active')
            }, 200)
          } else {
            messengerIcon = true
            console.log('...add messenger icon')
            $('.subheads').css('opacity', '1')
            $('.landing-nav span:last-of-type').removeClass('active')
            $('.landing-nav span:first-of-type').addClass('active')

            $('.imgs img.active').toggleClass('active')
            setTimeout(() => {
              $('.imgs img:last-of-type').css('display', 'none')
            }, 500)

            $('.imgs img:first-of-type').css('display', 'initial')
            setTimeout(() => {
              $('.imgs img:first-of-type').toggleClass('active')
            }, 200)
          }

      }

      if (touchendY <= touchstartY) {
          console.log('Swiped up');
      }

      if (touchendY >= touchstartY) {
          console.log('Swiped down');
      }

      if (touchendY === touchstartY) {
          console.log('Tap');
      }
  }
})
