$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var userAccessToken = pathname[pathname.length - 1]
  var userID = pathname[pathname.length - 2]

  var socket = io.connect()
  // var ID
  // socket.on('userID', (data) => {
  //   ID = data.id
  // })
  socket.emit('requestPages', {userID: userID, userAccessToken: userAccessToken})

  // socket.on('addPages', (data) => {
  //   $('.pageList').append("<a href='/save-page?access_token=" + data.page.access_token + "&pageid=" + data.page.id + "&userid=" + userID + "&org=" + data.page.name + "'>" + data.page.name + "</a>")
  // })

  socket.on('noPages', () => {

  })

})
