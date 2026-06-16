const autoOnHoldJob = require('./autoOnHold.job');
const awaitingReviewJob = require('./awaitingReview.job');
const adminAlertJob = require('./adminAlert.job');

const initCronJobs = () => {
  console.log('[CRON] Khởi tạo các Background Jobs...');
  autoOnHoldJob();
  awaitingReviewJob();
  adminAlertJob();
  console.log('[CRON] Đã khởi tạo hoàn tất.');
};

module.exports = initCronJobs;
