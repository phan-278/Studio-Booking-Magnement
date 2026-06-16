const supabase = require('../config/supabase');
const paymentLogService = require('./payment_log.service');

class BookingService {

  async _checkFinalizedInterceptor(booking, action) {
    const { formatInTimeZone } = require('date-fns-tz');
    const VN_TZ = 'Asia/Ho_Chi_Minh';
    let targetDates = [];

    if (booking.status === 'completed') {
      targetDates.push(booking.checked_in_at);
    } else if (booking.status === 'on_hold') {
      targetDates.push(booking.deposit_deadline);
    } else if (booking.status === 'pending_payment') {
      targetDates.push(booking.start_time);
      targetDates.push(booking.deposit_deadline);
    } else {
      targetDates.push(booking.start_time);
    }

    if (action === 'checkIn') {
      targetDates.push(new Date().toISOString());
    }

    const uniqueDates = [...new Set(targetDates.filter(Boolean))];

    for (let targetDate of uniqueDates) {
      const targetYear = parseInt(formatInTimeZone(new Date(targetDate), VN_TZ, 'yyyy'), 10);
      const targetMonth = parseInt(formatInTimeZone(new Date(targetDate), VN_TZ, 'MM'), 10);

      const { data: report } = await supabase.from('monthly_reports')
        .select('is_finalized')
        .eq('year', targetYear)
        .eq('month', targetMonth)
        .single();

      if (report && report.is_finalized) {
        throw Object.assign(new Error(`Tháng ${targetMonth}/${targetYear} đã khóa sổ kế toán. Hành động bị từ chối do vi phạm quy tắc toàn vẹn dữ liệu!`), { status: 400 });
      }
    }
  }

  /**
   * Tạo booking thông qua Stored Procedure (RPC)
   * Để đảm bảo Transaction và Advisory Locks
   */
  async createBooking(user_id, data) {
    const { studio_id, start_time, end_time, equipments } = data;

    // Gọi RPC đã được định nghĩa trong PostgreSQL
    const { data: result, error } = await supabase.rpc('create_booking_transaction', {
      p_user_id: user_id,
      p_studio_id: studio_id,
      p_start_time: start_time,
      p_end_time: end_time,
      p_equipments: equipments || []
    });

    if (error) {
      // Nhận diện lỗi từ PostgreSQL RAISE EXCEPTION
      let status = 400;
      let message = error.message;
      let code = 'CREATE_BOOKING_ERROR';

      if (error.message.includes('LIMIT_REACHED')) {
        status = 429;
        message = 'Bạn đang có quá nhiều booking chưa thanh toán (tối đa 3).';
        code = 'LIMIT_REACHED';
      } else if (error.message.includes('STUDIO_NOT_FOUND')) {
        status = 404;
        message = 'Phòng không tồn tại.';
        code = 'STUDIO_NOT_FOUND';
      } else if (error.message.includes('SLOT_CONFLICT')) {
        status = 409;
        message = 'Khung giờ này đã có người đặt, vui lòng chọn thời gian khác.';
        code = 'SLOT_CONFLICT';
      } else if (error.message.includes('EQUIPMENT_NOT_FOUND')) {
        status = 404;
        message = 'Thiết bị không tồn tại.';
        code = 'EQUIPMENT_NOT_FOUND';
      } else if (error.message.includes('EQUIPMENT_OUT_OF_STOCK')) {
        status = 409;
        message = 'Số lượng thiết bị không đủ trong khung giờ này.';
        code = 'EQUIPMENT_OUT_OF_STOCK';
      }

      const err = new Error(message);
      err.status = status;
      err.errorCode = code;
      throw err;
    }

    return result;
  }

  /**
   * Khách hàng báo đã chuyển khoản (Payment Claim)
   */
  async claimPayment(id, user_id) {
    const { data: booking } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (!booking) throw Object.assign(new Error('Booking không tồn tại'), { status: 404 });
    await this._checkFinalizedInterceptor(booking, 'claimPayment');

    // RACE CONDITION FIX: Bắt buộc kèm status = 'pending_payment' và payment_proof_submitted = false (tránh double submit)
    const { data, error } = await supabase
      .from('bookings')
      .update({ payment_proof_submitted: true, payment_claimed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user_id)
      .eq('status', 'pending_payment')
      .eq('payment_proof_submitted', false)
      .select();

    if (error) {
      const err = new Error('Lỗi truy xuất hệ thống');
      err.status = 500;
      throw err;
    }

    if (!data || data.length === 0) {
      const err = new Error('Giao dịch đã bị hệ thống tự động hủy do quá hạn, hoặc không hợp lệ.');
      err.status = 400;
      err.errorCode = 'CLAIM_FAILED_OR_EXPIRED';
      throw err;
    }

    return data[0];
  }

  /**
   * Admin xác nhận chuyển khoản
   */
  async confirmPayment(id, admin_id) {
    const { data: booking, error: fetchErr } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (!booking) throw Object.assign(new Error('Booking không tồn tại'), { status: 404 });

    await this._checkFinalizedInterceptor(booking, 'confirmPayment');

    if (booking.status !== 'pending_payment') {
      throw Object.assign(new Error('Booking không ở trạng thái pending_payment'), { status: 400 });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'deposit_paid',
        verified_by: admin_id,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    await paymentLogService.logPaymentStatus(id, booking.payment_status, 'deposit_paid', booking.deposit_amount, admin_id, 'Admin xác nhận chuyển khoản cọc');

    return data[0];
  }

  /**
   * Admin báo khách vắng mặt
   */
  async noShow(id, admin_id) {
    const { data: booking } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (!booking) throw Object.assign(new Error('Booking không tồn tại'), { status: 404 });

    await this._checkFinalizedInterceptor(booking, 'noShow');

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'no_show',
        payment_status: 'forfeited',
        cancellation_reason: 'no_show'
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    await paymentLogService.logPaymentStatus(id, booking.payment_status, 'forfeited', booking.deposit_amount, admin_id, 'Khách không đến (No-Show)');

    return data[0];
  }

  /**
   * Admin Check-in (Khách đến chụp)
   */
  async checkIn(id, admin_id) {
    const { data: booking } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (!booking) throw Object.assign(new Error('Booking không tồn tại'), { status: 404 });

    await this._checkFinalizedInterceptor(booking, 'checkIn');

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'completed',
        payment_status: 'fully_paid',
        checked_in_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    await paymentLogService.logPaymentStatus(id, booking.payment_status, 'fully_paid', booking.remaining_amount, admin_id, 'Khách hoàn thành thanh toán phần còn lại và check-in');

    return data[0];
  }

  /**
   * Hủy Booking
   */
  async cancelBooking(id, role, cancelled_by_id, reason) {
    const { data: booking } = await supabase.from('bookings').select('*').eq('id', id).single();
    if (!booking) throw Object.assign(new Error('Booking không tồn tại'), { status: 404 });

    await this._checkFinalizedInterceptor(booking, 'cancelBooking');

    if (['completed', 'cancelled', 'no_show'].includes(booking.status)) {
      throw Object.assign(new Error('Không thể hủy booking ở trạng thái này'), { status: 400 });
    }

    // Xác định payment_status sau khi hủy
    let new_payment_status = booking.payment_status;
    let cancellation_reason = 'user_cancelled'; // Mặc định là lỗi do khách

    if (role === 'admin' && reason === 'studio_fault') {
      cancellation_reason = 'studio_fault';
    }

    if (booking.payment_status === 'unpaid') {
      new_payment_status = 'unpaid';
    } else if (booking.payment_status === 'deposit_paid') {
      new_payment_status = 'forfeited'; // Bất kể lỗi ai, tiền trên DB vẫn là forfeited, việc hoàn tiền (nếu có) admin làm tay ngoài hệ thống
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: new_payment_status,
        cancellation_reason: cancellation_reason,
        cancelled_by: cancelled_by_id,
        cancelled_reason: reason // Text ghi chú
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    await paymentLogService.logPaymentStatus(id, booking.payment_status, new_payment_status, booking.deposit_amount, cancelled_by_id, `Hủy booking. Lý do: ${cancellation_reason}`);

    return data[0];
  }

  async getMyBookings(user_id) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, studios(name, type, code)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, phone), studios(name, type, code)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getBookingById(id) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, phone), studios(name, type, code), booking_equipments(*, equipments(name))')
      .eq('id', id)
      .single();

    if (error) throw Object.assign(new Error('Booking không tồn tại'), { status: 404 });
    return data;
  }
}

module.exports = new BookingService();
