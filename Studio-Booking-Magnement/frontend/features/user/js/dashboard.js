import { supabase } from '../../../services/supabase-config.js';

const { data: userResp } = await supabase.auth.getUser();
if (!userResp.user) {
  window.location.href = '../../../index.html';
}

const { data: profile } = await supabase.from('profiles').select('*').eq('id', userResp.user.id).single();
const name = profile?.full_name || userResp.user.user_metadata?.full_name || userResp.user.email || 'Khách';

document.getElementById('greetName').textContent = name;
document.getElementById('sbName').textContent    = name;
document.getElementById('sbEmail').textContent   = userResp.user.email || '';
document.getElementById('sbAvatar').textContent  = (name[0] || 'K').toUpperCase();

window.doLogout = async function() {
  await supabase.auth.signOut();
  window.location.href = '../../../index.html';
}

// Load bookings from Supabase
const { data: allBkData } = await supabase.from('bookings').select('*').eq('user_id', userResp.user.id);
const allBk = allBkData || [];

const counts = { total: allBk.length, pending: allBk.filter(b=>b.status==='pending').length, confirmed: allBk.filter(b=>b.status==='confirmed').length };

document.getElementById('statsGrid').innerHTML = `
  <div class="stat-card-d"><div class="stat-card-label">Tổng đặt lịch</div><div class="stat-card-value">${counts.total}</div><div class="stat-card-sub">Tất cả thời gian</div></div>
  <div class="stat-card-d"><div class="stat-card-label">Chờ xác nhận</div><div class="stat-card-value red">${counts.pending}</div><div class="stat-card-sub">Đang xử lý</div></div>
  <div class="stat-card-d"><div class="stat-card-label">Đã xác nhận</div><div class="stat-card-value">${counts.confirmed}</div><div class="stat-card-sub">Hoàn thành</div></div>
  <div class="stat-card-d"><div class="stat-card-label">Thành viên từ</div><div class="stat-card-value" style="font-size:1.1rem;">${profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()}</div><div class="stat-card-sub">Khách hàng thân thiết</div></div>
`;

const recent = [...allBk].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).reverse().slice(0, 4);
const bkEl = document.getElementById('recentBookings');
if (!recent.length) {
  bkEl.innerHTML = `<div class="empty-state"><div class="empty-icon">◷</div><div class="empty-title">Chưa có booking nào</div><div class="empty-sub">Bắt đầu đặt lịch để tận hưởng không gian sáng tạo của Kép Studio.</div></div>`;
} else {
  const badge = s => `<span class="badge badge-${s}">${{pending:'Chờ xác nhận',confirmed:'Đã xác nhận',rejected:'Từ chối',cancelled:'Đã hủy'}[s]||s}</span>`;
  bkEl.innerHTML = recent.map(b => `
    <a class="booking-card" href="my-bookings.html">
      <div><div class="booking-card-code">${b.id}</div><div class="booking-card-zone">${b.studio_id}</div><div class="booking-card-meta">${b.date || '—'} · ${b.start_time?.substring(0,5)||''} – ${b.end_time?.substring(0,5)||''}</div></div>
      <div class="booking-card-right"><div class="booking-card-amount">${b.total_price ? b.total_price.toLocaleString()+'K' : 'TBD'}</div>${badge(b.status)}</div>
    </a>
  `).join('');
}