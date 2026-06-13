const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Không tìm thấy Token xác thực.' });
  }

  try {
    // Verify siêu tốc cục bộ
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.user = decoded; // Chứa user_id (sub)
    next();
  } catch (error) {
    // Chuẩn 401 Unauthorized theo góp ý của User
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};
