const supabase = require('../config/supabase');

exports.requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Truy cập bị từ chối. Cần quyền Admin.' });
    }

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Lỗi kiểm tra phân quyền.' });
  }
};
