const equipmentService = require('../services/equipment.service');
const supabase = require('../config/supabase');

exports.getEquipments = async (req, res) => {
  const equipments = await equipmentService.getEquipments(req.query.start_time, req.query.end_time);
  res.json(equipments);
};

// --- Admin APIs ---

exports.createEquipment = async (req, res) => {
  const { data, error } = await supabase.from('equipments').insert([req.body]).select().single();
  if (error) throw error;
  res.status(201).json(data);
};

exports.updateEquipment = async (req, res) => {
  const { data, error } = await supabase.from('equipments').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
};

exports.deleteEquipment = async (req, res) => {
  const { error } = await supabase.from('equipments').update({ status: 'inactive' }).eq('id', req.params.id);
  if (error) throw error;
  res.json({ message: 'Đã ẩn Thiết bị thành công.' });
};
