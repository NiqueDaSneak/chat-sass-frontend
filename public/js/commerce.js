'use strict'

$(document).ready(() => {

  // initial animation
  setTimeout(() => {
    $('.imgs img:first-of-type').css('display', 'initial')
  }, 300)
  setTimeout(() => {
    $('.imgs img:first-of-type').addClass('active')
  }, 400)

  var landingCount = 1

  $('.landing-nav').click((event) => {

    if ($(event.target).hasClass('back')) {
      if (landingCount === 1) {
        $('.landing-nav span:nth-of-type(' + landingCount + ')').removeClass('active')
        landingCount = 3
        $('.landing-nav span:last-of-type').addClass('active')
      } else if (landingCount === 2) {
        $('.landing-nav span:nth-of-type(' + landingCount + ')').removeClass('active')
        landingCount--
        $('.landing-nav span:nth-of-type(' + landingCount + ')').addClass('active')
      } else {
        $('.landing-nav span:nth-of-type(' + landingCount + ')').removeClass('active')
        landingCount--
        $('.landing-nav span:nth-of-type(' + landingCount + ')').addClass('active')
      }
    }

    if ($(event.target).hasClass('fwd')) {

      function slideOut() {
        return new Promise(function(resolve, reject) {
          $('.imgs img.active').addClass('inactive')
          $('.alert').css('left', '-77.5vw')
          resolve()
        })
      }

      if (landingCount === 1) {
        $('.landing-nav span:first-of-type').removeClass('active')
        $('.subheads').css('opacity', '0')

        slideOut().then(() => {
          setTimeout(() => {
            $('.imgs img:first-of-type').css('display', 'none')
            $('.imgs img:first-of-type').removeClass()
          }, 1000)
        })
        $('.down-chevron').css('opacity', '1')
        
        landingCount++
        // add active class to .subheads p:nth-of-type
        $('.landing-nav span:nth-of-type(' + landingCount + ')').addClass('active')
        setTimeout(() => {
          $('.imgs img:nth-of-type(' + landingCount + ')').css('display', 'initial')
        }, 100)
        setTimeout(() => {
          $('.imgs img:nth-of-type(' + landingCount + ')').addClass('active')
        }, 200)
      } else if (landingCount === 2) {
        $('.landing-nav span:nth-of-type(' + landingCount + ')').removeClass('active')
        // $('subheads p').text('Capabilities')

        slideOut().then(() => {
          setTimeout(() => {
            $('.imgs img:nth-of-type(2)').css('display', 'none')
            $('.imgs img:nth-of-type(2)').removeClass()
          }, 1000)
        })
        landingCount++
        $('.headers span').text('Capabilities\n')
        $('.subheads p').text('Engage users instantly through an automated chat crafted with your brand’s voice, complete with quick replies based on common interactions.')
        $('.landing-nav span:nth-of-type(' + landingCount + ')').addClass('active')
        setTimeout(() => {
          $('.imgs img:nth-of-type(' + landingCount + ')').css('display', 'initial')
        }, 100)
        setTimeout(() => {
          $('.imgs img:nth-of-type(' + landingCount + ')').addClass('active')
        }, 200)
        // add active class to .imgs img:nth-of-type
        // add active class to .subheads p:nth-of-type
      } else {
        $('.landing-nav span:nth-of-type(' + landingCount + ')').removeClass('active')
        slideOut().then(() => {
          setTimeout(() => {
            $('.imgs img:last-of-type').css('display', 'none')
            $('.imgs img:last-of-type').removeClass()
          }, 1000)
        })
        landingCount = 1
        $('.headers span').text('Meet Conversational e-Commerce')
        $('.subheads p').text('Transform Messenger into an interactive, all-in-one e-commerce tool to maximize engagement, foster relationships and sell more.')
        $('.landing-nav span:first-of-type').addClass('active')
        setTimeout(() => {
          $('.imgs img:first-of-type').css('display', 'initial')
        }, 100)
        setTimeout(() => {
          $('.imgs img:first-of-type').addClass('active')
        }, 200)
        // add active class to .imgs img:first-of-type
        // add active class to .subheads p:first-of-type
      }
      console.log(landingCount)
    }
  })
})
