


  # Kế hoạch triển khai Backend (Studio Booking Management System v3 - Final Refinement)

Dựa trên phản hồi của bạn, bản kế hoạch đã được tinh chỉnh sâu hơn vào các góc khuất kỹ thuật (Database Locking, Business Logic Rate Limiting, Admin SLA) để đảm bảo không sai lệch khi bước vào code thực tế.

## User Review Required

> [!IMPORTANT]
> Các vấn đề về `SELECT ... FOR UPDATE` cho Zone/Equipment, Rate Limit bằng DB Query, và logic Không Hoàn Tiền đã được cập nhật rõ ràng. Hãy xem lại cấu trúc mới này.

## Open Questions

> [!WARNING]
> Về "SLA cho Admin" (Thời gian chờ admin xác nhận sau khi khách đã gửi minh chứng thanh toán): Đã chốt **X = 120 phút** (2 tiếng). Nếu sau 2 tiếng Admin chưa xác nhận, cron job sẽ bắn notification nhắc nhở lần 2 và set `awaiting_manual_review = true`.

---

## Các giai đoạn triển khai (Phased Implementation Plan)

### Giai đoạn 1: Chuẩn hóa Schema & Nền tảng (Foundation)
*Mục tiêu: Thiết lập cấu trúc Database, bảo mật, xác thực và nhất quán dữ liệu.*

#### 1. SQL Migration & Schema Database
*   **[NEW]** `src/supabase/schema.sql`: File migration SQL chứa:
    *   Bảng `bookings` có `payment_status` (`'unpaid'`, `'deposit_paid'`, `'fully_paid'`, `'forfeited'`).
    *   Bảng `monthly_reports` chứa đầy đủ các counter: `forfeited_amount`, `forfeited_count`, `no_show_count`, `cancelled_after_deposit_count`, `cancelled_before_deposit_count`.
    *   **Constraint DB**: Vẫn thêm `EXCLUDE USING gist (studio_id WITH =, tsrange(start_time, end_time) WITH &&)` để chặn trùng lặp trực tiếp cấp độ bảng.

#### 2. Xử lý lỗi & Data Validation (Zod)
*   **[NEW]** Middleware validate dữ liệu đầu vào.
*   **[NEW]** Global Error Handler trả về chuẩn lỗi (đặc biệt các lỗi `SLOT_CONFLICT`, `EQUIPMENT_OUT_OF_STOCK`).

#### 3. Authentication & Authorization Module
*   **[NEW]** API `/register`, `/login`, `/me` (Supabase Auth) và Middleware xác thực, phân quyền.

---

### Giai đoạn 2: Lõi hệ thống đặt lịch (Core Booking Module)
*Mục tiêu: Xây dựng hoàn chỉnh luồng Booking và Thanh toán chặt chẽ, chống Race Condition.*

#### 1. Xây dựng Booking Service & Controller
*   **[NEW]** `src/services/booking.service.js`: 
    *   **Tránh Overlap O/C/Full House**: Vì `EXCLUDE USING gist` không chặn được nhóm phòng khác ID, Service phải sử dụng `SELECT ... FOR UPDATE` bao trùm cả nhóm xung đột (ví dụ đặt C Zone thì phải lock cả dòng Full House tương ứng trong khung giờ) để tránh race condition.
    *   **Tránh Overlap Thiết bị**: Sử dụng `SELECT ... FOR UPDATE` khi tính toán `available_quantity` của bảng `equipments` trước khi insert vào `booking_equipments`.
    *   **Sinh `booking_code`** dùng cho nội dung chuyển khoản.
    *   **Snapshot giá cứng**: Ghi trực tiếp giá trị số (hardcode value tính tại thời điểm đó) vào các cột `studio_price`, `equipment_price`, `total_price`, `deposit_amount`. Không sử dụng Foreign Key join động để tính tiền.
*   **[NEW]** **Rate Limiting bằng Business Logic**: Khi tạo booking, query DB đếm số lượng booking `pending_payment` của `req.user.id`. Nếu >= 3, từ chối request. (Không dùng IP middleware).

#### 2. Xử lý luồng Thanh toán (Payment Status Flow)
*   Các API chuyển đổi trạng thái: `/payment-claim`, `/confirm-payment`, `/checkin`, `/no-show`.
*   **[NEW]** Ghi log vào `payment_logs`.

---

### Giai đoạn 3: Doanh thu & Thuế (Revenue & Tax Module)
*Mục tiêu: Xây dựng hệ thống quản lý Thuế và Doanh thu cho Admin.*

*   **[NEW]** API cho bảng `tax_settings`.
*   **[NEW]** `src/services/report.service.js`: 
    *   Tính `gross_revenue` từ booking `completed`.
    *   **Tính đầy đủ tất cả các counter**: Query và update đầy đủ các trường `forfeited_amount`, `forfeited_count`, `no_show_count`, `cancelled_after_deposit_count`, `cancelled_before_deposit_count` vào `monthly_reports`.

---

### Giai đoạn 4: Cron Jobs, Hủy (No Refund) & Admin SLA
*Mục tiêu: Đảm bảo vận hành tự động, nguyên tắc KHÔNG HOÀN CỌC và đôn đốc Admin.*

*   **[NEW]** `src/cron/booking.cron.js`: 
    *   **Tự hủy**: Quét các booking quá hạn `deposit_deadline` mà `payment_proof_submitted=false` -> Chuyển sang `cancelled` (và `unpaid`).
    *   **Admin SLA**: Nếu `payment_proof_submitted=true` nhưng sau **120 phút** admin chưa `confirm_payment` -> Tự động set `awaiting_manual_review=true` và trigger Notification cảnh báo Admin.
*   **[MODIFY]** Logic Hủy (`cancel`): 
    *   *Lưu ý rõ cho Dev*: Admin hủy do lỗi studio (hỏng hóc, trùng lịch) thì hệ thống VẪN tự động chuyển về `forfeited`. Dev tuyệt đối KHÔNG tự code thêm luồng refund hay trigger hoàn tiền nào tại đây. Admin sẽ tự liên hệ chuyển khoản tay cho khách.

---

### Giai đoạn 5: Notification Module (Sử dụng Resend)
*Mục tiêu: Gửi email thông báo kịp thời cho cả User và Admin.*

*   **[NEW]** `src/services/notification.service.js`: Tích hợp Resend.
*   **[NEW]** **Admin Notification**: Bắn ngay 1 email/tin nhắn thông báo cho Admin khi có một booking mới vừa được tạo ở trạng thái `pending_payment` (giúp đảm bảo KPI xác nhận trong 15 phút).
*   Các email khác: Xác nhận đặt cọc thành công, nhắc lịch chụp, nhắc khách đóng cọc khi sắp hết `deposit_deadline`, và cảnh báo Admin SLA (quá 120 phút chưa duyệt).

---

## Verification Plan

### Automated Tests
- Test việc sử dụng `SELECT ... FOR UPDATE` khi 2 khách hàng đồng thời gọi API tạo booking cho `O Zone` và `Full House`. Phải có 1 transaction bị block và sau đó báo lỗi 409.
- Test tương tự cho số lượng thiết bị (`available_quantity`).
- Test Rate Limit (tạo 4 booking liên tiếp mà chưa thanh toán để xem booking thứ 4 có bị từ chối không).

### Manual Verification
- Chạy SQL Schema trên Supabase.
- Chạy thử Cron Job bằng cách trigger thủ công các booking quá hạn 60 phút xem Admin có nhận được email nhắc nhở duyệt tiền không.

