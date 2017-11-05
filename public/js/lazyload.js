$(document).ready(() => {

  window.addEventListener('scroll', _.throttle(() => {
    if ($('.lazyload')) {
      $('.lazyload').each((index) => {
        if ($($('.lazyload')[index]).isOnScreen()) {
          $($('.lazyload')[index]).attr('src', $($('.lazyload')[index]).data('src')).removeClass('lazyload')
        }
      })
    }
  }, 1000))


  // is visible logic
  $.fn.isOnScreen = function() {
    var win = $(window)
    var viewport = {
      top: win.scrollTop(),
      left: win.scrollLeft()
    }
    viewport.right = viewport.left + win.width()
    viewport.bottom = viewport.top + win.height()
    var bounds = this.offset()
    bounds.right = bounds.left + this.outerWidth()
    bounds.bottom = bounds.top + this.outerHeight()
    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
  }


})
