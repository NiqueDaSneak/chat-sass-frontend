$(document).ready(() => {

  if (navigator.userAgent.match(/(iPad)/)) {

  } else if (navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry|IEMobile)/)) {

  } else {
    $('.subtitle').text('How small businesses engage and grow').css('margin-top', '8vh').css('margin-bottom', '15vh')
    $('.directMessaging').remove()
  }


  // blue gradient background
  // var blueGradient = new Multiple({
  //   selector: '.grad',
  //   background: 'radial-gradient(#00AEEF, #150958)'
  // })

  // about page gradient
  var aboutGrad = new Multiple({
    selector: '.about-copy',
    background: 'linear-gradient(#00AEEF, #150958)'
  })

  if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

    // business photo in first 2 sections
    var bizPhoto = new Multiple({
      selector: '.biz-photo',
      background: "url('/imgs/biz-photos/7-mobile.jpg')"
    })

    // nature photo landing page
    var naturePhoto = new Multiple({
      selector: '.features',
      background: "url('/imgs/nature-photos/8-mobile.jpg')"
    })

    // pricing page photo
    var pricingPhoto = new Multiple({
      selector: '.body-bg',
      background: "url('/imgs/pricingSteps-mobile.jpg')"
    })

    // customize page image
    var customizeImg = new Multiple({
      selector: '.customize-content',
      background: "url('/imgs/nature-photos/10-mobile.jpg')"
    })

  } else if ( /iPad/i.test(navigator.userAgent) ) {

    // business photo in first 2 sections
    var bizPhoto = new Multiple({
      selector: '.biz-photo',
      background: "url('/imgs/biz-photos/7-tab.jpg')"
    })

    // nature photo landing page
    var naturePhoto = new Multiple({
      selector: '.features',
      background: "url('/imgs/nature-photos/8-tab.jpg')"
    })

    // pricing page photo
    var pricingPhoto = new Multiple({
      selector: '.body-bg',
      background: "url('/imgs/pricingSteps-tab.jpg')"
    })

    // customize page image
    var customizeImg = new Multiple({
      selector: '.customize-content',
      background: "url('/imgs/nature-photos/10-tab.jpg')"
    })

  } else {

    // business photo in first 2 sections
    var bizPhoto = new Multiple({
      selector: '.biz-photo',
      background: "url('/imgs/biz-photos/7.png')"
    })

    // nature photo landing page
    var naturePhoto = new Multiple({
      selector: '.features',
      background: "url('/imgs/nature-photos/8.jpg')"
    })

    // pricing page photo
    var pricingPhoto = new Multiple({
      selector: '.body-bg',
      background: "url('/imgs/pricingSteps.png')"
    })

    // customize page image
    var customizeImg = new Multiple({
      selector: '.customize-content',
      background: "url('/imgs/nature-photos/10.png')"
    })
  }



  // landing page feature section css updates
  $('.features span:first-of-type').css('color', 'white')
  $('.features h5').css('color', 'white')
  $('.features h6').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  $('.features p').css('color', 'white').css('text-shadow', '0px 0px 60px black')

  // scroll listener for checking if elements on about us page are in viewport
  window.addEventListener('scroll', _.throttle(() => {
    $('.scroll-indicator').remove()
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      $('.about-copy span').each((index) => {
        if (index === 0) {
          if ($(`.about-copy .multiple-mobile-wrapper .multiple-mobile-content span:first-of-type`).isOnScreen()) {
            $(`.about-copy .multiple-mobile-wrapper .multiple-mobile-content span:first-of-type`).css('opacity', '1')
          }
        } else if (index === 11) {
          if ($(`.about-copy .multiple-mobile-wrapper .multiple-mobile-content span:last-of-type`).isOnScreen()) {
            $(`.about-copy .multiple-mobile-wrapper .multiple-mobile-content span:last-of-type`).css('opacity', '1')
          }
        } else {
          if ($(`.about-copy .multiple-mobile-wrapper .multiple-mobile-content span:nth-of-type(${index + 1})`).isOnScreen()) {
            $(`.about-copy .multiple-mobile-wrapper .multiple-mobile-content span:nth-of-type(${index + 1})`).css('opacity', '1')
          }
        }
      })
    } else {
      $('.about-copy span').each((index) => {
        if (index === 0) {
          if ($(`.about-copy span:first-of-type`).isOnScreen()) {
            $(`.about-copy span:first-of-type`).css('opacity', '1')
          }
        } else if (index === 11) {
          if ($(`.about-copy span:last-of-type`).isOnScreen()) {
            $(`.about-copy span:last-of-type`).css('opacity', '1')
          }
        } else {
          if ($(`.about-copy span:nth-of-type(${index + 1})`).isOnScreen()) {
            $(`.about-copy span:nth-of-type(${index + 1})`).css('opacity', '1')
          }
        }
      })
    }
  }, 1000))

  // is visible logic
  $.fn.isOnScreen = function() {
    var win = $(window)
    var viewport = {
      top: win.scrollTop(),
      left: win.scrollLeft()
    }
    viewport.right = viewport.left + win.width()
    viewport.bottom = viewport.top + win.height()
    var bounds = this.offset()
    bounds.right = bounds.left + this.outerWidth()
    bounds.bottom = bounds.top + this.outerHeight()
    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
  }

  // SCROLLING SEARCH BAR
  setTimeout(() => {
    if (navigator.userAgent.match(/(iPad)/)) {
      console.log('ipad')
      $('.directMessaging span:first-of-type').css('opacity', '1').css('bottom', '69.5vh')

    } else if (navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry|IEMobile)/)) {
      $('.directMessaging span:first-of-type').css('opacity', '1').css('bottom', '66.5vh')
    } else {
      $('.directMessaging span:first-of-type').css('opacity', '1').css('bottom', '14vh')
    }
  }, 1000)

  setTimeout(() => {
    if (navigator.userAgent.match(/(iPad)/)) {
      $('.directMessaging span:first-of-type').css('opacity', '0').css('bottom', '76vh')
      $('.directMessaging span:nth-of-type(2)').css('opacity', '1').css('bottom', '69.5vh')
      console.log('ipad')

    } else if (navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry|IEMobile)/)) {
      $('.directMessaging span:first-of-type').css('opacity', '0').css('bottom', '76vh')
      $('.directMessaging span:nth-of-type(2)').css('opacity', '1').css('bottom', '66.5vh')

    } else {
      $('.directMessaging span:first-of-type').css('opacity', '0').css('bottom', '22vh')
      $('.directMessaging span:nth-of-type(2)').css('opacity', '1').css('bottom', '14vh')
    }

  }, 2500)

  setTimeout(() => {
    if (navigator.userAgent.match(/(iPad)/)) {
      $('.directMessaging span:nth-of-type(2)').css('opacity', '0').css('bottom', '76vh')
      $('.directMessaging span:nth-of-type(3)').css('opacity', '1').css('bottom', '69.5vh')
      console.log('ipad')

    } else if (navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry|IEMobile)/)) {
      $('.directMessaging span:nth-of-type(2)').css('opacity', '0').css('bottom', '76vh')
      $('.directMessaging span:nth-of-type(3)').css('opacity', '1').css('bottom', '66.5vh')

    } else {
      $('.directMessaging span:nth-of-type(2)').css('opacity', '0').css('bottom', '22vh')
      $('.directMessaging span:nth-of-type(3)').css('opacity', '1').css('bottom', '14vh')
    }

  }, 3500)

  setTimeout(() => {
    if (navigator.userAgent.match(/(iPad)/)) {
      $('.directMessaging span:nth-of-type(3)').css('opacity', '0').css('bottom', '76vh')
      $('.directMessaging span:nth-of-type(4)').css('opacity', '1').css('bottom', '69.5vh')
      console.log('ipad')

    } else if (navigator.userAgent.match(/(iPhone|iPod|Android|BlackBerry|IEMobile)/)) {
      $('.directMessaging span:nth-of-type(3)').css('opacity', '0').css('bottom', '76vh')
      $('.directMessaging span:nth-of-type(4)').css('opacity', '1').css('bottom', '66.5vh')

    } else {
      $('.directMessaging span:nth-of-type(3)').css('opacity', '0').css('bottom', '22vh')
      $('.directMessaging span:nth-of-type(4)').css('opacity', '1').css('bottom', '14vh')
    }
  }, 4500)

  // setTimeout(() => {
  //   $('.directMessaging span:nth-of-type(4)').css('opacity', '0').css('bottom', '76vh')
  // }, 5500)


})
