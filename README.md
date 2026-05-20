📦 app-dat-lich-studio
┣ 📜 README.md                       <-- Hướng dẫn setup, chạy dự án cho Giảng viên/Team
┣ 📜 .gitignore                      <-- Chặn .env, node_modules, file rác lên Github
┃
┣ 📂 frontend                        <-- 🌐 [DEPLOY: VERCEL / NETLIFY]
┃ ┣ 📂 assets
┃ ┃ ┣ 📂 css
┃ ┃ ┃ ┣ 📜 global.css                <-- Reset CSS, biến màu, font, layout chung toàn web
┃ ┃ ┃ ┣ 📜 auth.css                  <-- CSS riêng cho Login/Register
┃ ┃ ┃ ┣ 📜 booking.css               <-- CSS cho Booking Wizard, Calendar, Price Summary
┃ ┃ ┃ ┣ 📜 dashboard.css             <-- CSS cho Dashboard User/Admin
┃ ┃ ┃ ┗ 📜 responsive.css            <-- Responsive mobile/tablet
┃ ┃ ┃
┃ ┃ ┣ 📂 js
┃ ┃ ┃ ┣ 📂 auth
┃ ┃ ┃ ┃ ┣ 📜 login.js                <-- Xử lý đăng nhập
┃ ┃ ┃ ┃ ┣ 📜 register.js             <-- Xử lý đăng ký
┃ ┃ ┃ ┃ ┗ 📜 authService.js          <-- Lưu/xóa token, user trong localStorage
┃ ┃ ┃ ┃
┃ ┃ ┃ ┣ 📂 services
┃ ┃ ┃ ┃ ┣ 📜 api.js                  <-- Cấu hình fetch/axios, base URL, token
┃ ┃ ┃ ┃ ┣ 📜 studioApi.js            <-- Gọi API lấy zone, giá, ảnh studio
┃ ┃ ┃ ┃ ┣ 📜 bookingApi.js           <-- Gọi API tạo booking, lấy lịch trống
┃ ┃ ┃ ┃ ┣ 📜 equipmentApi.js         <-- Gọi API lấy thiết bị
┃ ┃ ┃ ┃ ┗ 📜 userApi.js              <-- Gọi API profile, đổi mật khẩu
┃ ┃ ┃ ┃
┃ ┃ ┃ ┣ 📂 booking
┃ ┃ ┃ ┃ ┣ 📜 bookingWizard.js        <-- Điều khiển flow đặt lịch 3 bước
┃ ┃ ┃ ┃ ┣ 📜 calendar.js             <-- Hiển thị ngày/slot trống-bận
┃ ┃ ┃ ┃ ┣ 📜 zoneSelector.js         <-- UI chọn O Zone / Q Zone / Full House
┃ ┃ ┃ ┃ ┣ 📜 timePicker.js           <-- Chọn giờ bắt đầu - kết thúc
┃ ┃ ┃ ┃ ┣ 📜 equipmentSelector.js    <-- Chọn thiết bị + số lượng
┃ ┃ ┃ ┃ ┗ 📜 priceSummary.js         <-- Tính tổng tiền, tiền cọc 50%
┃ ┃ ┃ ┃
┃ ┃ ┃ ┣ 📂 app
┃ ┃ ┃ ┃ ┣ 📜 dashboard.js            <-- Trang tổng quan user/admin
┃ ┃ ┃ ┃ ┣ 📜 myBookings.js           <-- Lịch sử đặt lịch của user
┃ ┃ ┃ ┃ ┣ 📜 profile.js              <-- Thông tin cá nhân
┃ ┃ ┃ ┃ ┗ 📜 settings.js             <-- Cài đặt tài khoản/theme
┃ ┃ ┃ ┃
┃ ┃ ┃ ┣ 📂 admin
┃ ┃ ┃ ┃ ┣ 📜 adminDashboard.js       <-- Thống kê tổng quan
┃ ┃ ┃ ┃ ┣ 📜 adminBookings.js        <-- Quản lý duyệt/hủy booking
┃ ┃ ┃ ┃ ┣ 📜 adminStudios.js         <-- CRUD zone/phòng chụp
┃ ┃ ┃ ┃ ┣ 📜 adminEquipments.js      <-- CRUD thiết bị
┃ ┃ ┃ ┃ ┗ 📜 adminUsers.js           <-- Quản lý tài khoản khách
┃ ┃ ┃ ┃
┃ ┃ ┃ ┣ 📂 utils
┃ ┃ ┃ ┃ ┣ 📜 helpers.js              <-- Format tiền, ngày giờ, validate input
┃ ┃ ┃ ┃ ┗ 📜 constants.js            <-- API URL, status label, màu badge
┃ ┃ ┃ ┃
┃ ┃ ┃ ┗ 📜 global.js                 <-- Chạy chung: check login, render user bar, logout
┃ ┃ ┃
┃ ┃ ┣ 📂 images
┃ ┃ ┃ ┣ 📂 hero                     <-- Ảnh nền hero section
┃ ┃ ┃ ┣ 📂 studios                  <-- Ảnh O Zone, Q Zone, Full House
┃ ┃ ┃ ┣ 📂 portfolio                <-- Ảnh portfolio đã chụp tại studio
┃ ┃ ┃ ┣ 📂 equipments               <-- Ảnh thiết bị cho thuê
┃ ┃ ┃ ┗ 📂 icons                    <-- Icon UI
┃ ┃ ┃
┃ ┃ ┗ 📂 fonts                      <-- Font local nếu không dùng Google Fonts
┃ ┃
┃ ┣ 📂 KepDaSpace                   <-- Folder ảnh hiện tại của project
┃ ┃ ┗ 📂 ...                        <-- Ảnh background, studio, portfolio
┃ ┃
┃ ┣ 📂 pages
┃ ┃ ┣ 📂 auth
┃ ┃ ┃ ┣ 📜 login.html               <-- Trang/form đăng nhập
┃ ┃ ┃ ┗ 📜 register.html            <-- Trang/form đăng ký
┃ ┃ ┃
┃ ┃ ┣ 📂 app
┃ ┃ ┃ ┣ 📜 dashboard.html           <-- Trang tổng quan sau đăng nhập
┃ ┃ ┃ ┣ 📜 my-bookings.html         <-- Danh sách lịch đã đặt của user
┃ ┃ ┃ ┣ 📜 booking-detail.html      <-- Chi tiết 1 booking
┃ ┃ ┃ ┣ 📜 profile.html             <-- Thông tin cá nhân
┃ ┃ ┃ ┗ 📜 settings.html            <-- Cài đặt tài khoản
┃ ┃ ┃
┃ ┃ ┣ 📂 booking
┃ ┃ ┃ ┣ 📜 new-booking.html         <-- Form đặt lịch wizard 3 bước
┃ ┃ ┃ ┣ 📜 confirm-booking.html     <-- Xác nhận thông tin + thanh toán/cọc
┃ ┃ ┃ ┗ 📜 payment-result.html      <-- Kết quả thanh toán success/fail
┃ ┃ ┃
┃ ┃ ┣ 📂 studio
┃ ┃ ┃ ┣ 📜 studios.html             <-- Danh sách zone/phòng
┃ ┃ ┃ ┗ 📜 studio-detail.html       <-- Chi tiết 1 zone/phòng
┃ ┃ ┃
┃ ┃ ┗ 📂 admin
┃ ┃   ┣ 📜 index.html               <-- Admin dashboard
┃ ┃   ┣ 📜 bookings.html            <-- Quản lý booking
┃ ┃   ┣ 📜 studios.html             <-- Quản lý zone/phòng
┃ ┃   ┣ 📜 equipments.html          <-- Quản lý thiết bị
┃ ┃   ┣ 📜 users.html               <-- Quản lý user
┃ ┃   ┗ 📜 reports.html             <-- Báo cáo doanh thu
┃ ┃
┃ ┣ 📜 index.html                   <-- Landing page: Hero, About, Zone, Portfolio, CTA
┃ ┣ 📜 package.json                 <-- Nếu dùng Vite/Tailwind/Lib frontend
┃ ┗ 📜 vite.config.js               <-- Optional nếu dùng Vite
┃
┣ 📂 backend                        <-- ⚙️ [DEPLOY: RENDER / RAILWAY]
┃ ┣ 📂 src
┃ ┃ ┣ 📂 config
┃ ┃ ┃ ┣ 📜 db.js                    <-- Kết nối MongoDB Atlas
┃ ┃ ┃ ┗ 📜 env.js                   <-- Kiểm tra biến môi trường
┃ ┃ ┃
┃ ┃ ┣ 📂 models
┃ ┃ ┃ ┣ 📜 User.js                  <-- Schema user: name, email, phone, password, role
┃ ┃ ┃ ┣ 📜 Studio.js                <-- Schema studio/zone: O, Q, Full House, giá, ảnh
┃ ┃ ┃ ┣ 📜 Equipment.js             <-- Schema thiết bị: đèn, background, số lượng
┃ ┃ ┃ ┣ 📜 Booking.js               <-- Schema booking: user, zone, time, status, total
┃ ┃ ┃ ┗ 📜 Payment.js               <-- Schema payment: booking, amount, method, status
┃ ┃ ┃
┃ ┃ ┣ 📂 controllers
┃ ┃ ┃ ┣ 📜 authController.js        <-- Register, login, profile
┃ ┃ ┃ ┣ 📜 studioController.js      <-- Lấy danh sách zone, chi tiết zone
┃ ┃ ┃ ┣ 📜 bookingController.js     <-- Tạo booking, xem booking, hủy booking
┃ ┃ ┃ ┣ 📜 equipmentController.js   <-- Lấy danh sách thiết bị
┃ ┃ ┃ ┣ 📜 paymentController.js     <-- Thanh toán/cọc
┃ ┃ ┃ ┗ 📜 adminController.js       <-- Thống kê, duyệt booking
┃ ┃ ┃
┃ ┃ ┣ 📂 services
┃ ┃ ┃ ┣ 📜 authService.js           <-- Hash password, tạo JWT
┃ ┃ ┃ ┣ 📜 bookingService.js        <-- Check trùng lịch, full house, tính giá
┃ ┃ ┃ ┣ 📜 paymentService.js        <-- Xử lý thanh toán/cọc
┃ ┃ ┃ ┣ 📜 equipmentService.js      <-- Check số lượng thiết bị rảnh
┃ ┃ ┃ ┗ 📜 notificationService.js   <-- Email/toast thông báo
┃ ┃ ┃
┃ ┃ ┣ 📂 routes
┃ ┃ ┃ ┣ 📜 authRoutes.js            <-- /api/v1/auth
┃ ┃ ┃ ┣ 📜 studioRoutes.js          <-- /api/v1/studios
┃ ┃ ┃ ┣ 📜 bookingRoutes.js         <-- /api/v1/bookings
┃ ┃ ┃ ┣ 📜 equipmentRoutes.js       <-- /api/v1/equipments
┃ ┃ ┃ ┣ 📜 paymentRoutes.js         <-- /api/v1/payments
┃ ┃ ┃ ┗ 📜 adminRoutes.js           <-- /api/v1/admin
┃ ┃ ┃
┃ ┃ ┣ 📂 middleware
┃ ┃ ┃ ┣ 📜 authMiddleware.js        <-- Kiểm tra JWT
┃ ┃ ┃ ┣ 📜 roleMiddleware.js        <-- Chặn route admin nếu không phải admin
┃ ┃ ┃ ┣ 📜 errorMiddleware.js       <-- Bắt lỗi chung
┃ ┃ ┃ ┗ 📜 validateMiddleware.js    <-- Validate request body
┃ ┃ ┃
┃ ┃ ┣ 📂 utils
┃ ┃ ┃ ┣ 📜 generateToken.js         <-- Tạo JWT
┃ ┃ ┃ ┣ 📜 generateBookingCode.js   <-- Tạo mã booking BK-...
┃ ┃ ┃ ┣ 📜 calculatePrice.js        <-- Tính giá studio + thiết bị
┃ ┃ ┃ ┣ 📜 dateUtils.js             <-- Xử lý ngày giờ, timezone
┃ ┃ ┃ ┗ 📜 response.js              <-- Format response JSON
┃ ┃ ┃
┃ ┃ ┣ 📂 validations
┃ ┃ ┃ ┣ 📜 authValidation.js        <-- Validate login/register
┃ ┃ ┃ ┣ 📜 bookingValidation.js     <-- Validate dữ liệu đặt lịch
┃ ┃ ┃ ┗ 📜 studioValidation.js      <-- Validate dữ liệu zone/phòng
┃ ┃ ┃
┃ ┃ ┗ 📜 server.js                  <-- Khởi tạo Express, gắn route, chạy server
┃ ┃
┃ ┣ 📜 package.json                 <-- Express, Mongoose, JWT, bcrypt, dotenv...
┃ ┣ 📜 package-lock.json
┃ ┣ 📜 .env                         <-- PORT, MONGO_URI, JWT_SECRET
┃ ┗ 📜 .env.example                 <-- Mẫu biến môi trường để team setup
┃
┣ 📂 database                       <-- 🗄️ [TÀI LIỆU DATABASE / SEED]
┃ ┣ 📜 erd.png                      <-- Sơ đồ ERD users-studios-bookings-payments
┃ ┣ 📜 schema.md                    <-- Mô tả collection MongoDB
┃ ┣ 📜 seedStudios.js               <-- Tạo dữ liệu O Zone, Q Zone, Full House
┃ ┣ 📜 seedEquipments.js            <-- Tạo dữ liệu thiết bị mẫu
┃ ┗ 📜 sampleData.json              <-- Mock data để test frontend
┃
┣ 📂 docs                           <-- 📚 [TÀI LIỆU ĐỒ ÁN]
┃ ┣ 📜 PRD.md                       <-- Product Requirement Document
┃ ┣ 📜 API_SPEC.md                  <-- API contract FE-BE
┃ ┣ 📜 FRONTEND_FLOW.md             <-- Flow UI: login, booking, my-bookings
┃ ┣ 📜 BACKEND_FLOW.md              <-- Flow backend: auth, booking, payment
┃ ┣ 📜 UI_WIREFRAME.md              <-- Ghi chú layout/wireframe
┃ ┗ 📜 DEPLOYMENT.md                <-- Hướng dẫn deploy
┃
┗ 📂 tests                          <-- 🧪 [TEST]
  ┣ 📂 frontend
  ┃ ┗ 📜 booking-ui.test.js          <-- Test flow UI booking
  ┣ 📂 backend
  ┃ ┗ 📜 auth-api.test.js            <-- Test API auth
  ┗ 📜 checklist.md                  <-- Checklist test trước khi nộp/bảo vệ
