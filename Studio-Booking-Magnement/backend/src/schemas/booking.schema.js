const { z } = require('zod');

const VN_TZ = 'Asia/Ho_Chi_Minh';

const equipmentItemSchema = z.object({
  id: z.string().min(1, 'ID thiết bị không hợp lệ'),
  qty: z.number().int().min(1, 'Số lượng phải lớn hơn 0')
});

const createBookingSchema = {
  body: z.object({
    studio_id: z.string().min(1, 'ID phòng không hợp lệ'),
    start_time: z.string().datetime({ message: 'Thời gian bắt đầu không hợp lệ (chuẩn ISO)' }),
    end_time: z.string().datetime({ message: 'Thời gian kết thúc không hợp lệ (chuẩn ISO)' }),
    purposes: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 mục đích chụp.'),
    note: z.string().optional(),
    equipments: z.array(equipmentItemSchema).optional()
  }).superRefine((data, ctx) => {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);

    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thời gian kết thúc phải sau thời gian bắt đầu.',
        path: ['end_time']
      });
      return;
    }

    if (start < new Date()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Không thể đặt lịch trong quá khứ.',
        path: ['start_time']
      });
      return;
    }

    // Chốt chặn "Đặt lịch xuyên đêm" bảo vệ Advisory Lock
    const startDateVn = require('date-fns-tz').formatInTimeZone(start, VN_TZ, 'yyyy-MM-dd');
    const endDateVn = require('date-fns-tz').formatInTimeZone(end, VN_TZ, 'yyyy-MM-dd');

    if (startDateVn !== endDateVn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Không được phép đặt lịch vắt qua 2 ngày khác nhau. Vui lòng tách thành các đơn riêng biệt trong cùng ngày.',
        path: ['end_time']
      });
    }
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

const rejectPaymentSchema = {
  params: z.object({
    id: z.string().uuid('ID booking không hợp lệ')
  }),
  body: z.object({
    reason: z.string().min(1, 'Vui lòng cung cấp lý do từ chối thanh toán')
  })
};

module.exports = {
  createBookingSchema,
  bookingIdParamSchema,
  cancelBookingSchema,
  rejectPaymentSchema
};
