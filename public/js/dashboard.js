$(document).ready(() => {

  var pathname = window.location.pathname.split('/')
  var org = pathname[pathname.length - 1]
  console.log(org)

  var socket = io.connect();

})
