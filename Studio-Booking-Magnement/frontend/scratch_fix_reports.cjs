const fs = require('fs');
const path = 'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/reports.html';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('<div class="dash-layout">')) {
  // Replace <aside class="dash-sidebar"> with <div class="dash-layout">\n<aside class="dash-sidebar" id="dashSidebar">
  content = content.replace('<aside class="dash-sidebar">', '<div class="dash-layout">\n<aside class="dash-sidebar" id="dashSidebar">');
  
  // Replace the last </body> with </div>\n</body> closing dash-layout
  content = content.replace('</body>', '</div>\n</body>');
  fs.writeFileSync(path, content);
  console.log('Fixed reports.html');
}
