const STUDIOS_KEY = 'kep_studios';
const BOOKINGS_KEY = 'kep_bookings';

function ensureDefaultStudios() {
  const s = JSON.parse(localStorage.getItem(STUDIOS_KEY) || '[]');
  if (s.length) return;
  const defaults = [
    { id:'S-001', name:'"O" Zone', floor:'1F', desc:'Sảnh chính rộng với cột bê tông, ánh sáng tự nhiên từ cửa sổ vòm.', area:'~80 m²', capacity:20, price:600, priceExtra:250, amenities:'Máy lạnh, Wifi, Điện 3 pha', status:'active', createdAt:new Date().toISOString() },
    { id:'S-002', name:'"C" Zone', floor:'2F', desc:'Tầng thượng private, makeup 3 gương, phòng thay đồ, rèm lụa mờ.', area:'~60 m²', capacity:12, price:500, priceExtra:200, amenities:'Makeup zone, Phòng thay đồ, Wifi', status:'active', createdAt:new Date().toISOString() },
    { id:'S-003', name:'Full House', floor:'1F+2F', desc:'Thuê trọn 2 tầng cho production lớn, workshop hoặc pop-up event.', area:'~140 m²', capacity:40, price:1000, priceExtra:400, amenities:'Toàn bộ tiện ích, Setup support', status:'active', createdAt:new Date().toISOString() },
  ];
  localStorage.setItem(STUDIOS_KEY, JSON.stringify(defaults));
}

ensureDefaultStudios();

function getStudios() { return JSON.parse(localStorage.getItem(STUDIOS_KEY) || '[]'); }
function saveStudios(s) { localStorage.setItem(STUDIOS_KEY, JSON.stringify(s)); }
function getBookings() { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]'); }

const STATUS_LABELS = { active:'Đang hoạt động', inactive:'Tạm ngừng', maintenance:'Đang bảo trì' };

function renderZoneGrid() {
  const studios = getStudios();
  const bookings = getBookings();
  const grid = document.getElementById('zoneGrid');

  grid.innerHTML = studios.map(s => {
    const bk = bookings.filter(b => (b.zone === s.name.replace(/"/g,'').split(' ')[0]) || (s.name.includes(b.zone)));
    const totalBk = bk.length;
    const confirmed = bk.filter(b => b.status === 'confirmed').length;
    const revenue = bk.filter(b => b.status === 'confirmed').reduce((acc,b) => acc+(b.total||0), 0);
    const isActive = s.status === 'active';

    return `<div class="zone-card">
      <div class="zone-card-header">
        <div>
          <div class="zone-card-name">${s.name}</div>
          <div class="zone-card-floor">${s.floor}</div>
        </div>
        <div>
          <div class="zone-status-dot ${isActive?'':'off'}" title="${STATUS_LABELS[s.status]||s.status}"></div>
        </div>
      </div>
      <div class="zone-card-body">
        <div class="zone-detail-row"><span class="zone-detail-label">Trạng thái</span><span class="zone-detail-val">${isActive ? '<span class="tag-active">Hoạt động</span>' : '<span class="tag-inactive">'+(STATUS_LABELS[s.status]||s.status)+'</span>'}</span></div>
        <div class="zone-detail-row"><span class="zone-detail-label">Diện tích</span><span class="zone-detail-val">${s.area||'—'}</span></div>
        <div class="zone-detail-row"><span class="zone-detail-label">Sức chứa</span><span class="zone-detail-val">${s.capacity ? s.capacity+' người' : '—'}</span></div>
        <div class="zone-detail-row"><span class="zone-detail-label">Giá 2h</span><span class="zone-detail-val">${s.price ? s.price.toLocaleString()+'K' : 'Liên hệ'}</span></div>
        <div class="zone-detail-row"><span class="zone-detail-label">Giờ thêm</span><span class="zone-detail-val">${s.priceExtra ? s.priceExtra.toLocaleString()+'K/h' : '—'}</span></div>
        <div class="zone-detail-row"><span class="zone-detail-label">Tiện ích</span><span class="zone-detail-val" style="font-size:.56rem;">${s.amenities||'—'}</span></div>
      </div>
      <div class="zone-stats">
        <div class="zone-stat-item"><div class="zone-stat-val">${totalBk}</div><div class="zone-stat-lbl">Booking</div></div>
        <div class="zone-stat-item"><div class="zone-stat-val" style="color:#2E7D32;">${confirmed}</div><div class="zone-stat-lbl">Xác nhận</div></div>
        <div class="zone-stat-item"><div class="zone-stat-val" style="color:var(--red);">${revenue.toLocaleString()}K</div><div class="zone-stat-lbl">Doanh thu</div></div>
      </div>
      <div class="zone-card-footer">
        <button class="btn-sm edit" onclick='openEditModal(${JSON.stringify(s)})'>✏ Chỉnh sửa</button>
        <button class="btn-sm del" onclick="openDelModal('${s.id}')">✕</button>
      </div>
    </div>`;
  }).join('');
}

function renderAvailGrid() {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    days.push({ str: d.toISOString().split('T')[0], label: i === 0 ? 'Hôm nay' : d.toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit'}) });
  }
  const bk = getBookings();
  const zones = ['O','C','Full'];
  const grid = document.getElementById('availGrid');

  let html = `<div class="avail-cell header"></div>`;
  days.forEach(d => html += `<div class="avail-cell header">${d.label}</div>`);

  zones.forEach(zone => {
    html += `<div class="avail-cell zone-label">${zone} Zone</div>`;
    days.forEach(d => {
      const dayBk = bk.filter(b => b.date === d.str && b.zone === zone && b.status !== 'rejected' && b.status !== 'cancelled');
      let cls = 'free', txt = 'Rảnh';
      if (dayBk.length >= 3) { cls = 'booked'; txt = 'Kín'; }
      else if (dayBk.length > 0) { cls = 'partial'; txt = dayBk.length+' lịch'; }
      html += `<div class="avail-cell ${cls}">${txt}</div>`;
    });
  });

  grid.innerHTML = html;
}

function renderZoneChart() {
  const bk = getBookings();
  const zones = ['O','C','Full'];
  const colors = { O:'var(--red)', C:'#2E7D32', Full:'#d4a017' };
  const container = document.getElementById('zoneChartContainer');

  const maxBk = Math.max(...zones.map(z => bk.filter(b => b.zone === z).length), 1);

  container.innerHTML = `
    <div style="display:flex;align-items:flex-end;gap:32px;height:120px;margin-bottom:16px;">
      ${zones.map(z => {
        const count = bk.filter(b => b.zone === z).length;
        const pct = count / maxBk * 100;
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;">
          <span style="font-size:.6rem;color:var(--ink);font-weight:600;">${count}</span>
          <div style="width:100%;background:${colors[z]};opacity:.8;height:${Math.max(pct,4)}px;transition:height .6s;"></div>
          <span style="font-family:var(--font-brand);font-style:italic;font-size:.7rem;">${z} Zone</span>
        </div>`;
      }).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:20px;">
      ${zones.map(z => {
        const zBk = bk.filter(b => b.zone === z);
        const rev = zBk.filter(b => b.status === 'confirmed').reduce((a,b)=>a+(b.total||0),0);
        return `<div style="background:#f9f6f2;padding:12px 16px;">
          <div style="font-family:var(--font-brand);font-style:italic;font-size:.8rem;margin-bottom:8px;">${z} Zone</div>
          <div style="display:flex;justify-content:space-between;font-size:.58rem;padding:4px 0;border-bottom:1px solid var(--border);"><span style="color:var(--warm-grey);">Tổng booking</span><span>${zBk.length}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:.58rem;padding:4px 0;border-bottom:1px solid var(--border);"><span style="color:var(--warm-grey);">Confirmed</span><span style="color:#2E7D32;">${zBk.filter(b=>b.status==='confirmed').length}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:.58rem;padding:4px 0;"><span style="color:var(--warm-grey);">Doanh thu</span><span style="color:var(--red);font-weight:600;">${rev.toLocaleString()}K</span></div>
        </div>`;
      }).join('')}
    </div>
  `;
}

let deleteTarget = null;

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Thêm Zone mới';
  document.getElementById('editId').value = '';
  ['fName','fFloor','fDesc','fArea','fAmenities'].forEach(id => document.getElementById(id).value = '');
  ['fCapacity','fPrice','fPriceExtra'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fStatus').value = 'active';
  document.getElementById('zoneModal').classList.add('open');
}

function openEditModal(s) {
  document.getElementById('modalTitle').textContent = 'Chỉnh sửa Zone';
  document.getElementById('editId').value = s.id;
  document.getElementById('fName').value = s.name || '';
  document.getElementById('fFloor').value = s.floor || '';
  document.getElementById('fDesc').value = s.desc || '';
  document.getElementById('fArea').value = s.area || '';
  document.getElementById('fCapacity').value = s.capacity || '';
  document.getElementById('fPrice').value = s.price || '';
  document.getElementById('fPriceExtra').value = s.priceExtra || '';
  document.getElementById('fAmenities').value = s.amenities || '';
  document.getElementById('fStatus').value = s.status || 'active';
  document.getElementById('zoneModal').classList.add('open');
}

function closeModal() { document.getElementById('zoneModal').classList.remove('open'); }
function openDelModal(id) { deleteTarget = id; document.getElementById('delModal').classList.add('open'); }
function closeDelModal() { deleteTarget = null; document.getElementById('delModal').classList.remove('open'); }

function saveZone() {
  const id = document.getElementById('editId').value;
  const studios = getStudios();
  const data = {
    name: document.getElementById('fName').value.trim(),
    floor: document.getElementById('fFloor').value.trim(),
    desc: document.getElementById('fDesc').value.trim(),
    area: document.getElementById('fArea').value.trim(),
    capacity: parseInt(document.getElementById('fCapacity').value) || 0,
    price: parseInt(document.getElementById('fPrice').value) || 0,
    priceExtra: parseInt(document.getElementById('fPriceExtra').value) || 0,
    amenities: document.getElementById('fAmenities').value.trim(),
    status: document.getElementById('fStatus').value,
  };
  if (!data.name) { showToast('Vui lòng nhập tên Zone.'); return; }

  if (id) {
    const idx = studios.findIndex(s => s.id === id);
    if (idx > -1) studios[idx] = { ...studios[idx], ...data };
  } else {
    data.id = 'S-' + Date.now();
    data.createdAt = new Date().toISOString();
    studios.push(data);
  }
  saveStudios(studios);
  closeModal();
  showToast('✓ Đã lưu Zone.');
  renderAll();
}

function confirmDelete() {
  const studios = getStudios().filter(s => s.id !== deleteTarget);
  saveStudios(studios);
  closeDelModal();
  showToast('Đã xóa Zone.');
  renderAll();
}

function renderAll() { renderZoneGrid(); renderAvailGrid(); renderZoneChart(); }

function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }

document.addEventListener('DOMContentLoaded', renderAll);