'use strict'

$(document).ready(() => {

  var urlParams = new URLSearchParams(window.location.search)

  var price = urlParams.get('price')
  var dollars = price.split('.')[0]
  var cents = price.split('.')[1]

  var noDotPrice = dollars + cents

  var handler = StripeCheckout.configure({
    key: 'pk_test_RcrJKqemWFARPg2zNFfPSZXj',
    // key: 'sk_live_vCVX2baHRaQSbnF1Y5DMcQiN',
    image: '/imgs/tedx_logo.png',
    locale: 'auto',
    zipCode: true,
    // data-zip-code="true",
    token: function(token) {
      console.log(token)
      $.post('https://chat-sass-messenger-uploader.herokuapp.com/tedxrouter', {stripe: {email: token.email, id: token.id}, cost: Number(noDotPrice)})
      setTimeout(() => {
        window.location.replace("http://www.tedxcincinnati.com/");
      }, 3000)
    }
  })

  handler.open({
    name: 'TEDxCincinnati',
    description: 'TEDxCincinnati Donation',
    amount: Number(noDotPrice)
  })



})
