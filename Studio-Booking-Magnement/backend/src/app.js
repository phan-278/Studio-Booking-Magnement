// Ghi chú: Express 5.x (đã cài đặt trong package.json) TỰ ĐỘNG hỗ trợ xử lý lỗi bất đồng bộ (async/await)
// Do đó, chúng ta KHÔNG CẦN cài đặt và sử dụng thư viện `express-async-errors` nữa.
// Các lỗi Unhandled Promise Rejection sẽ tự động rơi vào Global Error Handler ở cuối file!

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares toàn cục
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Khai báo Routes
app.use('/api/studios', require('./routes/studio.route'));
app.use('/api/equipments', require('./routes/equipment.route'));
app.use('/api/bookings', require('./routes/booking.route'));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/reports', require('./routes/report.route'));

// Khởi chạy hệ thống Cron Jobs
const initCronJobs = require('./cron');
if (process.env.NODE_ENV !== 'test') {
  initCronJobs();
}

// Middleware xử lý lỗi tập trung cuối cùng (Global Error Handler)
// Sẽ tự động bắt được TẤT CẢ lỗi từ các hàm async trong Express 5.x
app.use((err, req, res, next) => {
  console.error('🔥 Hệ thống gặp lỗi:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Lỗi hệ thống nội bộ.',
  });
});

module.exports = app;
