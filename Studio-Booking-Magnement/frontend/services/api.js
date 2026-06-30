import { supabase } from './supabase-config.js';

let _bookings = [];
let _users    = [];
export let _currentUser = null;
export let _currentUserProfile = null;

export async function fetchInitialData() {
  // Check for logout query parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('logout')) {
    await supabase.auth.signOut();
    localStorage.removeItem('kep_admin_auth');
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.reload();
    return;
  }

  const { data: userResp } = await supabase.auth.getUser()
  if (userResp.user) {
    _currentUser = userResp.user;
    
    // Fetch user profile role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', _currentUser.id)
      .single();
      
    if (profile) {
      _currentUserProfile = profile;
      if (_currentUserProfile.role === 'admin') {
        localStorage.setItem('kep_admin_auth', '1');
      } else {
        localStorage.removeItem('kep_admin_auth');
      }
    } else {
      localStorage.removeItem('kep_admin_auth');
    }

    // Attach to window for global access
    window._currentUser = _currentUser;
    window._currentUserProfile = _currentUserProfile;

    // Update sidebar profile instead of userBar
    const sidebarProfile = document.getElementById('sidebarProfile');
    if (sidebarProfile) {
      const name = _currentUserProfile?.full_name || _currentUser.user_metadata?.full_name || _currentUser.email;
      const isAdmin = _currentUserProfile?.role === 'admin';
      const dashUrl = isAdmin ? './features/admin/dashboard.html' : './features/user/dashboard.html';
      const dashIcon = isAdmin ? '⊞' : '◎';
      
      sidebarProfile.innerHTML = `
        <div style="margin-bottom:8px; display:flex; flex-direction:column; gap:4px;">
          <span style="font-size: .65rem; font-weight: 600; color: #fff;">${name}</span>
          <a href="${dashUrl}" style="text-decoration: none; color: rgba(255,255,255,.7); font-size: .55rem; display: flex; align-items: center; gap: 6px; padding: 4px 0;">
            <span aria-hidden="true">${dashIcon}</span>
            <span>${isAdmin ? 'Admin Dashboard' : 'My Dashboard'}</span>
          </a>
        </div>
        <button onclick="doLogout()" style="width:100%; padding: 8px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.7); font-family: var(--font-body); font-size: .55rem; cursor: pointer; transition: all .2s; border-radius: 4px; text-align: center;">Đăng xuất</button>
        <span class="copy" style="display:block; margin-top:12px; font-size:.5rem; color:rgba(255,255,255,.4);">© 2025 Kép Studio</span>
      `;
    }
  } else {
    // If not logged in on Supabase, clear admin auth to sync
    localStorage.removeItem('kep_admin_auth');
    window._currentUser = null;
    window._currentUserProfile = null;
  }

  const { data: bookings } = await supabase.from('bookings').select('*');
  if (bookings) {
    _bookings = bookings.map(b => ({
      id: b.id,
      zone: b.studio_id,
      date: b.date,
      startTime: b.start_time.substring(0, 5),
      endTime: b.end_time.substring(0, 5),
      status: b.status,
      total: b.total_price,
      purposes: b.purposes,
      note: b.note,
      createdAt: b.created_at
    }));
  }
  
  if (typeof window.renderCalendar === 'function') window.renderCalendar();
}

export function getBookings() { return _bookings; }

export async function addBooking(data) {
  if (!_currentUser) {
    if (typeof window.showToast === 'function') window.showToast('Vui lòng đăng nhập trước khi đặt lịch');
    if (typeof window.openAuthFrame === 'function') window.openAuthFrame('login');
    throw new Error('Unauthorized');
  }

  const { data: booking, error } = await supabase.from('bookings').insert({
    user_id: _currentUser.id,
    studio_id: data.zone,
    date: data.date,
    start_time: data.startTime + ':00',
    end_time: data.endTime + ':00',
    total_price: data.total,
    purposes: data.purposes,
    note: data.note,
    status: 'pending'
  }).select().single();

  if (error) {
    if (typeof window.showToast === 'function') window.showToast(error.message);
    throw error;
  }
  
  if (data.equipments && data.equipments.length > 0) {
    const eqpData = data.equipments.map(e => ({
      booking_id: booking.id,
      equipment_id: e,
      quantity: 1
    }));
    await supabase.from('booking_equipments').insert(eqpData);
  }

  const newB = {
    id: booking.id,
    zone: booking.studio_id,
    date: booking.date,
    startTime: booking.start_time.substring(0, 5),
    endTime: booking.end_time.substring(0, 5),
    status: booking.status,
    total: booking.total_price,
    purposes: booking.purposes,
    note: booking.note,
    createdAt: booking.created_at
  };
  _bookings.push(newB);
  return newB;
}

export async function updateBookingStatus(id, status) {
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (!error) {
    const b = _bookings.find(x => x.id === id);
    if (b) b.status = status;
  } else {
    if (typeof window.showToast === 'function') window.showToast('Lỗi cập nhật trạng thái');
  }
}

// Call on load
fetchInitialData();

window.doLogout = async function() {
  await supabase.auth.signOut();
  localStorage.removeItem('kep_admin_auth');
  window.location.reload();
};
