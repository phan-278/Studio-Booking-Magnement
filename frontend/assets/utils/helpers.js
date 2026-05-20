/* =====================================================
   HELPERS.JS — Format tiền, ngày giờ, validate
===================================================== */

/* ── Format tiền VND ── */
export function formatMoney(amount) {
  if (amount === null || amount === undefined) return '—';
  return Number(amount).toLocaleString('vi-VN') + 'đ';
}

export function formatMoneyK(amount) {
  if (!amount) return '—';
  return Number(amount).toLocaleString('vi-VN') + 'K';
}

/* ── Format ngày ── */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function formatDatetime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function toDateStr(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

export function getDayName(dateStr) {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[new Date(dateStr).getDay()];
}

/* ── Validate ── */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone) {
  return /^(0|\+84)[0-9]{9}$/.test(phone.replace(/\s/g, ''));
}

/* ── Tính giờ chênh lệch ── */
export function hoursBetween(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? diff / 60 : 0;
}

/* ── Tính giá studio ── */
export function calcStudioPrice(zone, hours) {
  const pricing = {
    O:    { base: 600, baseHours: 2, extra: 250 },
    C:    { base: 500, baseHours: 2, extra: 200 },
    Full: { base: 0,   baseHours: 0, extra: 0 },
  };
  const p = pricing[zone];
  if (!p || p.base === 0) return null; // Full house = liên hệ

  if (hours <= p.baseHours) return p.base;
  return p.base + (hours - p.baseHours) * p.extra;
}

/* ── Tính tổng tiền (studio + thiết bị) ── */
export function calcTotal(studioPrice, equipItems = []) {
  if (studioPrice === null) return null;
  const equipTotal = equipItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  return studioPrice + equipTotal;
}

export function calcDeposit(total) {
  if (!total) return null;
  return Math.ceil(total / 2);
}

/* ── Sinh booking code ── */
export function genBookingCode() {
  const ts = Date.now().toString(36).toUpperCase();
  return `BK-${ts}`;
}

/* ── Truncate text ── */
export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

/* ── Get initials ── */
export function getInitials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ── Debounce ── */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}