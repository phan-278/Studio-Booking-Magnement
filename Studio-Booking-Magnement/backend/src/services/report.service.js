const supabase = require('../config/supabase');
const { formatInTimeZone, toDate } = require('date-fns-tz');

const VN_TZ = 'Asia/Ho_Chi_Minh';

class ReportService {
  /**
   * Tính toán hoặc lấy báo cáo từ DB
   */
  async getMonthlyReport(yearStr, monthStr) {
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    // 1. Kiểm tra xem đã khóa sổ chưa
    const { data: existingReport } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .single();

    if (existingReport && existingReport.is_finalized) {
      return existingReport;
    }

    // 2. Tính toán động từ bảng bookings
    // Lấy TẤT CẢ booking để filter bằng code (đơn giản, dễ debug)
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*');

    if (error) throw error;

    let gross_revenue = 0;
    let studio_revenue = 0;
    let equipment_revenue = 0;
    let forfeited_amount = 0;
    let total_bookings_completed = 0;
    let forfeited_count = 0;
    let no_show_count = 0;
    let cancelled_after_deposit_count = 0;
    let cancelled_before_deposit_count = 0;
    let on_hold_count = 0;

    for (const booking of bookings) {
      const getTargetMonthYear = (dateStr) => {
        if (!dateStr) return null;
        return {
          y: parseInt(formatInTimeZone(new Date(dateStr), VN_TZ, 'yyyy')),
          m: parseInt(formatInTimeZone(new Date(dateStr), VN_TZ, 'MM'))
        };
      };

      const checkedInYM = getTargetMonthYear(booking.checked_in_at);
      const startYM = getTargetMonthYear(booking.start_time);
      const deadlineYM = getTargetMonthYear(booking.deposit_deadline);

      // Rule: Doanh thu completed -> checked_in_at
      if (booking.status === 'completed' && checkedInYM && checkedInYM.y === year && checkedInYM.m === month) {
        total_bookings_completed++;
        studio_revenue += parseFloat(booking.studio_price || 0);
        equipment_revenue += parseFloat(booking.equipment_price || 0);
        gross_revenue += parseFloat(booking.total_price || 0);
      }

      // Rule: on_hold -> deposit_deadline
      if (booking.status === 'on_hold' && deadlineYM && deadlineYM.y === year && deadlineYM.m === month) {
        on_hold_count++;
      }

      // Rule: Cancelled / No show / Forfeited -> start_time
      if (startYM && startYM.y === year && startYM.m === month) {
        if (booking.status === 'no_show') {
          no_show_count++;
          forfeited_count++;
          forfeited_amount += parseFloat(booking.deposit_amount || 0);
        } else if (booking.status === 'cancelled') {
          if (booking.payment_status === 'forfeited') {
            cancelled_after_deposit_count++;
            forfeited_count++;
            forfeited_amount += parseFloat(booking.deposit_amount || 0);
          } else if (booking.payment_status === 'unpaid') {
            cancelled_before_deposit_count++;
          }
        }
      }
    }

    return {
      year,
      month,
      gross_revenue,
      studio_revenue,
      equipment_revenue,
      forfeited_amount,
      total_bookings_completed,
      forfeited_count,
      no_show_count,
      cancelled_after_deposit_count,
      cancelled_before_deposit_count,
      on_hold_count,
      is_finalized: false
    };
  }

  async regenerateMonthlyReport(yearStr, monthStr) {
    // Vì getMonthlyReport luôn tính live nếu chưa finalize, regenerate thực chất chỉ là trả kết quả live
    return this.getMonthlyReport(yearStr, monthStr);
  }

  async finalizeMonthlyReport(yearStr, monthStr, adminId) {
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    // 1. Kiểm tra xem đã khóa sổ chưa
    const { data: existingReport } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('year', year)
      .eq('month', month)
      .single();

    if (existingReport && existingReport.is_finalized) {
      const err = new Error('Tháng này đã được khóa sổ.');
      err.status = 400;
      throw err;
    }

    // 2. Kiểm tra Blocker Rule (Chống Deadlock)
    const { data: activeBookings, error: activeErr } = await supabase
      .from('bookings')
      .select('*')
      .in('status', ['pending_payment', 'confirmed']);
    
    if (activeErr) throw activeErr;

    for (const booking of activeBookings) {
      const getTargetMonthYear = (dateStr) => {
        if (!dateStr) return null;
        return {
          y: parseInt(formatInTimeZone(new Date(dateStr), VN_TZ, 'yyyy')),
          m: parseInt(formatInTimeZone(new Date(dateStr), VN_TZ, 'MM'))
        };
      };

      const startYM = getTargetMonthYear(booking.start_time);
      const deadlineYM = getTargetMonthYear(booking.deposit_deadline);

      if (booking.status === 'confirmed') {
        if (startYM && startYM.y === year && startYM.m === month) {
          const err = new Error('Không thể khóa sổ! Vẫn còn đơn hàng Confirmed chưa được xử lý dứt điểm trong tháng.');
          err.status = 400;
          throw err;
        }
      } else if (booking.status === 'pending_payment') {
        const isStartInMonth = startYM && startYM.y === year && startYM.m === month;
        const isDeadlineInMonth = deadlineYM && deadlineYM.y === year && deadlineYM.m === month;
        
        if (isStartInMonth || isDeadlineInMonth) {
          const err = new Error('Không thể khóa sổ! Vẫn còn đơn hàng Pending Payment có hạn chốt cọc hoặc lịch chụp rơi vào tháng này.');
          err.status = 400;
          throw err;
        }
      }
    }

    // 3. Tính toán chốt sổ
    const finalData = await this.getMonthlyReport(yearStr, monthStr);

    // 4. Lưu DB
    const reportPayload = {
      year,
      month,
      gross_revenue: finalData.gross_revenue,
      studio_revenue: finalData.studio_revenue,
      equipment_revenue: finalData.equipment_revenue,
      forfeited_amount: finalData.forfeited_amount,
      total_bookings_completed: finalData.total_bookings_completed,
      forfeited_count: finalData.forfeited_count,
      no_show_count: finalData.no_show_count,
      cancelled_after_deposit_count: finalData.cancelled_after_deposit_count,
      cancelled_before_deposit_count: finalData.cancelled_before_deposit_count,
      on_hold_count: finalData.on_hold_count,
      is_finalized: true,
      generated_at: new Date().toISOString(),
      generated_by: adminId
    };

    let result;
    if (existingReport) {
      const { data, error } = await supabase
        .from('monthly_reports')
        .update(reportPayload)
        .eq('id', existingReport.id)
        .select();
      if (error) throw error;
      result = data[0];
    } else {
      const { data, error } = await supabase
        .from('monthly_reports')
        .insert(reportPayload)
        .select();
      if (error) throw error;
      result = data[0];
    }

    return result;
  }
}

module.exports = new ReportService();
