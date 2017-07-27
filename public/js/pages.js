$(document).ready(() => {

  var socket = io.connect()
  var ID
  socket.on('userID', (data) => {
    ID = data.id
  })
  socket.emit('requestPages')

  socket.on('addPages', (data) => {
    console.log(data.page)
    $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + ID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})
