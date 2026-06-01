import '../../components/layout.js';
import '../../features/auth/auth.js';
import '../../features/booking/booking.js';
import '../../features/admin/admin.js';

// Load Sidebar and Footer dynamically
async function loadComponents() {
  try {
    const sidebarRes = await fetch('./components/sidebar.html');
    if (sidebarRes.ok) {
      const sidebarHtml = await sidebarRes.text();
      const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
      if (sidebarPlaceholder) {
        sidebarPlaceholder.outerHTML = sidebarHtml;
      }
    }

    const footerRes = await fetch('./components/footer.html');
    if (footerRes.ok) {
      const footerHtml = await footerRes.text();
      const footerPlaceholder = document.getElementById('footer-placeholder');
      if (footerPlaceholder) {
        footerPlaceholder.outerHTML = footerHtml;
      }
    }
  } catch (error) {
    console.error('Error loading components:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadComponents);
