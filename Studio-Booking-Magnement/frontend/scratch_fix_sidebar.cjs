const fs = require('fs');
const files = [
  'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/dashboard.html',
  'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/bookings.html'
];

const newSidebarTemplate = (activePage) => `
  <!-- ── ADMIN SIDEBAR ── -->
  <aside class="sidebar" id="sidebar">
    <!-- Brand / Logo -->
    <a class="brand" href="dashboard.html" aria-label="Kép Studio - Admin">
      <img src="../../../assets/KepDaSpace/INTRO11.png" alt="Kép Studio" class="brand-logo-img" />
    </a>

    <!-- Navigation -->
    <nav class="sidebar-nav" aria-label="Admin navigation">
      <a href="dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">
        <span class="nav-num">◈</span>
        <span class="nav-label">Dashboard</span>
      </a>
      <a href="bookings.html" class="nav-link ${activePage === 'bookings' ? 'active' : ''}">
        <span class="nav-num">◷</span>
        <span class="nav-label">Booking</span>
      </a>
      <a href="studios.html" class="nav-link">
        <span class="nav-num">◫</span>
        <span class="nav-label">Zone / Phòng</span>
      </a>
      <a href="equipments.html" class="nav-link">
        <span class="nav-num">◉</span>
        <span class="nav-label">Thiết bị</span>
      </a>
      <a href="users.html" class="nav-link">
        <span class="nav-num">◎</span>
        <span class="nav-label">Người dùng</span>
      </a>
      <a href="reports.html" class="nav-link">
        <span class="nav-num">◻</span>
        <span class="nav-label">Báo cáo</span>
      </a>
      <a href="../../../index.html" class="nav-link">
        <span class="nav-num">↗</span>
        <span class="nav-label">Trang chủ</span>
      </a>
    </nav>

    <!-- Footer actions -->
    <div class="sidebar-foot" style="padding-bottom: 24px;">
      <button class="admin-btn" onclick="doAdminLogout()">
        <span class="admin-icon">↪</span>
        <span class="admin-label">Đăng xuất</span>
      </button>
    </div>
  </aside>
`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace <aside class="dash-sidebar"> ... </aside> with new sidebar
  const activePage = file.includes('dashboard') ? 'dashboard' : 'bookings';
  content = content.replace(/<aside class="dash-sidebar" id="dashSidebar">[\s\S]*?<\/aside>/, newSidebarTemplate(activePage));
  
  // Replace <div class="dash-layout"> with <!-- dash-layout removed -->
  content = content.replace(/<div class="dash-layout">/, '<!-- dash-layout removed -->');
  
  // Replace <div class="dash-main"> with <div class="dash-main main">
  content = content.replace(/<div class="dash-main">/, '<div class="dash-main main">');
  
  // Remove the closing </div> of dash-layout. The dash-layout was wrapping dash-main in dashboard, 
  // but dash-layout closing was moved to the very bottom in dashboard.html.
  // In bookings.html, it's also at the bottom since we ran the previous fix!
  content = content.replace(/<\/div>\s*<div class="toast"/, '<div class="toast"');
  
  fs.writeFileSync(file, content);
});
console.log('Sidebar replaced');
