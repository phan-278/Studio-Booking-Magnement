/* =====================================================
   EQUIPMENT-API.JS — Gọi API thiết bị
===================================================== */

import api from './api.js';

export async function getEquipments() {
  return api.get('/equipments');
}

export async function getEquipmentById(id) {
  return api.get(`/equipments/${id}`);
}

export async function createEquipment(data) {
  return api.post('/equipments', data);
}

export async function updateEquipment(id, data) {
  return api.put(`/equipments/${id}`, data);
}

export async function deleteEquipment(id) {
  return api.delete(`/equipments/${id}`);
}