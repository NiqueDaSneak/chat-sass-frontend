
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

  $('.addGroup').click(() => {
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

  $('.list').on('click', 'p', (event) => {
      socket.emit('findGroup', { name: $(event.target).data('name'), organization: org })
  })

  socket.on('editGroupMembers', (data) => {
    let hidePromise = new Promise(function(resolve, reject) {
      $('.list').toggleClass('hide')
      $('.new').toggleClass('hide')
      $(this).scrollTop(0)
    })

    let addMembers = new Promise(function(resolve, reject) {
      $('.groupName').val(data.name)
      for (var i = 0; i < data.members.length; i++) {
        $('.new .names').prepend("<div data-fbid=" + data.members[i].fbID + "><img src='" + data.members[i].photo + "' alt='profile photo'><p>" + data.members[i].fullName + "</p></div>")
      }

      for (var i = 0; i < data.group.groupMembers.length; i++) {
        for (var x = 0; x < $('.names').children().length; x++) {
          console.log(data.group.groupMembers[i].fbID)
          console.log($($('.names').children()[x]).data('fbid'))
          if (data.group.groupMembers[i] === $($('.names').children()[x]).data('fbid')) {
            console.log('match')
            $($('.names').children()[x]).addClass('selected')
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
    if (data.data.createdDate) {
      let day = data.data.createdDate.split("-")[2].split('T')[0]
      let month = data.data.createdDate.split("-")[1]
      let year = data.data.createdDate.split("-")[0]
      if (moment(month + '-' + day + '-' + year ).diff(moment(), 'days') >= -12) {
        $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p><img class='new-user-icon' src='/imgs/star-icon.svg' alt='New User'></div>")
      } else {
        $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
      }
    } else {
      $('.new .names').prepend("<div data-fbid=" + data.data.fbID + "><img src='" + data.data.photo + "' alt='profile photo'><p>" + data.data.fullName + "</p></div>")
    }
  })

  socket.on('showList', (data) => {
    $('.listNames').empty()
    for (var i = 0; i < data.data.length; i++) {
      $('.list .listNames').append("<div><img class='deleteGroup' data-groupname='"+ data.data[i].groupName + "' src='/imgs/delete.svg' alt='Delete Icon'><p class='name' data-name='"+ data.data[i].groupName +"'>" + data.data[i].groupName + "</p></div>")
    }
  })
