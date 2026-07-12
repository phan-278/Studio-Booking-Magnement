const fs = require('fs');
const path = 'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/dashboard.html';
let content = fs.readFileSync(path, 'utf8');

const missingStr = `    </div>
  </aside>

  <!-- ── MAIN ── -->
  <div class="dash-main">
    <div class="dash-topbar">
      <h1 class="dash-page-title">
        Tổng quan hôm nay
      </h1>
      <div class="dash-topbar-actions">
        <span style="font-family:var(--font-body);font-size:.58rem;color:var(--warm-grey);" id="todayDate"></span>
      </div>
    </div>
`;

content = content.replace(
`<button class="dash-logout-btn" onclick="doAdminLogout()">Đăng xuất</button>
    <div class="dash-content">`,
`<button class="dash-logout-btn" onclick="doAdminLogout()">Đăng xuất</button>
${missingStr}
    <div class="dash-content">`
);

fs.writeFileSync(path, content);
console.log('Fixed HTML');
