/* ================================================================
   AUTH FRAME — assets/js/auth-frame.js
   Tách từ <script> inline cuối index.html
   Xử lý: mở/đóng iframe modal login/register
================================================================ */

function openAuthFrame(type = 'login') {
  const modal = document.getElementById('authFrameModal');
  const frame = document.getElementById('authFrame');

  if (!modal || !frame) return;

  const url = type === 'register' 
    ? './features/auth/html/register.html' 
    : './features/auth/html/login.html';
  frame.src = url;

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