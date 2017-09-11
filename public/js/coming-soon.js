$(document).ready(() => {

  var count = 0
  $('.coming-soon img').click(() => {
    if (count === 4) {
      $('.coming-soon').fadeOut()
    } else {
      count++
    }
  })
})
