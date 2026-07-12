const fs = require('fs');

const equipContent = fs.readFileSync('d:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/equipments.html', 'utf8');
const equipSidebar = equipContent.match(/<aside[^>]*>([\s\S]*?)<\/aside>/)[0];

const dashPath = 'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/dashboard.html';
let dashContent = fs.readFileSync(dashPath, 'utf8');

dashContent = dashContent.replace(/<aside[^>]*>([\s\S]*?)<\/aside>/, equipSidebar.replace('active" href="equipments.html"', '" href="equipments.html"').replace('" href="dashboard.html"', 'active" href="dashboard.html"'));

fs.writeFileSync(dashPath, dashContent);
console.log('Copied sidebar exactly from equipments.html');
