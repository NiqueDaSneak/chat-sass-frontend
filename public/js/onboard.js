$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var username

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button><button class='promote-later' type='button' name='button'>Post Later</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      socket.emit('promoteOnFacebook', {post: $('.promoteText').val(), org: org})
      $('.onboarding').remove()
      $('body').prepend("<img class='success-check' src='/imgs/checkmark.svg' alt='Success Check'>")
      setTimeout(() => {
        $('.success-check').fadeOut('slow')
        $('.onboard-dark').fadeOut('slow')
      }, 800)
      setTimeout(() => {
        $('.success-check').remove()
        $('.onboard-dark').remove()
      }, 1000)
      socket.emit('onboardComplete', {data: org})
    } else if ($(event.target).hasClass('promote-later')) {
      $('.onboarding').remove()
      $('.onboard-dark').remove()
      socket.emit('onboardComplete', {data: org})
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})
