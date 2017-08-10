$(document).ready(() => {

  // find org name from URL
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // socket connection
  var socket = io.connect()

  // UI & INTERACTIONS
  $('.showGroups').click(() => {
    socket.emit('getList', {org: org})
    $('.groups').fadeIn()
    $('.todays-msgs').fadeOut()
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
  })

  $('.new .create').click(() => {
    var arr = []
    for (var i = 0; i < $('.names').children().length; i++) {
      if ($($('.names').children()[i]).hasClass('selected')) {
        arr.push($($('.names').children()[i]).data('fbid'))
      }
    }
    socket.emit('createGroup', {groupMembers: arr, groupName: $('.groupName').val(), org: org})
    socket.emit('getList', {org: org})
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
  })

  $('.new .cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
  })


  $('.groups .header span:last-of-type').click(() => {
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })

  })

  $('.submenu').click(() => {
    $('footer').toggleClass('sub')
    $('.submenu').toggleClass('inactive')
  })

  $('.new').click((event) => {
    $(event.target).parent().toggleClass('selected')
  })

  socket.on('addUser', (data) => {
    $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<p>" + data.data[i].groupName + "</p>")
    }
  })

})
