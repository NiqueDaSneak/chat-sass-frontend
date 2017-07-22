"use strict"

$(document).ready(() => {

  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  $('.organization').val(org)

  // SOCKET CONNECTION
  var socket = io.connect()
  var manifest = {
    organization: org
  }
  var id
  // socket.emit('requestID', {data: org})
  // socket.on('sendID', (data) => {
  //   id = data.data
  //   $('.id').val(id)
  //   console.log(id)
  // })

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    setTimeout(() => {
      $('.input1').addClass('active')
      // ANIMATE INPUT1
    }, 1500)
    setTimeout(() => {
      $('.send1').addClass('active')
      // ANIMATE SEND1
    }, 2800)
    var moreAssets = false
    socket.emit('sendData', {query: 'introMessage'})

    $('.send1').click(() => {
      $('.organization').val(org)
      console.log($('.input1').val())
      manifest.type = $('.input1').val().toLowerCase()
      if ($('.input1').val().toLowerCase() === 'both') {
        moreAssets = true
      }
      socket.emit('sendData', {query: 'timeMsg'})
      $('.input1').removeClass('active')
      $('.send1').removeClass('active')
      setTimeout(() => {
        $('.input6').addClass('active')
        $('.send6').addClass('active')
      }, 500)
    })

    $('.send6').click(() => {
      console.log($('.input6').val())
      socket.emit('sendData', {query: 'dateMessage'})
      $('.input6').removeClass('active')
      $('.send6').removeClass('active')
      setTimeout(() => {
        $('.input2').addClass('active')
        $('.send2').addClass('active')
      }, 500)

    })

    $('.send2').click(() => {
      manifest.date = $('.input2').val()
      console.log($('.input2').val())
      $('.input2').removeClass('active')
      $('.send2').removeClass('active')
      if (moreAssets === true) {
        socket.emit('sendData', {query: 'bothMessage'})
        $('.input3').addClass('both')
        $('.send3').addClass('both')
        setTimeout(() => {
          $('input.both').addClass('active')
          $('img.both').addClass('active')
        }, 500)
      } else {
        setTimeout(() => {
          if (manifest.type.toLowerCase() === 'image') {
            socket.emit('sendData', {query: 'assetMessageImage'})
            $('.file-upload').addClass('active')
            console.log('give me that image!')
          }
          if (manifest.type.toLowerCase() === 'text') {
            socket.emit('sendData', {query: 'assetMessageText'})
            $('.input5').addClass('active')
          }
          $('.send3').addClass('active')
        }, 1000)
      }
    })

    $('.send3').click(() => {
      if (manifest.type === 'both') {
        manifest.assets = {
        }
        if ($('input.both').val().toLowerCase() === "text") {
          $('input.both').removeClass('active')
          $('img.both').removeClass('active')
          setTimeout(() => {
            $('.input5').addClass('active')
            $('.send4').addClass('active')
          }, 500)

          ASQ(socket.emit('sendData', {query: 'assetMessageText'}))
          .then(
            $('.send4').click(() => {
              manifest.assets.text = $('.input4').val()
              socket.emit('sendData', {query: 'assetMessageImage'})
              $('.input5').removeClass('active')
              $('.send4').removeClass('active')
              setTimeout(() => {
                $('.send5').addClass('active')
                $('.file-upload').addClass('active')
              }, 500)
            })
          )
          .then(
            $('.send5').click(() => {
              manifest.assets.image = $('.file-upload').val()
              socket.emit('sendData', {query: 'successMsg'})
              $('.send5').removeClass('active')
              $('.file-upload').removeClass('active')
              setTimeout(() => {
                $('.chat-ui').toggleClass('live-chat')
                $('input').val("")
              }, 1800)
              $('.msg-data').submit()
              console.log('submitting form!!!')
            })
          )
        } else {
          $('input.both').removeClass('active')
          $('img.both').removeClass('active')
          setTimeout(() => {
            $('.file-upload').addClass('active')
            $('.send4').addClass('active')
          }, 500)

          ASQ(socket.emit('sendData', {query: 'assetMessageImage'}))
          .then(
            $('.send4').click(() => {
              manifest.assets.image = $('.file-upload').val()
              socket.emit('sendData', {query: 'assetMessageText'})
              $('.file-upload').removeClass('active')
              $('.send4').removeClass('active')
              setTimeout(() => {
                $('.input5').addClass('active')
                $('.send5').addClass('active')
              }, 500)
            })
          )
          .then(
            $('.send5').click(() => {
              manifest.assets.text = $('.input5').val()
              socket.emit('sendData', {query: 'successMsg'})
              $('.send5').removeClass('active')
              $('.input5').removeClass('active')
              setTimeout(() => {
                $('.chat-ui').toggleClass('live-chat')
                $('input').val("")
              }, 1800)
              $('.msg-data').submit()
              console.log('submitting form!!!')
            })
          )
        }
      } else {
        if (manifest.type === 'text') {
          manifest.assets = {
            text: $('.input5').val()
          }
          socket.emit('sendData', {query: 'successMsg'})
          $('.input5').removeClass('active')
          $('.send3').removeClass('active')
          setTimeout(() => {
            $('.chat-ui').toggleClass('live-chat')
            $('input').val("")
          }, 1800)
          $('.msg-data').submit()
          console.log('submitting form!!!')
        } else {
          console.log($('.file-upload').val())
          manifest.assets = {
            image: $('.file-upload').val()
          }
          $('.image-name').val($('.file-upload').val().split("\\")[$('.file-upload').val().split("\\").length - 1])
          socket.emit('sendData', {query: 'successMsg'})
          $('.file-upload').removeClass('active')
          $('.send3').removeClass('active')
          setTimeout(() => {
            $('.chat-ui').toggleClass('live-chat')
            $('input').val("")
          }, 1800)
          console.log('submitting form!!!')
          $('.msg-data').submit()
        }
      }

    })
  })

  // ADD MESSAGES TO SCREEN
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

})
