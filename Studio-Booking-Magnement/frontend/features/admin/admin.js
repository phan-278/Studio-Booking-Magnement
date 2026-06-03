import { getBookings, updateBookingStatus, _currentUserProfile } from '../../services/api.js';
import { formatDate, openModal, closeModal, showToast } from '../../utils/helpers.js';

/* ==========
   9. ADMIN PANEL
================================================================ */
let adminFilter = 'all';

function openLogin() {
  if (_currentUserProfile && _currentUserProfile.role === 'admin') {
    openAdminPanel();
  } else {
    if (!_currentUserProfile) {
      showToast('Vui lòng đăng nhập tài khoản Admin');
      if (typeof window.openAuthFrame === 'function') {
        window.openAuthFrame('login');
      }
    } else {
      showToast('Tài khoản của bạn không có quyền truy cập Admin');
    }
  }
}

function tryLogin() {
  // Legacy function for password modal, no longer needed as we use Supabase Auth
  openLogin();
}

function openAdminPanel() {
  document.getElementById('adminPanel').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderAdmin();
}

function closeAdmin() {
  document.getElementById('adminPanel').classList.remove('open');
  document.body.style.overflow = '';
}

function renderAdmin() {
  const all = getBookings();
  const counts = {
    pending:   all.filter(b => b.status === 'pending').length,
    confirmed: all.filter(b => b.status === 'confirmed').length,
    rejected:  all.filter(b => b.status === 'rejected').length,
    revenue:   all.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.total || 0), 0)
  };

  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card"><div class="stat-lbl">Chờ duyệt</div><div class="stat-val red">${counts.pending}</div></div>
    <div class="stat-card"><div class="stat-lbl">Đã xác nhận</div><div class="stat-val">${counts.confirmed}</div></div>
    <div class="stat-card"><div class="stat-lbl">Từ chối</div><div class="stat-val">${counts.rejected}</div></div>
    <div class="stat-card"><div class="stat-lbl">Doanh thu</div><div class="stat-val">${counts.revenue.toLocaleString()}K</div></div>
  `;
  renderAdminTable(all);
}

function filterBookings(f, btn) {
  adminFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAdminTable(getBookings());
}

function renderAdminTable(all) {
  const rows  = adminFilter === 'all' ? all : all.filter(b => b.status === adminFilter);
  const tbody = document.getElementById('adminTbody');

  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--warm-grey);padding:24px;">Không có booking nào.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map((b, i) => `
    <tr>
      <td style="font-size:.5rem;color:var(--warm-grey);">${b.id || i + 1}</td>
      <td>${b.name || '—'}</td>
      <td>${b.phone || '—'}</td>
      <td>${b.zone || '—'}</td>
      <td>${b.date || '—'}</td>
      <td>${b.startTime || '—'} – ${b.endTime || '—'}</td>
      <td>${b.total ? b.total.toLocaleString() + 'K' : 'Liên hệ'}</td>
      <td><span class="status-badge s-${b.status}">${statusLabel(b.status)}</span></td>
      <td>
        <div class="action-btns">
          ${b.status !== 'confirmed' ? `<button class="act-btn act-confirm" onclick="actBooking('${b.id}','confirmed')">✓ Duyệt</button>` : ''}
          ${b.status !== 'rejected'  ? `<button class="act-btn act-reject"  onclick="actBooking('${b.id}','rejected')">✕ Từ chối</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function actBooking(id, status) {
  updateBookingStatus(id, status);
  renderAdmin();
  if (typeof window.renderCalendar === 'function') window.renderCalendar();
  if (typeof window.renderTimeline === 'function' && window.calSelectedDay) window.renderTimeline(window.calSelectedDay);
  showToast(status === 'confirmed' ? '✓ Đã xác nhận booking.' : 'Đã cập nhật trạng thái.');
}

function statusLabel(s) {
  return { pending: 'Chờ duyệt', confirmed: 'Đã xác nhận', rejected: 'Từ chối' }[s] || s;
}

window.openLogin      = openLogin;
window.tryLogin       = tryLogin;
window.closeAdmin     = closeAdmin;
window.filterBookings = filterBookings;
window.actBooking     = actBooking;
