const { z } = require('zod');

const equipmentItemSchema = z.object({
  equipment_id: z.string().uuid('ID thiết bị không hợp lệ'),
  quantity: z.number().int().min(1, 'Số lượng phải lớn hơn 0')
});

const createBookingSchema = {
  body: z.object({
    studio_id: z.string().uuid('ID phòng không hợp lệ'),
    start_time: z.string().datetime({ message: 'Thời gian bắt đầu không hợp lệ (chuẩn ISO)' }),
    end_time: z.string().datetime({ message: 'Thời gian kết thúc không hợp lệ (chuẩn ISO)' }),
    equipments: z.array(equipmentItemSchema).optional()
  }).refine(data => new Date(data.start_time) < new Date(data.end_time), {
    message: 'Thời gian bắt đầu phải trước thời gian kết thúc',
    path: ['start_time']
  }).refine(data => new Date(data.start_time) > new Date(), {
    message: 'Không thể đặt lịch trong quá khứ',
    path: ['start_time']
  })
};

const bookingIdParamSchema = {
  params: z.object({
    id: z.string().uuid('ID booking không hợp lệ')
  })
};

const cancelBookingSchema = {
  params: z.object({
    id: z.string().uuid('ID booking không hợp lệ')
  }),
  body: z.object({
    reason: z.string().optional()
  })
};

module.exports = {
  createBookingSchema,
  bookingIdParamSchema,
  cancelBookingSchema
};
