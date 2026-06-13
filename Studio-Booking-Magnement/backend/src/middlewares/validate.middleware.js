// Middleware linh hoạt: Cho phép check lẻ hoặc check cả 3 thành phần mà không lo bị xóa mất dữ liệu
exports.validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    return res.status(400).json({
      error: 'Dữ liệu đầu vào không hợp lệ.',
      details: err.errors ? err.errors.map(e => ({ field: e.path.join('.'), message: e.message })) : err.message,
    });
  }
};
