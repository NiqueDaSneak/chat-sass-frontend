$(document).ready(() => {

  // INITIALIZERS

  // socket connection
  var socket = io.connect()

  // grab org name for url to get data from server
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]

  // date variables
  var displayMonth = moment().format("MMM")
  var displayDay = moment().format('DD')
  var displayYear = moment().format('YYYY')
  generateMonthCalendar()
  loadActiveDay()
  loadTodayMsgs()
  loadMsgsForCal()

  // set date for toggle ui element
  $('.header-month').text(displayMonth)
  $('.controls-month').text(displayMonth)

  // set number for header-date
  $('.header-date').text(Number(displayDay))

  // // UI & INTERACTIONS
  $('.go-to-today').click(() => {
    displayDay = moment().format('D')
    $('.header-date').text(Number(displayDay))
    loadTodayMsgs()
    loadActiveDay()
  })

  $('.toggle-calendar').click((event) => {
    if (isNaN($(event.target).text())) {
      console.log('not a number')
    } else if ($(event.target).is('div') || $(event.target).is('img') ) {
      console.log('its a div or image!')
    } else {
      displayDay = $(event.target).text()
      $('.header-date').text(Number($(event.target).text()))
      loadActiveDay()
      loadTodayMsgs()
    }
  })

  $('.toggle').click(() => {
    $('.toggle .open').toggleClass('hide')
    $('.toggle .close').toggleClass('hide')
    $('footer').toggleClass('active')
    ASQ($('.todays-msgs').toggleClass('inactive'))
    .then($('.toggle-calendar').toggleClass('active'))
  })

  $('.monthLeft').click(() => {
    if (displayMonth === 'Jan') {
      displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.monthRight').click(() => {
    if (displayMonth === 'Dec') {
      displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
    }
    displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
    $('.header-month').text(displayMonth)
    $('.controls-month').text(displayMonth)
    generateMonthCalendar()
    loadMsgsForCal()
  })

  $('.dayLeft').click(() => {
     console.log('displayDay: ' + displayDay)
    if (displayDay === '1') {
       var daysInNextMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').daysInMonth()
       displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").subtract('1', 'months').format('MMM')
       displayDay = daysInNextMonth.toString()
       $('.header-month').text(displayMonth)
       $('.controls-month').text(displayMonth)
       $('.header-date').text(Number(displayDay))
       if (displayMonth === 'Jan') {
         displayYear = moment(displayYear, "YYYY").subtract('1', 'years').format('YYYY')
       }
       generateMonthCalendar()
       loadMsgsForCal()
     } else {
       var yesterday = Number(displayDay) - 1
       displayDay = yesterday.toString()
       console.log(displayDay)
       $('.header-date').text(yesterday)
       loadActiveDay()
     }
     loadTodayMsgs()
  })

  $('.dayRight').click(() => {
    if (displayDay === '30' && moment(displayMonth, "MMM").daysInMonth() === 30) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '31' && moment(displayMonth, "MMM").daysInMonth() === 31) {
      if (displayMonth === 'Dec') {
        displayYear = moment(displayYear, "YYYY").add('1', 'years').format('YYYY')
      }
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else if (displayDay === '28' && moment(displayMonth, "MMM").daysInMonth() === 28) {
      displayMonth = moment(displayMonth + '-' + displayDay, "MMM-D").add('1', 'months').format('MMM')
      $('.header-month').text(displayMonth)
      $('.controls-month').text(displayMonth)
      displayDay = '1'
      $('.header-date').text(displayDay)
      generateMonthCalendar()
      loadMsgsForCal()
    } else {
      var tomorrow = Number(displayDay) + 1
      displayDay = tomorrow.toString()
      $('.header-date').text(displayDay)
      loadActiveDay()
    }
    loadTodayMsgs()
  })

  // CALENDAR SETUP
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
      if (months[displayMonth] === 30) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.fifth').append("<span>" + months[displayMonth] + "</span>")
      }
      if (months[displayMonth] === 31) {
        $('.fifth').append("<span>" + (months[displayMonth] - 4) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 3) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 2) + "</span>")
        $('.fifth').append("<span>" + (months[displayMonth] - 1) + "</span>")
        $('.sixth').append("<span>" + months[displayMonth] + "</span>")
      }
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
    if ($('.sixth').children().length === 0) {
      $('.toggle-calendar').css('height', '50vh')
    } else {
      $('.toggle-calendar').css('height', '57vh')
    }
  }

  // FIND CREATED MSGS AND ADD A FLAG IN THE UI OVER THE DATE
  function loadMsgsForCal() {
    var msgs
    socket.emit('requestScheduledMsg', {data: org})
  }

  // LOOP THRU MESSAGES, AND SEE IF ONE HAS THE DISPLAYDAY => PUT MESSAGE INFO ON SCREEN
  function loadTodayMsgs() {
    socket.emit('requestMsgs', {data: org})
  }

  // FIGURE OUT WHAT THE CURRENT DAY IS AND HIGHLIGHT IT
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

  // SOCKET RECIEVERS
  socket.on('sendMsgs', (data) => {
    var dataArray = data.data
    $('.todays-msgs').empty()
    for (let msg of dataArray) {
      var month = msg.date.split('-')[1]
      var day = msg.date.split('-')[2]
      var year = msg.date.split('-')[0]
      var hour = msg.time.split(':')[0]
      var min = msg.time.split(':')[1]
      var fromNow = moment(month + day + year + hour + min, 'MMDDYYYYHHmm').fromNow()
      if (Number(day) === Number(displayDay)) {
        if (msg.videoURL) {
          function YouTubeGetID(url){
            url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
            return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
          }
          var videoID = YouTubeGetID(msg.videoURL)
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Video Message</div><span class='card-middle'><a target='_blank' href='" + msg.videoURL + "'><img src='https://img.youtube.com/vi/" + videoID + "/0.jpg' alt=''></a></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
        }

        if (msg.image) {
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Image Message</div><span class='card-middle'><img src='" + msg.image + "' alt=''></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
        }

        if (msg.text) {
          $('.todays-msgs').prepend("<div class='card'><div class='card-top'>Text Message</div><span class='card-middle'><p>'" + msg.text + "'</p></span><div class='card-bottom'><img src='/imgs/clock.svg' alt=''><span>" + fromNow + "</span><img src='/imgs/pen.svg' alt=''></div></div>")
        }
      }

    }
  })

  socket.on('scheduledMsgs', (data) => {
    msgs = data.data
    console.log(msgs)
    for (var i = 0; i < msgs.length; i++) {
      var month = moment(data.data[i].date.split('-')[1], "MM").format("MMM")

      var day = data.data[i].date.split('-')[2]
      var year = data.data[i].date.split('-')[0]
      console.log('month: ' + month)
      console.log('displayMonth: ' + displayMonth)
      console.log('day: ' + day)
      if (month === displayMonth) {
        for (var x = 0; x < $('.days').children().children().length; x++) {
          if (Number(day) === Number($($('.days').children().children()[x]).text())) {
            $($('.days').children().children()[x]).addClass('msg-day')
          }
        }
      }
    }
  })

})
