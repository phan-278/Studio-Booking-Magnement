const request = require('supertest');
const app = require('../../src/app');
const bookingService = require('../../src/services/booking.service');
const jwt = require('jsonwebtoken');

jest.mock('../../src/services/booking.service');

// Mock JWT verify to bypass authentication middleware
jest.mock('jsonwebtoken');

describe('Booking Controller API Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jwt.verify.mockReturnValue({ id: 'user-123', sub: 'user-123' });
  });

  describe('POST /api/bookings', () => {
    it('should return 400 validation error if missing required fields', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Dữ liệu đầu vào không hợp lệ');
    });

    it('should return 201 when booking is created successfully', async () => {
      bookingService.createBooking.mockResolvedValue({ id: 'booking-new' });

      const payload = {
        studio_id: 'studio-1',
        start_time: '2026-07-01T10:00:00.000Z',
        end_time: '2026-07-01T12:00:00.000Z',
        purposes: ['chụp ảnh'],
        equipments: []
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 'booking-new' });
      expect(bookingService.createBooking).toHaveBeenCalledWith('user-123', payload);
    });

    it('should return 409 if slot conflict occurs', async () => {
      const err = new Error('Khung giờ này đã có người đặt, vui lòng chọn thời gian khác.');
      err.status = 409;
      err.errorCode = 'SLOT_CONFLICT';
      bookingService.createBooking.mockRejectedValue(err);

      const payload = {
        studio_id: 'studio-1',
        start_time: '2026-07-01T10:00:00.000Z',
        end_time: '2026-07-01T12:00:00.000Z',
        purposes: ['chụp ảnh'],
        equipments: []
      };

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', 'Bearer valid_token')
        .send(payload);

      expect(response.status).toBe(409);
      expect(response.body.error).toEqual('Khung giờ này đã có người đặt, vui lòng chọn thời gian khác.');
    });
  });
});
