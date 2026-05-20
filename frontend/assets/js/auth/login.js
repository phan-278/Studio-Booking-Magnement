/* =====================================================
   LOGIN.JS — xử lý đăng nhập user
   Dựa theo logic cũ trong global.js
===================================================== */

const LOGIN_USERS_KEY = "kep_users";
const CURRENT_USER_KEY = "kep_current_user";

function showMessage(message, type = "error") {
  const msgEl = document.getElementById("loginMessage");
  if (!msgEl) {
    alert(message);
    return;
  }

  msgEl.textContent = message;
  msgEl.className = type === "success" ? "auth-success" : "auth-error";
  msgEl.style.display = "block";
}

function getUsers() {
  return JSON.parse(localStorage.getItem(LOGIN_USERS_KEY) || "[]");
}

function saveCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value;

  if (!email || !password) {
    showMessage("Vui lòng nhập đầy đủ email và mật khẩu.");
    return;
  }

  const users = getUsers();

  const foundUser = users.find(
    user => user.email === email && user.password === btoa(password)
  );

  if (!foundUser) {
    showMessage("Email hoặc mật khẩu không đúng.");
    return;
  }

  saveCurrentUser(foundUser);

  showMessage(`Đăng nhập thành công. Chào ${foundUser.name}!`, "success");

  setTimeout(() => {
    window.parent.location.reload();
  }, 800);
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});