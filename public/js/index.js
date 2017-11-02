$(document).ready(() => {

  // blue gradient background
  var blueGradient = new Multiple({
    selector: '.grad',
    background: 'radial-gradient(#00AEEF, #150958)'
  })

  // business photo in first 2 sections
  var bizPhoto = new Multiple({
    selector: '.biz-photo',
    background: "url('/imgs/biz-photos/7.png')"
  })

  $('.logo').attr('src', '/imgs/new-logo.png').css('filter', 'drop-shadow(black 0px 0px 15px)')
  $('.subtitle').css('color', 'white').css('text-shadow', '0px 0px 60px black').css('font-weight', '400')
  $('.market h3').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  $('.market h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  $('.landing a').css('border,', 'white solid 0.5vw').css('border', 'white solid .5vw').css('background-color', 'rgba(21, 9, 88, 0)')

  var naturePhoto = new Multiple({
    selector: '.features',
    background: "url('/imgs/nature-photos/9.png')"
  })

  $('.features span:first-of-type').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  $('.features h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  $('.features h6').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  $('.features p').css('color', 'white').css('text-shadow', '0px 0px 60px black')

  var pricingPhoto = new Multiple({
    selector: '.body-bg',
    background: "url('/imgs/pricingSteps.jpg')"
  })

  var aboutGrad = new Multiple({
    selector: '.about-copy',
    background: 'linear-gradient(#00AEEF, #150958)'
  })

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

})
