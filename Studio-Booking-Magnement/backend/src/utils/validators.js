const { z } = require('zod');
const { formatInTimeZone } = require('date-fns-tz');

const VN_TZ = 'Asia/Ho_Chi_Minh';

// Định nghĩa schema riêng cho BODY
const createBookingBodySchema = z.object({
  studio_id: z.string().min(1, 'Vui lòng chọn Studio.'),
  start_time: z.string().datetime({ message: 'Thời gian bắt đầu phải là chuẩn ISO String.' }),
  end_time: z.string().datetime({ message: 'Thời gian kết thúc phải là chuẩn ISO String.' }),
  purposes: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất 1 mục đích chụp.'),
  note: z.string().optional(),
  equipments: z.array(
    z.object({
      id: z.string().min(1, 'Vui lòng chọn Equipment.'),
      qty: z.number().int().positive('Số lượng thiết bị phải là số nguyên dương.')
    })
  ).optional().default([])
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

  // Chốt chặn "Đặt lịch xuyên đêm" bảo vệ Advisory Lock
  const startDateVn = formatInTimeZone(start, VN_TZ, 'yyyy-MM-dd');
  const endDateVn = formatInTimeZone(end, VN_TZ, 'yyyy-MM-dd');

  if (startDateVn !== endDateVn) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Không được phép đặt lịch vắt qua 2 ngày khác nhau. Vui lòng tách thành các đơn riêng biệt trong cùng ngày.',
      path: ['end_time']
    });
  }
});

module.exports = { createBookingBodySchema };
