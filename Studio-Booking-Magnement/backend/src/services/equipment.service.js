const supabase = require('../config/supabase');

class EquipmentService {
  async getEquipments(startTime, endTime) {
    // Lấy toàn bộ thiết bị active
    const { data: equipments, error } = await supabase
      .from('equipments')
      .select('*')
      .eq('status', 'active');
      
    if (error) throw error;

    // Nếu không có mốc thời gian, giả định số lượng khả dụng = tổng số lượng
    if (!startTime || !endTime) {
      return equipments.map(eq => ({
        ...eq,
        available_quantity: eq.total_quantity
      }));
    }

    // Nếu có mốc thời gian, tính số lượng đã được đặt trong các booking giao thoa
    const { data: bookings, error: bookingErr } = await supabase
      .from('bookings')
      .select('id')
      .in('status', ['pending_payment', 'confirmed'])
      .lt('start_time', endTime)
      .gt('end_time', startTime);

    if (bookingErr) throw bookingErr;

    if (!bookings || bookings.length === 0) {
      // Không có booking nào trùng giờ
      return equipments.map(eq => ({
        ...eq,
        available_quantity: eq.total_quantity
      }));
    }

    const bookingIds = bookings.map(b => b.id);

    // Lấy danh sách thiết bị đang được thuê trong các booking này
    const { data: bookingEquipments, error: beErr } = await supabase
      .from('booking_equipments')
      .select('equipment_id, quantity')
      .in('booking_id', bookingIds);

    if (beErr) throw beErr;

    // Tổng hợp số lượng đã thuê theo từng equipment_id
    const bookedCounts = {};
    if (bookingEquipments) {
      bookingEquipments.forEach(be => {
        bookedCounts[be.equipment_id] = (bookedCounts[be.equipment_id] || 0) + be.quantity;
      });
    }

    // Tính Available = Total - Booked
    return equipments.map(eq => ({
      ...eq,
      available_quantity: Math.max(0, eq.total_quantity - (bookedCounts[eq.id] || 0))
    }));
  }

  async createEquipment(data) {
    const { data: equipment, error } = await supabase
      .from('equipments')
      .insert([data])
      .select()
      .single();
      
    if (error) throw error;
    return equipment;
  }

  async updateEquipment(id, updateData) {
    const { data, error } = await supabase
      .from('equipments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async deleteEquipment(id) {
    // Soft delete (cập nhật status = inactive)
    const { data, error } = await supabase
      .from('equipments')
      .update({ status: 'inactive' })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

module.exports = new EquipmentService();
