// ================================================================
//  Kép Studio — assets/js/main.js
// ================================================================

import './layout.js';

// Uncomment khi các file này tồn tại:
// import './auth/auth.js';
// import './booking/booking.js';
// import './admin/admin.js';

async function loadComponents() {
  try {
    const [sidebarRes, footerRes] = await Promise.all([
      fetch('./components/sidebar.html'),
      fetch('./components/footer.html'),
    ]);

    if (sidebarRes.ok) {
      const sidebarHtml = await sidebarRes.text();
      const placeholder = document.getElementById('sidebar-placeholder');
      if (placeholder) placeholder.outerHTML = sidebarHtml;
    } else {
      console.warn('[main] sidebar.html not found:', sidebarRes.status);
    }

    if (footerRes.ok) {
      const footerHtml = await footerRes.text();
      const placeholder = document.getElementById('footer-placeholder');
      if (placeholder) placeholder.outerHTML = footerHtml;
    } else {
      console.warn('[main] footer.html not found:', footerRes.status);
    }

  } catch (err) {
    console.error('[main] Failed to load components:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadComponents);