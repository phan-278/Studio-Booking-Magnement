import { supabase } from '../../services/supabase-config.js';
import { _currentUser, fetchInitialData } from '../../services/api.js';
import { openModal, closeModal, showToast } from '../../utils/helpers.js';

export function openAuthFrame(type = "login") {
  const modal = document.getElementById("authFrameModal");
  const frame = document.getElementById("authFrame");

  if (!modal || !frame) return;

  if (type === "register") {
    frame.src = "./features/auth/register.html";
  } else {
    frame.src = "./features/auth/login.html";
  }

  modal.classList.add("show");
}

export function closeAuthFrame() {
  const modal = document.getElementById("authFrameModal");
  const frame = document.getElementById("authFrame");

  if (!modal || !frame) return;

  modal.classList.remove("show");
  frame.src = "";
}

export async function doLogout() {
  await supabase.auth.signOut();
  window.location.reload();
}

window.openAuthFrame = openAuthFrame;
window.closeAuthFrame = closeAuthFrame;
window.doLogout = doLogout;
