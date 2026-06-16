const supabase = require('../config/supabase');

exports.getEquipments = async (startTime, endTime) => {
  // Giữ nguyên logic tối ưu ForeignKey Embedded nhưng thêm check lỗi kết nối DB
  const { data: equipments, error: eqErr } = await supabase.from('equipments').select('*').eq('status', 'active');
  if (eqErr) throw eqErr;

  if (!startTime || !endTime) {
    return equipments.map(e => ({ ...e, available_quantity: e.total_quantity }));
  }

  const { data: booked, error: bookErr } = await supabase
    .from('booking_equipments')
    .select('equipment_id, quantity, bookings!inner(status, start_time, end_time)')
    .in('bookings.status', ['pending_payment', 'confirmed'])
    .lt('bookings.start_time', endTime)
    .gt('bookings.end_time', startTime);
    
  if (bookErr) throw bookErr;

  const bookedMap = {};
  booked.forEach(b => {
    bookedMap[b.equipment_id] = (bookedMap[b.equipment_id] || 0) + b.quantity;
  });

  return equipments.map(e => ({
    ...e,
    available_quantity: Math.max(0, e.total_quantity - (bookedMap[e.id] || 0))
  }));
};
