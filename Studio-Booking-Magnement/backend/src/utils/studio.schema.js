const { z } = require('zod');
const { formatInTimeZone } = require('date-fns-tz');
const VN_TZ = 'Asia/Ho_Chi_Minh';

// Schema dành cho Admin khi tạo Studio mới (ID bắt buộc nhập dạng TEXT: S01, C01, FULL)
exports.createStudioSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'Mã ID Studio không được để trống (Ví dụ: S01, C01).'),
    name: z.string().min(3, 'Tên Studio phải có ít nhất 3 ký tự.'),
    type: z.enum(['O', 'C', 'FULL'], { message: 'Mã loại phòng phải là O, C hoặc FULL.' }),
    price_per_hour: z.number().int().positive('Giá thuê mỗi giờ phải là số nguyên dương.'),
    description: z.string().optional(),
    images: z.array(z.string().url('Đường dẫn ảnh phải là URL hợp lệ.')).optional().default([]),
    max_capacity: z.number().int().positive().optional()
  })
});

// Kiểm tra ID trên URL Param dưới dạng Chuỗi chuẩn xác
exports.studioIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Mã ID Studio không hợp lệ.')
  })
});

// Schema kiểm tra điều kiện Check Lịch Trống
exports.checkStudioAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Mã ID Studio không được để trống.')
  }),
  query: z.object({
    start_time: z.string().datetime('start_time phải là định dạng ISO DateTime.'),
    end_time: z.string().datetime('end_time phải là định dạng ISO DateTime.')
  }).superRefine((data, ctx) => {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);

    if (start >= end) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Thời gian kết thúc phải sau thời gian bắt đầu." });
      return;
    }

    // Chốt chặn bảo vệ hiệu năng: Đồng bộ với Giai đoạn 2
    const startDateVn = formatInTimeZone(start, VN_TZ, 'yyyy-MM-dd');
    const endDateVn = formatInTimeZone(end, VN_TZ, 'yyyy-MM-dd');

    if (startDateVn !== endDateVn) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Không được phép truy vấn lịch phòng vắt qua nhiều ngày khác nhau." });
    }
  })
});
