$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  var socket = io.connect()

  $('.quick-view').click(() => {
    $('body').prepend("<section class='quick-view-holder'><div class='quick-view-header'><img src='/imgs/x.svg' alt='Close icon'><img src='/imgs/home.svg' alt='Home Icon'><span>Quick View</span></div><div class='new-users'><span>New Users, Past 2 Weeks: </span><span></span></div><div class='next-msg-preview'><span>Next Scheduled Message: </span><span></span></div><div class='onboard-dark'></div></section>")
    $('.onboard-dark').css('opacity', '.97').css('background-color', '#150958')
    socket.emit('getMembersAndNewMsg', {
      data: org
    })
  })
  $('body').on('click', '.quick-view-header img:first-of-type', () =>{
    $('.quick-view-holder').remove()
  })

  socket.on('quickViewNextMsg', (data) => {
    if (data.data === undefined) {
      $('.next-msg-preview span:last-of-type').text('None')
    } else {
      $('.next-msg-preview span:last-of-type').text(moment(data.data.date, 'YYYY-MM-DD').format('MM/DD'))
    }

  })

  socket.on('quickViewMembers', (data) => {
    $('.new-users span:last-of-type').text(data.members.length)
  })

})
