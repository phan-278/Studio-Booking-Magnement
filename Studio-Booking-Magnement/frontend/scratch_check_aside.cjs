const fs = require('fs');

const dashContent = fs.readFileSync('d:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/dashboard.html', 'utf8');
const equipContent = fs.readFileSync('d:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/equipments.html', 'utf8');

const dashMatch = dashContent.match(/<aside[^>]*>([\s\S]*?)<\/aside>/);
const equipMatch = equipContent.match(/<aside[^>]*>([\s\S]*?)<\/aside>/);

console.log('Dash:', dashMatch ? dashMatch[0].length : 'none');
console.log('Equip:', equipMatch ? equipMatch[0].length : 'none');

if (dashMatch && equipMatch) {
    if (dashMatch[0] === equipMatch[0]) {
        console.log('IDENTICAL exactly');
    } else {
        console.log('DIFFERENT');
    }
}
