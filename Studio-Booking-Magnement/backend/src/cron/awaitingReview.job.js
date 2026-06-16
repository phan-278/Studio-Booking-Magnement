const cron = require('node-cron');
const supabase = require('../config/supabase');

const awaitingReviewJob = () => {
  // Chạy mỗi 5 phút
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('[CRON] Chạy Job Awaiting Manual Review...');

      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          awaiting_manual_review: true
        })
        .eq('status', 'pending_payment')
        .eq('payment_proof_submitted', true) // Đã claim
        .eq('awaiting_manual_review', false) // Tránh update lặp lại
        .lt('deposit_deadline', new Date().toISOString()) // Đơn quá hạn 24h
        .select();

      if (error) {
        console.error('[CRON ERROR] Awaiting Manual Review:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`[CRON] Đã chuyển ${data.length} đơn sang trạng thái Awaiting Manual Review.`);
        // Gửi thông báo khẩn cấp cho Admin
      }
    } catch (err) {
      console.error('[CRON EXCEPTION] Awaiting Manual Review:', err);
    }
  });
};

module.exports = awaitingReviewJob;
