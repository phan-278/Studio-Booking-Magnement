/* ================================================================
   BOOKING GATE — assets/js/booking-gate.js
   Xử lý: booking CTA
================================================================ */

function handleBookingCTA() {
  if (window._currentUser) {
    window.location.href = './features/booking/new-booking.html';
  } else {
    if (typeof window.openAuthFrame === 'function') {
      window.openAuthFrame('login');
    } else {
      console.warn('openAuthFrame is not defined. Please ensure auth-frame.js is loaded.');
    }
  }
}

// Expose to global scope (dùng từ onclick trong HTML)
window.handleBookingCTA = handleBookingCTA;