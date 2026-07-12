const fs = require('fs');
const path = 'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/bookings.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /    <button class="dash-logout-btn" onclick="doAdminLogout\(\)">Đăng xuất<\/button>\r?\n  <\/div>\r?\n  <\/div>\r?\n<\/div>\r?\n\r?\n<!-- MAIN -->\r?\n<div class="dash-main">/m,
  '    <button class="dash-logout-btn" onclick="doAdminLogout()">Đăng xuất</button>\n  </div>\n</aside>\n\n<!-- MAIN -->\n<div class="dash-main">'
);

if (!content.includes('</div>\n</div>\n\n<div class="toast"')) {
  content = content.replace(
    '<div class="toast" id="toast"></div>',
    '</div>\n</div>\n\n<div class="toast" id="toast"></div>'
  );
}

fs.writeFileSync(path, content);
console.log('Fixed bookings.html structure');
