const supabase = require('../config/supabase');

class PaymentLogService {
  /**
   * Hàm tiện ích để ghi log thay đổi trạng thái thanh toán
   */
  async logPaymentStatus(booking_id, from_status, to_status, amount, changed_by, note) {
    const { error } = await supabase
      .from('payment_logs')
      .insert({
        booking_id,
        from_status,
        to_status,
        amount,
        changed_by,
        note
      });

    if (error) {
      console.error('Lỗi khi ghi payment_log:', error);
      // Có thể throw lỗi hoặc chỉ log tùy chiến lược, thông thường log không làm gián đoạn luồng chính
    }
  }
}

module.exports = new PaymentLogService();
