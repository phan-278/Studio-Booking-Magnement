/* =====================================================
   USER-API.JS — Gọi API profile, đổi mật khẩu
===================================================== */

import api from './api.js';

export async function getMyProfile() {
  return api.get('/auth/profile');
}

export async function updateProfile(data) {
  return api.put('/auth/profile', data);
}

export async function changePassword(data) {
  return api.post('/auth/change-password', data);
}

/* Admin: lấy danh sách user */
export async function getAllUsers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/admin/users${qs ? '?' + qs : ''}`);
}

export async function getUserById(id) {
  return api.get(`/admin/users/${id}`);
}

export async function deleteUser(id) {
  return api.delete(`/admin/users/${id}`);
}