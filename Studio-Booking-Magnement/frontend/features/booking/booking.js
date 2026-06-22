/* ================================================================
   NEW-BOOKING.JS — Tách từ new-booking.html
================================================================ */

/* ── Auth guard ── */
const _user = JSON.parse(localStorage.getItem('kep_user') || 'null');
if (!_user) { window.location.href = '../../index.html#booking'; }
else {
  const el = document.getElementById('topbarUser');
  if (el) el.textContent = 'Xin chào, ' + (_user.firstName || _user.name || '');
  // Prefill contact info
  document.getElementById('ctLastName').value  = _user.lastName  || '';
  document.getElementById('ctFirstName').value = _user.firstName || _user.name || '';
  document.getElementById('ctEmail').value     = _user.email     || '';
  document.getElementById('ctPhone').value     = _user.phone     || '';
}

/* ── State ── */
let state = {
  zone: null,
  date: '',
  startTime: null,
  duration: 2,         // Minimum 2 hours
  equipment: {},       // {id: qty}
  total: 0,
  depositAmt: 0,
  bookingId: null      // Persistent booking ID for current session
};

const ZONES = {
  O:    { name: '"O" Zone', base: 600, extra: 250 },
  C:    { name: '"C" Zone', base: 500, extra: 200 },
  Full: { name: 'Full House', base: null, extra: null }
};

const EQUIP = [
  { id: 'e1', name: 'Đèn Godox AD300 Pro', desc: 'Đèn flash ngoài trời, 300W, kèm softbox 60x90cm', price: 150, img: '../../assets/KepDaSpace/godox_ad300.png' },
  { id: 'e2', name: 'Reflector 5-in-1 (120cm)', desc: 'Bộ hắt sáng 5 mặt, khung carbon nhẹ', price: 50, img: '../../assets/KepDaSpace/studio1.jpg' },
  { id: 'e3', name: 'Chân đèn + Boom arm', desc: 'Chân đèn chuyên nghiệp + thanh boom 2m', price: 80, img: '../../assets/KepDaSpace/studio2.jpg' },
  { id: 'e4', name: 'Backdrop giấy vô cực', desc: 'Backdrop giấy 2.7m rộng, nhiều màu', price: 120, img: '../../assets/KepDaSpace/studio_backdrop.png' },
  { id: 'e5', name: 'Monitor màu Feelworld F6+', desc: 'Màn hình ngoài 5.5" 4K HDMI cho camera', price: 100, img: '../../assets/KepDaSpace/studio3.jpg' },
  { id: 'e6', name: 'Fog machine', desc: 'Máy khói mini cho hiệu ứng sương mờ nghệ thuật', price: 200, img: '../../assets/KepDaSpace/fog_machine.png' },
];

/* ── Steps ── */
let currentStep = 1;

function goStep(n) {
  // Validate
  if (n > currentStep) {
    if (currentStep === 1 && !state.zone) { alert('Vui lòng chọn zone.'); return; }
    if (currentStep === 2) {
      if (!state.date) { alert('Vui lòng chọn ngày.'); return; }
      if (!state.startTime) { alert('Vui lòng chọn giờ.'); return; }
    }
    if (currentStep === 4 && n === 5) {
      if (!document.getElementById('ctLastName').value.trim() ||
          !document.getElementById('ctFirstName').value.trim() ||
          !document.getElementById('ctEmail').value.trim() ||
          !document.getElementById('ctPhone').value.trim()) {
        alert('Vui lòng điền đầy đủ thông tin liên hệ.'); return;
      }
    }
  }

  // Mark steps
  for (let i = 1; i <= 5; i++) {
    const sn = document.getElementById('sn' + i);
    if (sn) {
      sn.classList.remove('active', 'done');
      if (i < n) sn.classList.add('done');
      else if (i === n) sn.classList.add('active');
    }
  }

  document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel' + n);
  if (panel) panel.classList.add('active');
  currentStep = n;

  if (n === 5) {
    buildConfirm();
    document.getElementById('floatingPriceCard').style.display = 'none';
    document.getElementById('priceCardToggleBtn').style.display = 'none';
  } else {
    const toggleBtn = document.getElementById('priceCardToggleBtn');
    if (toggleBtn.style.display !== 'block') {
      document.getElementById('floatingPriceCard').style.display = 'block';
    }
  }
  updatePrice();
}

/* ── Zone select ── */
function selectZone(z, el) {
  state.zone = z;
  document.querySelectorAll('.zone-card').forEach(c => c.classList.remove('selected'));
  if (el) {
    el.classList.add('selected');
  } else {
    const cardEl = document.getElementById('zone' + z);
    if (cardEl) cardEl.classList.add('selected');
  }

  if (state.date) {
    renderTimelineForDate(state.date);
  }

  updatePrice();
}

/* ── Calendar & Timeline ── */
let calendarDate = new Date();
let selectedDateStr = '';

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

function getLocalBookings() {
  return JSON.parse(localStorage.getItem('kep_bookings') || '[]');
}

function renderCalendar() {
  const y = calendarDate.getFullYear();
  const m = calendarDate.getMonth();
  document.getElementById('calendarTitle').textContent = `${MONTHS[m]} năm ${y}`;

  const wdEl = document.getElementById('calendarWeekdays');
  wdEl.innerHTML = WEEKDAYS.map(d => `<div class="wd">${d}</div>`).join('');

  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const prevMonthDays = new Date(y, m, 0).getDate();

  const today = new Date(); today.setHours(0,0,0,0);
  const bookings = getLocalBookings();
  const grid = document.getElementById('calendarDays');
  grid.innerHTML = '';

  for (let i = firstDay - 1; i >= 0; i--) {
    grid.appendChild(createDayCell(prevMonthDays - i, y, m - 1, true, today, bookings));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.appendChild(createDayCell(d, y, m, false, today, bookings));
  }
  const filled = firstDay + daysInMonth;
  const remain = (7 - (filled % 7)) % 7;
  for (let i = 1; i <= remain; i++) {
    grid.appendChild(createDayCell(i, y, m + 1, true, today, bookings));
  }
}

function createDayCell(day, year, month, otherMonth, today, bookings) {
  const cellDate = new Date(year, month, day);
  const cellDateStr = cellDate.toISOString().split('T')[0];

  const cell = document.createElement('div');
  cell.className = 'cal-day';
  if (otherMonth) cell.classList.add('other-month');
  if (cellDate.getTime() === today.getTime()) cell.classList.add('today');
  if (cellDateStr === selectedDateStr) cell.classList.add('selected');

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0,0,0,0);
  if (cellDate.getTime() < tomorrow.getTime()) {
    cell.classList.add('disabled');
  } else {
    cell.onclick = () => selectCalendarDate(cellDateStr);
  }

  const numEl = document.createElement('span');
  numEl.className = 'day-n';
  numEl.textContent = day;
  cell.appendChild(numEl);

  const dayBookings = bookings.filter(b => b.date === cellDateStr && b.status !== 'rejected');
  if (dayBookings.length > 0) {
    const dotsEl = document.createElement('div');
    dotsEl.className = 'day-dots';
    dayBookings.forEach(b => {
      const dot = document.createElement('span');
      dot.className = 'ddot ' + (b.status === 'confirmed' ? 'ddot-confirmed' : 'ddot-pending');
      dotsEl.appendChild(dot);
    });
    cell.appendChild(dotsEl);
  }

  return cell;
}

function prevMonth() {
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
}

function selectCalendarDate(dateStr) {
  selectedDateStr = dateStr;
  state.date = dateStr;
  renderCalendar();
  renderTimelineForDate(dateStr);

  state.startTime = null;
  state.duration = 2;
  updateTimelineSelection();
}

/* ── Visual Timeline Drag Selection ── */
const TIMELINE_START = 8;
const TIMELINE_END = 22;
let isDraggingTime = false;
let dragStartHour = null;
let dragActiveZone = null;

function renderTimelineForDate(dateStr) {
  const container = document.getElementById('timelineContainer');
  if (!container) return;
  container.style.display = 'block';

  document.getElementById('selectedDateLabel').textContent = new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const hoursRow = document.getElementById('timelineHoursRow');
  const hoursArray = [];
  for (let h = TIMELINE_START; h < TIMELINE_END; h++) {
    hoursArray.push(`<div class="timeline-hour-lbl">${h}h</div>`);
  }
  hoursRow.innerHTML = hoursArray.join('');

  const bookings = getLocalBookings().filter(b => b.date === dateStr && b.status !== 'rejected');
  const zonesList = [
    { id: 'O', name: '"O" Zone' },
    { id: 'C', name: '"C" Zone' },
    { id: 'Full', name: 'Full House' }
  ];

  const gridEl = document.getElementById('timelineRowsGrid');
  gridEl.innerHTML = '';

  zonesList.forEach(z => {
    const row = document.createElement('div');
    row.className = 'timeline-row';
    if (state.zone === z.id) row.classList.add('active-zone');

    const lbl = document.createElement('div');
    lbl.className = 'timeline-row-label';
    lbl.textContent = z.name;
    row.appendChild(lbl);

    const cellsWrap = document.createElement('div');
    cellsWrap.className = 'timeline-cells';
    cellsWrap.dataset.zone = z.id;

    for (let h = TIMELINE_START; h < TIMELINE_END; h++) {
      const cell = document.createElement('div');
      cell.className = 'timeline-cell';
      cell.dataset.hour = h;
      cell.textContent = `${h}:00`;

      const isBooked = bookings.some(b => {
        const bStart = parseInt(b.startTime.split(':')[0]);
        const bEnd = parseInt(b.endTime.split(':')[0]);
        const zoneMatch = (b.zone === z.name) ||
                          (b.zone === 'Full House') ||
                          (z.id === 'Full' && (b.zone === '"O" Zone' || b.zone === '"C" Zone'));
        return zoneMatch && (h >= bStart && h < bEnd);
      });

      if (isBooked) {
        cell.classList.add('booked');
        cell.textContent = 'Bận';
      } else {
        bindCellEvents(cell, h, z.id);
      }
      cellsWrap.appendChild(cell);
    }

    row.appendChild(cellsWrap);
    gridEl.appendChild(row);
  });

  updateTimelineSelection();
}

function bindCellEvents(cell, hour, zoneId) {
  const onStart = (e) => {
    e.preventDefault();
    if (state.zone !== zoneId) {
      selectZone(zoneId, null);
      document.querySelectorAll('.timeline-row').forEach(r => r.classList.remove('active-zone'));
      cell.closest('.timeline-row').classList.add('active-zone');
    }
    isDraggingTime = true;
    dragStartHour = hour;
    dragActiveZone = zoneId;

    state.startTime = hour;
    state.duration = 1;
    updateTimelineSelection();
  };

  cell.addEventListener('mousedown', onStart);
  cell.addEventListener('touchstart', onStart);

  cell.addEventListener('mouseenter', () => {
    if (!isDraggingTime || dragActiveZone !== zoneId) return;
    handleDragTo(hour, zoneId);
  });
}

function handleDragTo(hour, zoneId) {
  const start = Math.min(dragStartHour, hour);
  const end = Math.max(dragStartHour, hour) + 1;

  const bookings = getLocalBookings().filter(b => b.date === state.date && b.status !== 'rejected');
  let hasBookedSlot = false;
  for (let h = start; h < end; h++) {
    const isBooked = bookings.some(b => {
      const bStart = parseInt(b.startTime.split(':')[0]);
      const bEnd = parseInt(b.endTime.split(':')[0]);
      const zoneMatch = (b.zone === (zoneId === 'O' ? '"O" Zone' : zoneId === 'C' ? '"C" Zone' : 'Full House')) ||
                        (b.zone === 'Full House') ||
                        (zoneId === 'Full' && (b.zone === '"O" Zone' || b.zone === '"C" Zone'));
      return zoneMatch && (h >= bStart && h < bEnd);
    });
    if (isBooked) { hasBookedSlot = true; break; }
  }

  if (!hasBookedSlot) {
    state.startTime = start;
    state.duration = end - start;
    updateTimelineSelection();
  }
}

// Touch drag helper
document.addEventListener('touchmove', (e) => {
  if (!isDraggingTime) return;
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target && target.classList.contains('timeline-cell') && target.parentNode.dataset.zone === dragActiveZone) {
    const hour = parseInt(target.dataset.hour);
    handleDragTo(hour, dragActiveZone);
  }
});

// Finalize drag on mouseup/touchend
const onDragEnd = () => {
  if (isDraggingTime) {
    isDraggingTime = false;
    finalizeSelection();
  }
};
document.addEventListener('mouseup', onDragEnd);
document.addEventListener('touchend', onDragEnd);

function finalizeSelection() {
  if (!state.startTime) return;

  if (state.duration < 2 && state.zone !== 'Full') {
    const bookings = getLocalBookings().filter(b => b.date === state.date && b.status !== 'rejected');
    const start = state.startTime;
    const end = start + 2;

    let canExtendForward = (end <= TIMELINE_END);
    if (canExtendForward) {
      for (let h = start; h < end; h++) {
        const isBooked = bookings.some(b => {
          const bStart = parseInt(b.startTime.split(':')[0]);
          const bEnd = parseInt(b.endTime.split(':')[0]);
          const zoneMatch = (b.zone === (state.zone === 'O' ? '"O" Zone' : state.zone === 'C' ? '"C" Zone' : 'Full House')) ||
                            (b.zone === 'Full House') ||
                            (state.zone === 'Full' && (b.zone === '"O" Zone' || b.zone === '"C" Zone'));
          return zoneMatch && (h >= bStart && h < bEnd);
        });
        if (isBooked) { canExtendForward = false; break; }
      }
    }

    if (canExtendForward) {
      state.duration = 2;
    } else {
      let prevStart = start - 1;
      let canExtendBack = (prevStart >= TIMELINE_START);
      if (canExtendBack) {
        for (let h = prevStart; h < prevStart + 2; h++) {
          const isBooked = bookings.some(b => {
            const bStart = parseInt(b.startTime.split(':')[0]);
            const bEnd = parseInt(b.endTime.split(':')[0]);
            const zoneMatch = (b.zone === (state.zone === 'O' ? '"O" Zone' : state.zone === 'C' ? '"C" Zone' : 'Full House')) ||
                              (b.zone === 'Full House') ||
                              (state.zone === 'Full' && (b.zone === '"O" Zone' || b.zone === '"C" Zone'));
            return zoneMatch && (h >= bStart && h < bEnd);
          });
          if (isBooked) { canExtendBack = false; break; }
        }
      }

      if (canExtendBack) {
        state.startTime = prevStart;
        state.duration = 2;
      } else {
        alert('Khu vực này yêu cầu tối thiểu 2 giờ thuê liên tục.');
        state.startTime = null;
        state.duration = 2;
      }
    }
  }

  updateTimelineSelection();
}

function updateTimelineSelection() {
  document.querySelectorAll('.timeline-cell').forEach(c => c.classList.remove('selected'));
  const summary = document.getElementById('timelineSelectionSummary');

  if (state.startTime !== null && state.zone) {
    const end = state.startTime + state.duration;
    const cellsWrap = document.querySelector(`.timeline-cells[data-zone="${state.zone}"]`);
    if (cellsWrap) {
      for (let h = state.startTime; h < end; h++) {
        const cell = cellsWrap.querySelector(`.timeline-cell[data-hour="${h}"]`);
        if (cell) cell.classList.add('selected');
      }
    }
    document.getElementById('selectedTimeInfo').textContent = `${state.startTime}:00 → ${end}:00 · ${state.duration} giờ thuê`;
    summary.style.display = 'block';
  } else {
    summary.style.display = 'none';
  }
  updatePrice();
}

/* ── Zone Lightbox Modal ── */
const ZONE_GALLERY = {
  O: {
    title: '"O" Zone — Tầng 1 (1F)',
    desc: 'Sảnh chính rộng ~80m² với cột bê tông thô mộc, đón ánh sáng tự nhiên ngập tràn qua cửa sổ vòm lớn. Hoàn hảo cho chụp ảnh thời trang editorial, lookbook và các concept brutalist.',
    images: [
      '../../assets/KepDaSpace/studio1.jpg',
      '../../assets/KepDaSpace/studio2.jpg',
      '../../assets/KepDaSpace/studio3.jpg'
    ]
  },
  C: {
    title: '"C" Zone — Tầng 2 (2F)',
    desc: 'Không gian lầu 2 cực kỳ riêng tư, bao gồm khu trang điểm chuyên nghiệp 3 gương led lớn, ban công đón gió trời lãng mạn, cùng thiết kế rèm lụa mờ nghệ thuật.',
    images: [
      '../../assets/KepDaSpace/studio4.jpg',
      '../../assets/KepDaSpace/studio5.jpg',
      '../../assets/KepDaSpace/studio6.jpg'
    ]
  },
  Full: {
    title: 'Full House — Toàn bộ không gian',
    desc: 'Thuê trọn gói cả 2 tầng của Kép Studio để thực hiện các chiến dịch sản xuất lớn (quay MV, TVC), tổ chức pop-up store hoặc workshop nghệ thuật.',
    images: [
      '../../assets/KepDaSpace/intro4.jpg',
      '../../assets/KepDaSpace/intro5.jpg',
      '../../assets/KepDaSpace/intro6.jpg',
      '../../assets/KepDaSpace/intro7.jpg'
    ]
  }
};

let activeLightboxZone = null;

function openZoneLightbox(z, event) {
  if (event) event.stopPropagation();
  activeLightboxZone = z;
  const data = ZONE_GALLERY[z];

  document.getElementById('lightboxTitle').textContent = data.title;
  document.getElementById('lightboxInfo').innerHTML = `<strong>Đặc điểm:</strong> ${data.desc}`;

  const grid = document.getElementById('lightboxGrid');
  grid.innerHTML = data.images.map(img => `
    <div class="lb-img" style="background-image: url('${img}'); cursor: default;"></div>
  `).join('');

  document.getElementById('zoneLightbox').style.display = 'flex';
}

function closeLightbox() {
  document.getElementById('zoneLightbox').style.display = 'none';
}

function selectZoneFromLightbox() {
  if (activeLightboxZone) {
    const cardEl = document.getElementById('zone' + activeLightboxZone);
    selectZone(activeLightboxZone, cardEl);
  }
  closeLightbox();
}

/* ── Equipment ── */
function renderEquip() {
  const grid = document.getElementById('equipGrid');
  grid.innerHTML = EQUIP.map(e => `
    <div class="equip-card" id="ec${e.id}" onclick="toggleEquip('${e.id}', event)">
      <div class="equip-img-wrap" style="background-image: url('${e.img}');"></div>
      <div class="equip-info">
        <div class="equip-name">${e.name}</div>
        <div class="equip-desc">${e.desc}</div>
        <div class="equip-price">+${e.price}K / buổi</div>
        <div class="equip-qty" id="qty${e.id}" style="display:none;" onclick="event.stopPropagation()">
          <button class="qty-btn" onclick="changeQty('${e.id}', -1)">−</button>
          <span class="qty-val" id="qv${e.id}">1</span>
          <button class="qty-btn" onclick="changeQty('${e.id}', +1)">+</button>
        </div>
      </div>
      <div class="equip-check" id="eck${e.id}">✓</div>
    </div>
  `).join('');
}

function toggleEquip(id, e) {
  const card = document.getElementById('ec' + id);
  const qty  = document.getElementById('qty' + id);
  if (card.classList.contains('selected')) {
    card.classList.remove('selected');
    qty.style.display = 'none';
    delete state.equipment[id];
  } else {
    card.classList.add('selected');
    qty.style.display = 'flex';
    state.equipment[id] = 1;
  }
  updatePrice();
}

function changeQty(id, delta) {
  state.equipment[id] = Math.max(1, (state.equipment[id] || 1) + delta);
  document.getElementById('qv' + id).textContent = state.equipment[id];
  updatePrice();
}

/* ── Price calc ── */
function updatePrice() {
  const dur = state.duration || 2;
  const z = ZONES[state.zone];
  let zoneFee = 0;
  if (z && z.base !== null) {
    zoneFee = z.base + Math.max(0, dur - 2) * z.extra;
  }

  let equipFee = 0;
  EQUIP.forEach(e => {
    if (state.equipment[e.id]) equipFee += e.price * state.equipment[e.id];
  });

  state.total = zoneFee + equipFee;
  state.depositAmt = Math.round(state.total * 0.3);

  const fmt = v => v > 0 ? v.toLocaleString() + 'K' : '—';

  document.getElementById('prZone').textContent    = z ? z.name : '—';
  document.getElementById('prHours').textContent   = dur + ' giờ';
  document.getElementById('prZoneFee').textContent = z?.base ? fmt(zoneFee) : (state.zone === 'Full' ? 'Thương lượng' : '—');
  document.getElementById('prTotal').textContent   = state.zone === 'Full' ? 'Thương lượng' : (state.total > 0 ? fmt(state.total) : '—');
  document.getElementById('prDeposit').textContent = state.zone === 'Full' ? 'Thương lượng' : (state.depositAmt > 0 ? fmt(state.depositAmt) : '—');

  document.getElementById('prTotalToggle').textContent = state.zone === 'Full' ? 'Thương lượng' : (state.total > 0 ? fmt(state.total) : '—');

  const equRow = document.getElementById('prEquipRow');
  if (equipFee > 0) {
    equRow.style.display = 'flex';
    document.getElementById('prEquipFee').textContent = fmt(equipFee);
  } else {
    equRow.style.display = 'none';
  }
}

/* ── Floating Card Draggable & Toggle ── */
function makeElementDraggable(elmnt, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  handle.onmousedown = dragMouseDown;
  handle.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e = e || window.event;
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    let newTop = elmnt.offsetTop - pos2;
    let newLeft = elmnt.offsetLeft - pos1;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = elmnt.offsetWidth;
    const cardHeight = elmnt.offsetHeight;

    if (newTop < 0) newTop = 0;
    if (newTop + cardHeight > viewportHeight) newTop = viewportHeight - cardHeight;
    if (newLeft < 0) newLeft = 0;
    if (newLeft + cardWidth > viewportWidth) newLeft = viewportWidth - cardWidth;

    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
    elmnt.style.bottom = "auto";
    elmnt.style.right = "auto";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }

  function dragTouchStart(e) {
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('select')) return;
    const touch = e.touches[0];
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    document.ontouchend = closeDragTouch;
    document.ontouchmove = elementTouchDrag;
  }

  function elementTouchDrag(e) {
    const touch = e.touches[0];
    pos1 = pos3 - touch.clientX;
    pos2 = pos4 - touch.clientY;
    pos3 = touch.clientX;
    pos4 = touch.clientY;

    let newTop = elmnt.offsetTop - pos2;
    let newLeft = elmnt.offsetLeft - pos1;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const cardWidth = elmnt.offsetWidth;
    const cardHeight = elmnt.offsetHeight;

    if (newTop < 0) newTop = 0;
    if (newTop + cardHeight > viewportHeight) newTop = viewportHeight - cardHeight;
    if (newLeft < 0) newLeft = 0;
    if (newLeft + cardWidth > viewportWidth) newLeft = viewportWidth - cardWidth;

    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
    elmnt.style.bottom = "auto";
    elmnt.style.right = "auto";
  }

  function closeDragTouch() {
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

function togglePriceCard(show) {
  const card = document.getElementById('floatingPriceCard');
  const btn = document.getElementById('priceCardToggleBtn');
  if (show) {
    card.style.display = 'block';
    btn.style.display = 'none';
  } else {
    card.style.display = 'none';
    btn.style.display = 'block';
  }
}

/* ── Confirm screen ── */
function buildConfirm() {
  const z = ZONES[state.zone];
  const dur = state.duration;
  const end = state.startTime ? state.startTime + dur : null;
  const d = state.date ? new Date(state.date).toLocaleDateString('vi-VN', {weekday:'long', year:'numeric', month:'long', day:'numeric'}) : '—';

  if (!state.bookingId) {
    state.bookingId = 'BK' + Date.now().toString().slice(-6);
  }

  document.getElementById('cfZone').textContent     = z?.name || '—';
  document.getElementById('cfDate').textContent     = d;
  document.getElementById('cfTimeRange').textContent = state.startTime ? `${state.startTime}:00 → ${end}:00` : '—';
  document.getElementById('cfDur').textContent      = dur + ' giờ';

  const zFee = z && z.base !== null ? z.base + Math.max(0, dur - 2) * z.extra : 0;
  let equipFee = 0;

  const selEquip = EQUIP.filter(e => state.equipment[e.id]);
  const equBlock = document.getElementById('cfEquipBlock');

  if (selEquip.length) {
    equBlock.style.display = 'block';
    document.getElementById('cfEquipRows').innerHTML = selEquip.map(e =>
      `<div class="confirm-row"><span>${e.name} ×${state.equipment[e.id]}</span><strong>${e.price * state.equipment[e.id]}K</strong></div>`
    ).join('');

    selEquip.forEach(e => { equipFee += e.price * state.equipment[e.id]; });

    document.getElementById('cfEquipFeeRow').style.display = 'flex';
    document.getElementById('cfEquipFee').textContent = equipFee.toLocaleString() + 'K';
  } else {
    equBlock.style.display = 'none';
    document.getElementById('cfEquipFeeRow').style.display = 'none';
  }

  state.total = zFee + equipFee;
  state.depositAmt = Math.round(state.total * 0.3);

  const fmt = v => v > 0 ? v.toLocaleString() + 'K' : '—';

  document.getElementById('cfZoneFee').textContent = z?.base ? fmt(zFee) : 'Thương lượng';
  document.getElementById('cfTotal').textContent   = state.zone === 'Full' ? 'Thương lượng' : (state.total > 0 ? fmt(state.total) : '—');
  document.getElementById('cfDeposit').textContent = state.zone === 'Full' ? 'Thương lượng' : (state.depositAmt > 0 ? fmt(state.depositAmt) : '—');

  const fullName = (document.getElementById('ctFirstName').value + ' ' + document.getElementById('ctLastName').value).trim();
  document.getElementById('cfName').textContent    = fullName || '—';
  document.getElementById('cfEmail').textContent   = document.getElementById('ctEmail').value || '—';
  document.getElementById('cfPhone').textContent   = document.getElementById('ctPhone').value || '—';
  document.getElementById('cfPurpose').textContent = document.getElementById('ctPurpose').value || '—';

  const note = document.getElementById('ctNote').value.trim();
  if (note) {
    document.getElementById('cfNoteRow').style.display = 'flex';
    document.getElementById('cfNote').textContent = note;
  } else {
    document.getElementById('cfNoteRow').style.display = 'none';
  }

  const qrImg = document.getElementById('confirmQrImg');
  if (qrImg) {
    if (state.zone === 'Full' || state.total === 0) {
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Lien%20he%20truc%20tiep%20Kep%20Studio%20de%20thuong%20luong';
      document.getElementById('confirmQrAmount').textContent = 'Thương lượng';
      document.getElementById('confirmQrContent').textContent = `KEP ${state.bookingId}`;
    } else {
      const amountVND = state.depositAmt * 1000;
      qrImg.src = `https://img.vietqr.io/image/vietinbank-113000000000-compact2.jpg?amount=${amountVND}&addInfo=KEP%20${state.bookingId}&accountName=Kep%20Studio`;
      document.getElementById('confirmQrAmount').textContent = amountVND.toLocaleString('vi-VN') + ' VNĐ';
      document.getElementById('confirmQrContent').textContent = `KEP ${state.bookingId}`;
    }
  }
}

/* ── Submit ── */
function submitBooking() {
  const dur = state.duration;
  const end = state.startTime + dur;

  if (!state.bookingId) {
    state.bookingId = 'BK' + Date.now().toString().slice(-6);
  }

  const booking = {
    id: state.bookingId,
    zone: ZONES[state.zone]?.name || state.zone,
    date: state.date,
    startTime: state.startTime + ':00',
    endTime: end + ':00',
    duration: dur,
    equipment: Object.entries(state.equipment).map(([id, qty]) => {
      const e = EQUIP.find(x => x.id === id);
      return { name: e.name, qty, price: e.price };
    }),
    name: document.getElementById('ctFirstName').value + ' ' + document.getElementById('ctLastName').value,
    email: document.getElementById('ctEmail').value,
    phone: document.getElementById('ctPhone').value,
    purpose: document.getElementById('ctPurpose').value,
    note: document.getElementById('ctNote').value,
    total: state.total,
    deposit: state.depositAmt,
    status: 'pending',
    createdAt: new Date().toISOString(),
    userId: _user?.id || null
  };

  const bookings = JSON.parse(localStorage.getItem('kep_bookings') || '[]');
  bookings.push(booking);
  localStorage.setItem('kep_bookings', JSON.stringify(bookings));

  document.getElementById('wizardWrap').style.display = 'none';
  document.getElementById('successWrap').classList.add('show');
  document.getElementById('successCode').textContent = booking.id;

  document.getElementById('floatingPriceCard').style.display = 'none';
  document.getElementById('priceCardToggleBtn').style.display = 'none';
}

function resetBooking() {
  state = { zone: null, date: '', startTime: null, duration: 2, equipment: {}, total: 0, depositAmt: 0, bookingId: null };
  document.getElementById('successWrap').classList.remove('show');
  document.getElementById('wizardWrap').style.display = '';
  goStep(1);
  document.querySelectorAll('.zone-card').forEach(c => c.classList.remove('selected'));
  selectedDateStr = '';
  document.getElementById('timelineContainer').style.display = 'none';
  renderCalendar();
}

/* ── Init ── */
const fCard = document.getElementById('floatingPriceCard');
const fHandle = document.getElementById('priceDragHandle');
if (fCard && fHandle) {
  makeElementDraggable(fCard, fHandle);
}

renderCalendar();
renderEquip();
updatePrice();