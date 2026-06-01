import { getBookings, addBooking, updateBookingStatus } from '../../services/api.js';
import { BASE_PRICES, ADD_PRICES } from '../../utils/constants.js';
import { toDateStr, formatDate, getSelectedZone, openModal, closeModal, showToast } from '../../utils/helpers.js';

/* ==========
   6. ZONE LIGHTBOX
================================================================ */
const ZONE_DATA = {
  O: {
    title: '"O" Zone — Lầu 1 (1F)',
    images: [], // empty — photos TBD
    info: `
      <strong>O Zone · 1F</strong><br>
      Sảnh chính rộng ~80m² với cột bê tông, ánh sáng tự nhiên cửa sổ vòm.<br>
      Điện 3 pha · Máy lạnh · Wifi tốc độ cao<br><br>
      <strong>Giá:</strong> 600K / 2 giờ đầu — 250K / giờ thêm
    `
  },
  C: {
    title: '"C" Zone — Lầu 2 (2F)',
    images: [],
    info: `
      <strong>C Zone · 2F</strong><br>
      Tầng thượng private, makeup 3 gương, phòng thay đồ, rèm lụa mờ.<br>
      Cầu thang biểu tượng đỏ · Natural light<br><br>
      <strong>Giá:</strong> 500K / 2 giờ đầu — 200K / giờ thêm
    `
  },
  Full: {
    title: 'Full House — Toàn bộ 2 tầng',
    images: [],
    info: `
      <strong>Full House</strong><br>
      Thuê trọn 2 tầng cho production lớn, workshop, pop-up event hoặc buổi chụp thương mại.<br>
      Cả 2 tầng · Setup support · Ưu tiên giờ cao điểm<br><br>
      <strong>Giá:</strong> Thương lượng trực tiếp
    `
  }
};

let _lightboxZone = 'O';

function openZoneLightbox(zone) {
  _lightboxZone = zone;
  const data = ZONE_DATA[zone];

  document.getElementById('lightboxTitle').textContent = data.title;
  document.getElementById('lightboxInfo').innerHTML    = data.info;

  const grid = document.getElementById('lightboxGrid');
  if (data.images.length > 0) {
    grid.innerHTML = data.images.map(src =>
      `<div class="lb-img" style="background-image:url('${src}')"></div>`
    ).join('');
  } else {
    // Empty state placeholder
    grid.innerHTML = `
      <div style="grid-column:1/-1;display:flex;align-items:center;justify-content:center;
                  min-height:160px;background:var(--ink);color:rgba(237,229,208,0.2);
                  font-family:'Playfair Display',serif;font-style:italic;font-size:1.1rem;">
        Hình ảnh sẽ được cập nhật sớm
      </div>`;
  }

  openModal('zoneLightbox');
}

function bookFromLightbox() {
  closeModal('zoneLightbox');
  const radioEl = document.querySelector(`input[name="zone"][value="${_lightboxZone}"]`);
  if (radioEl) { radioEl.checked = true; onZoneChange(); }
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.openZoneLightbox = openZoneLightbox;
window.bookFromLightbox = bookFromLightbox;




/* ==========
   7. CALENDAR & TIMELINE
================================================================ */
const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_LABELS   = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                        'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const TIMELINE_START = 8;
const TIMELINE_END   = 21;

let calDate        = new Date();
let calSelectedDay = null;
let timelineZone   = 'O';

// --- BIẾN CHO TÍNH NĂNG CHỌN NHANH THÁNG/NĂM ---
let _isPickingMonthYear = false;

function renderCalendar() {
  const y = calDate.getFullYear();
  const m = calDate.getMonth();
  
  // 1. Cập nhật tiêu đề & Gắn sự kiện mở Picker
  const calTitle = document.getElementById('calTitle');
  if (calTitle) {
    calTitle.innerHTML = `${MONTH_LABELS[m]} năm ${y} <span class="cal-chevron" style="font-size:0.7em; margin-left:4px; opacity:0.6;">${_isPickingMonthYear ? '▴' : '▾'}</span>`;
    calTitle.style.cursor = 'pointer';
    calTitle.onclick = toggleMonthYearPicker;
  }

  // 2. Render Weekdays
  const wdEl = document.getElementById('calWeekdays');
  if (wdEl) wdEl.innerHTML = WEEKDAY_LABELS.map(d => `<div class="wd">${d}</div>`).join('');

  // 3. Tính toán ngày tháng
  const firstDay      = new Date(y, m, 1).getDay();
  const daysInMonth   = new Date(y, m + 1, 0).getDate();
  const prevMonthDays = new Date(y, m, 0).getDate();
  const today         = new Date(); today.setHours(0, 0, 0, 0);
  const bookings      = typeof getBookings === 'function' ? getBookings() : [];

  // 4. Render Days Grid
  const grid = document.getElementById('calDays');
  if (grid) {
    grid.innerHTML = '';
    
    // Ngày tháng trước
    for (let i = firstDay - 1; i >= 0; i--) {
      grid.appendChild(makeDayCell(prevMonthDays - i, true, false, [], null));
    }

    // Ngày tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      const dt      = new Date(y, m, day);
      const dateStr = typeof toDateStr === 'function' ? toDateStr(dt) : dt.toISOString().split('T')[0];
      const isToday = dt.getTime() === today.getTime();
      const isSel   = dateStr === calSelectedDay;

      const dayBks = bookings.filter(b =>
        b.date === dateStr &&
        b.status !== 'rejected' &&
        (b.zone === timelineZone || b.zone === 'Full' || timelineZone === 'Full')
      );

      const cell = makeDayCell(day, false, isToday, dayBks, dateStr);
      if (isSel) cell.classList.add('selected');
      grid.appendChild(cell);
    }

    // Ngày tháng sau
    const filled = firstDay + daysInMonth;
    const remain = (7 - filled % 7) % 7;
    for (let i = 1; i <= remain; i++) {
      grid.appendChild(makeDayCell(i, true, false, [], null));
    }
  }

  // 5. Render Picker (Menu chọn năm tháng ẩn/hiện)
  renderMonthYearPicker();
}

// ==========================================
// CÁC HÀM XỬ LÝ CHỌN NHANH THÁNG/NĂM
// ==========================================
function toggleMonthYearPicker() {
  _isPickingMonthYear = !_isPickingMonthYear;
  renderCalendar();
}

function renderMonthYearPicker() {
  let picker = document.getElementById('month-year-picker');
  
  // Nếu chưa có thẻ div picker này trong HTML, tự động tạo nó
  if (!picker) {
    picker = document.createElement('div');
    picker.id = 'month-year-picker';
    const wdEl = document.getElementById('calWeekdays');
    if (wdEl) {
      // Chèn ngay trên phần hiển thị thứ trong tuần
      wdEl.parentNode.insertBefore(picker, wdEl);
    }
  }

  // Set class để ẩn/hiện dựa trên css
  picker.className = `month-year-picker ${_isPickingMonthYear ? 'show' : ''}`;
  
  if (!_isPickingMonthYear) return;

  const currentYear = calDate.getFullYear();
  const currentMonth = calDate.getMonth();
  
  // Render html cho Năm
  let yearsHtml = '<div class="picker-years">';
  const startYear = new Date().getFullYear();
  for (let y = startYear - 1; y <= startYear + 3; y++) {
    yearsHtml += `<div class="picker-item ${y === currentYear ? 'active' : ''}" onclick="selectQuickYear(${y})">${y}</div>`;
  }
  yearsHtml += '</div>';

  // Render html cho Tháng
  let monthsHtml = '<div class="picker-months">';
  MONTH_LABELS.forEach((name, idx) => {
    monthsHtml += `<div class="picker-item ${idx === currentMonth ? 'active' : ''}" onclick="selectQuickMonth(${idx})">${name}</div>`;
  });
  monthsHtml += '</div>';

  picker.innerHTML = yearsHtml + monthsHtml;
}

window.selectQuickMonth = function(m) {
  calDate.setMonth(m);
  _isPickingMonthYear = false; // Chọn xong tháng thì đóng
  renderCalendar();
};

window.selectQuickYear = function(y) {
  calDate.setFullYear(y);
  renderCalendar(); // Giữ menu mở để chọn tiếp tháng
};

// ==========================================
// CÁC HÀM CŨ GIỮ NGUYÊN (makeDayCell, Timeline...)
// ==========================================
function makeDayCell(dayNum, otherMonth, isToday, bookings, dateStr) {
  const cell = document.createElement('div');
  cell.className = 'cal-day' +
    (otherMonth ? ' other-month' : '') +
    (isToday    ? ' today' : '');

  const numEl = document.createElement('span');
  numEl.className = 'day-n';
  numEl.textContent = dayNum;
  cell.appendChild(numEl);

  if (bookings.length > 0) {
    const dots = document.createElement('div');
    dots.className = 'day-dots';
    bookings.forEach(b => {
      const d = document.createElement('span');
      d.className = 'ddot ' + (b.status === 'confirmed' ? 'ddot-confirmed' : 'ddot-pending');
      dots.appendChild(d);
    });
    cell.appendChild(dots);
  }

  if (dateStr) cell.onclick = () => selectDay(dateStr);
  return cell;
}

function selectDay(dateStr) {
  calSelectedDay = dateStr;
  document.querySelectorAll('.cal-day.selected').forEach(c => c.classList.remove('selected'));
  renderCalendar();
  
  const fDateEl = document.getElementById('fDate');
  if (fDateEl) fDateEl.value = dateStr;
  
  renderTimeline(dateStr);
}

window.calPrev = function() { 
  calDate.setMonth(calDate.getMonth() - 1); 
  _isPickingMonthYear = false; // Đổi tháng thì tắt picker
  renderCalendar(); 
};
window.calNext = function() { 
  calDate.setMonth(calDate.getMonth() + 1); 
  _isPickingMonthYear = false;
  renderCalendar(); 
};
window.switchTimelineZone = function(zone, btn) {
  timelineZone = zone;
  document.querySelectorAll('.tz-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderCalendar();
  if (calSelectedDay) renderTimeline(calSelectedDay);
};

function renderTimeline(dateStr) {
  const wrap     = document.getElementById('timelineWrap');
  if (!wrap) return;
  const bookings = (typeof getBookings === 'function' ? getBookings() : []).filter(b =>
    b.date === dateStr &&
    b.status !== 'rejected' &&
    (b.zone === timelineZone || b.zone === 'Full' || timelineZone === 'Full')
  );

  const hours    = TIMELINE_END - TIMELINE_START;
  const colCount = hours;
  let html = `<div class="tl-grid" style="--tl-cols:${colCount};">`;

  html += '<div class="tl-zone-label" style="font-size:.38rem;color:var(--warm-grey);">Giờ</div>';
  for (let h = TIMELINE_START; h < TIMELINE_END; h++) {
    html += `<div class="tl-hour-label">${h}h</div>`;
  }

  const zonesToShow = timelineZone === 'Full' ? ['O', 'C'] : [timelineZone];
  zonesToShow.forEach(z => {
    html += `<div class="tl-zone-label">${z}</div>`;
    const zoneBookings = bookings.filter(b => b.zone === z || b.zone === 'Full');

    for (let h = TIMELINE_START; h < TIMELINE_END; h++) {
      const booked = zoneBookings.find(b => {
        const start = parseInt((b.startTime || '08:00').split(':')[0]);
        const end   = parseInt((b.endTime   || '10:00').split(':')[0]);
        return h >= start && h < end;
      });

      if (booked) {
        const bStart = parseInt((booked.startTime || '08:00').split(':')[0]);
        const bEnd   = parseInt((booked.endTime   || '10:00').split(':')[0]);
        const span   = bEnd - bStart;
        if (h === bStart) {
          const statusClass = booked.status === 'confirmed' ? 'booked-confirmed' : 'booked-pending';
          const label       = booked.status === 'confirmed' ? '✓ ' + (booked.name || '') : '⏳ ' + (booked.name || 'Pending');
          html += `<div class="tl-cell ${statusClass}" style="grid-column: span ${span}; position:relative;">
                     <div class="tl-block ${booked.status}" title="${label}">${label}</div>
                   </div>`;
          h += span - 1;
        }
      } else {
        html += '<div class="tl-cell"></div>';
      }
    }
  });

  html += '</div>';

  const dLabel = document.createElement('div');
  dLabel.style.cssText = 'font-family:var(--font-body);font-size:.56rem;letter-spacing:.14em;color:var(--warm-grey);margin-bottom:8px;text-transform:uppercase;';
  dLabel.textContent = typeof formatDate === 'function' ? formatDate(dateStr) : dateStr;

  wrap.innerHTML = '';
  wrap.appendChild(dLabel);
  wrap.insertAdjacentHTML('beforeend', html);
}



/* ==========
   8. BOOKING FORM
================================================================ */
let currentStep = 1;
let selectedEquip = {};

function goStep(n) {
  if (n > currentStep && !validateStep(currentStep)) return;
  document.getElementById('fs' + currentStep).classList.remove('active');
  markStep(currentStep, 'done');
  currentStep = n;
  document.getElementById('fs' + currentStep).classList.add('active');
  markStep(currentStep, 'active');
  if (n === 5) renderSummary();
}

function markStep(n, state) {
  const el = document.getElementById('sp' + n);
  if (el) {
    el.classList.remove('active', 'done');
    el.classList.add(state);
  }
}

function validateStep(n) {
  if (n === 1) {
    if (!document.querySelector('input[name="zone"]:checked')) {
      showToast('Vui lòng chọn khu vực.'); return false;
    }
  }
  if (n === 2) {
    if (!document.getElementById('fDate').value) {
      showToast('Vui lòng chọn ngày.'); return false;
    }
    if (!document.getElementById('fStart').value) {
      showToast('Vui lòng chọn giờ bắt đầu.'); return false;
    }
    if (!document.getElementById('fEnd').value) {
      showToast('Vui lòng chọn giờ kết thúc.'); return false;
    }
    const start = parseInt(document.getElementById('fStart').value);
    const end   = parseInt(document.getElementById('fEnd').value);
    if (end <= start) {
      showToast('Giờ kết thúc phải sau giờ bắt đầu.'); return false;
    }
    if (document.getElementById('conflictWarn').style.display !== 'none') {
      showToast('Khung giờ đang bị trùng lịch. Vui lòng chọn giờ khác.'); return false;
    }
  }
  if (n === 4) {
    if (!document.getElementById('fName').value.trim()) {
      showToast('Vui lòng nhập họ tên.'); return false;
    }
    if (!document.getElementById('fPhone').value.trim()) {
      showToast('Vui lòng nhập số điện thoại.'); return false;
    }
  }
  return true;
}

function onZoneChange() { checkConflict(); updateDurationInfo(); }
function onDateChange() {
  const dateStr = document.getElementById('fDate').value;
  if (dateStr) {
    calSelectedDay = dateStr;
    const d = new Date(dateStr);
    calDate  = new Date(d.getFullYear(), d.getMonth(), 1);
    renderCalendar();
    renderTimeline(dateStr);
  }
  checkConflict();
}
function onTimeChange() { updateDurationInfo(); checkConflict(); }

function updateDurationInfo() {
  const zone  = getSelectedZone();
  const start = document.getElementById('fStart').value;
  const end   = document.getElementById('fEnd').value;
  const info  = document.getElementById('durationInfo');

  if (!start || !end || !zone) { info.style.display = 'none'; return; }
  const sh    = parseInt(start);
  const eh    = parseInt(end);
  const hours = eh - sh;
  if (hours <= 0) { info.style.display = 'none'; return; }

  const total = calcPrice(zone, hours);
  const priceStr = zone === 'Full' ? 'Liên hệ báo giá' : total.toLocaleString() + 'K';
  info.style.display = 'block';
  info.innerHTML = `
    Thời gian: <strong>${start} — ${end}</strong> (${hours} giờ)&nbsp;&nbsp;·&nbsp;&nbsp;
    Tạm tính: <strong style="color:var(--red)">${priceStr}</strong>
  `;
}

// Thay đổi checkConflict để tránh trùng lặp ngày/giờ/zone
function checkConflict() {
  const zone  = getSelectedZone();
  const date  = document.getElementById('fDate').value;
  const start = document.getElementById('fStart').value;
  const end   = document.getElementById('fEnd').value;
  const warn  = document.getElementById('conflictWarn');

  if (!zone || !date || !start || !end) { warn.style.display = 'none'; return; }

  const sh = parseInt(start);
  const eh = parseInt(end);
  const hasConflict = getBookings().some(b => {
    if (b.status === 'rejected') return false;
    if (b.date !== date) return false;
    const zoneMatch = b.zone === zone || b.zone === 'Full' || zone === 'Full';
    if (!zoneMatch) return false;
    const bs = parseInt((b.startTime || '08:00').split(':')[0]);
    const be = parseInt((b.endTime   || '10:00').split(':')[0]);
    return sh < be && eh > bs;
  });

  warn.style.display = hasConflict ? 'block' : 'none';
}

function toggleTag(btn)   { btn.classList.toggle('active'); }
function toggleEquip(el) {
  const key   = el.dataset.key;
  const price = parseInt(el.dataset.price);
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) selectedEquip[key] = price;
  else delete selectedEquip[key];
}

function calcPrice(zone, hours) {
  if (!zone || zone === 'Full') return 0;
  const base    = BASE_PRICES[zone] || 0;
  const addH    = Math.max(0, hours - 2);
  const addRate = ADD_PRICES[zone] || 0;
  const equip   = Object.values(selectedEquip).reduce((a, b) => a + b, 0);
  return base + addH * addRate + equip;
}

function renderSummary() {
  const zone     = getSelectedZone();
  const date     = document.getElementById('fDate').value;
  const start    = document.getElementById('fStart').value;
  const end      = document.getElementById('fEnd').value;
  const name     = document.getElementById('fName').value;
  const phone    = document.getElementById('fPhone').value;
  const note     = document.getElementById('fNote').value;
  const purposes = [...document.querySelectorAll('.tag-btn.active')].map(b => b.textContent).join(', ');
  const equips   = Object.keys(selectedEquip).join(', ') || 'Không';
  const hours    = end && start ? parseInt(end) - parseInt(start) : 0;
  const total    = calcPrice(zone, hours);
  const deposit  = Math.round(total / 2);
  const zoneLabel = { O: '"O" Zone · 1F', C: '"C" Zone · 2F', Full: 'Full House' }[zone] || zone;

  document.getElementById('summaryBox').innerHTML = `
    <div class="sum-row"><span>Khu vực</span><span>${zoneLabel}</span></div>
    <div class="sum-row"><span>Ngày</span><span>${formatDate(date)}</span></div>
    <div class="sum-row"><span>Thời gian</span><span>${start} — ${end} (${hours} giờ)</span></div>
    <div class="sum-row"><span>Mục đích</span><span>${purposes || '—'}</span></div>
    <div class="sum-row"><span>Thiết bị thuê</span><span>${equips}</span></div>
    <div class="sum-row"><span>Họ tên</span><span>${name}</span></div>
    <div class="sum-row"><span>SĐT / Zalo</span><span>${phone}</span></div>
    ${note ? `<div class="sum-row"><span>Ghi chú</span><span>${note}</span></div>` : ''}
    <div class="sum-row total">
      <span>Tổng cộng</span>
      <span>${zone === 'Full' ? 'Liên hệ' : total.toLocaleString() + 'K'}</span>
    </div>
    <div class="sum-row">
      <span>Đặt cọc 50%</span>
      <span style="color:var(--red);font-weight:600;">${zone === 'Full' ? '—' : deposit.toLocaleString() + 'K'}</span>
    </div>
  `;
}

async function submitBooking() {
  const zone  = getSelectedZone();
  const date  = document.getElementById('fDate').value;
  const start = document.getElementById('fStart').value;
  const end   = document.getElementById('fEnd').value;
  const name  = document.getElementById('fName').value.trim();
  const phone = document.getElementById('fPhone').value.trim();

  if (!zone || !date || !start || !end || !name || !phone) {
    showToast('Vui lòng điền đầy đủ thông tin.'); return;
  }

  const hours   = parseInt(end) - parseInt(start);
  const total   = calcPrice(zone, hours);
  const deposit = Math.round(total / 2);
  const purposes = [...document.querySelectorAll('.tag-btn.active')].map(b => b.textContent);

  try {
    const booking = await addBooking({
      name, phone, zone,
      date, startTime: start, endTime: end, hours,
      equipments: Object.keys(selectedEquip),
      purposes,
      note: document.getElementById('fNote').value,
      total, deposit
    });

    renderCalendar();
    if (calSelectedDay === date) renderTimeline(date);
    showQRModal(booking);
    resetForm();
  } catch (err) {
    // Error is handled in addBooking via showToast
    console.error("Booking failed:", err);
  }
}

function resetForm() {
  currentStep = 1;
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById('fs1').classList.add('active');
  [1,2,3,4,5].forEach(n => { markStep(n, n === 1 ? 'active' : ''); });
  document.querySelectorAll('input[name="zone"]').forEach(r => r.checked = false);
  document.getElementById('fDate').value  = '';
  document.getElementById('fStart').value = '';
  document.getElementById('fEnd').value   = '';
  document.getElementById('fName').value  = '';
  document.getElementById('fPhone').value = '';
  document.getElementById('fNote').value  = '';
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.equip-item').forEach(e => e.classList.remove('selected'));
  Object.keys(selectedEquip).forEach(k => delete selectedEquip[k]);
  document.getElementById('durationInfo').style.display  = 'none';
  document.getElementById('conflictWarn').style.display  = 'none';
}

window.goStep        = goStep;
window.onZoneChange  = onZoneChange;
window.onDateChange  = onDateChange;
window.onTimeChange  = onTimeChange;
window.toggleTag     = toggleTag;
window.toggleEquip   = toggleEquip;
window.submitBooking = submitBooking;

// Thay đổi showQRModal để hỗ trợ thanh toán thẻ tín dụng
window.showQRModal = function(booking) {
  const amount  = booking.zone === 'Full' ? 'Liên hệ' : (booking.deposit || 0).toLocaleString() + 'K';
  
  // Sửa HTML modal QR thành Modal Thanh toán Credit Card
  document.getElementById('qrAmount').textContent = amount;
  document.getElementById('qrContent').textContent = 'KEP ' + booking.id;
  
  const qrImg = document.getElementById('qrImg');
  if (qrImg) {
    qrImg.style.display = 'none'; // Ẩn ảnh QR Momo
  }
  
  // Có thể thêm 1 div nhỏ báo nhập Credit Card
  let creditInfo = document.getElementById('creditInfo');
  if (!creditInfo) {
    creditInfo = document.createElement('div');
    creditInfo.id = 'creditInfo';
    creditInfo.innerHTML = '<p style="margin-top:15px; font-size:14px;">Vui lòng thanh toán qua thẻ Tín dụng / Ghi nợ để giữ chỗ.</p><button class="btn" style="margin-top:10px; width:100%;" onclick="window.closeModal(\'qrModal\'); window.showToast(\'Chuyển hướng đến cổng thanh toán...\')">Thanh toán Credit Card</button>';
    qrImg.parentNode.insertBefore(creditInfo, qrImg.nextSibling);
  }
  
  openModal('qrModal');
}

window.renderCalendar = renderCalendar;
window.renderTimeline = renderTimeline;
Object.defineProperty(window, 'calSelectedDay', { get: () => calSelectedDay });
