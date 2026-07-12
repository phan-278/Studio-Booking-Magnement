const fs = require('fs');
const path = 'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/dashboard.html';
let content = fs.readFileSync(path, 'utf8');

const missingStr = `          <span class="qa-icon">◻</span>
          <span class="qa-label">Báo cáo</span>
          <span class="qa-sub">Doanh thu tháng</span>
        </a>
      </div>

      <!-- 2-col: Today bookings + Activity -->
      <div class="dash-grid-2col">

        <!-- Today's bookings -->
        <div>
          <div class="dash-section-title">
            Booking hôm nay
            <a href="bookings.html">Xem tất cả →</a>
          </div>
          <div style="background:#fff;border:1px solid var(--border);padding:24px;">
            <div id="todayBookingsList">
              <div style="text-align:center;padding:32px;color:var(--warm-grey);font-family:var(--font-body);font-size:.64rem;">
                Chưa có booking nào hôm nay.
              </div>
            </div>
          </div>
        </div>

        <!-- Activity feed — today only -->
        <div>
          <div class="dash-section-title">Hoạt động hôm nay</div>
          <div style="background:#fff;border:1px solid var(--border);padding:20px 24px;">
            <div class="activity-feed" id="activityFeed"></div>
          </div>
        </div>
      </div>

      <!-- Recent bookings table — today -->
      <div class="dash-section-title" style="margin-top:28px;">
        Booking mới nhất hôm nay
        <a href="bookings.html">Quản lý tất cả →</a>`;

content = content.replace(
  /<a class="qa-card" href="reports\.html">\s*<\/div>\s*<div class="dash-table-wrap">/m,
  '<a class="qa-card" href="reports.html">\n' + missingStr + '\n      </div>\n      <div class="dash-table-wrap">'
);

fs.writeFileSync(path, content);
console.log('Fixed HTML properly');
