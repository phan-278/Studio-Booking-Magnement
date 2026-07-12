import { supabase } from '../../../services/supabase-config.js';

/* ── Show message ── */
function showMessage(text, type = 'error') {
  const el = document.getElementById('loginMessage');
  if (!el) return;
  el.textContent = text;
  el.className = 'auth-msg ' + (type === 'success' ? 'success' : 'error');
  el.style.display = 'block';
}

/* ── Handle login ── */
async function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showMessage('Vui lòng nhập đầy đủ email và mật khẩu.'); return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    showMessage(error.message || 'Email hoặc mật khẩu không đúng.'); return;
  }

  let userRole = 'user';
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    if (profile) {
      userRole = profile.role;
    }
  }

  showMessage('Đăng nhập thành công!', 'success');

  setTimeout(() => {
    if (userRole === 'admin') {
      if (window.parent !== window) window.parent.location.href = '../../admin/html/dashboard.html';
      else window.location.href = '../../admin/html/dashboard.html';
    } else {
      if (window.parent !== window) window.parent.location.href = '../../../index.html';
      else window.location.href = '../../../index.html';
    }
  }, 900);
}

document.getElementById('loginForm')?.addEventListener('submit', handleLogin);