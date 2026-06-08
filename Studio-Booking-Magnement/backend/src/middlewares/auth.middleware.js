const supabase = require('../config/supabase');

/**
 * Middleware để xác thực JWT token của user.
 * Yêu cầu client gửi Header: Authorization: Bearer <token>
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Kiểm tra token bằng Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Gán user vào request để các controller sử dụng
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};

/**
 * Middleware để xác thực quyền Admin.
 * Bắt buộc phải đặt sau authMiddleware.
 */
const adminMiddleware = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Lấy role từ bảng profiles
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return res.status(403).json({ error: 'Forbidden: Profile not found' });
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (err) {
    console.error('Admin Middleware Error:', err);
    res.status(500).json({ error: 'Internal Server Error during authorization' });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware
};
