const fs = require('fs');
const getSidebar = (file) => {
  const content = fs.readFileSync('d:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/' + file, 'utf8');
  const match = content.match(/<aside[^>]*>([\s\S]*?)<\/aside>/);
  return match ? match[0] : null;
};
const dash = getSidebar('dashboard.html');
const bk = getSidebar('bookings.html');
console.log('Equal?', dash === bk.replace('active" href="bookings.html"', '" href="bookings.html"').replace('" href="dashboard.html"', 'active" href="dashboard.html"'));
