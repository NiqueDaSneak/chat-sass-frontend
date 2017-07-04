"use strict"

$(document).ready(() => {

  // SOCKET CONNECTION
  var socket = io.connect()
  var manifest = {}

  // UI
  $('.add-new').click(() => {
    $('.chat-ui').toggleClass('live-chat')
    setTimeout(() => {
      $('.input1').addClass('active')
      // ANIMATE INPUT1
    }, 2500)
    setTimeout(() => {
      $('.send1').addClass('active')
      // ANIMATE SEND1
    }, 4000)
    var moreAssets = false
    socket.emit('sendData', {query: 'introMessage'})

    $('.send1').click(() => {
      manifest.type = $('.input1').val().toLowerCase()
      if ($('.input1').val().toLowerCase() === 'both') {
        moreAssets = true
      }
      socket.emit('sendData', {query: 'dateMessage'})
      // $('.input1').val("")
      $('.input1').removeClass('active')
      $('.send1').removeClass('active')
      setTimeout(() => {
        $('.input2').addClass('active')
        $('.send2').addClass('active')
      }, 1000)
      console.log(manifest)
    })

    $('.send2').click(() => {
      manifest.date = $('.input2').val().toLowerCase()
      $('.input2').removeClass('active')
      $('.send2').removeClass('active')
      // $('.input2').val("")
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
          if (manifest.type === 'image') {
            socket.emit('sendData', {query: 'assetMessageImage'})
            $('.file-upload').addClass('active')
          }
          if (manifest.type === 'text') {
            socket.emit('sendData', {query: 'assetMessageText'})
            $('.input3').addClass('active')
          }
          $('.send3').addClass('active')
        }, 1000)
      }
      console.log(manifest)
    })

    $('.send3').click(() => {
      if (manifest.type === 'both') {
        manifest.assets = {
        }
        if ($('input.both').val() === "text") {
          // $('input.both').val("")
          $('input.both').removeClass('active')
          $('img.both').removeClass('active')
          setTimeout(() => {
            $('.input4').addClass('active')
            $('.send4').addClass('active')
          }, 500)

          ASQ(socket.emit('sendData', {query: 'assetMessageText'}))
          .then(
            $('.send4').click(() => {
              console.log($('.input4').val())
              manifest.assets.text = $('.input4').val()
              socket.emit('sendData', {query: 'assetMessageImage'})
              $('.input4').removeClass('active')
              $('.send4').removeClass('active')
              $('.send5').addClass('active')
              $('.file-upload').addClass('active')
              console.log(manifest)
            })
          )
          .then(
            $('.send5').click(() => {
              manifest.assets.image = $('.file-upload').val()
              socket.emit('sendData', {query: 'successMsg'})
              $('.send5').removeClass('active')
              $('.file-upload').removeClass('active')
              setTimeout(() => {
                $.post("/message", {manifest})
                $('.chat-ui').toggleClass('live-chat')
                $('input').val("")
              }, 3500)
              console.log(manifest)
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
              console.log($('.input4').val())
              socket.emit('sendData', {query: 'assetMessageText'})
              $('.file-upload').removeClass('active')
              $('.send4').removeClass('active')
              setTimeout(() => {
                $('.input5').addClass('active')
                $('.send5').addClass('active')
              }, 500)
              console.log(manifest)
            })
          )
          .then(
            $('.send5').click(() => {
              manifest.assets.text = $('.input5').val()
              socket.emit('sendData', {query: 'successMsg'})
              $('.send5').removeClass('active')
              $('.input5').removeClass('active')
              setTimeout(() => {
                $.post("/message", {manifest})
                $('.chat-ui').toggleClass('live-chat')
                $('input').val("")
              }, 3500)
              console.log(manifest)
            })
          )
        }
      } else {
        if (manifest.type === 'text') {
          manifest.assets = {
            text: $('.input3').val()
          }
          socket.emit('sendData', {query: 'successMsg'})
          $('.input3').removeClass('active')
          $('.send3').removeClass('active')
          console.log(manifest)
          setTimeout(() => {
            $.post("/message", {manifest})
            $('.chat-ui').toggleClass('live-chat')
            $('input').val("")
          }, 3500)

        } else {
          manifest.assets = {
            image: $('.file-upload').val()
          }
          socket.emit('sendData', {query: 'successMsg'})
          $('.file-upload').removeClass('active')
          $('.send3').removeClass('active')
          console.log(manifest)
          setTimeout(() => {
            $.post("/message", {manifest})
            $('.chat-ui').toggleClass('live-chat')
            $('input').val("")
          }, 3500)
        }
      }

    })


    // emit event for sending welcome, and asking what type of message

    // event1 : click1
      // emit message to ask for date
      // on click1 => save data in input1
      // if input1 val === "both" => (moreAssets = true)

    // event2 : click2
    // event3 : click3

    ASQ(
      socket.emit('sendData', {query: 'introMessage'})
    )
    .then(
      $('.send').click(() => {
        socket.emit('sendData', {query: 'dateMessage'})
        manifest.type = $('.chat-ui input').val().toLowerCase()
        if ($('.chat-ui input').val().toLowerCase() === 'both') {
          moreAssets = true
        }
        $('.chat-ui input').val("")
      })
  )
  // .then(
  //   $('.send').click(() => {
  //     socket.emit('sendData', {query: 'assetMessage'})
  //     manifest.date = $('.chat-ui input').val()
  //     // $('.send2').addClass('send3').removeClass('send2')
  //     $('.chat-ui input').val("")
  //   })
  // )
  .then(
    console.log(manifest)
  )
    // createMessageChat()
    //
  })

  // DATA EXCHANGE
  socket.on('botMessage', (data) => {
    $('.botMessages').empty()
    $('.botMessages').prepend("<span>" + data.content + "</span>")
  })

  // function createMessageChat() {
  //   var moreAssets = false
  //   var manifest = {}
  //
  //   var saveManifestType = function() {
  //       $('.send').click(() => {
  //         socket.emit('sendData', {query: 'dateMessage'})
  //           manifest.type = $('.chat-ui input').val().toLowerCase()
  //         if ($('.chat-ui input').val().toLowerCase() === 'both') {
  //           moreAssets = true
  //         }
  //         $('.chat-ui input').val("")
  //         // $('.send').addClass('send2').removeClass('send')
  //       })
  //   }
  //   var saveManifestDate = function() {
  //       $('.send').click(() => {
  //         socket.emit('sendData', {query: 'assetMessage'})
  //         manifest.date = $('.chat-ui input').val()
  //         // $('.send2').addClass('send3').removeClass('send2')
  //         $('.chat-ui input').val("")
  //       })
  //   }
  //   var saveTextAsset = function() {
  //       $('.send').click(() => {
  //         manifest.assets = {
  //           "text": $('.chat-ui input').val()
  //         }
  //       })
  //       console.log(manifest)
  //   }
  //   ASQ(saveManifestType())
  //   .then(saveManifestDate())
  //   .then(saveTextAsset())
  // }

})
