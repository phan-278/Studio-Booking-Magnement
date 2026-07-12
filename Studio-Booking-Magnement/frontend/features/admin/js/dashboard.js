const BOOKINGS_KEY  = 'kep_bookings';
const USERS_KEY     = 'kep_users';
const EQUIPMENT_KEY = 'kep_equipment';

const STATUS_LABEL = { pending:'Chờ duyệt', confirmed:'Đã xác nhận', rejected:'Từ chối', cancelled:'Đã hủy' };
const STATUS_BADGE = { pending:'badge-pending', confirmed:'badge-confirmed', rejected:'badge-rejected', cancelled:'badge-cancelled' };

const TODAY = new Date().toISOString().split('T')[0];

document.getElementById('todayDate').textContent = new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

// Seed demo data if empty — place some bookings on TODAY
function ensureDemoData() {
  const bk = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  if (bk.length) return;
  const zones = ['O','C','Full'];
  const names = ['Nguyễn Thị Mai','Trần Văn Hùng','Lê Thu Hương','Phạm Minh Đức','Võ Thị Lan'];
  const phones = ['0901234567','0912345678','0923456789','0934567890','0945678901'];
  const statuses = ['pending','confirmed','pending','confirmed','cancelled'];
  const demo = [];
  // 3 bookings today
  for (let i = 0; i < 3; i++) {
    const zone = zones[i];
    const base = zone === 'O' ? 600 : zone === 'C' ? 500 : 1000;
    const dur = 2 + i;
    const total = base + (dur-2)*(zone==='Full'?400:250);
    demo.push({
      id: 'BK-TODAY-' + (i+1),
      name: names[i], phone: phones[i], email: names[i].toLowerCase().replace(' ','')+'@gmail.com',
      zone, date: TODAY,
      startTime: String(8 + i*3).padStart(2,'0') + ':00',
      duration: dur,
      total, deposit: Math.round(total/2),
      purpose: ['Photography','Videography','Fashion'][i],
      status: statuses[i],
      createdAt: new Date().toISOString(),
    });
  }
  // a few historical bookings
  for (let i = 3; i < 8; i++) {
    const d = new Date(); d.setDate(d.getDate() - (i-2));
    const zone = zones[i % 3];
    const base = zone === 'O' ? 600 : zone === 'C' ? 500 : 1000;
    const dur = 2;
    demo.push({
      id: 'BK-' + String(i+1).padStart(4,'0'),
      name: names[i % names.length], phone: phones[i % phones.length],
      zone, date: d.toISOString().split('T')[0],
      startTime: '10:00', duration: dur,
      total: base, deposit: Math.round(base/2),
      status: statuses[i % statuses.length],
      createdAt: new Date(d.getTime() - 86400000).toISOString(),
    });
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(demo));
}

ensureDemoData();

document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderTodayBookings();
  renderActivity();
  renderRecentTable();
  renderQuickStats();
});

function getBookings() { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]'); }
function getUsers()    { return JSON.parse(localStorage.getItem(USERS_KEY)    || '[]'); }
function getEquip()    { return JSON.parse(localStorage.getItem(EQUIPMENT_KEY)|| '[]'); }
function getTodayBk()  { return getBookings().filter(b => b.date === TODAY); }

function renderStats() {
  const bk = getBookings();
  const todayBk = getTodayBk();
  const us = getUsers();

  const todayTotal    = todayBk.length;
  const todayPending  = todayBk.filter(b => b.status === 'pending').length;
  const todayRevenue  = todayBk.filter(b => b.status === 'confirmed').reduce((s,b) => s + (b.total||0), 0);
  const todayDeposit  = todayBk.filter(b => b.status === 'confirmed').reduce((s,b) => s + (b.deposit||0), 0);
  const todayUsers    = bk.filter(b => b.date === TODAY).map(b => b.email).filter((v,i,a) => v && a.indexOf(v)===i).length;
  const confirmRate   = todayTotal ? Math.round(todayBk.filter(b=>b.status==='confirmed').length/todayTotal*100) : 0;

  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card-d">
      <div class="stat-card-label">Booking Hôm Nay</div>
      <div class="stat-card-value">${todayTotal}</div>
      <div class="stat-card-sub">${todayPending} đang chờ duyệt</div>
    </div>
    <div class="stat-card-d">
      <div class="stat-card-label">Doanh Thu Hôm Nay</div>
      <div class="stat-card-value red">${todayRevenue.toLocaleString()}K</div>
      <div class="stat-card-sub">Cọc: ${todayDeposit.toLocaleString()}K</div>
    </div>
    <div class="stat-card-d">
      <div class="stat-card-label">Khách Hôm Nay</div>
      <div class="stat-card-value">${todayUsers || todayBk.length}</div>
      <div class="stat-card-sub">Lượt đặt lịch</div>
    </div>
    <div class="stat-card-d">
      <div class="stat-card-label">Tỉ Lệ Xác Nhận</div>
      <div class="stat-card-value green">${confirmRate}%</div>
      <div class="stat-card-sub">Trong ngày hôm nay</div>
    </div>
  `;
}

function renderQuickStats() {
  const pending = getBookings().filter(b => b.status === 'pending').length;
  const equip   = getEquip().length;
  document.getElementById('qaPending').textContent = pending + ' đang chờ';
  document.getElementById('qaEquip').textContent   = equip + ' thiết bị';
}

function renderTodayBookings() {
  const todayBk = getTodayBk();
  const wrap = document.getElementById('todayBookingsList');

  if (!todayBk.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:32px;color:var(--warm-grey);font-family:var(--font-body);font-size:.64rem;">Chưa có booking nào hôm nay.</div>';
    return;
  }

  wrap.innerHTML = todayBk.map(b => {
    const end = endTime(b.startTime, b.duration);
    return `
    <div class="today-bk-item" onclick="void(0)">
      <div class="today-bk-zone">${b.zone}</div>
      <div class="today-bk-info">
        <div class="today-bk-name">${b.name||'—'} <span style="color:var(--warm-grey);font-weight:400;">· ${b.phone||''}</span></div>
        <div class="today-bk-time">${b.startTime||'—'} – ${end} · ${b.purpose||''}</div>
      </div>
      <div class="today-bk-right">
        <div class="today-bk-amount">${b.total ? b.total.toLocaleString()+'K' : 'Liên hệ'}</div>
        <span class="badge ${STATUS_BADGE[b.status]||''}">${STATUS_LABEL[b.status]||b.status}</span>
      </div>
    </div>`;
  }).join('');
}

function renderActivity() {
  // Show today's activity only
  const todayBk = getTodayBk().slice(0, 8);
  const feed = document.getElementById('activityFeed');

  if (!todayBk.length) {
    feed.innerHTML = '<div style="font-family:var(--font-body);font-size:.64rem;color:var(--warm-grey);padding:16px 0;">Chưa có hoạt động nào hôm nay.</div>';
    return;
  }

  feed.innerHTML = todayBk.map(b => {
    const time = b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit'}) : '—';
    const statusText = { pending:'đặt lịch mới', confirmed:'được xác nhận', rejected:'bị từ chối', cancelled:'đã hủy' }[b.status] || b.status;
    return `
    <div class="activity-item">
      <div class="activity-dot ${b.status}"></div>
      <div class="activity-text"><strong>${b.name || 'Khách'}</strong> ${statusText} — ${b.zone} Zone</div>
      <div class="activity-time">${time}</div>
    </div>`;
  }).join('');
}

function renderRecentTable() {
  // Show only today's bookings in the recent table
  const bk = getTodayBk();
  const tbody = document.getElementById('recentTbody');

  if (!bk.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--warm-grey);font-size:.64rem;">Chưa có booking nào hôm nay.</td></tr>`;
    return;
  }

  tbody.innerHTML = bk.map((b, i) => `
    <tr>
      <td style="font-size:.5rem;color:var(--warm-grey);">${b.id || ('#' + (i+1))}</td>
      <td><strong>${b.name||'—'}</strong><br><span style="font-size:.56rem;color:var(--warm-grey);">${b.phone||''}</span></td>
      <td>${b.zone||'—'}</td>
      <td>${b.date ? formatDate(b.date) : '—'}</td>
      <td>${b.startTime||'—'} – ${endTime(b.startTime, b.duration)}</td>
      <td>${b.total ? b.total.toLocaleString() + 'K' : 'Liên hệ'}</td>
      <td><span class="badge ${STATUS_BADGE[b.status]||''}">${STATUS_LABEL[b.status]||b.status}</span></td>
      <td>
        <div class="tbl-actions">
          ${b.status === 'pending' ? `
            <button class="tbl-action-btn confirm" onclick="actBooking('${b.id}','confirmed')">✓</button>
            <button class="tbl-action-btn reject"  onclick="actBooking('${b.id}','rejected')">✕</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

window.actBooking = function(id, status) {
  const bk = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  const b = bk.find(x => x.id === id);
  if (b) { b.status = status; localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bk)); }
  showToast(status === 'confirmed' ? '✓ Đã xác nhận booking.' : '✕ Đã từ chối booking.');
  renderStats(); renderRecentTable(); renderActivity(); renderTodayBookings(); renderQuickStats();
}

function formatDate(str) { if(!str) return '—'; const [y,m,d] = str.split('-'); return `${d}/${m}/${y}`; }
function endTime(s, dur) {
  if(!s||!dur) return '—';
  const [h,m] = s.split(':').map(Number);
  const total = h*60 + m + Math.round(Number(dur)*60);
  return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
}


function showToast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),3000); }