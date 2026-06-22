/* ================================================================
   AUTH FRAME — assets/js/auth-frame.js
   Tách từ <script> inline cuối index.html
   Xử lý: mở/đóng iframe modal login/register
================================================================ */

function openAuthFrame(type = 'login') {
  const modal = document.getElementById('authFrameModal');
  const frame = document.getElementById('authFrame');

  if (!modal || !frame) return;

  frame.src = type === 'register'
    ? './features/auth/register.html'
    : './features/auth/login.html';

  modal.classList.add('show');
}

function closeAuthFrame() {
  const modal = document.getElementById('authFrameModal');
  const frame = document.getElementById('authFrame');

  if (!modal || !frame) return;

  modal.classList.remove('show');
  frame.src = '';
}

window.openAuthFrame  = openAuthFrame;
window.closeAuthFrame = closeAuthFrame;