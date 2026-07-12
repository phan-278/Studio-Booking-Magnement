const fs = require('fs');
const path = 'd:/#UIT/Nhập môn Công nghệ phần mềm/Đồ án/Studio-Booking-Magnement/frontend/features/admin/html/bookings.html';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
`    <button class="dash-logout-btn" onclick="doAdminLogout()">Đăng xuất</button>
  </div>
  </div>
</div>

<!-- MAIN -->
<div class="dash-main">`,
`    <button class="dash-logout-btn" onclick="doAdminLogout()">Đăng xuất</button>
  </div>
</aside>

<!-- MAIN -->
<div class="dash-main">`
);

content = content.replace(
`      <div class="pagination" id="pagination"></div>
    </div>
  </div>
</div>

<!-- Detail Modal -->`,
`      <div class="pagination" id="pagination"></div>
    </div>
  </div>
</div>
</div>

<!-- Detail Modal -->`
);

fs.writeFileSync(path, content);
console.log('Fixed bookings.html');
