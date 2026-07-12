const BOOKINGS_KEY = 'kep_bookings';
const ZONE_META = {
  O: 'Classic Room',
  C: 'Creative Room',
  Q: 'Modern Room',
  Full: 'Full House',
  'Full House': 'Trọn studio'
};

let currentPeriod = '30';
let currentMode   = 'revenue';

document.addEventListener('DOMContentLoaded', () => {
  ensureReportDemoData();
  document.getElementById('periodSelect').addEventListener('change', e => {
    currentPeriod = e.target.value;
    renderAll();
  });
  document.getElementById('chartMode').addEventListener('change', e => {
    currentMode = e.target.value;
    renderChart(getFilteredBookings());
  });
  renderAll();
});

function ensureReportDemoData() {
  const bk = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  if (bk.length) return;
  const zones = ['O','C','Full'];
  const names = ['Nguyễn Thị Mai','Trần Văn Hùng','Lê Thu Hương','Phạm Minh Đức','Võ Thị Lan','Đặng Quốc Tuấn','Hoàng Yến Nhi','Bùi Văn Long'];
  const statuses = ['confirmed','confirmed','pending','confirmed','rejected','confirmed','cancelled'];
  const demo = [];
  for (let i = 0; i < 40; i++) {
    const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random()*180));
    const zone = zones[i % zones.length];
    const dur = 2 + Math.floor(Math.random()*4);
    const base = zone === 'O' ? 600 : zone === 'C' ? 500 : 1100;
    const total = base + (dur - 2) * (zone === 'O' ? 250 : zone === 'C' ? 220 : 400) + (i % 4 === 0 ? 180 : 0);
    demo.push({
      id:'BK-' + String(i+1).padStart(4,'0'),
      name:names[i % names.length],
      zone,
      date:d.toISOString().split('T')[0],
      startTime:String(8 + (i % 10)).padStart(2,'0') + ':00',
      duration:dur,
      total,
      deposit:Math.round(total/2),
      status:statuses[i % statuses.length],
      createdAt:new Date(d.getTime() - 86400000).toISOString()
    });
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(demo));
}

function getBookings() { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]'); }
function getFilteredBookings() {
  const bk = getBookings();
  if (currentPeriod === 'all') return bk;
  const days = Number(currentPeriod);
  const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - days + 1);
  return bk.filter(b => {
    if (!b.date) return false;
    return new Date(b.date + 'T00:00:00') >= start;
  });
}
function getConfirmed(bk) { return bk.filter(b => b.status === 'confirmed'); }
function money(v) { return (v || 0).toLocaleString('vi-VN') + 'K'; }
function percent(a,b) { return b ? Math.round((a/b)*100) : 0; }

function renderAll() {
  const bk = getFilteredBookings();
  document.getElementById('periodLabel').textContent = document.getElementById('periodSelect').selectedOptions[0].textContent;
  renderStats(bk);
  renderChart(bk);
  renderInsights(bk);
  renderZoneTable(bk);
  renderTopMonths();
  renderTopQuarters();
}

function renderStats(bk) {
  const confirmed = getConfirmed(bk);
  const revenue = confirmed.reduce((s,b) => s + (b.total || 0), 0);
  const deposit = confirmed.reduce((s,b) => s + (b.deposit || 0), 0);
  const pending = bk.filter(b => b.status === 'pending').length;
  const avg = confirmed.length ? Math.round(revenue / confirmed.length) : 0;
  const confirmRate = percent(confirmed.length, bk.length);

  document.getElementById('reportStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Doanh thu xác nhận</div>
      <div class="stat-val red">${money(revenue)}</div>
      <div class="stat-sub">Cọc đã ghi nhận: ${money(deposit)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Booking trong kỳ</div>
      <div class="stat-val">${bk.length}</div>
      <div class="stat-sub">${pending} booking đang chờ duyệt</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Tỷ lệ xác nhận</div>
      <div class="stat-val green">${confirmRate}%</div>
      <div class="stat-sub">${confirmed.length}/${bk.length || 0} booking đã xác nhận</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Giá trị TB / Booking</div>
      <div class="stat-val gold">${money(avg)}</div>
      <div class="stat-sub">Tính trên booking xác nhận</div>
    </div>
  `;
}

function renderChart(bk) {
  const confirmed = getConfirmed(bk);
  const wrap = document.getElementById('revenueChart');
  const isLong = (currentPeriod === '90' || currentPeriod === 'all');
  const daysCount = currentPeriod === '7' ? 7 : isLong ? 12 : 10;
  const buckets = [];

  if (isLong) {
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0,7);
      buckets.push({ key, label: `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(2)}`, revenue:0, count:0 });
    }
    confirmed.forEach(b => {
      const key = (b.date || '').slice(0,7);
      const bucket = buckets.find(x => x.key === key);
      if (bucket) { bucket.revenue += b.total || 0; bucket.count += 1; }
    });
  } else {
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      buckets.push({ key, label: key.split('-').slice(1).reverse().join('/'), revenue:0, count:0 });
    }
    confirmed.forEach(b => {
      const bucket = buckets.find(x => x.key === b.date);
      if (bucket) { bucket.revenue += b.total || 0; bucket.count += 1; }
    });
  }

  const values = buckets.map(x => currentMode === 'revenue' ? x.revenue : x.count);
  const max = Math.max(...values, 1);
  document.getElementById('chartNote').textContent = currentMode === 'revenue'
    ? 'Đơn vị hiển thị: nghìn VNĐ (K), chỉ tính booking đã xác nhận.'
    : 'Đơn vị hiển thị: số booking đã xác nhận.';

  wrap.innerHTML = buckets.map(b => {
    const val = currentMode === 'revenue' ? b.revenue : b.count;
    const h = Math.max(Math.round((val / max) * 150), val ? 8 : 4);
    return `
      <div class="chart-col" title="${b.label}: ${currentMode === 'revenue' ? money(val) : val + ' booking'}">
        <div class="chart-val">${val ? (currentMode === 'revenue' ? compactMoney(val) : val) : ''}</div>
        <div class="chart-bar" style="height:${h}px"></div>
        <div class="chart-label">${b.label}</div>
      </div>`;
  }).join('');
}

function compactMoney(v) {
  if (v >= 1000) return (v/1000).toFixed(v >= 10000 ? 0 : 1).replace('.0','') + 'M';
  return v + 'K';
}

function renderInsights(bk) {
  const confirmed = getConfirmed(bk);
  const revenue = confirmed.reduce((s,b)=>s+(b.total||0),0);
  const topZone = getZoneStats(confirmed).sort((a,b)=>b.revenue-a.revenue)[0];
  const pending = bk.filter(b=>b.status==='pending').length;
  const avg = confirmed.length ? Math.round(revenue/confirmed.length) : 0;

  document.getElementById('insightList').innerHTML = `
    <div class="insight-item">
      <div class="insight-label">Zone mạnh nhất</div>
      <div class="insight-value">${topZone ? topZone.zone : '—'}</div>
      <div class="insight-text">${topZone ? `${money(topZone.revenue)} từ ${topZone.count} lượt đặt.` : 'Chưa có dữ liệu xác nhận trong kỳ.'}</div>
    </div>
    <div class="insight-item">
      <div class="insight-label">Booking cần xử lý</div>
      <div class="insight-value">${pending}</div>
      <div class="insight-text">Duyệt sớm để tránh mất slot và giữ trải nghiệm khách hàng.</div>
    </div>
    <div class="insight-item">
      <div class="insight-label">Giá trị trung bình</div>
      <div class="insight-value">${money(avg)}</div>
      <div class="insight-text">Có thể tăng bằng combo thuê phòng + thiết bị ánh sáng.</div>
    </div>
  `;

  const tip = pending > 0
    ? `Có ${pending} booking đang chờ duyệt. Nên xử lý trước các đơn có giá trị cao hoặc các slot cuối tuần.`
    : `Không có booking chờ duyệt. Có thể dùng khoảng trống giữa tuần để chạy ưu đãi hoặc đẩy combo thiết bị.`;
  document.getElementById('tipBox').innerHTML = `<strong>Gợi ý vận hành:</strong> ${tip}`;
}

function getZoneStats(confirmed) {
  const map = {};
  confirmed.forEach(b => {
    const zone = b.zone || 'Khác';
    if (!map[zone]) map[zone] = { zone, count:0, revenue:0 };
    map[zone].count += 1;
    map[zone].revenue += b.total || 0;
  });
  return Object.values(map);
}

function renderZoneTable(bk) {
  const confirmed = getConfirmed(bk);
  const stats = getZoneStats(confirmed).sort((a,b)=>b.revenue-a.revenue);
  const totalRevenue = stats.reduce((s,z)=>s+z.revenue,0);
  const tbody = document.getElementById('zoneTbody');

  if (!stats.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Chưa có booking đã xác nhận trong kỳ này.</td></tr>`;
    return;
  }

  tbody.innerHTML = stats.map(z => {
    const share = percent(z.revenue,totalRevenue);
    const avg = z.count ? Math.round(z.revenue/z.count) : 0;
    const cls = share >= 40 ? 'badge-good' : share >= 20 ? 'badge-mid' : 'badge-low';
    const text = share >= 40 ? 'Mũi nhọn' : share >= 20 ? 'Ổn định' : 'Cần đẩy mạnh';
    return `
      <tr>
        <td><div class="zone-name">${z.zone} Zone</div><div class="zone-meta">${ZONE_META[z.zone] || 'Studio service'}</div></td>
        <td>${z.count}</td>
        <td><div class="progress-wrap"><div class="progress-track"><div class="progress-fill" style="width:${share}%"></div></div><span class="progress-num">${share}%</span></div></td>
        <td class="amount-cell">${money(z.revenue)}</td>
        <td>${money(avg)}</td>
        <td><span class="badge ${cls}">${text}</span></td>
      </tr>`;
  }).join('');
}

/* ── TOP MONTHS: uses ALL confirmed bookings (not period-filtered) ── */
function renderTopMonths() {
  const confirmed = getConfirmed(getBookings()); // all-time
  const map = {};
  confirmed.forEach(b => {
    if (!b.date) return;
    const key = b.date.slice(0,7); // YYYY-MM
    if (!map[key]) map[key] = { key, revenue:0, count:0 };
    map[key].revenue += b.total || 0;
    map[key].count += 1;
  });
  const top = Object.values(map).sort((a,b)=>b.revenue-a.revenue).slice(0, 6);
  const rankClass = ['gold','silver','bronze','','',''];
  const wrap = document.getElementById('topMonthsList');

  if (!top.length) {
    wrap.innerHTML = `<div class="empty-state">Chưa có dữ liệu doanh thu.</div>`;
    return;
  }

  wrap.innerHTML = top.map((m, i) => {
    const [y, mo] = m.key.split('-');
    const label = `Tháng ${parseInt(mo)}/${y}`;
    return `<div class="mini-item">
      <div class="mini-rank ${rankClass[i]||''}">${i+1}</div>
      <div class="mini-main">
        <div class="mini-title">${label}</div>
        <div class="mini-sub">${m.count} booking xác nhận</div>
      </div>
      <div class="mini-val">${money(m.revenue)}</div>
    </div>`;
  }).join('');
}

/* ── TOP QUARTERS: uses ALL confirmed bookings ── */
function renderTopQuarters() {
  const confirmed = getConfirmed(getBookings()); // all-time
  const map = {};
  confirmed.forEach(b => {
    if (!b.date) return;
    const d = new Date(b.date + 'T00:00:00');
    const y = d.getFullYear();
    const q = Math.ceil((d.getMonth() + 1) / 3);
    const key = `${y}-Q${q}`;
    if (!map[key]) map[key] = { key, year:y, quarter:q, revenue:0, count:0 };
    map[key].revenue += b.total || 0;
    map[key].count += 1;
  });
  const top = Object.values(map).sort((a,b)=>b.revenue-a.revenue).slice(0, 6);
  const rankClass = ['gold','silver','bronze','','',''];
  const wrap = document.getElementById('topQuartersList');

  if (!top.length) {
    wrap.innerHTML = `<div class="empty-state">Chưa có dữ liệu doanh thu.</div>`;
    return;
  }

  wrap.innerHTML = top.map((q, i) => {
    return `<div class="mini-item">
      <div class="mini-rank ${rankClass[i]||''}">${i+1}</div>
      <div class="mini-main">
        <div class="mini-title">Quý ${q.quarter} / ${q.year}</div>
        <div class="mini-sub">${q.count} booking xác nhận</div>
      </div>
      <div class="mini-val">${money(q.revenue)}</div>
    </div>`;
  }).join('');
}


function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}