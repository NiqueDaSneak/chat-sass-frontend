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
  selector: '.body',
  background: "url('/imgs/pricingSteps.jpg')"
})

})
