$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  var socket = io.connect()

  socket.emit('isOnboarded?', {data: org})

  socket.on('onboardUser', () => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Integer ut auctor augue. Maecenas feugiat sed enim at ultricies. Maecenas vitae lobortis neque. Duis sagittis libero sit amet venenatis gravida.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>Maecenas vitae lobortis neque. Duis sagittis libero sit amet venenatis gravida. Integer ut auctor augue. Maecenas feugiat sed enim at ultricies. </p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Duis sagittis maecenas vitae lobortis neque libero sit amet venenatis gravida. Integer ut auctor augue.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>Integer ut auctor. Duis sagittis maecenas vitae lobortis neque libero sit amet venenatis gravida.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>Integer ut auctor. Duis sagittis maecenas vitae lobortis neque libero sit amet venenatis gravida.</p><textarea name='name' rows='8' cols='45'></textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })

  $('body').on('click', '.onboarding button', (event) => {
    if ($(event.target).hasClass('promote-on-facebook')) {
      $('.onboarding').remove()
      $('.onboard-dark').remove()
    } else {
      $(event.target).parent().addClass('hide')
      $(event.target).parent().next().removeClass('hide')
    }
  })

})
