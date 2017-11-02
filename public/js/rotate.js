$(document).ready(() => {
  $(window).on("orientationchange", (event) => {
   if (window.orientation === 90) {
     $('.hide-orientation').fadeIn()
   }

   if (window.orientation === -90) {
     $('.hide-orientation').fadeIn()
   }

   if (window.orientation === 0) {
       $('.hide-orientation').fadeOut()
   }
 })
})
