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

  // blue gradient background
  var blueGradient = new Multiple({
    selector: '.grad',
    background: 'radial-gradient(#00AEEF, #150958)'
  })
  var rand = Math.floor(Math.random() * 10) + 1

  // business photo in first 2 sections
  var bizPhoto = new Multiple({
    selector: '.biz-photo',
    background: "url('/imgs/biz-photos/" + rand + ".png')"
  })

  if (rand === 1) {
    $('.logo').attr('src', '/imgs/logo-white-top.png').css('filter', 'drop-shadow(black 0px 0px 15px)')
    $('.subtitle').css('color', 'white').css('text-shadow', 'black 0px 0px 60px')
    $('.landing a').css('border', 'black solid 0.5vw').css('background-color','rgba(21, 9, 88, 0)')
    $('.landing a span').css('text-shadow', '0px 0px 30px black')
    $('.market h3').css('text-shadow', '0px 0px 60px black').css('color', 'white')
    $('.market h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  }

  if (rand === 2) {
    $('.logo').attr('src', '/imgs/logo-black-top.png').css('filter', 'drop-shadow(white 0px 0px 15px)')
    $('.subtitle').css('color', 'white').css('text-shadow', 'black 0px 0px 60px')
    $('.landing a').css('border', 'black solid 0.5vw').css('background-color','rgba(21, 9, 88, 0)')
    $('.landing a span').css('font-weight', '400').css('text-shadow', '0px 0px 30px white')
    $('.market h3').css('text-shadow', '0px 0px 60px black').css('color', 'white')
    $('.market h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  }

  if (rand === 3) {
    $('.logo').attr('src', '/imgs/logo-black-top.png').css('filter', 'drop-shadow(white 0px 0px 15px)')
    $('.subtitle').css('color', 'black').css('text-shadow', '0px 0px 280px white').css('font-weight', '600')
    $('.market h3').css('text-shadow', '0px 0px 280px white').css('color', 'black')
    $('.market h5').css('color', 'black').css('text-shadow', '0px 0px 280px white')
    $('.landing a').css('background-color','black')
  }

  if (rand === 4) {
    $('.logo').attr('src', '/imgs/logo-lightblue-top.png').css('filter', 'drop-shadow(black 0px 0px 15px)')
    $('.subtitle').css('color', 'white')
    $('.market h3').css('text-shadow', '0px 0px 60px black').css('color', 'white')
    $('.market h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.landing a').css('border', 'white solid 0.5vw').css('background-color','rgba(21, 9, 88, 0)')
  }

  if (rand === 5) {
    $('.logo').attr('src', '/imgs/logo-lightblue-top.png').css('filter', 'drop-shadow(#00AEEF 0px 0px 45px)')
    $('.subtitle').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.market h3').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.market h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.landing a').css('background-color','rgba(21, 9, 88, 0)').css('border', '#00AEEF solid 1.1vw')
    $('.landing a span').css('text-shadow', '0px 0px 60px #00AEEF').css('font-weight', '400')
    $('.landing a img').css('filter', 'drop-shadow(#00AEEF 0px 0px 15px)')
  }

  if (rand === 6) {
    $('.logo').attr('src', '/imgs/logo-black-top.png').css('filter', 'drop-shadow(black 0px 0px 7px)')
    $('.subtitle').css('color', 'white').css('text-shadow', '0px 0px 60px black').css('font-weight', '400')
    $('.market h3').css('text-shadow', '0px 0px 60px black').css('color', 'white')
    $('.market h5').css('text-shadow', '0px 0px 60px black').css('color', 'white')
    $('.landing a').css('background-color','rgba(21, 9, 88, 0)').css('border,', 'white solid 0.5vw').css('border', 'white solid .5vw')
  }

  if (rand === 7) {
    $('.logo').attr('src', '/imgs/logo-lightblue-top.png').css('filter', 'drop-shadow(black 0px 0px 15px)')
    $('.subtitle').css('color', 'white').css('text-shadow', '0px 0px 60px black').css('font-weight', '400')
    $('.market h3').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.market h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.landing a').css('border,', 'white solid 0.5vw').css('border', 'white solid .5vw').css('background-color','rgba(21, 9, 88, 0)')
  }

  if (rand === 8) {
    $('.logo').attr('src', '/imgs/logo-white-top.png').css('filter', 'drop-shadow(black 0px 0px 13px)')
    $('.landing a').css('background-color','black')
    $('.subtitle').css('color', 'white').css('text-shadow', '0px 0px 60px black').css('font-weight', '400')
    $('.market h3').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.market h5').css('text-shadow', '0px 0px 60px black').css('color', 'white')
  }

  if (rand === 9) {
    $('.logo').attr('src', '/imgs/logo-lightblue-top.png')
    $('.subtitle').css('text-shadow', '0px 0px 25px black').css('color', 'white').css('font-weight', '400')
    $('.landing a').css('font-weight', '400').css('text-shadow', '0px 0px 60px black').css('border', 'white solid .5vw').css('background-color', 'rgba(0, 0, 255, 0)')
    $('.landing a span').css('font-weight', '600')
    $('.landing a img').css('filter', 'drop-shadow( 0px 0px 15px black )')
    $('.market h3').css('text-shadow', '0px 0px 60px black').css('color', 'white')
    $('.market h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
  }

  if (rand === 10) {
    $('.logo').attr('src', '/imgs/logo-lightblue-top.png').css('filter', 'drop-shadow(black 0px 0px 15px)')
    $('.subtitle').css('text-shadow', '0px 0px 25px black').css('color', 'white').css('font-weight', '400')
    $('.landing a').css('text-shadow', '0px 0px 60px black').css('font-weight', '400').css('border', 'white solid .5vw').css('background-color', 'rgba(0, 0, 255, 0)')
    $('.landing a span').css('font-weight', '600')
    $('.landing a img').css('filter', 'drop-shadow( 0px 0px 15px black )')
    $('.market h3').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.market h5').css('text-shadow', '0px 0px 60px black').css('color', 'white')
  }

  var rand2 = Math.floor(Math.random() * 11) + 1

  var naturePhoto = new Multiple({
    selector: '.features',
    background: "url('/imgs/nature-photos/" + rand2 + ".png')"
  })

  switch (rand2) {
    default:
    $('.features h3').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.features h5').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.features h6').css('color', 'white').css('text-shadow', '0px 0px 60px black')
    $('.features p').css('color', 'white').css('text-shadow', '0px 0px 60px black')

  }
})
