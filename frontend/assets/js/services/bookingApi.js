/* =====================================================
   BOOKING-API.JS — Gọi API booking
===================================================== */

import api from './api.js';

/* ── Lấy lịch trống theo zone + ngày ── */
export async function getAvailableSlots(studioId, date) {
  return api.get(`/bookings/available?studioId=${studioId}&date=${date}`);
}

/* ── Tạo booking mới ── */
export async function createBooking(data) {
  return api.post('/bookings', data);
}

/* ── Lấy booking của user hiện tại ── */
export async function getMyBookings() {
  return api.get('/bookings/me');
}

/* ── Lấy chi tiết 1 booking ── */
export async function getBookingById(id) {
  return api.get(`/bookings/${id}`);
}

/* ── User hủy booking ── */
export async function cancelBooking(id) {
  return api.patch(`/bookings/${id}/cancel`);
}

/* ── Admin: Lấy tất cả booking ── */
export async function getAllBookings(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/bookings${qs ? '?' + qs : ''}`);
}

/* ── Admin: Duyệt / Từ chối booking ── */
export async function updateBookingStatus(id, status) {
  return api.patch(`/bookings/${id}/status`, { status });
}