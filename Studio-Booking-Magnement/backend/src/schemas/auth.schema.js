const { z } = require('zod');

const registerSchema = {
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    full_name: z.string().min(1, 'Họ tên không được để trống')
  })
};

const loginSchema = {
  body: z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Mật khẩu không được để trống')
  })
};

module.exports = {
  registerSchema,
  loginSchema
};
