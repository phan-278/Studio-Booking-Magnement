import { supabase } from '../../../services/supabase-config.js';

document.getElementById('todayDate').textContent = new Date().toLocaleDateString('vi-VN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

let allUsers = [];
let allBookings = [];

async function loadData() {
  const { data: profiles } = await supabase.from('profiles').select('*');
  const { data: bookings } = await supabase.from('bookings').select('*');
  allUsers = profiles || [];
  allBookings = bookings || [];
  renderAll();
}

window.getUserBookings = function(user) {
  return allBookings.filter(b => b.user_id === user.id);
}

function getUserTier(count) {
  if (count >= 5) return { label:'VIP', badge:'badge-vip' };
  if (count >= 2) return { label:'Thường xuyên', badge:'badge-regular' };
  return { label:'Mới', badge:'badge-new' };
}

let filterMode = 'all';

window.renderStats = function() {
  const newThisMonth = allUsers.filter(u => { const d = new Date(u.created_at); return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear(); }).length;
  const vip = allUsers.filter(u => getUserBookings(u).length >= 5).length;
  document.getElementById('userStats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Tổng người dùng</div><div class="stat-val">${allUsers.length}</div><div class="stat-sub">Đã đăng ký</div></div>
    <div class="stat-card"><div class="stat-label">Mới tháng này</div><div class="stat-val" style="color:#2E7D32;">${newThisMonth}</div><div class="stat-sub">Đăng ký mới</div></div>
    <div class="stat-card"><div class="stat-label">Khách VIP</div><div class="stat-val" style="color:#d4a017;">${vip}</div><div class="stat-sub">≥ 5 booking</div></div>
    <div class="stat-card"><div class="stat-label">Tổng Booking</div><div class="stat-val" style="color:var(--red);">${allBookings.length}</div><div class="stat-sub">Từ tất cả user</div></div>
  `;
}

window.renderTopUsers = function() {
  const ranked = allUsers.map(u => ({ ...u, bkCount: getUserBookings(u).length, spend: getUserBookings(u).filter(b=>b.status==='confirmed').reduce((s,b)=>s+(b.total_price||0),0) }))
    .sort((a,b) => b.bkCount - a.bkCount).slice(0, 6);

  const rankClass = ['gold','silver','bronze','','',''];
  const grid = document.getElementById('topUsersGrid');

  if (!ranked.filter(u=>u.bkCount>0).length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--warm-grey);font-size:.62rem;">Chưa có booking nào.</div>`;
    return;
  }

  grid.innerHTML = ranked.filter(u=>u.bkCount>0).map((u,i) => {
    const initials = (u.full_name || 'Khách').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    return `<div class="top-user-card">
      <div class="rank-badge ${rankClass[i]||''}">${i+1}</div>
      <div class="user-avatar-sm" style="background:${['var(--red)','var(--ink)','#2E7D32','#555','#777','#999'][i]};">${initials}</div>
      <div class="top-user-info">
        <div class="top-user-name">${u.full_name || 'Khách'}</div>
        <div class="top-user-meta">${u.phone || u.email || '—'}</div>
      </div>
      <div class="top-user-stat">
        <div class="top-user-count">${u.bkCount}</div>
        <div class="top-user-lbl">booking</div>
        <div style="font-size:.52rem;color:var(--red);margin-top:2px;">${u.spend.toLocaleString()}K</div>
      </div>
    </div>`;
  }).join('');
}

window.setFilter = function(f, btn) {
  filterMode = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}

window.renderTable = function() {
  const q = (document.getElementById('searchInput').value||'').toLowerCase();
  let users = allUsers.map(u => ({ ...u, bkCount: getUserBookings(u).length, spend: getUserBookings(u).filter(b=>b.status==='confirmed').reduce((s,b)=>s+(b.total_price||0),0) }));
  if (q) users = users.filter(u => (u.full_name||'').toLowerCase().includes(q) || (u.phone||'').includes(q) || (u.email||'').toLowerCase().includes(q));
  if (filterMode === 'vip') users = users.filter(u => u.bkCount >= 5);
  if (filterMode === 'new') users = users.filter(u => u.bkCount <= 1);
  users.sort((a,b) => b.bkCount - a.bkCount);

  const tbody = document.getElementById('userTbody');
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--warm-grey);font-size:.62rem;">Không tìm thấy người dùng nào.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const initials = (u.full_name || 'K').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
    const tier = getUserTier(u.bkCount);
    const confirmed = getUserBookings(u).filter(b=>b.status==='confirmed').length;
    return `<tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar-sm">${initials}</div>
          <div>
            <div class="user-name">${u.full_name || 'Khách'}</div>
            <div class="user-id" style="font-size:.4rem">${u.id.substring(0,8)}...</div>
          </div>
        </div>
      </td>
      <td>${u.phone||'—'}</td>
      <td style="font-size:.58rem;">${u.email||'—'}</td>
      <td style="font-weight:600;text-align:center;">${u.bkCount}</td>
      <td style="color:#2E7D32;font-weight:600;text-align:center;">${confirmed}</td>
      <td style="color:var(--red);font-weight:600;">${u.spend ? u.spend.toLocaleString()+'K' : '0K'}</td>
      <td><span class="${tier.badge}">${tier.label}</span></td>
      <td style="font-size:.56rem;white-space:nowrap;">${u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '—'}</td>
      <td><div class="tbl-actions">
        <button class="tbl-btn view" onclick='openUserModal("${u.id}")'>Xem</button>
        <button class="tbl-btn del" onclick='promptDeleteUser("${u.id}")'>✕ Xóa</button>
      </div></td>
    </tr>`;
  }).join('');
}

window.openUserModal = function(userId) {
  const u = allUsers.find(x => x.id === userId);
  if (!u) return;
  const bk = getUserBookings(u);
  const confirmed = bk.filter(b => b.status === 'confirmed');
  const spend = confirmed.reduce((s,b) => s+(b.total_price||0),0);
  const tier = getUserTier(bk.length);

  document.getElementById('modalTitle').textContent = u.full_name || 'Khách';
  document.getElementById('modalContent').innerHTML = `
    <div class="detail-row"><span class="detail-label">Mã user</span><span class="detail-val" style="font-family:monospace; font-size:.5rem;">${u.id}</span></div>
    <div class="detail-row"><span class="detail-label">SĐT / Zalo</span><span class="detail-val">${u.phone||'—'}</span></div>
    <div class="detail-row"><span class="detail-label">Email</span><span class="detail-val">${u.email||'—'}</span></div>
    <div class="detail-row"><span class="detail-label">Phân loại</span><span class="detail-val"><span class="${tier.badge}">${tier.label}</span></span></div>
    <div class="detail-row"><span class="detail-label">Tổng booking</span><span class="detail-val">${bk.length} (${confirmed.length} đã xác nhận)</span></div>
    <div class="detail-row"><span class="detail-label">Tổng chi tiêu</span><span class="detail-val" style="color:var(--red);font-weight:600;">${spend.toLocaleString()}K</span></div>
    <div class="detail-row"><span class="detail-label">Ngày đăng ký</span><span class="detail-val">${u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN',{year:'numeric',month:'long',day:'numeric'}) : '—'}</span></div>
    ${bk.length ? `
    <div style="margin-top:16px;">
      <div style="font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--warm-grey);margin-bottom:8px;">Booking gần đây</div>
      <div class="mini-booking-list">
        ${bk.slice(0,5).map(b => `
          <div class="mini-booking-item">
            <span>${b.id.substring(0,8)} · ${b.studio_id} Zone · ${b.date ? formatDate(b.date) : '—'}</span>
            <span class="${'badge-'+b.status}" style="display:inline-block;padding:2px 8px;font-size:.48rem;">${{pending:'Chờ duyệt',confirmed:'Đã xác nhận',rejected:'Từ chối',cancelled:'Đã hủy'}[b.status]||b.status}</span>
          </div>`).join('')}
      </div>
    </div>` : ''}
  `;

  document.getElementById('delBtn').onclick = () => {
    closeModal();
    promptDeleteUser(userId);
  };
  document.getElementById('userModal').classList.add('open');
}

window.closeModal = function() { document.getElementById('userModal').classList.remove('open'); }

/* ── DELETE CONFIRM FLOW ── */
let pendingDeleteId = null;

window.promptDeleteUser = function(id) {
  const u = allUsers.find(x => x.id === id);
  if (!u) return;
  pendingDeleteId = id;
  document.getElementById('deleteTargetName').textContent = u.full_name || u.email;
  document.getElementById('confirmDeleteBtn').onclick = executeDelete;
  document.getElementById('deleteConfirmModal').classList.add('open');
}

window.closeDeleteConfirm = function() {
  pendingDeleteId = null;
  document.getElementById('deleteConfirmModal').classList.remove('open');
}

window.executeDelete = async function() {
  if (!pendingDeleteId) return;
  const { error } = await supabase.from('profiles').delete().eq('id', pendingDeleteId);
  if (error) {
    showToast('Lỗi xóa: ' + error.message);
  } else {
    showToast('Đã xóa tài khoản.');
    allUsers = allUsers.filter(u => u.id !== pendingDeleteId);
    renderAll();
  }
  pendingDeleteId = null;
  closeDeleteConfirm();
}

function formatDate(str) { if(!str) return '—'; const [y,m,d] = str.split('-'); return `${d}/${m}/${y}`; }

window.showToast = function(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }

window.renderAll = function() { renderStats(); renderTopUsers(); renderTable(); }

loadData();