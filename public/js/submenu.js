
  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  var socket = io.connect()

  socket.emit('getUsername', {data: org})

  new Clipboard('.clipboard-link')

  $('.show-more').click(() => {
    $('.submenu').toggleClass('inactive')
  })

  $('.todays-msgs').click((event) => {
    if (!$('.submenu').hasClass('inactive')) {
      $('.submenu').toggleClass('inactive')
    }
  })

  $('.clipboard-link').click(() => {
    $('.submenu div:nth-of-type(3)').css('background-color', 'green')
    setTimeout(() => {
      $('.submenu').addClass('inactive')
    }, 1000)
    setTimeout(() => {
      $('.submenu div:nth-of-type(3)').css('background-color', '#00AEEF')
    }, 1000)
  })

  $('.submenu div').click((event) => {
    switch ($(event.target).text()) {
      case 'Help':
        socket.emit('onboardUserAgain', {data: org})
        setTimeout(() => {
          $('.submenu').addClass('inactive')
        }, 1000)
        break;
      case 'Share Templates':
        $('body').append("<div class='share-templates'><img src='/imgs/white-icon.svg' alt=''><img src='/imgs/x.svg' alt='Close'><span>Use these templates to drive traffic to your Messenger profile. This are just a few ideas to help guide you. How do you reach your customer today? Use those channels to encourage customers to “Get Started”. It’s as easy as dropping a link!</span><p>Email Template #1</p><textarea name='name' rows='8' cols='80'></textarea><p>Email Template #2</p><textarea name='name' rows='8' cols='80'></textarea><p>Email Template #3</p><textarea name='name' rows='8' cols='80'></textarea><p>Email Template #4</p><textarea name='name' rows='8' cols='80'></textarea><p>Social Post Template #1</p><textarea name='name' rows='8' cols='80'></textarea><p>Social Post Template #2</p><textarea name='name' rows='8' cols='80'></textarea><p>Social Post Template #3</p><textarea name='name' rows='8' cols='80'></textarea></div>")
        $('.share-templates textarea:first-of-type').val("Subject: Connect with <company name> now on Messenger!\n\n<company name> can now be reached through FaceBook Messenger! Nothing new to download, speak with <company name> whenever, wherever.\n\nSpeak with us now at: https://m.me/" + org)
        $('.share-templates textarea:nth-of-type(2)').val("Subject: Connect with <company name> now on Messenger!\n\nDon’t check email often? Join other <company name> VIPs and message us on Facebook! We are always striving to have better ways to connect with our customers. You can now have a conversation with us wherever you may be.\n\nHave a conversation with <company name> now at: https://m.me/" + org)
        $('.share-templates textarea:nth-of-type(3)').val("Subject: Connect with <company name> now on Messenger!\n\nWe’ve made it even easier to connect with <company name>! Reach us on Facebook Messenger and get real time updates on <company name>. Come have a conversation at: https://m.me/" + org)
        $('.share-templates textarea:nth-of-type(4)').val("Subject: Connect with <company name> on Messenger! Receive X% off all holiday orders!\n\n<company name> can now be reached through FaceBook Messenger. Join other VIPs and receive X% of your holiday purchases!\n\nJust follow the link below and click “Get Started”\n\nhttps://m.me/" + org)
        $('.share-templates textarea:nth-of-type(5)').val("<company name> is now on Messenger! Start a conversation today @ https://m.me/" + org)
        $('.share-templates textarea:nth-of-type(6)').val("<company name> is now on Messenger! Start speaking with us today! First 100 users will receive an additional X% off! https://m.me/" + org)
        $('.share-templates textarea:last-of-type').val("Now it is even easier to connect with <company name>! Get Started @ https://m.me/" + org)
        setTimeout(() => {
          $('.share-templates').css('left', '0')
          $('.share-templates img:last-of-type').click(() => {
            $('.share-templates').remove()
          })
        }, 100)
        setTimeout(() => {
          $('.submenu').addClass('inactive')
        }, 1000)
        break;
      case 'Log Out':
      $(location).attr('href','/')
        console.log($(event.target).text())
        break;
      default:

    }
  })

  socket.on('addToClipboard', (data) => {
    $('.clipboard-link').attr('data-clipboard-text', $('.clipboard-link').data('clipboard-text') + data.data)
  })

  socket.on('onboardingAgain', (data) => {
    $('body').prepend("<div class='onboarding'>" +
    "<div class='onboard-welcome'><!-- <img src='/imgs/add.svg' alt=''> --><p>Welcome!</p><p>Irrigate will help you connect to your customers where they already are. Here are some of the tools you can use:</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-cal hide'><img src='/imgs/cal.svg' alt='Calendar Icon'><p>Calendar</p><p>You have quick access to the Calendar, so you can easily see past, present and future messages...</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-groups hide'><img src='/imgs/groups.svg' alt='Groups Icon'><p>Groups</p><p>Maybe your message doesn't need to go to everyone. Groups allows you make your messages more targeted, personalized and relevant.</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-add hide'><img src='/imgs/add.svg' alt='Add Icon'><p>Create</p><p>The whole point is to help tell your story! You can send any media type you like!</p><button type='button' name='button'>Next</button></div>" +
    "<div class='onboard-promote hide'><p>Let’s Promote!</p><p>...but before we can use these tools, we need to get people on board! Please alter this text if you need before you hit post.</p><textarea class='promoteText' name='name' rows='8' cols='45'>Now you can interact with us on Messenger! Follow the link for exclusive content, deals and fun stuff from us! You can sign up to use it by going to m.me/" + data.data + "</textarea><button class='promote-on-facebook' type='button' name='button'>Post To Facebook</button><button class='promote-later' type='button' name='button'>Post Later</button></div></div>" +
    "<div class='onboard-dark'></div>")
  })
