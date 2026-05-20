/* =====================================================
   STUDIO-API.JS — Gọi API zone/phòng chụp
===================================================== */

import api from './api.js';

/* ── Lấy danh sách tất cả studio/zone ── */
export async function getStudios() {
  return api.get('/studios');
}

/* ── Lấy chi tiết 1 zone ── */
export async function getStudioById(id) {
  return api.get(`/studios/${id}`);
}

/* ── Admin: Tạo zone mới ── */
export async function createStudio(data) {
  return api.post('/studios', data);
}

/* ── Admin: Cập nhật zone ── */
export async function updateStudio(id, data) {
  return api.put(`/studios/${id}`, data);
}

/* ── Admin: Xóa zone ── */
export async function deleteStudio(id) {
  return api.delete(`/studios/${id}`);
}