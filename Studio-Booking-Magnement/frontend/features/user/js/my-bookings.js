import { supabase } from '../../../services/supabase-config.js';

const { data: userResp } = await supabase.auth.getUser();
if (!userResp.user) { window.location.href = '../../../index.html'; }

const { data: profile } = await supabase.from('profiles').select('*').eq('id', userResp.user.id).single();
const name = profile?.full_name || userResp.user.user_metadata?.full_name || userResp.user.email || 'Khách';

document.getElementById('sbName').textContent   = name;
document.getElementById('sbEmail').textContent  = userResp.user.email || '';
document.getElementById('sbAvatar').textContent = (name[0] || 'K').toUpperCase();

window.doLogout = async function() {
  await supabase.auth.signOut();
  window.location.href = '../../../index.html';
}

window.activeFilter = 'all';
const { data: allBkData } = await supabase.from('bookings').select('*').eq('user_id', userResp.user.id);
window.allBk = allBkData || [];

window.filterBk = function(f, btn){
  window.activeFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
  btn.classList.add('active');
  window.renderList();
}

window.renderList = function(){
  const list = document.getElementById('bkList');
  const bks  = (window.activeFilter === 'all' ? window.allBk : window.allBk.filter(b=>b.status===window.activeFilter))
                .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  if (!bks.length){
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">◷</div><div class="empty-title">Chưa có booking nào</div><div class="empty-sub">Hãy bắt đầu trải nghiệm không gian sáng tạo của Kép Studio.</div><a class="empty-cta" href='../../booking/html/new-booking.html'>Đặt lịch ngay →</a></div>`;
    return;
  }

  const bLabel = s=>({pending:'Chờ xác nhận',confirmed:'Đã xác nhận',rejected:'Từ chối',cancelled:'Đã hủy'}[s]||s);
  
  list.innerHTML = bks.map((b,i)=>`
    <div class="bk-card" onclick="toggleDetail(${i})">
      <div class="bk-card-header">
        <div>
          <div class="bk-code">${b.id}</div>
          <div class="bk-zone">${b.studio_id}</div>
          <div class="bk-meta">${b.date||'—'}&nbsp;·&nbsp;${b.start_time?.substring(0,5)||''} – ${b.end_time?.substring(0,5)||''}</div>
        </div>
        <div class="bk-right">
          <div class="bk-amount">${b.total_price?b.total_price.toLocaleString()+'K':'TBD'}</div>
          <span class="badge badge-${b.status}">${bLabel(b.status)}</span>
        </div>
      </div>
      <button class="bk-toggle-btn" id="tbtn${i}">Chi tiết ↓</button>
      <div class="bk-detail" id="detail${i}">
        <div class="bk-detail-group">
          <div class="bk-detail-label">Thời gian & Zone</div>
          <div class="bk-detail-row"><span>Zone</span><strong>${b.studio_id}</strong></div>
          <div class="bk-detail-row"><span>Ngày</span><strong>${b.date||'—'}</strong></div>
          <div class="bk-detail-row"><span>Bắt đầu</span><strong>${b.start_time?.substring(0,5)||'—'}</strong></div>
          <div class="bk-detail-row"><span>Kết thúc</span><strong>${b.end_time?.substring(0,5)||'—'}</strong></div>
        </div>
        <div class="bk-detail-group">
          <div class="bk-detail-label">Chi phí</div>
          <div class="bk-detail-row"><span>Tổng</span><strong>${b.total_price?b.total_price.toLocaleString()+'K':'TBD'}</strong></div>
          <div class="bk-detail-row"><span>Đặt cọc (30%)</span><strong>${b.total_price?(b.total_price*0.3).toLocaleString()+'K':'—'}</strong></div>
          ${b.purposes?`<div class="bk-detail-row"><span>Mục đích</span><strong>${Array.isArray(b.purposes)?b.purposes.join(', '):b.purposes}</strong></div>`:''}
          ${b.note?`<div class="bk-detail-row"><span>Ghi chú</span><strong>${b.note}</strong></div>`:''}
        </div>
      </div>
    </div>
  `).join('');
}

window.toggleDetail = function(i){
  const d    = document.getElementById('detail'+i);
  const btn  = document.getElementById('tbtn'+i);
  const open = d.classList.contains('open');
  d.classList.toggle('open', !open);
  btn.textContent = open ? 'Thu gọn ↑' : 'Chi tiết ↓';
}

window.renderList();