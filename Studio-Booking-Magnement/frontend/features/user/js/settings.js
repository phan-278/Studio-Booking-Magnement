import { supabase } from '../../../services/supabase-config.js';

const { data: userResp } = await supabase.auth.getUser();
if (!userResp.user) { window.location.href = '../../../index.html'; }

const { data: profile } = await supabase.from('profiles').select('*').eq('id', userResp.user.id).single();
const meta = userResp.user.user_metadata || {};
const fullName = profile?.full_name || meta.full_name || userResp.user.email || 'Khách';

document.getElementById('sbName').textContent   = fullName;
document.getElementById('sbEmail').textContent  = userResp.user.email || '';
document.getElementById('sbAvatar').textContent = (fullName[0] || 'K').toUpperCase();

window.doLogout = async function() {
  await supabase.auth.signOut();
  window.location.href = '../../../index.html';
}

/* Load saved settings from Supabase metadata or local fallback */
const prefs = meta.prefs || JSON.parse(localStorage.getItem('kep_prefs') || '{}');

// Language
window.activeLang = prefs.lang || 'vi';
document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('selected'));
document.getElementById('lang' + window.activeLang.toUpperCase())?.classList.add('selected');

// Theme
window.activeTheme = prefs.theme || 'cream';
applyTheme(window.activeTheme);
document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
document.getElementById('th' + window.activeTheme.charAt(0).toUpperCase() + window.activeTheme.slice(1))?.classList.add('selected');

// Notifications
if (prefs.ntf) {
  document.getElementById('ntfEmail').checked  = prefs.ntf.email  !== false;
  document.getElementById('ntfRemind').checked = prefs.ntf.remind !== false;
  document.getElementById('ntfNews').checked   = !!prefs.ntf.news;
  document.getElementById('ntfZalo').checked   = prefs.ntf.zalo   !== false;
}

window.selectLang = function(lang, el){
  window.activeLang = lang;
  document.querySelectorAll('.lang-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

window.selectTheme = function(theme, el){
  window.activeTheme = theme;
  document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  applyTheme(theme);
}

function applyTheme(theme){
  document.body.classList.remove('dark', 'sepia');
  if (theme === 'dark')  document.body.classList.add('dark');
  if (theme === 'sepia') {
    document.documentElement.style.setProperty('--cream', '#F5EDD9');
    document.documentElement.style.setProperty('--cream-dark', '#EDE0C4');
    document.documentElement.style.setProperty('--ink', '#3D2B1F');
  } else if (theme === 'cream') {
    document.documentElement.style.removeProperty('--cream');
    document.documentElement.style.removeProperty('--cream-dark');
    document.documentElement.style.removeProperty('--ink');
  }
}

window.saveSettings = async function(){
  const newPrefs = {
    lang: window.activeLang,
    theme: window.activeTheme,
    ntf: {
      email:  document.getElementById('ntfEmail').checked,
      remind: document.getElementById('ntfRemind').checked,
      news:   document.getElementById('ntfNews').checked,
      zalo:   document.getElementById('ntfZalo').checked,
    }
  };
  localStorage.setItem('kep_prefs', JSON.stringify(newPrefs));
  
  // Save to Supabase
  await supabase.auth.updateUser({
    data: {
      prefs: newPrefs
    }
  });

  const msg = document.getElementById('settingsSaved');
  msg.style.display = 'block';
  setTimeout(()=>msg.style.display='none', 3000);
}