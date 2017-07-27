$(document).ready(() => {

  var socket = io.connect()
  var ID
  socket.on('userID', (data) => {
    ID = data.id
    console.log(ID)
  })
  socket.emit('requestPages')

  socket.on('addPages', (data) => {
    $('.pageList').append("<a href='/save-page?pageid=" + data.page.id + "&userid=" + ID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  })

})
