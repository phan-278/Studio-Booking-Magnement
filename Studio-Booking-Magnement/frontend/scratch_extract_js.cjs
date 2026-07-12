const fs = require('fs');
const path = require('path');
const dir = 'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin';
const files = ['users.html', 'studios.html', 'equipments.html', 'reports.html', 'bookings.html', 'dashboard.html'];

files.forEach(file => {
  const fullPath = path.join(dir, file);
  let content = fs.readFileSync(fullPath, 'utf8');
  
  let jsContent = '';
  // Extract script block (excluding src= ones)
  // There can be multiple script tags. Let's find the first one that has no src attribute and replace it.
  content = content.replace(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/, (match, p1) => {
    jsContent = p1.trim();
    const jsFileName = file.replace('.html', '.js');
    return `<script type="module" src="${jsFileName}"></script>`;
  });
  
  if (jsContent) {
    fs.writeFileSync(path.join(dir, file.replace('.html', '.js')), jsContent);
    fs.writeFileSync(fullPath, content);
    console.log('Extracted JS for ' + file);
  }
});
