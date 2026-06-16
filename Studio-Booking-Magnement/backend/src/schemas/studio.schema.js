const { z } = require('zod');

const createStudioSchema = {
  body: z.object({
    name: z.string().min(1, 'Tên studio không được để trống'),
    code: z.enum(['O', 'C', 'FULL'], {
      errorMap: () => ({ message: 'Code phải là O, C hoặc FULL' })
    }),
    type: z.enum(['zone', 'full'], {
      errorMap: () => ({ message: 'Type phải là zone hoặc full' })
    }),
    price_per_hour: z.number().min(0, 'Giá không được âm'),
    capacity: z.number().int().min(1, 'Sức chứa phải lớn hơn 0').optional(),
    description: z.string().optional(),
    images: z.any().optional(),
  })
};

const updateStudioSchema = {
  params: z.object({
    id: z.string().uuid('ID không hợp lệ')
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.enum(['O', 'C', 'FULL']).optional(),
    type: z.enum(['zone', 'full']).optional(),
    price_per_hour: z.number().min(0).optional(),
    capacity: z.number().int().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
};

const studioIdParamSchema = {
  params: z.object({
    id: z.string().uuid('ID không hợp lệ')
  })
};

module.exports = {
  createStudioSchema,
  updateStudioSchema,
  studioIdParamSchema
};
