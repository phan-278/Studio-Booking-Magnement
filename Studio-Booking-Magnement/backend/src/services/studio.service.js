const supabase = require('../config/supabase');

exports.checkAvailability = async (studioId, startTime, endTime) => {
  // 1. Lấy thông tin loại phòng của studio đích đang muốn check
  const { data: currentStudio, error: studioErr } = await supabase
    .from('studios')
    .select('type')
    .eq('id', studioId)
    .single();
  
  if (studioErr || !currentStudio) throw new Error('Không tìm thấy thông tin Studio trong hệ thống.');
  
  // 2. Truy vấn toàn bộ các đơn đặt phòng có nguy cơ trùng khung giờ
  // Lấy thêm trường `studio_id` để thực hiện thuật toán đối soát ma trận
  const { data: conflicts, error } = await supabase
    .from('bookings')
    .select('id, studio_id, studios!inner(type)')
    .in('status', ['pending_payment', 'confirmed'])
    .lt('start_time', endTime)
    .gt('end_time', startTime);

  if (error) throw error;

  // 3. Xử lý Ma Trận Xung Đột (Giải quyết triệt để bài toán scale-up nhiều phòng cùng loại)
  const hasRealConflict = conflicts.some(booking => {
    const isSameStudio = booking.studio_id === studioId;
    const isTargetFullHouse = currentStudio.type === 'FULL';
    const isExistingBookingFullHouse = booking.studios.type === 'FULL';

    return (
      isSameStudio ||            // 1. Trùng chính xác ID phòng đó (Ví dụ: Đều đặt phòng O_ZONE_01)
      isTargetFullHouse ||       // 2. Phòng đang check là FULL (Sẽ block toàn bộ các đơn O hoặc C đơn lẻ)
      isExistingBookingFullHouse // 3. Đơn đang có trên hệ thống là FULL (Sẽ tự động block phòng O hoặc C đang check)
    );
  });

  return !hasRealConflict; // Trả về true nếu KHÔNG có bất kỳ xung đột thực tế nào
};
