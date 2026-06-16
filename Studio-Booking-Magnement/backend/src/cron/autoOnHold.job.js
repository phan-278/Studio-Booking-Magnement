const cron = require('node-cron');
const supabase = require('../config/supabase');

const autoOnHoldJob = () => {
  // Chạy mỗi 5 phút
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[CRON] Chạy Job Auto On-Hold...');

      // Gọi lệnh UPDATE ... RETURNING để tránh Race Condition trên đa máy chủ
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status: 'on_hold', 
          payment_status: 'unpaid', 
          cancellation_reason_type: 'expired' 
        })
        .eq('status', 'pending_payment')
        .eq('payment_proof_submitted', false) // Khách chưa claim
        .lt('deposit_deadline', new Date().toISOString()) // Nhanh gọn, chính xác bằng Index
        .select();

      if (error) {
        console.error('[CRON ERROR] Auto On-Hold:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`[CRON] Đã hủy tự động ${data.length} đơn hàng quá hạn cọc 24h.`);
        // Ở đây có thể tích hợp service gửi Email thông báo cho khách hàng
      }
    } catch (err) {
      console.error('[CRON EXCEPTION] Auto On-Hold:', err);
    }
  });
};

module.exports = autoOnHoldJob;
