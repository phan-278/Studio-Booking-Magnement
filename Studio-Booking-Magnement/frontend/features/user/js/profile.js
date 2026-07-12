import { supabase } from '../../../services/supabase-config.js';

const { data: userResp } = await supabase.auth.getUser();
if (!userResp.user) { window.location.href = '../../../index.html'; }

const { data: profile } = await supabase.from('profiles').select('*').eq('id', userResp.user.id).single();
const meta = userResp.user.user_metadata || {};
const fullName = profile?.full_name || meta.full_name || userResp.user.email || 'Khách';
const email = userResp.user.email;
const phone = profile?.phone || meta.phone || '';

window.doLogout = async function() {
  await supabase.auth.signOut();
  window.location.href = '../../../index.html';
}

// Populate sidebar
document.getElementById('sbName').textContent   = fullName;
document.getElementById('sbEmail').textContent  = email;
document.getElementById('sbAvatar').textContent = (fullName[0] || 'K').toUpperCase();

// Big avatar
const initials = fullName.substring(0,2).toUpperCase();
document.getElementById('bigAvatar').textContent = initials;
document.getElementById('bigName').textContent   = fullName;
document.getElementById('bigEmail').textContent  = email;

// Stats
const { data: bks } = await supabase.from('bookings').select('status').eq('user_id', userResp.user.id);
const bksList = bks || [];
document.getElementById('statTotal').textContent = bksList.length;
document.getElementById('statDone').textContent  = bksList.filter(b=>b.status==='confirmed').length;
document.getElementById('memberSince').textContent = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN',{month:'long',year:'numeric'}) : new Date().toLocaleDateString('vi-VN',{month:'long',year:'numeric'});

// Fill form
const nameParts = fullName.split(' ');
const firstName = nameParts.pop() || '';
const lastName = nameParts.join(' ');

document.getElementById('pfLastName').value  = lastName;
document.getElementById('pfFirstName').value = firstName;
document.getElementById('pfEmail').value     = email;
document.getElementById('pfPhone').value     = phone;
document.getElementById('pfDob').value       = meta.dob || '';
document.getElementById('pfGender').value    = meta.gender || '';
document.getElementById('pfJob').value       = meta.job || '';

window.saveProfile = async function() {
  const ln = document.getElementById('pfLastName').value.trim();
  const fn = document.getElementById('pfFirstName').value.trim();
  const pPhone = document.getElementById('pfPhone').value.trim();
  const dob = document.getElementById('pfDob').value;
  const gender = document.getElementById('pfGender').value;
  const job = document.getElementById('pfJob').value.trim();
  const newFullName = (ln ? ln + ' ' : '') + fn;

  // Update profile in DB
  await supabase.from('profiles').update({ full_name: newFullName, phone: pPhone }).eq('id', userResp.user.id);
  
  // Update user metadata (for extra fields)
  await supabase.auth.updateUser({
    data: {
      full_name: newFullName,
      phone: pPhone,
      dob,
      gender,
      job
    }
  });

  // Refresh display
  document.getElementById('bigName').textContent  = newFullName;
  document.getElementById('sbName').textContent   = newFullName;
  document.getElementById('bigAvatar').textContent = newFullName.substring(0,2).toUpperCase();
  document.getElementById('sbAvatar').textContent = newFullName.substring(0,1).toUpperCase();

  const msg = document.getElementById('saveMsg');
  msg.style.display = 'block';
  setTimeout(()=>msg.style.display='none', 3000);
}

window.changePw = async function() {
  const nw  = document.getElementById('pwNew').value;
  const msg = document.getElementById('pwMsg');
  msg.style.display = 'block';
  msg.style.color   = 'var(--red)';

  if (!nw) { msg.textContent = 'Vui lòng nhập mật khẩu mới.'; return; }
  if (nw.length < 8) { msg.textContent = 'Mật khẩu mới tối thiểu 8 ký tự.'; return; }

  const { error } = await supabase.auth.updateUser({ password: nw });
  if (error) {
    msg.textContent = error.message;
    return;
  }

  msg.style.color   = '#2E7D32';
  msg.textContent   = '✓ Đã đổi mật khẩu thành công';
  document.getElementById('pwCurrent').value = '';
  document.getElementById('pwNew').value     = '';
  setTimeout(()=>msg.style.display='none', 3000);
}