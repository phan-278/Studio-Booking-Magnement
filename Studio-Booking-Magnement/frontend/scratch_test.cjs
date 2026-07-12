const fs = require('fs');
const files = ['studios.html', 'equipments.html', 'reports.html', 'bookings.html'];
files.forEach(f => {
  const content = fs.readFileSync('d:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/' + f, 'utf8');
  const broken = content.includes('<!-- MAIN -->') && content.includes('<div class="dash-main">');
  console.log(f + ': ' + (broken ? 'BROKEN' : 'OK?'));
});
