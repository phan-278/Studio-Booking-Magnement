/* =====================================================
   AUTH-SERVICE.JS — Quản lý auth state
   Lưu/xóa token, current user trong localStorage
===================================================== */

const USERS_KEY       = 'kep_users';
const CURRENT_USER_KEY = 'kep_current_user';

/* ── Lấy user hiện tại ── */
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
  } catch {
    return null;
  }
}

/* ── Lưu user sau login/register ── */
export function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('kep:auth-change', { detail: { user } }));
}

/* ── Xóa user khi logout ── */
export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.dispatchEvent(new CustomEvent('kep:auth-change', { detail: { user: null } }));
}

/* ── Kiểm tra đã đăng nhập ── */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/* ── Kiểm tra quyền admin ── */
export function isAdmin() {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

/* ── Token ── */
export function getToken() {
  return getCurrentUser()?.token || null;
}

/* ── LOCAL STORAGE AUTH (demo khi chưa có backend) ── */

export function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveLocalUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function localLogin(email, password) {
  const users = getLocalUsers();
  const user = users.find(u => u.email === email && u.password === btoa(password));
  if (!user) throw new Error('Email hoặc mật khẩu không đúng.');
  setCurrentUser(user);
  return user;
}

export function localRegister({ name, phone, email, password }) {
  const users = getLocalUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('Email này đã được đăng ký.');
  }
  const newUser = {
    id: 'U-' + Date.now(),
    name,
    phone,
    email,
    password: btoa(password),
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveLocalUsers(users);
  setCurrentUser(newUser);
  return newUser;
}

export function localLogout() {
  clearCurrentUser();
}

/* ── Redirect guards ── */

/** Nếu chưa đăng nhập → redirect login */
export function requireAuth(redirectTo = '/pages/auth/login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

/** Nếu đã đăng nhập → redirect dashboard */
export function redirectIfLoggedIn(redirectTo = '/pages/app/dashboard.html') {
  if (isLoggedIn()) {
    window.location.href = redirectTo;
    return true;
  }
  return false;
}

/** Nếu không phải admin → redirect */
export function requireAdmin(redirectTo = '/pages/app/dashboard.html') {
  if (!isAdmin()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}