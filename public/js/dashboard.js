$(document).ready(() => {

  // INITIALIZERS
  // set date for toggle ui element
  $('.month').text(moment().format("MMMM"))
  // set color for today's date
  $('.fc-today').css('color', 'darkgrey')
  // GRAB ORG NAME FOR URL TO GET DATA FROM SERVER
  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  console.log(org)

  // UI & INTERACTIONS

  $('.toggle').click(() => {
    $('footer').toggleClass('active')
    $('#toggle-calendar').toggleClass('bottom')
  })

  $('.left').click(() => {
    $('#main-calendar').fullCalendar('prev')
  })

  $('.right').click(() => {
    $('#main-calendar').fullCalendar('next')
  })

  $('.hamburger').click(() => {
    $('footer').toggleClass('active')
  })

  // CALENDAR SETUP
  $('#toggle-calendar').fullCalendar({
    header: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay'
			},
			defaultDate: '2017-05-12',
			navLinks: true, // can click day/week names to navigate views
			selectable: true,
			selectHelper: true,
			select: function(start, end) {
				var title = prompt('Event Title:');
				var eventData;
				if (title) {
					eventData = {
						title: title,
						start: start,
						end: end
					};
					$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
				}
				$('#calendar').fullCalendar('unselect');
			},
			editable: true,
			eventLimit: true, // allow "more" link when too many events
		});


$('#main-calendar').fullCalendar({
  // defaultView: 'basicDay',
  header: {
    left: '',
    center: 'title',
    right: ''
  },
  selectable: true
})

// SOCKET CONNECTION AND DATA TRANSFER
var socket = io.connect();

})
