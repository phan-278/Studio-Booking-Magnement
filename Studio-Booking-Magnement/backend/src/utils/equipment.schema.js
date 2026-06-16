const { z } = require('zod');
const { formatInTimeZone } = require('date-fns-tz');

const VN_TZ = 'Asia/Ho_Chi_Minh';

exports.equipmentQuerySchema = z.object({
  query: z.object({
    start_time: z.string().datetime().optional(),
    end_time: z.string().datetime().optional()
  }).superRefine((data, ctx) => {
    // Ràng buộc bắt buộc đi kèm cặp
    if ((data.start_time && !data.end_time) || (!data.start_time && data.end_time)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cần cung cấp đồng thời cả start_time và end_time để tính toán tồn kho động."
      });
      return;
    }

    if (data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);

      if (start >= end) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Thời gian kết thúc phải sau thời gian bắt đầu."
        });
        return;
      }

      // ĐỒNG BỘ KIẾN TRÚC: Chốt chặn bảo vệ hiệu năng, cấm quét thiết bị xuyên đêm
      const startDateVn = formatInTimeZone(start, VN_TZ, 'yyyy-MM-dd');
      const endDateVn = formatInTimeZone(end, VN_TZ, 'yyyy-MM-dd');

      if (startDateVn !== endDateVn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Không được phép truy vấn dữ liệu tồn kho thiết bị vắt qua nhiều ngày."
        });
      }
    }
  })
});

// Schema Admin tạo/sửa thiết bị
exports.createEquipmentSchema = z.object({
  body: z.object({
    id: z.string().min(1, 'ID thiết bị không được để trống.'),
    name: z.string().min(3, 'Tên thiết bị phải có ít nhất 3 ký tự.'),
    category: z.string().min(1, 'Danh mục không được để trống.'),
    price_per_hour: z.number().int().min(0, 'Giá không được âm.'),
    total_quantity: z.number().int().positive('Số lượng phải lớn hơn 0.'),
    description: z.string().optional(),
    images: z.array(z.string().url('Đường dẫn ảnh phải là URL hợp lệ.')).optional().default([]),
    status: z.enum(['active', 'inactive']).optional().default('active')
  })
});

exports.equipmentIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'ID không hợp lệ.')
  })
});
