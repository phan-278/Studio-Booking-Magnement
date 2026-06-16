const supabase = require('../config/supabase');

class AuthController {
  async register(req, res, next) {
    try {
      const { email, password, full_name } = req.body;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name
          }
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message, code: 'REGISTER_FAILED' });
      }

      res.status(201).json({ message: 'Đăng ký thành công', user: data.user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác', code: 'LOGIN_FAILED' });
      }

      res.json({
        message: 'Đăng nhập thành công',
        access_token: data.session.access_token,
        user: data.user
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = req.user; // Đã được gán từ authMiddleware

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        return res.status(404).json({ error: 'Không tìm thấy profile', code: 'PROFILE_NOT_FOUND' });
      }

      res.json(profile);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
