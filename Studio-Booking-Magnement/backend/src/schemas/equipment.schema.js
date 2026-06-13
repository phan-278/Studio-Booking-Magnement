const { z } = require('zod');

const createEquipmentSchema = {
  body: z.object({
    name: z.string().min(1, 'Tên thiết bị không được để trống'),
    total_quantity: z.number().int().min(0, 'Số lượng không được âm'),
    price: z.number().min(0, 'Giá không được âm')
  })
};

const updateEquipmentSchema = {
  params: z.object({
    id: z.string().uuid('ID không hợp lệ')
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    total_quantity: z.number().int().min(0).optional(),
    price: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive']).optional()
  })
};

const equipmentIdParamSchema = {
  params: z.object({
    id: z.string().uuid('ID không hợp lệ')
  })
};

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema,
  equipmentIdParamSchema
};
