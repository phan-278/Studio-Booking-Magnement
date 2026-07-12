const fs = require('fs');
const files = [
  'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/dashboard.html',
  'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/bookings.html'
];

const newSidebarTemplate = (activePage) => `
<div class="dash-layout">
  <aside class="dash-sidebar" id="dashSidebar">
    <div class="dash-brand">
      <a class="dash-brand-name" href="../../../index.html">"Kép"</a>
      <span class="dash-brand-role">Admin Panel</span>
    </div>
    <nav class="dash-nav">
      <div class="dash-nav-section">Tổng quan</div>
      <a class="dash-nav-link ${activePage === 'dashboard' ? 'active' : ''}" href="dashboard.html"><span class="nav-icon">◈</span> Dashboard</a>
      <div class="dash-nav-section">Quản lý</div>
      <a class="dash-nav-link ${activePage === 'bookings' ? 'active' : ''}" href="bookings.html"><span class="nav-icon">◷</span> Booking</a>
      <a class="dash-nav-link" href="studios.html"><span class="nav-icon">◫</span> Zone / Phòng</a>
      <a class="dash-nav-link" href="equipments.html"><span class="nav-icon">◉</span> Thiết bị</a>
      <a class="dash-nav-link" href="users.html"><span class="nav-icon">◎</span> Người dùng</a>
      <a class="dash-nav-link" href="reports.html"><span class="nav-icon">◻</span> Báo cáo</a>
      <div class="dash-nav-section">Hệ thống</div>
      <a class="dash-nav-link" href="../../../index.html"><span class="nav-icon">↗</span> Xem trang chủ</a>
    </nav>
    <div class="dash-sidebar-footer">
      <div class="dash-user-info">
        <div class="dash-user-avatar" style="background:var(--red);">A</div>
        <div>
          <div class="dash-user-name">Admin</div>
          <div class="dash-user-email">Kép Studio</div>
        </div>
      </div>
      <button class="dash-logout-btn" onclick="doAdminLogout()">Đăng xuất</button>
    </div>
  </aside>
`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const activePage = file.includes('dashboard') ? 'dashboard' : 'bookings';
  
  // Replace the whole new sidebar back to the old one
  content = content.replace(/<!-- ── ADMIN SIDEBAR ── -->[\s\S]*?<\/aside>/, newSidebarTemplate(activePage));
  
  // Also we had removed <div class="dash-layout"> and added main to dash-main.
  content = content.replace(/<!-- dash-layout removed -->\r?\n?/g, '');
  content = content.replace(/<div class="dash-main main">/g, '<div class="dash-main">');
  
  // The layout now correctly opens <div class="dash-layout"> in the newSidebarTemplate,
  // we just need to make sure the closing </div> is at the end of the file.
  // In the previous code, there was a </div></div> before <div class="toast">. Let's make sure it's </div>\n<div class="toast".
  content = content.replace(/<\/div>\s*<\/div>\s*<div class="toast"/g, '</div>\n<div class="toast"');
  
  fs.writeFileSync(file, content);
});
console.log('Restored');
