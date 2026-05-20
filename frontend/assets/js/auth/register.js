/* =====================================================
   REGISTER.JS — xử lý đăng ký user
   Dựa theo logic cũ trong global.js
===================================================== */

const REGISTER_USERS_KEY = "kep_users";
const CURRENT_USER_KEY = "kep_current_user";

function showMessage(message, type = "error") {
  const msgEl = document.getElementById("registerMessage");
  if (!msgEl) {
    alert(message);
    return;
  }

  msgEl.textContent = message;
  msgEl.className = type === "success" ? "auth-success" : "auth-error";
  msgEl.style.display = "block";
}

function getUsers() {
  return JSON.parse(localStorage.getItem(REGISTER_USERS_KEY) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(REGISTER_USERS_KEY, JSON.stringify(users));
}

function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById("regName")?.value.trim();
  const phone = document.getElementById("regPhone")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value;
  const confirmPassword = document.getElementById("regConfirmPassword")?.value;

  if (!name || !phone || !email || !password) {
    showMessage("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage("Email không hợp lệ.");
    return;
  }

  if (password.length < 6) {
    showMessage("Mật khẩu phải có ít nhất 6 ký tự.");
    return;
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    showMessage("Mật khẩu xác nhận không khớp.");
    return;
  }

  const users = getUsers();

  const existedUser = users.find(user => user.email === email);

  if (existedUser) {
    showMessage("Email này đã được đăng ký.");
    return;
  }

  const newUser = {
    id: "U-" + Date.now(),
    name,
    phone,
    email,
    password: btoa(password),
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  saveCurrentUser(newUser);

  showMessage(`Đăng ký thành công. Chào mừng ${name}!`, "success");

  setTimeout(() => {
  window.parent.location.reload();
}, 800);

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});