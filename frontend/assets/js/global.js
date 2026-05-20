/* =====================================================
   KÉP STUDIO — script.js
   1. Storage
   2. Hero Slideshow
   3. Scroll Reveal + 3D Tilt
   4. Navigation
   5. Marquee
   6. Zone Lightbox
   7. Calendar (mini + hourly timeline)
   8. Booking Form (5 steps)
   9. Admin Panel
   10. Auth (Login / Register)
   11. Utilities
   ===================================================== */


/* ================================================================
   1. STORAGE — Local fallback (Supabase-ready)
================================================================ */
let _bookings = JSON.parse(localStorage.getItem('kep_bookings') || '[]');
let _users    = JSON.parse(localStorage.getItem('kep_users')    || '[]');
let _currentUser = JSON.parse(localStorage.getItem('kep_current_user') || 'null');

function getBookings() { return _bookings; }
function saveBookings() { localStorage.setItem('kep_bookings', JSON.stringify(_bookings)); }

function addBooking(data) {
  const entry = {
    ...data,
    id: 'BK-' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  _bookings.unshift(entry);
  saveBookings();
  return entry;
}

function updateBookingStatus(id, status) {
  const b = _bookings.find(x => x.id === id);
  if (b) { b.status = status; saveBookings(); }
}


/* ================================================================
   2. HERO SLIDESHOW
================================================================ */
(function initSlideshow() {
  const slides   = document.querySelectorAll('.slide');
  const dotsWrap = document.getElementById('slideDots');
  let current = 0;
  let timer;

  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slide-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => { goSlide(i); resetTimer(); };
    dotsWrap.appendChild(d);
  });

  function goSlide(n) {
    slides[current].classList.remove('active');
    dotsWrap.children[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dotsWrap.children[current].classList.add('active');
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goSlide(current + 1), 5000);
  }

  resetTimer();
  window.nextSlide = () => { goSlide(current + 1); resetTimer(); };
  window.prevSlide = () => { goSlide(current - 1); resetTimer(); };

  const hero = document.querySelector('.hero');
  hero.addEventListener('mouseenter', () => clearInterval(timer));
  hero.addEventListener('mouseleave', resetTimer);
})();


/* ================================================================
   3. SCROLL REVEAL + 3D TILT
================================================================ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = entry.target.parentElement.querySelectorAll('.reveal-up');
      siblings.forEach((sib, i) => {
        if (!sib.classList.contains('visible')) {
          setTimeout(() => sib.classList.add('visible'), i * 90);
        }
      });
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => obs.observe(el));

  setTimeout(() => {
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 300 + i * 150);
    });
  }, 100);
})();

(function init3DTilt() {
  document.querySelectorAll('.studio-card, .zone-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const rx = -((e.clientY - r.top)  / r.height - 0.5) * 7;
      const ry =  ((e.clientX - r.left) / r.width  - 0.5) * 7;
      card.style.transform  = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
      card.style.transition = 'transform 0.1s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
    });
  });
})();


/* ================================================================
   4. NAVIGATION
================================================================ */
(function initNav() {
  const links = document.querySelectorAll('.nav-link');
  const secs  = document.querySelectorAll('section[id]');

  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  window.addEventListener('scroll', () => {
    let active = '';
    secs.forEach(s => {
      if (window.scrollY >= s.offsetTop - 220) active = s.id;
    });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + active));
  });
})();


/* ================================================================
   5. MARQUEE
================================================================ */
(function initMarquee() {
  const mq = document.querySelector('.marquee-track');
  if (!mq) return;
  mq.addEventListener('mouseenter', () => mq.style.animationPlayState = 'paused');
  mq.addEventListener('mouseleave', () => mq.style.animationPlayState = 'running');
})();


/* ================================================================
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



/* ================================================================
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


/* ================================================================
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
  el.classList.remove('active', 'done');
  el.classList.add(state);
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

const BASE_PRICES = { O: 600, C: 500, Full: 0 };
const ADD_PRICES  = { O: 250, C: 200, Full: 0 };

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

function submitBooking() {
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

  const booking = addBooking({
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
}

function showQRModal(booking) {
  const amount  = booking.zone === 'Full' ? 'Liên hệ' : (booking.deposit || 0).toLocaleString() + 'K';
  const content = `KEP ${booking.id}`;
  const qrData  = encodeURIComponent(`MOMO:0xxx-${content}-${amount}`);
  const qrUrl   = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrData}`;

  document.getElementById('qrImg').src               = qrUrl;
  document.getElementById('qrAmount').textContent    = amount;
  document.getElementById('qrContent').textContent   = content;
  openModal('qrModal');
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


/* ================================================================
   9. ADMIN PANEL
================================================================ */
const ADMIN_PASSWORD = 'kep2025';
let adminFilter = 'all';

function openLogin() { openModal('loginModal'); }

function tryLogin() {
  const pw = document.getElementById('adminPw').value;

  if (pw === ADMIN_PASSWORD) {
    localStorage.setItem('kep_admin_auth', '1');

    closeModal('loginModal');
    document.getElementById('adminPw').value = '';
    document.getElementById('loginError').style.display = 'none';

    window.location.href = './pages/admin/index.html';
  } else {
    document.getElementById('loginError').style.display = 'block';
  }
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
  renderCalendar();
  if (calSelectedDay) renderTimeline(calSelectedDay);
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


/* ================================================================
   10. AUTH — Guest Login / Register
================================================================ */

function openAuthModal(tab) {
  switchAuthTab(tab || 'login');
  openModal('authModal');
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('tabLogin').classList.toggle('active', isLogin);
  document.getElementById('tabRegister').classList.toggle('active', !isLogin);
  document.getElementById('authFormLogin').style.display    = isLogin ? 'block' : 'none';
  document.getElementById('authFormRegister').style.display = isLogin ? 'none' : 'block';
}

function doLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('authLoginError');

  if (!email || !password) {
    errEl.textContent = 'Vui lòng điền đầy đủ thông tin.';
    errEl.style.display = 'block'; return;
  }

  const users = JSON.parse(localStorage.getItem('kep_users') || '[]');
  const user  = users.find(u => u.email === email && u.password === btoa(password));

  if (!user) {
    errEl.textContent = 'Email hoặc mật khẩu không đúng.';
    errEl.style.display = 'block'; return;
  }

  errEl.style.display = 'none';
  setCurrentUser(user);
  closeModal('authModal');
  showToast('✓ Đăng nhập thành công. Chào ' + user.name + '!');
  document.getElementById('loginEmail').value    = '';
  document.getElementById('loginPassword').value = '';
}

function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const phone    = document.getElementById('regPhone').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const errEl    = document.getElementById('authRegError');

  if (!name || !phone || !email || !password) {
    errEl.textContent = 'Vui lòng điền đầy đủ thông tin.';
    errEl.style.display = 'block'; return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
    errEl.style.display = 'block'; return;
  }

  const users = JSON.parse(localStorage.getItem('kep_users') || '[]');
  if (users.find(u => u.email === email)) {
    errEl.textContent = 'Email này đã được đăng ký.';
    errEl.style.display = 'block'; return;
  }

  const newUser = { id: 'U-' + Date.now(), name, phone, email, password: btoa(password) };
  users.push(newUser);
  localStorage.setItem('kep_users', JSON.stringify(users));

  errEl.style.display = 'none';
  setCurrentUser(newUser);
  closeModal('authModal');
  showToast('✓ Đăng ký thành công. Chào mừng, ' + name + '!');
  document.getElementById('regName').value     = '';
  document.getElementById('regPhone').value    = '';
  document.getElementById('regEmail').value    = '';
  document.getElementById('regPassword').value = '';
}

function setCurrentUser(user) {
  _currentUser = user;
  localStorage.setItem('kep_current_user', JSON.stringify(user));
  updateUserUI();
}

function doLogout() {
  _currentUser = null;
  localStorage.removeItem('kep_current_user');
  updateUserUI();
  showToast('Đã đăng xuất.');
}

function updateUserUI() {
  const bar    = document.getElementById('userBar');
  const nameEl = document.getElementById('userBarName');
  const userBtn = document.querySelector('.user-btn .admin-label');

  if (_currentUser) {
    bar.style.display = 'flex';
    if (nameEl) nameEl.textContent = _currentUser.name;
    if (userBtn) userBtn.textContent = ' ' + _currentUser.name;
    // Pre-fill booking form with user info
    const fName  = document.getElementById('fName');
    const fPhone = document.getElementById('fPhone');
    if (fName && !fName.value)  fName.value  = _currentUser.name;
    if (fPhone && !fPhone.value) fPhone.value = _currentUser.phone;
  } else {
    bar.style.display = 'none';
    if (userBtn) userBtn.textContent = ' Đăng nhập';
  }
}

window.openAuthModal  = openAuthModal;
window.switchAuthTab  = switchAuthTab;
window.doLogin        = doLogin;
window.doRegister     = doRegister;
window.doLogout       = doLogout;

// Init user UI on load
updateUserUI();


/* ================================================================
   11. UTILITIES
================================================================ */
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('show');
  });
});

window.openModal  = openModal;
window.closeModal = closeModal;

function showToast(msg, dur = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), dur);
}

function toDateStr(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function formatDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function getSelectedZone() {
  const r = document.querySelector('input[name="zone"]:checked');
  return r ? r.value : '';
}

function openAuthFrame(type = "login") {
  const modal = document.getElementById("authFrameModal");
  const frame = document.getElementById("authFrame");

  if (!modal || !frame) return;

  if (type === "register") {
    frame.src = "./pages/auth/register.html";
  } else {
    frame.src = "./pages/auth/login.html";
  }

  modal.classList.add("show");
}

function closeAuthFrame() {
  const modal = document.getElementById("authFrameModal");
  const frame = document.getElementById("authFrame");

  if (!modal || !frame) return;

  modal.classList.remove("show");
  frame.src = "";
}

window.openAuthFrame = openAuthFrame;
window.closeAuthFrame = closeAuthFrame;


/* ================================================================
   INIT
================================================================ */
renderCalendar();
