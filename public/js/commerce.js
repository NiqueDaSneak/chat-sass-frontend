'use strict'

$(document).ready(() => {

  // hide header
  $('header').hide()

  // make first img show up, but still off screen on mobile
  setTimeout(() => {
    $('.imgs img:first-of-type').css('display', 'initial')
  }, 300)

  // slide messenger icon in
  setTimeout(() => {
    $('.imgs img:first-of-type').addClass('active')
  }, 2000)

  if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {

    // hide down chevron
    $('.down-chevron').hide()

    // remove second header text on mobile
    $(".hide-desktop").css('display', 'none')

    // make first img show up, but still off screen on mobile
    // setTimeout(() => {
    //   $('.imgs img:first-of-type').css('display', 'initial')
    // }, 300)

    // start loop of email icons
    setTimeout(() => {
      $('.email-icon').remove()
    }, 3500)

    // slide messenger icon in
    setTimeout(() => {
      $('.imgs img:first-of-type').addClass('active')
    }, 2000)

    var counter = 1
    // for news rotating
    setInterval(() => {

      if (counter === 2) {
        $('.news-icons.active').toggleClass('active')
        $('.future div:nth-of-type(3)').toggleClass('active')
        counter++
        // console.log(counter)
      } else if (counter === 1) {
        $('.news-icons.active').toggleClass('active')
        $('.future div:nth-of-type(2)').toggleClass('active')
        $('.news .title').text('How SnapTravel generated $1 million in less than a year and Sephora increase sales by 11%.')
        $('.news .description').text("'Messenger can be an integral tool for business-to-consumer (B2C) communications, as it offers the 65 million active businesses on its platform an easy and seamless communications channel to reach its 1.2 billion monthly active users.'")
        counter++
        // console.log(counter)
      } else {
        $('.news-icons.active').toggleClass('active')
        $('.future div:nth-of-type(4)').toggleClass('active')
        counter = 1
      }
      // console.log(counter)
    }, 3000)

    // for top scrolling imgs
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
        $('.down-chevron').show()
        $('header').show()
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
          $('.down-chevron').show()
          $('header').show()
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
          $('.down-chevron').show()
          $('header').show()
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
  } else {

  }
})
