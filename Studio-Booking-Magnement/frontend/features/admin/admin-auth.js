import { supabase } from '../../services/supabase-config.js';

async function checkAdminAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.replace('../../index.html');
    return;
  }
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (error || !profile || profile.role !== 'admin') {
    window.location.replace('../../index.html');
  } else {
    document.body.style.display = 'flex'; // Reveal the UI safely
  }
}

// Call immediately
checkAdminAuth();

window.doAdminLogout = async function() {
  await supabase.auth.signOut();
  localStorage.removeItem('kep_admin_auth');
  window.location.href = '../../index.html?logout=true';
};
