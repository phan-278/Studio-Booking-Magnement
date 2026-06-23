const reportService = require('../../src/services/report.service');
const supabase = require('../../src/config/supabase');

jest.mock('../../src/config/supabase', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis()
}));

describe('Report Service Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMonthlyReport', () => {
    it('should return existing finalized report', async () => {
      const mockReport = { id: 1, is_finalized: true, gross_revenue: 1000 };
      supabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockReport, error: null })
      }));

      const result = await reportService.getMonthlyReport('2026', '06');
      expect(result).toEqual(mockReport);
    });

    it('should calculate live report if not finalized', async () => {
      const mockBookings = [
        {
          status: 'completed',
          checked_in_at: '2026-06-15T10:00:00Z', // UTC, will be mapped to VN timezone
          studio_price: 500,
          equipment_price: 100,
          total_price: 600
        },
        {
          status: 'no_show',
          start_time: '2026-06-20T10:00:00Z',
          deposit_amount: 300
        }
      ];

      supabase.from.mockImplementation((table) => {
        if (table === 'monthly_reports') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null })
          };
        }
        if (table === 'bookings') {
          return {
            select: jest.fn().mockResolvedValue({ data: mockBookings, error: null })
          };
        }
      });

      const result = await reportService.getMonthlyReport('2026', '06');
      
      expect(result.gross_revenue).toBe(600);
      expect(result.forfeited_amount).toBe(300);
      expect(result.total_bookings_completed).toBe(1);
      expect(result.no_show_count).toBe(1);
    });
  });
});
