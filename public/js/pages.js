$(document).ready(() => {

  var socket = io.connect()
  var ID
  socket.on('userID', (data) => {
    ID = data.id
    console.log(ID)
  })
  socket.emit('requestPages')

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?pageid=" + data.page.id + "&userid=" + ID + "'>" + data.page.name + "</a>")
  })

})
