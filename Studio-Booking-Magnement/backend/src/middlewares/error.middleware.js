/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error]:', err);

  // Lỗi do Supabase trả về (thường có thuộc tính code)
  if (err.code && typeof err.code === 'string') {
    // Lỗi vi phạm constraint EXCLUDE USING gist của Postgres
    if (err.code === '23P01') {
      return res.status(409).json({
        error: 'Khung giờ này đã có người đặt, vui lòng chọn khung giờ khác.',
        code: 'SLOT_CONFLICT'
      });
    }
    // Lỗi vi phạm khóa ngoại
    if (err.code === '23503') {
      return res.status(400).json({
        error: 'Dữ liệu tham chiếu không tồn tại (Ví dụ: ID không hợp lệ).',
        code: 'FOREIGN_KEY_VIOLATION'
      });
    }
    // Lỗi vi phạm unique constraint
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Dữ liệu này đã tồn tại trong hệ thống (Trùng lặp).',
        code: 'UNIQUE_VIOLATION'
      });
    }
  }

  // Lỗi custom nghiệp vụ (Ví dụ ném lỗi với status code từ service)
  if (err.status && err.message) {
    return res.status(err.status).json({
      error: err.message,
      code: err.errorCode || 'BUSINESS_ERROR'
    });
  }

  // Lỗi hệ thống chung (Fallback)
  res.status(500).json({
    error: 'Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.',
    code: 'INTERNAL_SERVER_ERROR'
  });
};

module.exports = errorHandler;
