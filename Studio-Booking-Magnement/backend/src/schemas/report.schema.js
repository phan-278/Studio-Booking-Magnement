const { z } = require('zod');

exports.monthlyReportQuerySchema = {
  query: z.object({
    year: z.string().regex(/^\d{4}$/, 'Năm phải là 4 chữ số'),
    month: z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Tháng phải từ 1 đến 12')
  })
};

exports.monthlyReportParamsSchema = {
  params: z.object({
    year: z.string().regex(/^\d{4}$/, 'Năm phải là 4 chữ số'),
    month: z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Tháng phải từ 1 đến 12')
  })
};
