'use strict'

$(document).ready(() => {

  var socket = io.connect()

  var pathname = window.location.pathname.split('/')
  var userID = pathname[2]
  var userAccessToken = pathname[3]

  let i = 0
  if (window.location.search === '?failed') {
    $('body').prepend("<p class='err-msg'>Error Processing Payment. Try Again.</p>")
    $('.tiers-header').css('margin-top', '4vh')
  }

  var planVar

  var handler = StripeCheckout.configure({
    key: 'pk_test_RcrJKqemWFARPg2zNFfPSZXj',
    image: '/imgs/icon.png',
    locale: 'auto',
    zipCode: true,
    // data-zip-code="true",
    token: function(token) {
      socket.emit('savePaymentToken', { userID: userID, accessToken: userAccessToken, stripeToken: token, plan: planVar })
    }
  })

  $('.free-tier').click((event) => {
    planVar = 'free'
    handler.open({
      name: 'IRRIGATE MESSAGING LLC',
      description: 'Free Tier',
      amount: 0
    })
    event.preventDefault()
  })

  $('.lite-tier').click((event) => {
    planVar = 'lite'
    handler.open({
      name: 'IRRIGATE MESSAGING LLC',
      description: 'Lite Tier',
      amount: 2200
    })
    event.preventDefault()
  })

  $('.pro-tier').click((event) => {
    planVar = 'pro'
    handler.open({
      name: 'IRRIGATE MESSAGING LLC',
      description: 'Pro Tier',
      amount: 6500
    })
    event.preventDefault()
  })

  $('.elite-tier').click((event) => {
    planVar = 'elite'
    handler.open({
      name: 'IRRIGATE MESSAGING LLC',
      description: 'Elite Tier',
      amount: 12000
    })
    event.preventDefault()
  })

  socket.on('redirect', (data) => {
    if (data.data === true) {
      $(location).attr('href','/choose-page/' + userID + '/' + userAccessToken)
    } else {
      $(location).attr('href','/tiers/' + userID + '/' + userAccessToken + '?failed')
    }
  })
})
