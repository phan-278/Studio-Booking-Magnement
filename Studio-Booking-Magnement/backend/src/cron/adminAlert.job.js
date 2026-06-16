const cron = require('node-cron');
const supabase = require('../config/supabase');

const adminAlertJob = () => {
  // Chạy mỗi 5 phút
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[CRON] Chạy Job Admin Alert 30m...');

      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          admin_notified: true 
        })
        .eq('status', 'pending_payment')
        .eq('payment_proof_submitted', true) // Đã claim
        .eq('admin_notified', false) // Chỉ nhắc 1 lần
        .lt('payment_claimed_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // KPI 30 phút
        .select();

      if (error) {
        console.error('[CRON ERROR] Admin Alert:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`[CRON] Đã gửi cảnh báo Admin cho ${data.length} đơn hàng quá KPI 30 phút.`);
        // Gửi Noti/Email nhắc nhở Admin nhẹ nhàng (chưa đánh dấu là nguy hiểm)
      }
    } catch (err) {
      console.error('[CRON EXCEPTION] Admin Alert:', err);
    }
  });
};

module.exports = adminAlertJob;
