$(document).ready(() => {

  // INITIALIZERS

  // $.mobile.loadingMessage = false
  // if ($.mobile.loadingMessage) {
  //   $.mobile.loadingMessage = false
  // }

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  // var month = moment().format("MM")
  // var day = "01"
  // var year = moment().format("YYYY")
  //
  // var displayMonth = moment().format("MM")
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  // var displayDayNumber = Number(moment().format('DD'))
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  // loadActiveDay()
  // loadTodayMsgs()
  //
  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)
  //
  // set number for header-date
  $('.header-date').text(Number(displayDay))
  //
  //
  //
  // // UI & INTERACTIONS
  //
  // $('.go-to-today').click(() => {
  //   displayDayNumber = Number(moment().format('D'))
  //   $('.header-date').text(Number(displayDay))
  //   loadTodayMsgs()
  //   loadActiveDay()
  // })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {
      console.log('not a number')
    } else if ($(event.target).is('div')) {
      console.log('its a div!')
    } else {
      displayDay = Number($(event.target).text())
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      // loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  socket.emit('requestMsgs', {data: org})

  socket.on('sendMsgs', (data) => {
    msgs = data.data
    console.log(msgs)
    for (var i = 0; i < msgs.length; i++) {
      var month = msgs[i].date.split('-')[1]
      var day = msgs[i].date.split('-')[2]
      var year = msgs[i].date.split('-')[0]
      var hour = msgs[i].time.split(':')[0]
      var min = msgs[i].time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msgs[i].videoURL) {

          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msgs[i].videoURL)

          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msgs[i].videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
        }

        if (msgs[i].image) {
          console.log(msgs[i].image)
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msgs[i].image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
        }

        if (msgs[i].text) {
          console.log(msgs[i].text)
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msgs[i].text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
        }

      }
    }
    // $('.todays-msgs').empty()
    // $('.todays-msgs').append(imgAppend)
    // $('.todays-msgs').append(textAppend)
    // $('.todays-msgs').append(bothAppend)
  })

  //
  // $('.left').click(() => {
  //   console.log('works left')
  //   console.log('day: ' + displayDayNumber)
  // })
  //
  // $('.right').click(() => {
  //   console.log('works right')
  //   console.log('day: ' + displayDayNumber)
  // })
  //
  // // $('.left').click(() => {
  // //   loadTodayMsgs()
  // //   console.log(displayDayNumber)
  // //   if (displayDayNumber === 1) {
  // //     var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MM-DD").subtract('1', 'months').daysInMonth()
  // //     displayDayNumber = daysInNextMonth
  // //     displayMonth = moment(displayMonth + '-' + displayDay, "MM-DD").subtract('1', 'months').format('MM')
  // //     displayMonthLong = moment(displayMonth + '-' + displayDay, "MM-DD").format('MMM')
  // //     $('.header-month').text(displayMonthLong)
  // //     $('.header-date').text(Number(daysInNextMonth))
  // //     if (displayMonth === '01') {
  // //       displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
  // //     }
  // //     generateMonthCalendar()
  // //   } else {
  // //     displayDayNumber = displayDayNumber - 1
  // //     $('.header-date').text(Number(displayDayNumber))
  // //     loadActiveDay()
  // //   }
  // // })
  //
  // // $('.right').click(() => {
  // //   if (displayDayNumber === 30 && moment(displayMonthLong, "MMM").daysInMonth() === 30) {
  // //     if (displayMonth === '12') {
  // //       displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
  // //     }
  // //     displayMonth = moment(displayMonth + '-' + displayDay, "MM-DD").add('1', 'months').format('MM')
  // //     displayMonthLong = moment(displayMonth + '-' + displayDay, "MM-DD").format('MMM')
  // //     $('.header-month').text(displayMonthLong)
  // //     $('.header-date').text(1)
  // //     displayDayNumber = 1
  // //     generateMonthCalendar()
  // //   } else if (displayDayNumber === 31 && moment(displayMonthLong, "MMM").daysInMonth() === 31) {
  // //     if (displayMonth === '12') {
  // //       displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
  // //     }
  // //     displayMonth = moment(displayMonth + '-' + displayDay, "MM-DD").add('1', 'months').format('MM')
  // //     displayMonthLong = moment(displayMonth + '-' + displayDay, "MM-DD").format('MMM')
  // //     $('.header-month').text(displayMonthLong)
  // //     $('.header-date').text(1)
  // //     displayDayNumber = 1
  // //     generateMonthCalendar()
  // //   } else if (displayDayNumber === 28 && moment(displayMonthLong, "MMM").daysInMonth() === 28) {
  // //     displayMonth = moment(displayMonth + '-' + displayDay, "MM-DD").add('1', 'months').format('MM')
  // //     displayMonthLong = moment(displayMonth + '-' + displayDay, "MM-DD").format('MMM')
  // //     $('.header-month').text(displayMonthLong)
  // //     $('.header-date').text(1)
  // //     displayDayNumber = 1
  // //     generateMonthCalendar()
  // //   } else {
  // //     displayDayNumber = displayDayNumber + 1
  // //     $('.header-date').text(displayDayNumber)
  // //     loadActiveDay()
  // //   }
  // //   loadTodayMsgs()
  // // })
  //
  // // CALENDAR SETUP
  function generateMonthCalendar() {
    $('.first').empty()
    $('.second').empty()
    $('.third').empty()
    $('.fourth').empty()
    $('.fifth').empty()
    $('.sixth').empty()
    var firstDayOfWeek = moment(displayMonth + "01" + displayYear, "MMM-DD-YYYY").format('dd')
    var days = [
      "Su",
      "Mo",
      "Tu",
      "We",
      "Th",
      "Fr",
      "Sa"
    ]
    var months = {
      "Jan": 31,
      "Feb": moment("02" +
        "01" + displayYear, "MM-DD-YYYY").daysInMonth(),
      "Mar": 31,
      "Apr": 30,
      "May": 31,
      "Jun": 30,
      "Jul": 31,
      "Aug": 31,
      "Sep": 30,
      "Oct": 31,
      "Nov": 30,
      "Dec": 31
    }
    if (firstDayOfWeek === "Su") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 7) {
          $('.first').append("<span>" + i + "</span>")
        } else if (i > 7 && i <= 14) {
          $('.second').append("<span>" + i + "</span>")
        } else if (i > 14 && i <= 21) {
          $('.third').append("<span>" + i + "</span>")
        } else if (i > 21 && i <= 28) {
          $('.fourth').append("<span>" + i + "</span>")
        } else {
          $('.fifth').append("<span>" + i + "</span>")
        }
      }
    }
    if (firstDayOfWeek === "Mo") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i === 1) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 1) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 1) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 1) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 1) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 1) + "</span>")
        }
      }
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Tu") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 2) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 2) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 2) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 2) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 2) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 2) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "We") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 3) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 3) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 3) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 3) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 3) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 3) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Th") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 4) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 4) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 4) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 4) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 4) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 4) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.fifth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Fr") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 5) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 5) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 5) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 5) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 5) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 5) + "</span>")
        }
      }
      $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
      $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
      $('.sixth').append("<span>" + months[displayMonth] + "</span>")
    }
    if (firstDayOfWeek === "Sa") {
      for (var i = 1; i <= months[displayMonth]; i++) {
        if (i <= 6) {
          $('.first').append("<span></span>")
        } else if (i > 1 && i <= 7) {
          $('.first').append("<span>" + (i - 6) + "</span>")
        } else if (i > 6 && i <= 14) {
          $('.second').append("<span>" + (i - 6) + "</span>")
        } else if (i > 13 && i <= 21) {
          $('.third').append("<span>" + (i - 6) + "</span>")
        } else if (i > 20 && i <= 28) {
          $('.fourth').append("<span>" + (i - 6) + "</span>")
        } else {
          $('.fifth').append("<span>" + (i - 6) + "</span>")
        }
      }
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 5) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.sixth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }

    }
    loadActiveDay()
  //   loadMsgsForCal()
  }
  //
  // // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  // function loadMsgsForCal() {
  //   var msgs
  //
  //   socket.emit('requestScheduledMsg', {data: org})
  //
  //   socket.on('scheduledMsgs', (data) => {
  //     msgs = data.data
  //     for (var i = 0; i < msgs.length; i++) {
  //       var month = data.data[i].date.split('-')[0]
  //       var day = data.data[i].date.split('-')[1]
  //       var year = data.data[i].date.split('-')[2]
  //       if (month === displayMonth) {
  //         for (var x = 0; x < $('.days').children().children().length; x++) {
  //           if (Number(day) === Number($($('.days').children().children()[x]).text())) {
  //             $($('.days').children().children()[x]).addClass('msg-day')
  //           }
  //         }
  //       }
  //     }
  //   })
  // }
  //
  // // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAYNUMBER => PUT MESSAGE INFO ON SCREEN
  // function loadTodayMsgs() {
  //   var msgs
  //   var imgAppend
  //   var textAppend
  //   var bothAppend
  //
  //   socket.emit('requestMsgs', {data: org})
  //
  //   socket.on('sendMsgs', (data) => {
  //     msgs = data.data
  //     for (var i = 0; i < msgs.length; i++) {
  //       var month = data.data[i].date.split('-')[0]
  //       var day = data.data[i].date.split('-')[1]
  //       var year = data.data[i].date.split('-')[2]
  //       if (Number(day) === displayDayNumber) {
  //         if (msgs[i].assetManifest.image && msgs[i].assetManifest.text) {
  //           bothAppend = "<p class='header'>Text & Image Message</p><p>" + msgs[i].assetManifest.text + "</p><img src='" + msgs[i].assetManifest.image + "'>"
  //         } else if (msgs[i].assetManifest.image) {
  //           imgAppend = "<p class='header'>Image Message</p><img src='" + msgs[i].assetManifest.image + "'>"
  //         } else {
  //           textAppend = "<p class='header'>Text Message</p><p>" + msgs[i].assetManifest.text + "</p>"
  //         }
  //       }
  //     }
  //     $('.todays-msgs').empty()
  //     $('.todays-msgs').append(imgAppend)
  //     $('.todays-msgs').append(textAppend)
  //     $('.todays-msgs').append(bothAppend)
  //   })
  // }
  //
  // // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
  function loadActiveDay() {
    for (var i = 0; i <= $('.days').children().children().length; i++) {
      if (Number($($('.days').children().children()[i]).text()) === Number(displayDay)) {
        $($('.days').children().children()[i]).addClass('active-day')
      }
    }
    for (var i = 0; i < $('.active-day').length; i++) {
      if (Number($($('.active-day')[i]).text()) != Number(displayDay)) {
        $($('.active-day')[i]).removeClass('active-day')
      }
    }
  }

})
