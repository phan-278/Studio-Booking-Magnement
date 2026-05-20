/* =====================================================
   adminBookings.js — Schedule View Module
   Google Calendar–style layout:
     - Left: mini month calendar
     - Right: 3-zone day tracks (O / C / Full House)
     - Draggable booking blocks (vertical = time, zone row = zone)
     - "+" quick-add button → quick form modal
   Depends on: BOOKINGS_KEY, getBookings(), saveBookings(),
               showToast(), formatDate(), endTime() from bookings.html
===================================================== */

const SV = (() => {

  /* ── Constants ── */
  const ZONES        = ['O', 'C', 'Full'];
  const ZONE_COLORS  = {
    O:    { bg:'#e8f5e9', border:'#a5d6a7', text:'#1a5c1a', dark:'#2E7D32' },
    C:    { bg:'#e3f2fd', border:'#90caf9', text:'#0d3b7a', dark:'#1565C0' },
    Full: { bg:'#fce4ec', border:'#f48fb1', text:'#7a0c2e', dark:'#c62828' },
  };
  const HOUR_START   = 7;   // 07:00
  const HOUR_END     = 22;  // 22:00
  const HOURS        = HOUR_END - HOUR_START;   // 15 slots
  const PX_PER_HOUR  = 64;  // height of 1 hour row in px
  const ZONE_ROW_H   = HOURS * PX_PER_HOUR;     // full track height

  /* ── State ── */
  let svDate   = new Date().toISOString().split('T')[0];  // "YYYY-MM-DD"
  let miniDate = new Date();   // mini calendar month reference
  let dragging = null;         // { bookingId, origStart, origZone, offsetY }

  /* ═══════════════════════════════════════════════
     PUBLIC — init: mount everything into #sv-root
  ═══════════════════════════════════════════════ */
  function init() {
    const root = document.getElementById('sv-root');
    if (!root) return;
    root.innerHTML = buildShell();
    bindMiniCal();
    renderMiniCal();
    renderTracks();
    bindTrackEvents();
  }

  /* ── HTML shell ── */
  function buildShell() {
    return `
    <div class="sv-wrap">

      <!-- LEFT: mini-cal + date label -->
      <div class="sv-left">
        <div class="sv-mini-nav">
          <button class="sv-mini-btn" id="sv-prev">←</button>
          <span class="sv-mini-label" id="sv-mini-label"></span>
          <button class="sv-mini-btn" id="sv-next">→</button>
        </div>
        <div class="sv-mini-dow">
          ${['CN','T2','T3','T4','T5','T6','T7'].map(d=>`<div>${d}</div>`).join('')}
        </div>
        <div class="sv-mini-grid" id="sv-mini-grid"></div>

        <!-- Zone legend -->
        <div class="sv-zone-legend">
          ${ZONES.map(z => `
            <div class="sv-legend-row">
              <span class="sv-legend-dot" style="background:${ZONE_COLORS[z].dark}"></span>
              <span class="sv-legend-name">${z === 'Full' ? 'Full House' : z + ' Zone'}</span>
            </div>`).join('')}
        </div>

        <!-- Help note -->
        <div class="sv-help">
          <span>💡</span> Kéo block để đổi giờ / zone
        </div>
      </div>

      <!-- RIGHT: schedule tracks -->
      <div class="sv-right">

        <!-- Header: date label + add button -->
        <div class="sv-track-header">
          <div class="sv-track-date" id="sv-track-date"></div>
          <button class="sv-add-btn" id="sv-add-btn" title="Thêm booking">＋</button>
        </div>

        <!-- Hour ruler + zone tracks -->
        <div class="sv-tracks-outer" id="sv-tracks-outer">

          <!-- Time ruler column -->
          <div class="sv-ruler">
            ${Array.from({length: HOURS + 1}, (_, i) => {
              const h = HOUR_START + i;
              return `<div class="sv-ruler-cell" style="height:${PX_PER_HOUR}px">
                <span>${String(h).padStart(2,'0')}:00</span>
              </div>`;
            }).join('')}
          </div>

          <!-- Zone rows -->
          <div class="sv-zones" id="sv-zones">
            ${ZONES.map(zone => `
              <div class="sv-zone-col" data-zone="${zone}">
                <div class="sv-zone-label">
                  <span class="sv-zone-dot" style="background:${ZONE_COLORS[zone].dark}"></span>
                  ${zone === 'Full' ? 'Full House' : zone + ' Zone'}
                </div>
                <div class="sv-zone-track" id="sv-track-${zone}" data-zone="${zone}" style="height:${ZONE_ROW_H}px">
                  <!-- hour grid lines -->
                  ${Array.from({length: HOURS}, (_, i) =>
                    `<div class="sv-hour-line" style="top:${i * PX_PER_HOUR}px"></div>`
                  ).join('')}
                  <!-- half-hour lines -->
                  ${Array.from({length: HOURS}, (_, i) =>
                    `<div class="sv-half-line" style="top:${i * PX_PER_HOUR + PX_PER_HOUR/2}px"></div>`
                  ).join('')}
                  <!-- "now" line injected by JS -->
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick-Add Modal -->
    <div class="sv-modal-overlay" id="sv-modal">
      <div class="sv-modal-box">
        <button class="sv-modal-close" id="sv-modal-close">✕</button>
        <div class="sv-modal-title" id="sv-modal-title">Thêm Booking</div>

        <div class="sv-form-row">
          <div class="sv-form-group">
            <label>Họ tên *</label>
            <input type="text" id="sv-f-name" placeholder="Nguyễn Thị Mai">
          </div>
          <div class="sv-form-group">
            <label>SĐT *</label>
            <input type="tel" id="sv-f-phone" placeholder="0901234567">
          </div>
        </div>
        <div class="sv-form-group">
          <label>Email</label>
          <input type="email" id="sv-f-email" placeholder="khach@gmail.com">
        </div>
        <div class="sv-form-row">
          <div class="sv-form-group">
            <label>Zone *</label>
            <select id="sv-f-zone">
              <option value="O">O Zone</option>
              <option value="C">C Zone</option>
              <option value="Full">Full House</option>
            </select>
          </div>
          <div class="sv-form-group">
            <label>Ngày *</label>
            <input type="date" id="sv-f-date">
          </div>
        </div>
        <div class="sv-form-row">
          <div class="sv-form-group">
            <label>Giờ bắt đầu *</label>
            <select id="sv-f-start">
              ${Array.from({length: HOURS * 2}, (_, i) => {
                const totalMins = HOUR_START * 60 + i * 30;
                const h = String(Math.floor(totalMins/60)).padStart(2,'0');
                const m = totalMins % 60 === 0 ? '00' : '30';
                return `<option value="${h}:${m}">${h}:${m}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="sv-form-group">
            <label>Số giờ *</label>
            <select id="sv-f-dur">
              ${[1,1.5,2,2.5,3,3.5,4,5,6,8].map(h =>
                `<option value="${h}" ${h===2?'selected':''}>${h}h</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="sv-form-group">
          <label>Mục đích</label>
          <select id="sv-f-purpose">
            <option value="Photography">Photography</option>
            <option value="Videography">Videography</option>
            <option value="Fashion">Fashion</option>
            <option value="Event">Event</option>
            <option value="Other">Khác</option>
          </select>
        </div>
        <div class="sv-form-group">
          <label>Ghi chú</label>
          <textarea id="sv-f-note" rows="2" placeholder="Ghi chú thêm..."></textarea>
        </div>

        <div class="sv-form-err" id="sv-form-err"></div>
        <div class="sv-modal-actions">
          <button class="sv-btn-cancel" id="sv-btn-cancel">Hủy</button>
          <button class="sv-btn-save"   id="sv-btn-save">Lưu Booking</button>
        </div>
      </div>
    </div>
    `;
  }

  /* ═══════════════════════════════════════════════
     MINI CALENDAR
  ═══════════════════════════════════════════════ */
  function renderMiniCal() {
    const year  = miniDate.getFullYear();
    const month = miniDate.getMonth();
    const label = new Date(year, month, 1)
      .toLocaleDateString('vi-VN', { month:'long', year:'numeric' });
    document.getElementById('sv-mini-label').textContent = label;

    const bk      = getBookings();
    const grid    = document.getElementById('sv-mini-grid');
    const today   = new Date().toISOString().split('T')[0];
    const first   = new Date(year, month, 1).getDay();
    const days    = new Date(year, month + 1, 0).getDate();
    let html      = '';

    for (let i = 0; i < first; i++) html += '<div class="sv-mini-cell empty"></div>';
    for (let d = 1; d <= days; d++) {
      const ds  = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cnt = bk.filter(b => b.date === ds).length;
      const cls = [
        'sv-mini-cell',
        ds === today   ? 'today'    : '',
        ds === svDate  ? 'selected' : '',
        cnt            ? 'has-bk'   : '',
      ].join(' ');
      html += `<div class="${cls}" data-date="${ds}">
        <span>${d}</span>
        ${cnt ? `<div class="sv-mini-dot"></div>` : ''}
      </div>`;
    }
    grid.innerHTML = html;

    // click handler
    grid.querySelectorAll('.sv-mini-cell[data-date]').forEach(el => {
      el.addEventListener('click', () => {
        svDate = el.dataset.date;
        renderMiniCal();
        renderTracks();
      });
    });
  }

  function bindMiniCal() {
    document.getElementById('sv-prev').addEventListener('click', () => {
      miniDate.setMonth(miniDate.getMonth() - 1);
      renderMiniCal();
    });
    document.getElementById('sv-next').addEventListener('click', () => {
      miniDate.setMonth(miniDate.getMonth() + 1);
      renderMiniCal();
    });
  }

  /* ═══════════════════════════════════════════════
     TRACKS — render booking blocks for svDate
  ═══════════════════════════════════════════════ */
  function renderTracks() {
    // Update header date
    const d = new Date(svDate + 'T00:00:00');
    document.getElementById('sv-track-date').textContent =
      d.toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' });

    const bk = getBookings().filter(b => b.date === svDate);

    ZONES.forEach(zone => {
      const track = document.getElementById(`sv-track-${zone}`);
      // remove old blocks (keep grid lines)
      track.querySelectorAll('.sv-block').forEach(el => el.remove());
      // remove old "now" line
      track.querySelectorAll('.sv-now-line').forEach(el => el.remove());

      // "now" indicator
      const now = new Date();
      const nowDate = now.toISOString().split('T')[0];
      if (svDate === nowDate) {
        const mins = now.getHours() * 60 + now.getMinutes();
        const startMins = HOUR_START * 60;
        const top = ((mins - startMins) / 60) * PX_PER_HOUR;
        if (top >= 0 && top <= ZONE_ROW_H) {
          const line = document.createElement('div');
          line.className = 'sv-now-line';
          line.style.top = `${top}px`;
          track.appendChild(line);
        }
      }

      bk.filter(b => b.zone === zone).forEach(b => {
        const block = buildBlock(b);
        track.appendChild(block);
      });
    });
  }

  function buildBlock(b) {
    const col  = ZONE_COLORS[b.zone] || ZONE_COLORS['O'];
    const top  = timeToY(b.startTime);
    const h    = durationToH(Number(b.duration));
    const STATUS_LABEL = { pending:'Chờ duyệt', confirmed:'Xác nhận', rejected:'Từ chối', cancelled:'Đã hủy' };

    const block = document.createElement('div');
    block.className = `sv-block sv-block-${b.status}`;
    block.dataset.id = b.id;
    block.style.cssText = `
      top: ${top}px;
      height: ${Math.max(h - 3, 20)}px;
      background: ${col.bg};
      border-left: 3px solid ${col.dark};
      color: ${col.text};
    `;
    block.innerHTML = `
      <div class="sv-block-time">${b.startTime} – ${endTime(b.startTime, b.duration)}</div>
      <div class="sv-block-name">${b.name || '—'}</div>
      ${h > 52 ? `<div class="sv-block-status">${STATUS_LABEL[b.status]||b.status}</div>` : ''}
      <div class="sv-block-resize" data-id="${b.id}" title="Kéo để thay đổi thời lượng"></div>
    `;

    // click → open detail modal (delegates to parent bookings.html)
    block.addEventListener('click', (e) => {
      if (e.target.classList.contains('sv-block-resize')) return;
      if (typeof openDetail === 'function') openDetail(b.id);
    });

    makeDraggable(block, b);
    makeResizable(block, b);
    return block;
  }

  /* ── Time ↔ pixel helpers ── */
  function timeToY(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return ((h * 60 + m - HOUR_START * 60) / 60) * PX_PER_HOUR;
  }

  function yToTime(y) {
    const totalMins = Math.round(((y / PX_PER_HOUR) * 60 + HOUR_START * 60) / 30) * 30;
    const clamped   = Math.max(HOUR_START * 60, Math.min(HOUR_END * 60 - 30, totalMins));
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  function durationToH(dur) {
    return (Number(dur) || 1) * PX_PER_HOUR;
  }

  /* ═══════════════════════════════════════════════
     DRAG — move block vertically (time) or
            across zones (drop on other track)
  ═══════════════════════════════════════════════ */
  function makeDraggable(block, b) {
    block.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('sv-block-resize')) return;
      e.preventDefault();

      const trackRect = block.parentElement.getBoundingClientRect();
      const offsetY   = e.clientY - block.getBoundingClientRect().top;

      block.classList.add('sv-dragging');
      document.body.style.userSelect = 'none';

      // ghost: a semi-transparent clone following cursor
      const ghost = block.cloneNode(true);
      ghost.classList.add('sv-ghost');
      ghost.style.width  = block.offsetWidth + 'px';
      ghost.style.height = block.offsetHeight + 'px';
      ghost.style.position = 'fixed';
      ghost.style.pointerEvents = 'none';
      document.body.appendChild(ghost);

      let lastZone = b.zone;

      function onMove(ev) {
        // move ghost
        ghost.style.left = `${ev.clientX - 20}px`;
        ghost.style.top  = `${ev.clientY - offsetY}px`;

        // detect which zone track cursor is over
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        const trackEl = el?.closest('.sv-zone-track');
        if (trackEl) lastZone = trackEl.dataset.zone || lastZone;

        // show drop preview on track
        ZONES.forEach(z => {
          document.getElementById(`sv-track-${z}`)
            ?.querySelectorAll('.sv-drop-preview').forEach(p => p.remove());
        });

        const targetTrack = document.getElementById(`sv-track-${lastZone}`);
        if (targetTrack) {
          const tRect  = targetTrack.getBoundingClientRect();
          const relY   = ev.clientY - tRect.top - offsetY;
          const snapY  = snapToHalf(relY);
          const preview = document.createElement('div');
          preview.className = 'sv-drop-preview';
          preview.style.cssText = `top:${snapY}px;height:${block.offsetHeight}px;background:${ZONE_COLORS[lastZone].bg};border:2px dashed ${ZONE_COLORS[lastZone].dark};`;
          targetTrack.appendChild(preview);
        }
      }

      function onUp(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        ghost.remove();
        block.classList.remove('sv-dragging');
        document.body.style.userSelect = '';

        ZONES.forEach(z => {
          document.getElementById(`sv-track-${z}`)
            ?.querySelectorAll('.sv-drop-preview').forEach(p => p.remove());
        });

        // compute new time
        const targetTrack = document.getElementById(`sv-track-${lastZone}`);
        if (!targetTrack) return;
        const tRect = targetTrack.getBoundingClientRect();
        const relY  = ev.clientY - tRect.top - offsetY;
        const newTime = yToTime(snapToHalf(relY));

        if (newTime === b.startTime && lastZone === b.zone) return; // no change

        // persist
        const bk = getBookings();
        const rec = bk.find(x => x.id === b.id);
        if (rec) {
          rec.startTime = newTime;
          rec.zone      = lastZone;
          saveBookings(bk);
          showToast(`✓ Đã di chuyển booking ${b.id} → ${lastZone} Zone, ${newTime}`);
          b.startTime = newTime;
          b.zone      = lastZone;
        }

        // re-render both old + new tracks (or all)
        renderTracks();
        renderMiniCal();

        // Refresh parent table if function exists
        if (typeof renderTable === 'function') renderTable();
        if (typeof renderStats === 'function') renderStats();
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  /* ═══════════════════════════════════════════════
     RESIZE — drag the bottom handle to change duration
  ═══════════════════════════════════════════════ */
  function makeResizable(block, b) {
    const handle = block.querySelector('.sv-block-resize');
    if (!handle) return;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const startY  = e.clientY;
      const origH   = block.offsetHeight;
      document.body.style.userSelect = 'none';

      function onMove(ev) {
        const dy   = ev.clientY - startY;
        const newH = Math.max(PX_PER_HOUR / 2, origH + dy);
        block.style.height = `${newH}px`;
      }

      function onUp(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.userSelect = '';

        const dy       = ev.clientY - startY;
        const newH     = Math.max(PX_PER_HOUR / 2, origH + dy);
        // round to nearest 0.5h
        const durH     = Math.round((newH / PX_PER_HOUR) * 2) / 2;
        const clampDur = Math.max(0.5, Math.min(durH, HOURS));

        const bk  = getBookings();
        const rec = bk.find(x => x.id === b.id);
        if (rec) {
          rec.duration = clampDur;
          saveBookings(bk);
          b.duration = clampDur;
          showToast(`✓ Đã đổi thời lượng ${b.id} → ${clampDur}h`);
        }
        renderTracks();
        if (typeof renderTable  === 'function') renderTable();
        if (typeof renderStats  === 'function') renderStats();
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  function snapToHalf(y) {
    return Math.round(y / (PX_PER_HOUR / 2)) * (PX_PER_HOUR / 2);
  }

  /* ═══════════════════════════════════════════════
     TRACK CLICK → quick add at that time/zone
  ═══════════════════════════════════════════════ */
  function bindTrackEvents() {
    ZONES.forEach(zone => {
      const track = document.getElementById(`sv-track-${zone}`);
      if (!track) return;
      track.addEventListener('click', (e) => {
        if (e.target.closest('.sv-block')) return; // block click handled separately
        const rect  = track.getBoundingClientRect();
        const relY  = e.clientY - rect.top;
        const time  = yToTime(snapToHalf(relY));
        openQuickAdd({ zone, time, date: svDate });
      });
    });

    document.getElementById('sv-add-btn').addEventListener('click', () => {
      openQuickAdd({ date: svDate });
    });
  }

  /* ═══════════════════════════════════════════════
     QUICK-ADD MODAL
  ═══════════════════════════════════════════════ */
  function openQuickAdd({ zone = 'O', time = '08:00', date = svDate } = {}) {
    const modal = document.getElementById('sv-modal');
    document.getElementById('sv-modal-title').textContent = 'Thêm Booking';
    document.getElementById('sv-f-name').value    = '';
    document.getElementById('sv-f-phone').value   = '';
    document.getElementById('sv-f-email').value   = '';
    document.getElementById('sv-f-zone').value    = zone;
    document.getElementById('sv-f-date').value    = date;
    document.getElementById('sv-f-start').value   = time;
    document.getElementById('sv-f-dur').value     = '2';
    document.getElementById('sv-f-purpose').value = 'Photography';
    document.getElementById('sv-f-note').value    = '';
    document.getElementById('sv-form-err').textContent = '';
    modal.classList.add('open');
  }

  function closeQuickAdd() {
    document.getElementById('sv-modal').classList.remove('open');
  }

  function saveQuickAdd() {
    const name    = document.getElementById('sv-f-name').value.trim();
    const phone   = document.getElementById('sv-f-phone').value.trim();
    const email   = document.getElementById('sv-f-email').value.trim();
    const zone    = document.getElementById('sv-f-zone').value;
    const date    = document.getElementById('sv-f-date').value;
    const start   = document.getElementById('sv-f-start').value;
    const dur     = parseFloat(document.getElementById('sv-f-dur').value);
    const purpose = document.getElementById('sv-f-purpose').value;
    const note    = document.getElementById('sv-f-note').value.trim();
    const errEl   = document.getElementById('sv-form-err');

    if (!name)  { errEl.textContent = 'Vui lòng nhập họ tên.'; return; }
    if (!phone) { errEl.textContent = 'Vui lòng nhập số điện thoại.'; return; }
    if (!date)  { errEl.textContent = 'Vui lòng chọn ngày.'; return; }
    errEl.textContent = '';

    const base  = zone === 'O' ? 600 : zone === 'C' ? 500 : 1000;
    const extra = Math.max(0, dur - 2) * (zone === 'Full' ? 400 : 250);
    const total = base + extra;

    const bk  = getBookings();
    const id  = 'BK-' + String(Date.now()).slice(-6);
    bk.unshift({
      id, name, phone, email, zone, date,
      startTime: start,
      duration: dur,
      purpose, note,
      total, deposit: Math.round(total / 2),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    saveBookings(bk);
    showToast(`✓ Đã thêm booking ${id}`);
    closeQuickAdd();

    // Switch view to that date
    svDate    = date;
    miniDate  = new Date(date + 'T00:00:00');
    renderMiniCal();
    renderTracks();
    if (typeof renderTable  === 'function') renderTable();
    if (typeof renderStats  === 'function') renderStats();
    if (typeof renderCalendar === 'function') renderCalendar();
  }

  /* bind modal buttons after shell is rendered */
  function bindModal() {
    document.getElementById('sv-modal-close').addEventListener('click', closeQuickAdd);
    document.getElementById('sv-btn-cancel').addEventListener('click', closeQuickAdd);
    document.getElementById('sv-btn-save').addEventListener('click', saveQuickAdd);
    document.getElementById('sv-modal').addEventListener('click', (e) => {
      if (e.target.id === 'sv-modal') closeQuickAdd();
    });
  }

  /* ── public init override to include modal bind ── */
  const _origInit = init;
  function initFull() {
    _origInit();
    bindModal();
    // scroll to 8am
    const outer = document.getElementById('sv-tracks-outer');
    if (outer) outer.scrollTop = (8 - HOUR_START) * PX_PER_HOUR;
  }

  /* ── helpers (referenced from bookings.html scope) ── */
  function endTime(s, dur) {
    if (!s || !dur) return '—';
    const [h, m] = s.split(':').map(Number);
    const total  = h * 60 + m + Math.round(Number(dur) * 60);
    return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
  }

  return { init: initFull };
})();