"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)
  console.log($('.organization').val())

  // SOCKET CONNECTION
  var socket = io.connect()
  var manifest = {
    organization: org
  }
  var id

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    $('.todays-msgs').addClass('inactive')
    socket.emit('requestMembersForMessage', {data: org})
  })

  $('.msg-data .btn-holder .create').click(() => {
    $('.msg-data').submit()
    $('.loading').fadeIn()
  })

  function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader()

        reader.onload = function (e) {
            $('.previewImg').attr('src', e.target.result)
        }

        reader.readAsDataURL(input.files[0])
    }
}

$(".uploader input").change(function(){
    readURL(this);
})

  $('.chat-ui .header span:last-of-type').click(() => {
    if ($('.chat-ui').hasClass('live-chat')) {
      $('.chat-ui').toggleClass('live-chat')
      $('.msgGroupList').empty()
      $('.chat-ui input').val('')
      $('.todays-msgs').removeClass('inactive')
    } else {
      $('.chat-ui').toggleClass('live-chat')
    }
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  socket.on('groups', (data) => {
    for (var i = 0; i < data.data.length; i++) {
      $('.botMessages').append("<div class='group-name'>" + data.data[i].groupName + "</div>")
    }
  })

  socket.on('showGroupsForMessage', (data) => {
    $('.msgGroupList').prepend("<div><label><input type='checkbox' name='groupNames' value='" + data.data.groupName + "'>"+ data.data.groupName + "</label></div>")
  })

})
