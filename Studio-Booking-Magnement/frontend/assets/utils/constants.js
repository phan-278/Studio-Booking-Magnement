/* =====================================================
   CONSTANTS.JS — API URL, status labels, badge colors
===================================================== */

export const API_URL = window.KEP_API_URL || 'http://localhost:5000/api/v1';

/* ── Booking status ── */
export const BOOKING_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  REJECTED:  'rejected',
  CANCELLED: 'cancelled',
};

export const BOOKING_STATUS_LABEL = {
  pending:   'Chờ duyệt',
  confirmed: 'Đã xác nhận',
  rejected:  'Từ chối',
  cancelled: 'Đã hủy',
};

export const BOOKING_STATUS_BADGE = {
  pending:   'badge-pending',
  confirmed: 'badge-confirmed',
  rejected:  'badge-rejected',
  cancelled: 'badge-cancelled',
};

/* ── Zone info ── */
export const ZONES = {
  O: {
    key: 'O',
    name: '"O" Zone',
    floor: '1F',
    area: '~80 m²',
    desc: 'Sảnh chính với cột bê tông, ánh sáng tự nhiên cửa sổ vòm.',
    price: '600K/2h · 250K/h thêm',
    basePrice: 600,
    baseHours: 2,
    extraPerHour: 250,
  },
  C: {
    key: 'C',
    name: '"C" Zone',
    floor: '2F',
    area: 'Private',
    desc: 'Tầng thượng private, makeup 3 gương, phòng thay đồ.',
    price: '500K/2h · 200K/h thêm',
    basePrice: 500,
    baseHours: 2,
    extraPerHour: 200,
  },
  Full: {
    key: 'Full',
    name: 'Full House',
    floor: '1F + 2F',
    area: 'Toàn bộ',
    desc: 'Thuê trọn 2 tầng cho production lớn, workshop, event.',
    price: 'Thương lượng',
    basePrice: null,
    baseHours: null,
    extraPerHour: null,
  },
};

/* ── Time slots ── */
export const TIME_SLOTS = [
  '08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00',
  '16:00','17:00','18:00','19:00',
  '20:00','21:00',
];

/* ── Equipment list (fallback khi chưa có API) ── */
export const DEFAULT_EQUIPMENT = [
  { key: 'flash',  name: 'Đèn flash studio',    desc: '2 đèn Godox 400W + softbox',  price: 150 },
  { key: 'cont',   name: 'Đèn continuous LED',  desc: 'Bộ 3 đèn panel 60W',          price: 120 },
  { key: 'bg-w',   name: 'Background trắng',    desc: 'Backdrop vải seamless 3×5m',  price: 80  },
  { key: 'bg-b',   name: 'Background đen',      desc: 'Backdrop vải seamless 3×5m',  price: 80  },
  { key: 'fan',    name: 'Quạt gió',             desc: 'Tạo hiệu ứng tóc bay',        price: 50  },
  { key: 'screen', name: 'Màn hình LED 55"',     desc: '+ tripod',                    price: 120 },
  { key: 'smoke',  name: 'Máy khói',             desc: 'Fog machine',                 price: 100 },
  { key: 'ref',    name: 'Reflector 5-in-1',    desc: 'Hắt sáng chuyên nghiệp',      price: 40  },
];

/* ── User roles ── */
export const ROLES = {
  USER:  'user',
  ADMIN: 'admin',
};

/* ── Pagination ── */
export const DEFAULT_PAGE_SIZE = 10;