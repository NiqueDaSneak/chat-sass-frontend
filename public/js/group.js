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
    $(this).scrollTop(0)
  })

  $('.list .addGroup').click(() => {
    socket.emit('requestMembers', {data: org})
    $('.list').toggleClass('hide')
    $('.new').toggleClass('hide')
    $(this).scrollTop(0)
  })

  $('.create').click(() => {
    if (!$('.groupName').val()) {
      console.log('empty')
      $('.groupName').addClass('warning')
      $(this).scrollTop(0)
    } else {
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
      $('.groupName').removeClass('warning')
      $('.groupName').val("")
    }
  })

  $('.cancel').click(() => {
    $('.new').toggleClass('hide')
    $('.list').toggleClass('hide')
    $('.names').empty()
    $('.groupName').val("")
    $(this).scrollTop(0)
  })


  $('.groups .header span:last-of-type').click(() => {
    $(this).scrollTop(0)
    ASQ($('.groups').fadeOut())
    .then(() => {
      $('.todays-msgs').fadeIn()
      $('.new').addClass('hide')
      $('.list').removeClass('hide')
      $('.names').empty()
      $('.groupName').val("")
    })
  })

  $('.list').click('.name', (event) => {
      socket.emit('findGroup', { name: $(event.target).data('name'), organization: org })
  })

  socket.on('editGroupMembers', (data) => {
    let hidePromise = new Promise(function(resolve, reject) {
      $('.list').toggleClass('hide')
      $('.new').toggleClass('hide')
      $(this).scrollTop(0)
    })

    let addMembers = new Promise(function(resolve, reject) {
      for (var i = 0; i < data.members.length; i++) {
        for (var x = 0; x < data.group.groupMembers.length; x++) {
          console.log(data.members[i].fbID)
          console.log(data.group.groupMembers[x])
          console.log('--')
          if (data.members[i].fbID === data.group.groupMembers[x]) {
            console.log('found a match')
            $('.groupName').val(data.name)
            $('.new .names').prepend("<div class='selected' data-fbid=" + data.members[i].fbID + "><img src='" + data.members[i].photo + "' alt='profile photo'><p>" + data.members[i].fullName + "</p></div>")
          } else {
            console.log('not match')
            $('.new .names').prepend("<div data-fbid=" + data.members[i].fbID + "><img src='" + data.members[i].photo + "' alt='profile photo'><p>" + data.members[i].fullName + "</p></div>")
          }
        }
      }
    })

    hidePromise.then(() => {
      addMembers
    })

  })

  $('.list').on('click', '.deleteGroup', (event) => {
    socket.emit('deleteGroup', { groupName: $(event.target).data('groupname'), org: org })
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
      $('.list .listNames').append("<div><img class='deleteGroup' data-groupname='"+ data.data[i].groupName + "' src='/imgs/delete.svg' alt='Delete Icon'><p class='name' data-name='"+ data.data[i].groupName +"'>" + data.data[i].groupName + "</p></div>")
    }
  })

})
