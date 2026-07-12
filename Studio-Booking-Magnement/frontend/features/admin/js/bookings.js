const BOOKINGS_KEY = 'kep_bookings';
const STATUS_LABEL = { pending:'Chờ duyệt', confirmed:'Đã xác nhận', rejected:'Từ chối', cancelled:'Đã hủy' };
const STATUS_BADGE = { pending:'badge-pending', confirmed:'badge-confirmed', rejected:'badge-rejected', cancelled:'badge-cancelled' };
const ZONES = ['O','C','Full'];
const ZONE_NAMES = { O:'O Zone', C:'C Zone', Full:'Full House' };
const ZONE_COLORS = {
  O:    { dark:'var(--zone-o-dark)', text:'var(--zone-o-text)' },
  C:    { dark:'var(--zone-c-dark)', text:'var(--zone-c-text)' },
  Full: { dark:'var(--zone-f-dark)', text:'var(--zone-f-text)' },
};
const HOUR_START = 7;
const HOUR_END   = 22;
const HOURS      = HOUR_END - HOUR_START;
const PX_PER_H   = 64;

let currentFilter = 'all';
let currentPage   = 1;
const PAGE_SIZE   = 10;
let calMode = 'day'; // 'day' | 'week'
let calDate = new Date(); // currently viewed date
let miniMonth = new Date(); // mini-cal month

document.getElementById('todayDate').textContent = new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

// Populate start time options
(function() {
  const sel = document.getElementById('qa-start');
  for (let i = 0; i < HOURS * 2; i++) {
    const totalMins = HOUR_START * 60 + i * 30;
    const h = String(Math.floor(totalMins/60)).padStart(2,'0');
    const m = totalMins % 60 === 0 ? '00' : '30';
    sel.insertAdjacentHTML('beforeend', `<option value="${h}:${m}">${h}:${m}</option>`);
  }
})();

// ── Demo Data ──
function ensureDemoData() {
  const bk = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  if (bk.length) return;
  const today = new Date().toISOString().split('T')[0];
  const zones = ['O','C','Full'];
  const names = ['Nguyễn Thị Mai','Trần Văn Hùng','Lê Thu Hương','Phạm Minh Đức','Võ Thị Lan','Đặng Quốc Tuấn','Hoàng Yến Nhi'];
  const phones = ['0901234567','0912345678','0923456789','0934567890','0945678901','0956789012','0967890123'];
  const statuses = ['pending','confirmed','confirmed','rejected','pending'];
  const demo = [];
  // Today bookings
  [['O','08:00',2,'pending'],['C','10:00',3,'confirmed'],['Full','14:00',4,'pending'],['O','16:00',2,'confirmed']].forEach(([zone,st,dur,status], i) => {
    const base = zone==='O'?600:zone==='C'?500:1000;
    const extra = (dur-2)*(zone==='Full'?400:250);
    const total = base + Math.max(0,extra);
    demo.push({ id:'BK-TODAY-'+(i+1), name:names[i], phone:phones[i], email:'test@gmail.com', zone, date:today, startTime:st, duration:dur, total, deposit:Math.round(total/2), purpose:['Photography','Videography','Fashion','Event'][i], status, createdAt:new Date().toISOString() });
  });
  // Past bookings
  for (let i = 0; i < 16; i++) {
    const d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random()*10)+1);
    const dateStr = d.toISOString().split('T')[0];
    const zone = zones[i%3];
    const base = zone==='O'?600:zone==='C'?500:1000;
    const dur = 2;
    demo.push({ id:'BK-'+String(i+10).padStart(4,'0'), name:names[i%names.length], phone:phones[i%phones.length], zone, date:dateStr, startTime:String(8+i%8).padStart(2,'0')+':00', duration:dur, total:base, deposit:Math.round(base/2), purpose:'Photography', status:statuses[i%statuses.length], createdAt:new Date(d.getTime()-86400000).toISOString() });
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(demo));
}

ensureDemoData();

function getBookings() { return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]'); }
function saveBookings(bk) { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bk)); }

// ── VIEW TOGGLE ──
function switchView(v) {
  const isCalendar = v === 'calendar';
  document.getElementById('calendarView').classList.toggle('hidden', !isCalendar);
  document.getElementById('tableView').classList.toggle('hidden', isCalendar);
  document.getElementById('tabCal').classList.toggle('active', isCalendar);
  document.getElementById('tabList').classList.toggle('active', !isCalendar);
  if (!isCalendar) renderTable();
}

// ── STATS ──
function renderStats() {
  const bk = getBookings();
  const pending   = bk.filter(b => b.status==='pending').length;
  const confirmed = bk.filter(b => b.status==='confirmed').length;
  const revenue   = bk.filter(b => b.status==='confirmed').reduce((s,b) => s+(b.total||0),0);
  const deposit   = bk.filter(b => b.status==='confirmed').reduce((s,b) => s+(b.deposit||0),0);
  const today     = new Date().toISOString().split('T')[0];
  const todayBk   = bk.filter(b => b.date===today).length;
  document.getElementById('bkStats').innerHTML = `
    <div class="stat-card"><div class="stat-card-label">Tổng Booking</div><div class="stat-card-value">${bk.length}</div><div class="stat-card-sub">Tất cả</div></div>
    <div class="stat-card"><div class="stat-card-label">Chờ Duyệt</div><div class="stat-card-value orange">${pending}</div><div class="stat-card-sub">Cần xử lý</div></div>
    <div class="stat-card"><div class="stat-card-label">Đã Xác Nhận</div><div class="stat-card-value green">${confirmed}</div><div class="stat-card-sub">Đã duyệt</div></div>
    <div class="stat-card"><div class="stat-card-label">Doanh Thu</div><div class="stat-card-value red">${revenue.toLocaleString()}K</div><div class="stat-card-sub">Cọc: ${deposit.toLocaleString()}K</div></div>
    <div class="stat-card"><div class="stat-card-label">Hôm Nay</div><div class="stat-card-value">${todayBk}</div><div class="stat-card-sub">Booking ngày hôm nay</div></div>
  `;
}

// ════════════════════════════════════════
// CALENDAR MODE
// ════════════════════════════════════════
function setCalMode(mode) {
  calMode = mode;
  document.getElementById('vDay').classList.toggle('active', mode==='day');
  document.getElementById('vWeek').classList.toggle('active', mode==='week');
  renderCalendar();
}

function calPrev() {
  if (calMode==='day') calDate.setDate(calDate.getDate()-1);
  else calDate.setDate(calDate.getDate()-7);
  renderCalendar();
}

function calNext() {
  if (calMode==='day') calDate.setDate(calDate.getDate()+1);
  else calDate.setDate(calDate.getDate()+7);
  renderCalendar();
}

function calGoToday() {
  calDate = new Date();
  renderCalendar();
}

function renderCalendar() {
  updateCalDateLabel();
  if (calMode==='day') renderDayView();
  else renderWeekView();
  renderMiniCal();
}

function updateCalDateLabel() {
  const el = document.getElementById('calDateLabel');
  if (calMode==='day') {
    const isToday = toDateStr(calDate) === toDateStr(new Date());
    el.textContent = calDate.toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'long', year:'numeric' }) + (isToday ? ' — Hôm nay' : '');
  } else {
    const weekStart = getWeekStart(calDate);
    const weekEnd   = new Date(weekStart); weekEnd.setDate(weekEnd.getDate()+6);
    el.textContent = weekStart.toLocaleDateString('vi-VN',{day:'2-digit',month:'short'}) + ' – ' + weekEnd.toLocaleDateString('vi-VN',{day:'2-digit',month:'short',year:'numeric'});
  }
}

// DAY VIEW — 3 zone columns side by side (like Google Calendar's weekly but zones instead of days)
function renderDayView() {
  const dateStr = toDateStr(calDate);
  const bk = getBookings().filter(b => b.date === dateStr);
  const today = toDateStr(new Date());

  // Header zones
  const headerZones = document.getElementById('tracksHeaderZones');
  headerZones.innerHTML = ZONES.map(zone => {
    const zoneBk = bk.filter(b => b.zone===zone);
    return `
      <div class="track-zone-header">
        <span class="track-zone-dot" style="background:${getComputedStyle(document.documentElement).getPropertyValue(
          zone==='O'?'--zone-o-dark':zone==='C'?'--zone-c-dark':'--zone-f-dark'
        ).trim() || (zone==='O'?'#2E7D32':zone==='C'?'#1565C0':'#c62828')}"></span>
        <span class="track-zone-label">${ZONE_NAMES[zone]}</span>
        <span class="track-zone-count">${zoneBk.length} booking</span>
      </div>`;
  }).join('');

  // Time ruler
  const ruler = document.getElementById('timeRuler');
  ruler.innerHTML = Array.from({length:HOURS+1},(_,i) => {
    const h = HOUR_START+i;
    return `<div class="time-ruler-cell" style="height:${PX_PER_H}px"><span>${String(h).padStart(2,'0')}:00</span></div>`;
  }).join('');

  // Zone track columns
  const container = document.getElementById('zonesContainer');
  container.innerHTML = ZONES.map(zone => {
    const zoneBk = bk.filter(b => b.zone===zone);
    const trackH = HOURS * PX_PER_H;
    const hourLines = Array.from({length:HOURS},(_,i) =>
      `<div class="zone-hour-line" style="top:${i*PX_PER_H}px"></div>`
    ).join('');
    const halfLines = Array.from({length:HOURS},(_,i) =>
      `<div class="zone-half-line" style="top:${i*PX_PER_H+PX_PER_H/2}px"></div>`
    ).join('');

    const blocks = zoneBk.map(b => buildBlock(b)).join('');

    // Now line (only for today)
    let nowLine = '';
    if (dateStr === today) {
      const now = new Date();
      const nowMins = now.getHours()*60 + now.getMinutes();
      const top = (nowMins - HOUR_START*60) / 60 * PX_PER_H;
      if (top >= 0 && top <= trackH) {
        nowLine = `<div class="now-line" style="top:${top}px"></div>`;
      }
    }

    return `
      <div class="zone-track-col" data-zone="${zone}" style="min-height:${trackH}px"
           onclick="onTrackClick(event,'${zone}','${dateStr}')">
        ${hourLines}${halfLines}${nowLine}${blocks}
      </div>`;
  }).join('');

  // Scroll to 8am
  const scroll = document.getElementById('tracksScroll');
  scroll.scrollTop = (8-HOUR_START)*PX_PER_H;
}

// WEEK VIEW — for each day show compressed booking dots
function renderWeekView() {
  const weekStart = getWeekStart(calDate);
  const days = Array.from({length:7},(_,i) => {
    const d = new Date(weekStart); d.setDate(d.getDate()+i);
    return d;
  });
  const bk = getBookings();
  const today = toDateStr(new Date());

  // Header: 3 zones, but columns are days × zones interleaved
  // Simpler: for week view, each column = day, rows = zones
  const headerZones = document.getElementById('tracksHeaderZones');
  headerZones.innerHTML = days.map(d => {
    const ds = toDateStr(d);
    const isToday = ds===today;
    const dayBk = bk.filter(b => b.date===ds);
    const dow = ['CN','T2','T3','T4','T5','T6','T7'][d.getDay()];
    return `
      <div class="track-zone-header" style="cursor:pointer;flex-direction:column;align-items:center;gap:4px;${isToday?'background:rgba(163,28,28,.04);':''}" onclick="calDate=new Date('${ds}T12:00:00');setCalMode('day')">
        <div style="font-family:var(--font-body);font-size:.48rem;letter-spacing:.1em;color:var(--warm-grey);">${dow}</div>
        <div style="font-family:var(--font-brand);font-size:${isToday?'1.1rem':'.9rem'};font-weight:700;color:${isToday?'var(--red)':'var(--ink)'};${isToday?'background:var(--red);color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;':''}">${d.getDate()}</div>
        <div style="font-size:.46rem;color:var(--warm-grey);">${dayBk.length} BK</div>
      </div>`;
  }).join('');

  // Time ruler
  const ruler = document.getElementById('timeRuler');
  ruler.innerHTML = Array.from({length:HOURS+1},(_,i) => {
    const h = HOUR_START+i;
    return `<div class="time-ruler-cell" style="height:${PX_PER_H}px"><span>${String(h).padStart(2,'0')}:00</span></div>`;
  }).join('');

  // Zone columns = 7 days (week view: data-mode="week", data-date per column, zone kept from booking)
  const container = document.getElementById('zonesContainer');
  container.innerHTML = days.map(d => {
    const ds = toDateStr(d);
    const isToday = ds===today;
    const dayBk = bk.filter(b => b.date===ds);
    const trackH = HOURS*PX_PER_H;
    const hourLines = Array.from({length:HOURS},(_,i) => `<div class="zone-hour-line" style="top:${i*PX_PER_H}px"></div>`).join('');
    const blocks = dayBk.map(b => buildBlock(b, true)).join('');
    let nowLine='';
    if (isToday) {
      const now=new Date(); const top=(now.getHours()*60+now.getMinutes()-HOUR_START*60)/60*PX_PER_H;
      if(top>=0&&top<=trackH) nowLine=`<div class="now-line" style="top:${top}px"></div>`;
    }
    return `
      <div class="zone-track-col week-day-col" data-mode="week" data-date="${ds}" data-zone="week-day"
           style="min-height:${trackH}px;${isToday?'background:rgba(163,28,28,.018);':''}"
           onclick="onWeekColClick(event,'${ds}')">
        ${hourLines}${nowLine}${blocks}
      </div>`;
  }).join('');

  const scroll=document.getElementById('tracksScroll');
  scroll.scrollTop=(8-HOUR_START)*PX_PER_H;
}

function buildBlock(b, compact=false) {
  if (!b.startTime) return '';
  const [sh,sm] = b.startTime.split(':').map(Number);
  const startMins = sh*60+sm;
  const dur = Number(b.duration)||2;
  const top = (startMins - HOUR_START*60) / 60 * PX_PER_H;
  const height = Math.max(dur * PX_PER_H, 24);
  if (top < 0 || top > HOURS*PX_PER_H) return '';
  const endT = endTime(b.startTime, b.duration);
  const zoneClass = b.zone==='Full'?'zone-Full':'zone-'+b.zone;
  const statusClass = 'status-'+(b.status||'pending');
  const statusDot = b.status==='confirmed'?'●':'◌';
  const resizeHandle = compact ? '' : `<div class="cal-block-resize-handle" data-resize-id="${b.id}" title="Kéo để đổi thời lượng"></div>`;
  return `
    <div class="cal-block ${zoneClass} ${statusClass}"
         style="top:${top}px;height:${height}px;position:absolute;left:3px;right:3px;"
         data-block-id="${b.id}"
         onclick="event.stopPropagation();openDetail('${b.id}')"
         title="${b.name} · ${b.startTime}–${endT}">
      ${compact ? `
        <span class="cal-block-name" style="font-size:.5rem;">${b.name?.split(' ').pop()||'—'}</span>
        ${height>36 ? `<span class="cal-block-time" style="font-size:.46rem;">${b.startTime}</span>` : ''}
      ` : `
        <span class="cal-block-name">${statusDot} ${b.name||'—'}</span>
        ${height>36 ? `<span class="cal-block-time">${b.startTime} – ${endT}</span>` : ''}
        ${height>56 ? `<span class="cal-block-purpose">${b.purpose||''}</span>` : ''}
      `}
      ${resizeHandle}
    </div>`;
}

function onTrackClick(e, zone, dateStr) {
  if (e.target.closest('.cal-block')) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const relY  = e.clientY - rect.top;
  const totalMins = HOUR_START*60 + Math.round(relY/PX_PER_H*60 / 30)*30;
  const h = String(Math.floor(totalMins/60)).padStart(2,'0');
  const m = totalMins%60===0?'00':'30';
  openQuickAdd(zone, `${h}:${m}`, dateStr);
}

// Week view column click: if not dragging and not on a block → switch to day view
let _weekDragHappened = false;
function onWeekColClick(e, ds) {
  if (_weekDragHappened) { _weekDragHappened = false; return; }
  if (e.target.closest('.cal-block')) return;
  calDate = new Date(ds+'T12:00:00');
  setCalMode('day');
}

// Collision check: does any OTHER booking occupy zone+date with overlapping time?
function hasConflict(bookingId, zone, dateStr, startTime, duration) {
  const allBk = getBookings();
  const [sh, sm] = startTime.split(':').map(Number);
  const newStart = sh*60+sm;
  const newEnd   = newStart + Math.round(duration*60);
  return allBk.some(b => {
    if (b.id === bookingId) return false;
    if (b.zone !== zone || b.date !== dateStr) return false;
    if (b.status === 'rejected' || b.status === 'cancelled') return false;
    const [bh, bm] = (b.startTime||'00:00').split(':').map(Number);
    const bStart = bh*60+bm;
    const bEnd   = bStart + Math.round((b.duration||2)*60);
    return newStart < bEnd && newEnd > bStart;
  });
}

// ── MINI CALENDAR ──
function renderMiniCal() {
  const el   = document.getElementById('miniCalGrid');
  const lbl  = document.getElementById('miniCalMonth');
  const y    = miniMonth.getFullYear();
  const mo   = miniMonth.getMonth();
  const bk   = getBookings();
  const today = toDateStr(new Date());
  const selDate = toDateStr(calDate);

  lbl.textContent = new Date(y,mo,1).toLocaleDateString('vi-VN',{month:'long',year:'numeric'});

  const daysInMonth = new Date(y,mo+1,0).getDate();
  const firstDow    = new Date(y,mo,1).getDay(); // 0=Sun
  let html = '';

  // Prev month padding
  const prevDays = new Date(y,mo,0).getDate();
  for (let i = firstDow-1; i >= 0; i--) {
    html += `<button class="mini-day other-month">${prevDays-i}</button>`;
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${y}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const hasBk = bk.some(b => b.date===ds);
    const isToday = ds===today;
    const isSel   = ds===selDate;
    const cls = [
      'mini-day',
      hasBk?'has-booking':'',
      isToday?'today':'',
      isSel&&!isToday?'selected':'',
    ].filter(Boolean).join(' ');
    html += `<button class="${cls}" onclick="miniCalSelect('${ds}')" data-date="${ds}">${d}</button>`;
  }
  // Trailing days
  const total = firstDow + daysInMonth;
  const trailing = total % 7 === 0 ? 0 : 7 - total%7;
  for (let d = 1; d <= trailing; d++) {
    html += `<button class="mini-day other-month">${d}</button>`;
  }

  el.innerHTML = html;
}

function miniCalSelect(ds) {
  calDate = new Date(ds+'T12:00:00');
  miniMonth = new Date(calDate);
  calMode = 'day';
  document.getElementById('vDay').classList.add('active');
  document.getElementById('vWeek').classList.remove('active');
  renderCalendar();
}

function miniCalPrev() {
  miniMonth.setMonth(miniMonth.getMonth()-1);
  renderMiniCal();
}

function miniCalNext() {
  miniMonth.setMonth(miniMonth.getMonth()+1);
  renderMiniCal();
}

// ── QUICK-ADD ──
function openQuickAdd(zone='O', time='08:00', date=null) {
  const ds = date || toDateStr(calDate);
  document.getElementById('qa-name').value    = '';
  document.getElementById('qa-phone').value   = '';
  document.getElementById('qa-email').value   = '';
  document.getElementById('qa-zone').value    = zone;
  document.getElementById('qa-date').value    = ds;
  document.getElementById('qa-start').value   = time;
  document.getElementById('qa-dur').value     = '2';
  document.getElementById('qa-purpose').value = 'Photography';
  document.getElementById('qa-note').value    = '';
  document.getElementById('qa-err').textContent = '';
  document.getElementById('qaModal').classList.add('open');
}

function closeQuickAdd() {
  document.getElementById('qaModal').classList.remove('open');
}

function saveQuickAdd() {
  const name    = document.getElementById('qa-name').value.trim();
  const phone   = document.getElementById('qa-phone').value.trim();
  const email   = document.getElementById('qa-email').value.trim();
  const zone    = document.getElementById('qa-zone').value;
  const date    = document.getElementById('qa-date').value;
  const start   = document.getElementById('qa-start').value;
  const dur     = parseFloat(document.getElementById('qa-dur').value);
  const purpose = document.getElementById('qa-purpose').value;
  const note    = document.getElementById('qa-note').value.trim();
  const errEl   = document.getElementById('qa-err');

  if (!name)  { errEl.textContent='Vui lòng nhập họ tên.'; return; }
  if (!phone) { errEl.textContent='Vui lòng nhập số điện thoại.'; return; }
  if (!date)  { errEl.textContent='Vui lòng chọn ngày.'; return; }
  errEl.textContent='';

  const base  = zone==='O'?600:zone==='C'?500:1000;
  const extra = Math.max(0,dur-2)*(zone==='Full'?400:250);
  const total = base+extra;

  const bk = getBookings();
  const id = 'BK-'+String(Date.now()).slice(-6);
  bk.unshift({ id,name,phone,email,zone,date,startTime:start,duration:dur,purpose,note,total,deposit:Math.round(total/2),status:'pending',createdAt:new Date().toISOString() });
  saveBookings(bk);
  showToast('✓ Đã thêm booking '+id);
  closeQuickAdd();

  // Navigate to that date
  calDate = new Date(date+'T12:00:00');
  miniMonth = new Date(calDate);
  calMode='day';
  document.getElementById('vDay').classList.add('active');
  document.getElementById('vWeek').classList.remove('active');

  renderStats();
  renderCalendar();
}

// Click outside quick-add modal
document.getElementById('qaModal').addEventListener('click', e => {
  if (e.target.id==='qaModal') closeQuickAdd();
});

// ── TABLE VIEW ──
function setFilter(f, btn) {
  currentFilter=f; currentPage=1;
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  renderTable();
}

// ── Smart date/month/quarter parsing from query string
function parseDateQuery(q) {
  q = q.trim();
  // Quarter: Q1/2025, q2 2024, Quý 1 2025
  let m = q.match(/^q([1-4])[\/\s\-]?(\d{4})?$/i) || q.match(/^quý\s*([1-4])[\/\s]?(\d{4})?$/i);
  if (m) {
    const quarter = parseInt(m[1]);
    const year    = m[2] ? parseInt(m[2]) : new Date().getFullYear();
    const startM  = (quarter-1)*3; // 0-indexed
    return { type:'quarter', year, startMonth:startM, endMonth:startM+2 };
  }
  // Month: T3/2025, 03/2025, tháng 3 2025
  m = q.match(/^t(\d{1,2})[\/\-](\d{4})$/i) || q.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const mo = parseInt(m[1])-1; // 0-indexed
    const yr = parseInt(m[2]);
    return { type:'month', year:yr, month:mo };
  }
  // Day: 14/03, 14/03/2025, 14-03-2025
  m = q.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?$/);
  if (m) {
    const day = parseInt(m[1]);
    const mo  = parseInt(m[2])-1;
    const yr  = m[3] ? parseInt(m[3]) : null;
    return { type:'day', day, month:mo, year:yr };
  }
  return null;
}

function matchesDateQuery(booking, parsed) {
  if (!parsed || !booking.date) return false;
  const [y,mo,d] = booking.date.split('-').map(Number);
  const bMo = mo-1; // 0-indexed
  if (parsed.type==='day') {
    const sameDayMo = d===parsed.day && bMo===parsed.month;
    return parsed.year ? sameDayMo && y===parsed.year : sameDayMo;
  }
  if (parsed.type==='month') return y===parsed.year && bMo===parsed.month;
  if (parsed.type==='quarter') return y===parsed.year && bMo>=parsed.startMonth && bMo<=parsed.endMonth;
  return false;
}

function renderTable() {
  const q = (document.getElementById('searchInput')?.value||'').trim();
  const ql = q.toLowerCase();
  const parsed = parseDateQuery(q);

  let bk = getBookings();
  if (currentFilter!=='all') bk=bk.filter(b=>b.status===currentFilter);

  if (parsed) {
    bk = bk.filter(b => matchesDateQuery(b, parsed));
  } else if (ql) {
    bk = bk.filter(b =>
      (b.name||'').toLowerCase().includes(ql) ||
      (b.phone||'').includes(ql) ||
      (b.id||'').toLowerCase().includes(ql) ||
      (b.email||'').toLowerCase().includes(ql)
    );
  }

  bk.sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));

  const total=bk.length, pages=Math.ceil(total/PAGE_SIZE);
  const slice=bk.slice((currentPage-1)*PAGE_SIZE,currentPage*PAGE_SIZE);
  const tbody=document.getElementById('bookingTbody');

  if (!slice.length) {
    tbody.innerHTML=`<tr><td colspan="10" style="text-align:center;padding:40px;color:var(--warm-grey);font-size:.62rem;">Không tìm thấy booking nào.</td></tr>`;
  } else {
    tbody.innerHTML=slice.map(b => {
      const eqHtml = b.equipments?.length ? `<div class="equip-tags">${b.equipments.map(e=>`<span class="equip-tag">${e}</span>`).join('')}</div>` : `<span style="color:var(--warm-grey);font-size:.52rem;">—</span>`;
      const actionBtns = b.status==='pending' ? `
        <button class="tbl-btn confirm" onclick="actBooking('${b.id}','confirmed')">✓ Duyệt</button>
        <button class="tbl-btn reject"  onclick="actBooking('${b.id}','rejected')">✕ Từ chối</button>
      ` : '';
      return `<tr>
        <td><div class="booking-code">${b.id}</div></td>
        <td><div class="customer-name">${b.name||'—'}</div><div class="customer-meta">${b.purpose||''}</div></td>
        <td><div class="customer-meta">${b.phone||'—'}</div><div class="customer-meta">${b.email||'—'}</div></td>
        <td><span class="zone-badge">${b.zone}</span></td>
        <td style="white-space:nowrap;">${b.date?formatDate(b.date):'—'}</td>
        <td style="white-space:nowrap;">${b.startTime||'—'} – ${endTime(b.startTime,b.duration)}<br><span style="font-size:.52rem;color:var(--warm-grey);">${b.duration||'—'}h</span></td>
        <td>${eqHtml}</td>
        <td><div class="amount-cell">${b.total?b.total.toLocaleString()+'K':'Liên hệ'}</div><div class="deposit-cell">Cọc: ${b.deposit?b.deposit.toLocaleString()+'K':'—'}</div></td>
        <td><span class="badge ${STATUS_BADGE[b.status]||''}">${STATUS_LABEL[b.status]||b.status}</span></td>
        <td><div class="tbl-actions">${actionBtns}<button class="tbl-btn detail" onclick='openDetail("${b.id}")'>Chi tiết</button></div></td>
      </tr>`;
    }).join('');
  }

  const pg=document.getElementById('pagination');
  if (pages<=1){pg.innerHTML='';return;}
  let html=`<span class="page-info">${total} booking</span>`;
  if(currentPage>1) html+=`<button class="page-btn" onclick="goPage(${currentPage-1})">←</button>`;
  for(let i=1;i<=pages;i++) html+=`<button class="page-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  if(currentPage<pages) html+=`<button class="page-btn" onclick="goPage(${currentPage+1})">→</button>`;
  pg.innerHTML=html;
}

function goPage(p){currentPage=p;renderTable();}

function actBooking(id, status) {
  const bk=getBookings(); const b=bk.find(x=>x.id===id);
  if(b){b.status=status;saveBookings(bk);}
  showToast(status==='confirmed'?'✓ Đã xác nhận booking.':'✕ Đã từ chối booking.');
  renderStats(); renderTable(); renderCalendar();
  closeDetailModal();
}

function openDetail(id) {
  const bk=getBookings(); const b=bk.find(x=>x.id===id);
  if(!b) return;
  document.getElementById('modalTitle').textContent='Chi tiết · '+b.id;
  document.getElementById('modalContent').innerHTML=`
    <div class="detail-row"><span class="detail-label">Khách hàng</span><span class="detail-val">${b.name||'—'}</span></div>
    <div class="detail-row"><span class="detail-label">SĐT / Zalo</span><span class="detail-val">${b.phone||'—'}</span></div>
    <div class="detail-row"><span class="detail-label">Email</span><span class="detail-val">${b.email||'—'}</span></div>
    <div class="detail-row"><span class="detail-label">Zone</span><span class="detail-val"><span class="zone-badge">${b.zone}</span></span></div>
    <div class="detail-row"><span class="detail-label">Ngày</span><span class="detail-val">${b.date?formatDate(b.date):'—'}</span></div>
    <div class="detail-row"><span class="detail-label">Giờ</span><span class="detail-val">${b.startTime||'—'} – ${endTime(b.startTime,b.duration)} (${b.duration||'—'}h)</span></div>
    <div class="detail-row"><span class="detail-label">Mục đích</span><span class="detail-val">${b.purpose||'—'}</span></div>
    <div class="detail-row"><span class="detail-label">Thiết bị</span><span class="detail-val">${b.equipments?.join(', ')||'Không có'}</span></div>
    <div class="detail-row"><span class="detail-label">Tổng tiền</span><span class="detail-val" style="color:var(--red);font-weight:600;">${b.total?b.total.toLocaleString()+'K':'Liên hệ'}</span></div>
    <div class="detail-row"><span class="detail-label">Đặt cọc 50%</span><span class="detail-val">${b.deposit?b.deposit.toLocaleString()+'K':'—'}</span></div>
    <div class="detail-row"><span class="detail-label">Ghi chú</span><span class="detail-val">${b.note||'—'}</span></div>
    <div class="detail-row"><span class="detail-label">Trạng thái</span><span class="detail-val"><span class="badge ${STATUS_BADGE[b.status]||''}">${STATUS_LABEL[b.status]||b.status}</span></span></div>
    <div class="detail-row"><span class="detail-label">Ngày đặt</span><span class="detail-val">${b.createdAt?new Date(b.createdAt).toLocaleString('vi-VN'):'—'}</span></div>
  `;
  const actions=document.getElementById('modalActions');
  actions.innerHTML=b.status==='pending'?`
    <button class="tbl-btn reject" onclick="actBooking('${b.id}','rejected')">✕ Từ chối</button>
    <button class="tbl-btn confirm" onclick="actBooking('${b.id}','confirmed')">✓ Xác nhận</button>
  `:`<button class="tbl-btn detail" onclick="closeDetailModal()">Đóng</button>`;
  document.getElementById('detailModal').classList.add('open');
}

function closeDetailModal() { document.getElementById('detailModal').classList.remove('open'); }
document.getElementById('detailModal').addEventListener('click', e => { if(e.target.id==='detailModal') closeDetailModal(); });

// ── HELPERS ──
function toDateStr(d) {
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function formatDate(str) { if(!str) return '—'; const [y,m,d]=str.split('-'); return `${d}/${m}/${y}`; }
function endTime(s,dur) {
  if(!s||!dur) return '—';
  const [h,m]=s.split(':').map(Number);
  const total=h*60+m+Math.round(Number(dur)*60);
  return String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');
}
function getWeekStart(d) {
  const dt=new Date(d); dt.setHours(0,0,0,0);
  const dow=dt.getDay(); dt.setDate(dt.getDate()-dow); return dt;
}

function showToast(msg, warn=false) { const t=document.getElementById('toast'); t.textContent=msg; t.classList.toggle('warn',warn); t.classList.add('show'); setTimeout(()=>{t.classList.remove('show');t.classList.remove('warn');},3500); }

// ════════════════════════════════════════
// DRAG & DROP SYSTEM
// ════════════════════════════════════════

/* Helper: snap px to nearest 30-min grid */
function snapToHalf(y) {
  return Math.round(y / (PX_PER_H / 2)) * (PX_PER_H / 2);
}

/* Convert absolute Y inside a track → "HH:MM" */
function yToTime(y) {
  const totalMins = Math.round((y / PX_PER_H * 60 + HOUR_START * 60) / 30) * 30;
  const clamped   = Math.max(HOUR_START*60, Math.min((HOUR_END-0.5)*60, totalMins));
  const h = Math.floor(clamped/60);
  const m = clamped%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

/* Zone color map for ghost styling */
const GHOST_COLORS = {
  O:    { bg:'#e8f5e9', border:'#2E7D32', text:'#1a5c1a' },
  C:    { bg:'#e3f2fd', border:'#1565C0', text:'#0d3b7a' },
  Full: { bg:'#fce4ec', border:'#c62828', text:'#7a0c2e' },
};

/* Delegated mousedown on zonesContainer — catch all .cal-block drags */
function initDragSystem() {
  const container = document.getElementById('zonesContainer');
  if (!container) return;

  container.addEventListener('mousedown', function(e) {
    // Resize handle takes priority
    if (e.target.classList.contains('cal-block-resize-handle')) return;

    const blockEl = e.target.closest('.cal-block[data-block-id]');
    if (!blockEl) return;

    e.preventDefault();
    e.stopPropagation();

    const bookingId = blockEl.dataset.blockId;
    const bkList    = getBookings();
    const booking   = bkList.find(x => x.id === bookingId);
    if (!booking) return;

    const isWeekMode = calMode === 'week';
    const blockRect  = blockEl.getBoundingClientRect();
    const offsetY    = e.clientY - blockRect.top;
    const col        = GHOST_COLORS[booking.zone] || GHOST_COLORS['O'];

    // Mark original as ghost placeholder
    blockEl.classList.add('dragging');

    // Create ghost
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.style.cssText = `
      width:${blockRect.width}px;
      height:${blockRect.height}px;
      background:${col.bg};
      border-color:${col.border};
      color:${col.text};
      left:${e.clientX - 20}px;
      top:${e.clientY - offsetY}px;
    `;
    ghost.innerHTML = `
      <span class="cal-block-name">${booking.name||'—'}</span>
      <span class="cal-block-time" id="ghost-time-label">${booking.startTime}</span>
      <span class="cal-block-time" id="ghost-date-label" style="font-size:.46rem;opacity:.7;">${isWeekMode ? formatDate(booking.date) : ''}</span>
    `;
    document.body.appendChild(ghost);

    // In day mode: current drop zone; in week mode: current drop date
    let currentZone = booking.zone;
    let currentDate = booking.date;

    let hasMoved = false;

    function onMove(ev) {
      hasMoved = true;
      ghost.style.left = `${ev.clientX - 20}px`;
      ghost.style.top  = `${ev.clientY - offsetY}px`;

      document.querySelectorAll('.zone-track-col.drag-over').forEach(el => el.classList.remove('drag-over'));
      document.querySelectorAll('.drop-preview').forEach(el => el.remove());

      ghost.style.pointerEvents = 'none';
      const elUnder = document.elementFromPoint(ev.clientX, ev.clientY);
      ghost.style.pointerEvents = 'none';

      const trackEl = elUnder?.closest('.zone-track-col');
      if (trackEl) {
        if (isWeekMode) {
          // Week mode: columns = days, zone stays the same
          currentDate = trackEl.dataset.date || currentDate;
          currentZone = booking.zone; // keep original zone
        } else {
          // Day mode: columns = zones, date stays the same
          currentZone = trackEl.dataset.zone || currentZone;
          currentDate = booking.date;
        }

        trackEl.classList.add('drag-over');

        const tRect  = trackEl.getBoundingClientRect();
        const relY   = ev.clientY - tRect.top - offsetY;
        const snapY  = snapToHalf(Math.max(0, relY));
        const newT   = yToTime(snapY);

        // Update ghost labels
        const lbl = ghost.querySelector('#ghost-time-label');
        if (lbl) lbl.textContent = `${newT} → ${endTime(newT, booking.duration)}`;
        const dlbl = ghost.querySelector('#ghost-date-label');
        if (dlbl && isWeekMode) dlbl.textContent = formatDate(currentDate);

        // Drop preview color based on zone (always booking.zone in week mode)
        const previewZone = isWeekMode ? booking.zone : currentZone;
        const c = GHOST_COLORS[previewZone] || GHOST_COLORS['O'];
        const preview = document.createElement('div');
        preview.className = 'drop-preview';
        preview.style.cssText = `top:${snapY}px;height:${blockRect.height}px;border-color:${c.border};background:${c.bg};`;
        trackEl.appendChild(preview);
      }
    }

    function onUp(ev) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';

      ghost.remove();
      blockEl.classList.remove('dragging');
      document.querySelectorAll('.zone-track-col.drag-over').forEach(el => el.classList.remove('drag-over'));
      document.querySelectorAll('.drop-preview').forEach(el => el.remove());

      if (hasMoved) _weekDragHappened = true;

      // Compute drop target track
      ghost.style.pointerEvents = 'none';
      const elUnder = document.elementFromPoint(ev.clientX, ev.clientY);
      const trackEl = elUnder?.closest('.zone-track-col') ||
                      (isWeekMode
                        ? document.querySelector(`.zone-track-col[data-date="${currentDate}"]`)
                        : document.querySelector(`.zone-track-col[data-zone="${currentZone}"]`));
      if (!trackEl) return;

      const tRect   = trackEl.getBoundingClientRect();
      const relY    = ev.clientY - tRect.top - offsetY;
      const snapY   = snapToHalf(Math.max(0, relY));
      const newTime = yToTime(snapY);

      // Determine final zone/date
      const finalZone = isWeekMode ? booking.zone : (trackEl.dataset.zone || currentZone);
      const finalDate = isWeekMode ? (trackEl.dataset.date || currentDate) : booking.date;

      // Nothing changed
      if (newTime === booking.startTime && finalZone === booking.zone && finalDate === booking.date) return;

      // Collision check
      if (hasConflict(bookingId, finalZone, finalDate, newTime, booking.duration)) {
        const conflictZone = finalZone==='Full'?'Full House':finalZone+' Zone';
        const conflictDate = formatDate(finalDate);
        showToast(`⚠ Phòng ${conflictZone} ngày ${conflictDate} đã có booking vào khung giờ này!`, true);
        renderCalendar();
        return;
      }

      // Persist
      const allBk = getBookings();
      const rec   = allBk.find(x => x.id === bookingId);
      if (rec) {
        rec.startTime = newTime;
        rec.zone      = finalZone;
        rec.date      = finalDate;
        saveBookings(allBk);
        const zoneName = finalZone==='Full'?'Full House':finalZone+' Zone';
        if (isWeekMode) {
          showToast(`✓ Đã dời ${rec.name} → ${formatDate(finalDate)}, ${newTime}`);
        } else {
          showToast(`✓ Đã dời ${rec.name} → ${zoneName}, ${newTime}`);
        }
        renderCalendar();
        renderStats();
      }
    }

    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // ── RESIZE: delegated on zonesContainer ──
  container.addEventListener('mousedown', function(e) {
    const handle = e.target.closest('.cal-block-resize-handle');
    if (!handle) return;

    e.preventDefault();
    e.stopPropagation();

    const bookingId = handle.dataset.resizeId;
    const blockEl   = handle.closest('.cal-block');
    const bkList    = getBookings();
    const booking   = bkList.find(x => x.id === bookingId);
    if (!blockEl || !booking) return;

    const startY  = e.clientY;
    const origH   = blockEl.offsetHeight;
    document.body.style.userSelect = 'none';

    function onMove(ev) {
      const dy   = ev.clientY - startY;
      const newH = Math.max(PX_PER_H/2, origH + dy);
      blockEl.style.height = `${newH}px`;
      const durH = Math.round((newH / PX_PER_H) * 2) / 2;
      const lbl  = blockEl.querySelector('.cal-block-time');
      if (lbl) lbl.textContent = `${booking.startTime} – ${endTime(booking.startTime, durH)}`;
    }

    function onUp(ev) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.userSelect = '';

      const dy      = ev.clientY - startY;
      const newH    = Math.max(PX_PER_H/2, origH + dy);
      const durH    = Math.round((newH / PX_PER_H) * 2) / 2;
      const clamp   = Math.max(0.5, Math.min(durH, HOURS));

      const allBk = getBookings();
      const rec   = allBk.find(x => x.id === bookingId);
      if (rec) {
        rec.duration = clamp;
        saveBookings(allBk);
        showToast(`✓ Đã đổi thời lượng → ${clamp}h`);
        renderCalendar();
        renderStats();
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderCalendar();
  initDragSystem();
  // Re-init drag system after each calendar render (delegated, but container may be re-rendered)
  // Since we use delegation on #zonesContainer which persists, no need to re-init.
  // Update now-line every minute
  setInterval(() => { if(calMode==='day') renderDayView(); }, 60000);

  // Search hint focus
  const si = document.getElementById('searchInput');
  const sh = document.getElementById('searchHint');
  if (si && sh) {
    si.addEventListener('focus', () => sh.classList.add('visible'));
    si.addEventListener('blur',  () => setTimeout(() => sh.classList.remove('visible'), 200));
  }
});