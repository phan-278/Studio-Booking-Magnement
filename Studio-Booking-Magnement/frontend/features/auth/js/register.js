import { supabase } from '../../../services/supabase-config.js';

function showMessage(text, type = 'error') {
  const el = document.getElementById('registerMessage');
  if (!el) return;
  el.textContent = text;
  el.className = 'auth-msg ' + (type === 'success' ? 'success' : 'error');
  el.style.display = 'block';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleRegister(e) {
  e.preventDefault();
  const name            = document.getElementById('regName').value.trim();
  const phone           = document.getElementById('regPhone').value.trim();
  const email           = document.getElementById('regEmail').value.trim();
  const password        = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (!name || !phone || !email || !password) {
    showMessage('Vui lòng nhập đầy đủ thông tin.'); return;
  }
  if (!isValidEmail(email)) {
    showMessage('Email không hợp lệ.'); return;
  }
  if (password.length < 6) {
    showMessage('Mật khẩu phải có ít nhất 6 ký tự.'); return;
  }
  if (password !== confirmPassword) {
    showMessage('Mật khẩu xác nhận không khớp.'); return;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        phone: phone
      }
    }
  });

  if (error) {
    showMessage(error.message || 'Đăng ký thất bại.'); return;
  }

  showMessage('Đăng ký thành công! Đang chuyển hướng...', 'success');

  setTimeout(() => {
    if (window.parent !== window) {
      window.parent.location.reload();
    } else {
      window.location.href = '../../../index.html';
    }
  }, 900);
}

document.getElementById('registerForm')?.addEventListener('submit', handleRegister);