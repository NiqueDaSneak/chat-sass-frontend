'use strict'

$(document).ready(() => {

  var landingCount = 1

  $('.landing-nav').click((event) => {

    if ($(event.target).hasClass('back')) {
      console.log('left')
    }

    if ($(event.target).hasClass('fwd')) {

      if (landingCount === 1) {
        $('.landing-nav span:first-of-type').removeClass('active')
        landingCount++
        $('.landing-nav span:nth-of-type(' + landingCount + ')').addClass('active')
      } else if (landingCount === 2) {
        $('.landing-nav span:nth-of-type(' + landingCount + ')').removeClass('active')
        landingCount++
        $('.landing-nav span:nth-of-type(' + landingCount + ')').addClass('active')
      } else {
        $('.landing-nav span:nth-of-type(' + landingCount + ')').removeClass('active')
        landingCount = 1
        $('.landing-nav span:first-of-type').addClass('active')
      }
      console.log(landingCount)
    }
  })
})
