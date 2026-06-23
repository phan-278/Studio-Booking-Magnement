/* ================================================================
   BOOKING GATE — assets/js/booking-gate.js
   Tách từ <script> inline trong index.html
   Xử lý: auth gate modal, login/register form, booking CTA
================================================================ */

function handleBookingCTA() {
  const user = localStorage.getItem('kep_user');
  if (user) {
    window.location.href = './features/booking/new-booking.html';
  } else {
    document.getElementById('authGateOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeAuthGate(e) {
  if (e && e.target !== document.getElementById('authGateOverlay')) return;
  document.getElementById('authGateOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function switchGateTab(tab, btn) {
  document.querySelectorAll('.agt-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.agt-form').forEach(f => f.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('gateForm' + (tab === 'login' ? 'Login' : 'Register')).classList.add('active');
}

function doGateLogin() {
  const email = document.getElementById('gateEmail').value.trim();
  const pw    = document.getElementById('gatePw').value;
  const msg   = document.getElementById('gateMsgLogin');

  msg.style.display = 'none';

  if (!email || !pw) {
    msg.textContent    = 'Vui lòng nhập đầy đủ email và mật khẩu.';
    msg.style.display  = 'block';
    return;
  }

  const users = JSON.parse(localStorage.getItem('kep_users') || '[]');
  const found = users.find(u => u.email === email && u.pw === pw);

  if (!found) {
    msg.textContent   = 'Email hoặc mật khẩu không đúng.';
    msg.style.display = 'block';
    return;
  }

  localStorage.setItem('kep_user', JSON.stringify(found));
  document.getElementById('authGateOverlay').classList.remove('open');
  document.body.style.overflow = '';
  window.location.href = './features/booking/new-booking.html';
}

function doGateRegister() {
  const lastName  = document.getElementById('regLastName').value.trim();
  const firstName = document.getElementById('regFirstName').value.trim();
  const email     = document.getElementById('regEmail').value.trim();
  const phone     = document.getElementById('regPhone').value.trim();
  const pw        = document.getElementById('regPw').value;
  const msg       = document.getElementById('gateMsgRegister');

  msg.style.display = 'none';

  if (!lastName || !firstName || !email || !phone || !pw) {
    msg.textContent   = 'Vui lòng điền đầy đủ thông tin.';
    msg.style.display = 'block';
    return;
  }

  if (pw.length < 8) {
    msg.textContent   = 'Mật khẩu tối thiểu 8 ký tự.';
    msg.style.display = 'block';
    return;
  }

  const users = JSON.parse(localStorage.getItem('kep_users') || '[]');
  if (users.find(u => u.email === email)) {
    msg.textContent   = 'Email này đã được đăng kí.';
    msg.style.display = 'block';
    return;
  }

  const newUser = {
    id: 'u_' + Date.now(),
    lastName, firstName,
    name: firstName + ' ' + lastName,
    email, phone, pw,
    dob: '', createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('kep_users', JSON.stringify(users));
  localStorage.setItem('kep_user', JSON.stringify(newUser));

  document.getElementById('authGateOverlay').classList.remove('open');
  document.body.style.overflow = '';
  window.location.href = './features/booking/new-booking.html';
}

// Expose to global scope (dùng từ onclick trong HTML)
window.handleBookingCTA = handleBookingCTA;
window.closeAuthGate    = closeAuthGate;
window.switchGateTab    = switchGateTab;
window.doGateLogin      = doGateLogin;
window.doGateRegister   = doGateRegister;