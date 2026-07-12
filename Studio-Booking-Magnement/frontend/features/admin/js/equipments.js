const EQUIP_KEY    = 'kep_equipment';
const BOOKINGS_KEY = 'kep_bookings';

const CAT_LABELS = { lighting:'Ánh sáng', backdrop:'Phông nền', display:'Màn hình', prop:'Phụ kiện', audio:'Âm thanh', other:'Khác' };
const STATUS_MAP = { active:'Cho thuê', maintenance:'Bảo trì', inactive:'Ngừng' };

function ensureDefaultEquip() {
  const e = JSON.parse(localStorage.getItem(EQUIP_KEY) || '[]');
  if (e.length) return;
  const defaults = [
    { id:'E-001', name:'2× Đèn Softbox 300W', category:'lighting', price:200, total:4, available:4, note:'Kèm softbox 80×80, tripod', status:'active', usageCount:0 },
    { id:'E-002', name:'Đèn Spotlight 500W', category:'lighting', price:150, total:3, available:3, note:'Focusable beam, barndoor', status:'active', usageCount:0 },
    { id:'E-003', name:'Backdrop trơn (trắng/đen/xám)', category:'backdrop', price:100, total:6, available:6, note:'Khổ 2.7×3m', status:'active', usageCount:0 },
    { id:'E-004', name:'Reflector 5-in-1', category:'prop', price:50, total:5, available:5, note:'Đường kính 110cm', status:'active', usageCount:0 },
    { id:'E-005', name:'Màn hình LED 55" + Tripod', category:'display', price:120, total:2, available:2, note:'4K HDMI input', status:'active', usageCount:0 },
    { id:'E-006', name:'Quạt Tạo Hiệu Ứng', category:'prop', price:80, total:2, available:1, note:'Tốc độ 3 cấp', status:'maintenance', usageCount:0 },
  ];
  localStorage.setItem(EQUIP_KEY, JSON.stringify(defaults));
}

ensureDefaultEquip();

// Sync usageCount from bookings
function syncUsage() {
  const equips = JSON.parse(localStorage.getItem(EQUIP_KEY) || '[]');
  const bk = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  equips.forEach(e => {
    e.usageCount = bk.filter(b => b.equipments && b.equipments.some(eq => eq.toLowerCase().includes(e.name.toLowerCase().split('(')[0].trim().toLowerCase().substring(0,10)))).length;
  });
  localStorage.setItem(EQUIP_KEY, JSON.stringify(equips));
}

// Calculate available today
function getAvailableToday(equip) {
  const bk = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  const today = new Date().toISOString().split('T')[0];
  const usedToday = bk.filter(b => b.date === today && ['pending','confirmed'].includes(b.status) && b.equipments && b.equipments.some(eq => eq.includes(equip.name.split(' ').slice(-1)[0]))).length;
  return Math.max(0, equip.available - usedToday);
}

function getEquips() { return JSON.parse(localStorage.getItem(EQUIP_KEY) || '[]'); }
function saveEquips(e) { localStorage.setItem(EQUIP_KEY, JSON.stringify(e)); }

let filterMode = 'all';
let delTarget = null;

function renderStats() {
  const equips = getEquips();
  const total = equips.length;
  const lowStock = equips.filter(e => e.status === 'active' && e.available <= 1).length;
  const outStock = equips.filter(e => e.available === 0).length;
  const maintenance = equips.filter(e => e.status === 'maintenance').length;
  document.getElementById('equipStats').innerHTML = `
    <div class="stat-card"><div class="stat-label">Tổng thiết bị</div><div class="stat-val">${total}</div><div class="stat-sub">Loại</div></div>
    <div class="stat-card"><div class="stat-label">Đang cho thuê</div><div class="stat-val green">${equips.filter(e=>e.status==='active').length}</div><div class="stat-sub">Sẵn sàng</div></div>
    <div class="stat-card"><div class="stat-label">Sắp hết</div><div class="stat-val orange">${lowStock}</div><div class="stat-sub">≤ 1 cái còn lại</div></div>
    <div class="stat-card"><div class="stat-label">Bảo trì / Ngừng</div><div class="stat-val red">${maintenance}</div><div class="stat-sub">Không cho thuê</div></div>
  `;
}

function renderUsageChart() {
  const equips = getEquips().sort((a,b) => (b.usageCount||0) - (a.usageCount||0)).slice(0,8);
  const max = Math.max(...equips.map(e => e.usageCount||0), 1);
  const container = document.getElementById('usageChart');
  container.innerHTML = equips.map(e => {
    const h = Math.round(((e.usageCount||0) / max) * 120);
    const shortName = e.name.length > 20 ? e.name.substring(0,18)+'…' : e.name;
    return `<div class="chart-bar-col">
      <span class="chart-val">${e.usageCount||0}</span>
      <div class="chart-bar" style="height:${Math.max(h,4)}px" title="${e.name}: ${e.usageCount||0} lần"></div>
      <span class="chart-lbl" title="${e.name}">${shortName}</span>
    </div>`;
  }).join('');
}

function setFilter(f, btn) {
  filterMode = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}

function renderTable() {
  const q = (document.getElementById('searchInput').value||'').toLowerCase();
  let equips = getEquips();
  if (q) equips = equips.filter(e => (e.name||'').toLowerCase().includes(q));
  if (filterMode === 'low')      equips = equips.filter(e => e.status === 'active' && e.available <= 1 && e.available > 0);
  if (filterMode === 'out')      equips = equips.filter(e => e.available === 0);
  if (filterMode === 'inactive') equips = equips.filter(e => e.status !== 'active');

  const tbody = document.getElementById('equipTbody');
  if (!equips.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--warm-grey);font-size:.62rem;">Không tìm thấy thiết bị nào.</td></tr>`;
    return;
  }

  tbody.innerHTML = equips.map(e => {
    const availToday = getAvailableToday(e);
    const stockPct = e.total ? e.available / e.total * 100 : 0;
    let stockColor = '#2E7D32';
    if (stockPct <= 25) stockColor = 'var(--red)';
    else if (stockPct <= 50) stockColor = '#d4a017';

    let statusBadge = '';
    if (e.status === 'active' && e.available === 0) statusBadge = '<span class="badge-out">Hết hàng</span>';
    else if (e.status === 'active' && e.available <= 1) statusBadge = '<span class="badge-low">Sắp hết</span>';
    else if (e.status === 'active') statusBadge = '<span class="badge-ok">Sẵn sàng</span>';
    else if (e.status === 'maintenance') statusBadge = '<span class="badge-low">Bảo trì</span>';
    else statusBadge = '<span class="badge-inactive">Ngừng</span>';

    return `<tr>
      <td><span style="font-size:.5rem;color:var(--warm-grey);font-family:monospace;">${e.id}</span></td>
      <td>
        <div class="equip-name">${e.name}</div>
        ${e.note ? `<div style="font-size:.54rem;color:var(--warm-grey);margin-top:2px;">${e.note}</div>` : ''}
      </td>
      <td><span style="font-size:.56rem;color:var(--ink-light);">${CAT_LABELS[e.category]||e.category||'—'}</span></td>
      <td>
        <div class="stock-bar-wrap">
          <div class="stock-bar"><div class="stock-bar-fill" style="width:${stockPct}%;background:${stockColor};"></div></div>
          <span class="stock-num"><span class="avail">${e.available}</span> <span class="total-s">/ ${e.total||0}</span></span>
        </div>
      </td>
      <td>
        <span style="font-weight:600;color:${availToday === 0 ? 'var(--red)' : availToday <= 1 ? '#d4a017' : '#2E7D32'};">${availToday}</span>
        <span style="font-size:.52rem;color:var(--warm-grey);"> còn lại</span>
      </td>
      <td><strong>${e.price ? e.price.toLocaleString()+'K' : '—'}</strong></td>
      <td><span class="usage-count">${e.usageCount||0}</span> <span style="font-size:.52rem;color:var(--warm-grey);">lần</span></td>
      <td>${statusBadge}</td>
      <td><div class="tbl-actions">
        <button class="tbl-btn edit" onclick='openEditModal(${JSON.stringify(e)})'>✏ Sửa</button>
        <button class="tbl-btn del" onclick="openDelModal('${e.id}')">✕</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Thêm thiết bị';
  document.getElementById('editId').value = '';
  ['fName','fNote'].forEach(id => document.getElementById(id).value = '');
  ['fPrice','fTotal','fAvail'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fCategory').value = 'lighting';
  document.getElementById('fStatus').value = 'active';
  document.getElementById('equipModal').classList.add('open');
}

function openEditModal(e) {
  document.getElementById('modalTitle').textContent = 'Chỉnh sửa thiết bị';
  document.getElementById('editId').value = e.id;
  document.getElementById('fName').value = e.name || '';
  document.getElementById('fCategory').value = e.category || 'other';
  document.getElementById('fPrice').value = e.price || '';
  document.getElementById('fTotal').value = e.total || '';
  document.getElementById('fAvail').value = e.available || '';
  document.getElementById('fNote').value = e.note || '';
  document.getElementById('fStatus').value = e.status || 'active';
  document.getElementById('equipModal').classList.add('open');
}

function closeModal() { document.getElementById('equipModal').classList.remove('open'); }
function openDelModal(id) { delTarget = id; document.getElementById('delModal').classList.add('open'); }
function closeDelModal() { delTarget = null; document.getElementById('delModal').classList.remove('open'); }

function saveEquip() {
  const id = document.getElementById('editId').value;
  const equips = getEquips();
  const data = {
    name: document.getElementById('fName').value.trim(),
    category: document.getElementById('fCategory').value,
    price: parseInt(document.getElementById('fPrice').value) || 0,
    total: parseInt(document.getElementById('fTotal').value) || 0,
    available: parseInt(document.getElementById('fAvail').value) || 0,
    note: document.getElementById('fNote').value.trim(),
    status: document.getElementById('fStatus').value,
  };
  if (!data.name) { showToast('Vui lòng nhập tên thiết bị.'); return; }
  if (id) {
    const idx = equips.findIndex(e => e.id === id);
    if (idx > -1) equips[idx] = { ...equips[idx], ...data };
  } else {
    data.id = 'E-' + String(equips.length + 1).padStart(3, '0');
    data.usageCount = 0;
    equips.push(data);
  }
  saveEquips(equips);
  closeModal();
  showToast('✓ Đã lưu thiết bị.');
  renderAll();
}

function confirmDelete() {
  const equips = getEquips().filter(e => e.id !== delTarget);
  saveEquips(equips);
  closeDelModal();
  showToast('Đã xóa thiết bị.');
  renderAll();
}

function renderAll() { syncUsage(); renderStats(); renderUsageChart(); renderTable(); }

function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }

document.addEventListener('DOMContentLoaded', renderAll);