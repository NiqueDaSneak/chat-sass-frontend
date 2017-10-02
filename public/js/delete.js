$(document).ready(() => {

  var socket = io.connect()
  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  $('.todays-msgs').click('.delete', (event) => {
    if ($(event.target).hasClass('delete')) {
      $('body').prepend("<div class='onboard-dark'></div>")
      $('body').prepend("<div class='are-you-sure'><p>Are you sure?</p><button class='delete-msg' data-id=" + $(event.target).data('id') + " type='button' name='Delete'>Delete</button><button class='cancel-delete-msg' type='button' name='cancel'>Cancel</button></div>")
    }
  })

  $('button').click('.delete-msg', (event) => {
  })

  $('body').click((event) => {
    if ($(event.target).hasClass('cancel-delete-msg')) {
      let areYouSurePromise = new Promise(function(resolve, reject) {
        $('.are-you-sure').fadeOut()
        resolve()
      })
      let hideOverlay = new Promise(function(resolve, reject) {
        $('.onboard-dark').fadeOut()
        resolve()
      })

      areYouSurePromise.then(() => {
        $('.are-you-sure').remove()
      })

      hideOverlay.then(() => {
        $('.onboard-dark').remove()
      })
    }

    if ($(event.target).hasClass('delete-msg')) {
      console.log($(event.target).data('id'))
      socket.emit('requestDelete', { data: $(event.target).data('id'), org: org })
    }
  })

  socket.on('reloadPage', () => {
    location.reload(true)
  })

})
