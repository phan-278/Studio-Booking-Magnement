const bookingService = require('../../src/services/booking.service');
const supabase = require('../../src/config/supabase');

jest.mock('../../src/config/supabase', () => ({
  rpc: jest.fn()
}));

// Mock hàm nội bộ
jest.spyOn(bookingService, '_checkFinalizedInterceptor').mockResolvedValue(true);

describe('Booking Service Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should return booking data when rpc success', async () => {
      const mockResult = { id: 'booking-1' };
      supabase.rpc.mockResolvedValue({ data: mockResult, error: null });

      const data = {
        studio_id: 'studio-1',
        start_time: '2026-07-01T10:00:00Z',
        end_time: '2026-07-01T12:00:00Z',
        equipments: []
      };

      const result = await bookingService.createBooking('user-1', data);
      
      expect(supabase.rpc).toHaveBeenCalledWith('create_booking_transaction', {
        p_user_id: 'user-1',
        p_studio_id: data.studio_id,
        p_start_time: data.start_time,
        p_end_time: data.end_time,
        p_equipments: []
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw 409 error on slot conflict', async () => {
      supabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'SLOT_CONFLICT error' } 
      });

      const data = {
        studio_id: 'studio-1',
        start_time: '2026-07-01T10:00:00Z',
        end_time: '2026-07-01T12:00:00Z',
        equipments: []
      };

      await expect(bookingService.createBooking('user-1', data))
        .rejects
        .toThrow('Khung giờ này đã có người đặt, vui lòng chọn thời gian khác.');
    });
  });
});
