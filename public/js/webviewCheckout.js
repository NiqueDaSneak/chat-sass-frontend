'use strict'

$(document).ready(() => {

  var urlParams = new URLSearchParams(window.location.search)

  var price = urlParams.get('price')
  var dollars = price.split('.')[0]
  var cents = price.split('.')[1]
  var biz = urlParams.get('biz')
  var noDotPrice = dollars + cents

  var handler = StripeCheckout.configure({
    key: 'pk_test_RcrJKqemWFARPg2zNFfPSZXj',
    image: '/imgs/icon.png',
    locale: 'auto',
    zipCode: true,
    // data-zip-code="true",
    token: function(token) {
      console.log(token)
    }
  })

  handler.open({
    name: biz,
    description: 'Online Payment',
    amount: Number(noDotPrice)
  })
})
