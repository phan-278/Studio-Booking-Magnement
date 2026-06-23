const jwt = require('jsonwebtoken');
const { verifyToken } = require('../../src/middlewares/auth.middleware');
const { requireAdmin } = require('../../src/middlewares/role.middleware');
const supabase = require('../../src/config/supabase');

jest.mock('jsonwebtoken');
jest.mock('../../src/config/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn()
}));

describe('Middlewares Test', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should return 401 if no token provided', () => {
      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Không tìm thấy Token xác thực.' });
    });

    it('should return 401 if token is invalid', () => {
      req.headers.authorization = 'Bearer invalidtoken';
      jwt.verify.mockImplementation(() => { throw new Error(); });

      verifyToken(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
    });

    it('should call next if token is valid', () => {
      req.headers.authorization = 'Bearer validtoken';
      const decoded = { sub: 'user-123' };
      jwt.verify.mockReturnValue(decoded);

      verifyToken(req, res, next);
      expect(req.user).toEqual(decoded);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should return 403 if user is not admin', async () => {
      req.user = { sub: 'user-123' };
      supabase.single.mockResolvedValue({ data: { role: 'user' }, error: null });

      await requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Truy cập bị từ chối. Cần quyền Admin.' });
    });

    it('should call next if user is admin', async () => {
      req.user = { sub: 'admin-123' };
      supabase.single.mockResolvedValue({ data: { role: 'admin' }, error: null });

      await requireAdmin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 500 if supabase error', async () => {
      req.user = { sub: 'admin-123' };
      supabase.single.mockRejectedValue(new Error('DB Error'));

      await requireAdmin(req, res, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lỗi kiểm tra phân quyền.' });
    });
  });
});
