const studioService = require('../services/studio.service');
const supabase = require('../config/supabase');

exports.getStudios = async (req, res) => {
  // User thường chỉ thấy phòng is_available = true. Admin thấy hết.
  const isAdmin = req.user?.role === 'admin';
  let query = supabase.from('studios').select('*').order('id');
  if (!isAdmin) {
    query = query.eq('is_available', true);
  }
  const { data, error } = await query;
  if (error) throw error;
  res.json(data);
};

exports.getStudioById = async (req, res) => {
  const { data, error } = await supabase.from('studios').select('*').eq('id', req.params.id).single();
  if (error || !data) return res.status(404).json({ error: 'Không tìm thấy Studio.' });
  res.json(data);
};

exports.checkAvailability = async (req, res) => {
  const isAvailable = await studioService.checkAvailability(req.params.id, req.query.start_time, req.query.end_time);
  res.json({ is_available: isAvailable });
};

// --- Admin APIs ---

exports.createStudio = async (req, res) => {
  const { data, error } = await supabase.from('studios').insert([req.body]).select().single();
  if (error) throw error;
  res.status(201).json(data);
};

exports.updateStudio = async (req, res) => {
  const { data, error } = await supabase.from('studios').update(req.body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json(data);
};

exports.deleteStudio = async (req, res) => {
  const { error } = await supabase.from('studios').update({ is_available: false }).eq('id', req.params.id);
  if (error) throw error;
  res.json({ message: 'Đã ẩn Studio thành công.' });
};
