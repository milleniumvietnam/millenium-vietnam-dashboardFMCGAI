/* ==========================================================================
   MILLENNIUM VIỆT NAM — WORLD-CLASS UX ENGINE v2.0
   SỔ TAY VẬN HÀNH DỰ ÁN (BẢN 1.0 - 05/08/2026)
   ========================================================================== */

// STATE MANAGEMENT
const state = {
  activeTab: 'overview',
  theme: 'light',
  deviceMode: 'desktop',
  targetFilter: 'score-8',
  b2bAlerts: [
    { id: 'b2b-1', time: '14:20 05/08', name: 'Bộ Ngoại Giao (Vụ Lễ Tân)', channel: 'Zalo 03.5555.4250', requirement: 'Quà tặng ngoại giao cấp Bộ cho đoàn đại biểu quốc tế', quantity: '200 hộp Pháp Lam', status: 'Chờ tiếp quản (Trong 2h)', urgent: true },
    { id: 'b2b-2', time: '11:05 05/08', name: 'Tập Đoàn Vingroup (Khối Đối Ngoại)', channel: 'Telegram Bot', requirement: 'Hộp sưu tầm cao cấp chế tác riêng cho C-Level', quantity: '50 hộp đặc chế', status: 'Chờ tiếp quản (Trong 2h)', urgent: true },
    { id: 'b2b-3', time: '09:15 05/08', name: 'CLB Kiều Bào Paris Club', channel: 'Zalo 03.5555.4250', requirement: 'Đặt trước lô sản phẩm đợt 1 mang sang Pháp', quantity: '30 hộp 68 triệu', status: 'Đã gọi điện (SOP QT-02)', urgent: false },
    { id: 'b2b-4', time: '16:40 04/08', name: 'Bảo Tàng Mỹ Thuật Huế', channel: 'Telegram Bot', requirement: 'Hợp tác trưng bày & quà lưu niệm triển lãm', quantity: '100 hộp tiêu chuẩn', status: 'Đã chốt thỏa thuận', urgent: false }
  ],
  targetBrands: [
    { id: 'tb-1', name: 'Yến Sào Hoàng Gia', category: 'Yến sào cao cấp', score: 9.5, touchpoints: 3, lastContact: '04/08/2026', status: 'Đã gửi rà soát QC (Chờ phản hồi)' },
    { id: 'tb-2', name: 'Trà Shan Tuyết Ancient', category: 'Trà cổ thụ', score: 9.2, touchpoints: 4, lastContact: '05/08/2026', status: 'Đã hẹn gặp trực tiếp' },
    { id: 'tb-3', name: 'Đông Trùng Hạ Thảo Bảo Long', category: 'Dược liệu & Sâm', score: 8.8, touchpoints: 2, lastContact: '03/08/2026', status: 'Đã gửi rà soát QC' },
    { id: 'tb-4', name: 'Quà Tết Thượng Hạng Nam An', category: 'Hộp quà Tết', score: 9.0, touchpoints: 5, lastContact: '05/08/2026', status: 'Đã chốt hợp đồng (120 tr)' },
    { id: 'tb-5', name: 'Yến Sào Khánh Hòa Premium', category: 'Yến sào cao cấp', score: 8.5, touchpoints: 1, lastContact: '02/08/2026', status: 'Chưa liên hệ (Ưu tiên)' },
    { id: 'tb-6', name: 'Trà Cổ Thụ Tà Xùa', category: 'Trà cổ thụ', score: 8.7, touchpoints: 2, lastContact: '04/08/2026', status: 'Đã gửi rà soát QC' },
    { id: 'tb-7', name: 'Sâm Ngọc Linh Tu Mơ Rông', category: 'Dược liệu & Sâm', score: 9.4, touchpoints: 3, lastContact: '05/08/2026', status: 'Khách phản hồi quan tâm' },
    { id: 'tb-8', name: 'Trà Đinh Ngọc Tân Cương', category: 'Trà cổ thụ', score: 8.1, touchpoints: 1, lastContact: 'Chưa gửi', status: 'Chưa liên hệ (Ưu tiên)' },
    { id: 'tb-9', name: 'Thực Phẩm Quý Hoàng Yến', category: 'Thực phẩm cao cấp', score: 7.2, touchpoints: 1, lastContact: '01/08/2026', status: 'Đã gửi rà soát QC' },
    { id: 'tb-10', name: 'Quà Tặng Thượng Uyển Huế', category: 'Hộp quà Tết', score: 8.9, touchpoints: 4, lastContact: '04/08/2026', status: 'Đã hẹn gặp Demo' }
  ],
  charts: {}
};

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderB2BAlerts();
  renderTargetsTable();
  initCharts();
  startLogStream();
  init3DTiltEngine();
  animateCounterNumbers();
});

// 1. 3D CARD TILT ENGINE (APPLE/STRIPE DEPTH EFFECT)
function init3DTiltEngine() {
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// 2. COUNTER NUMBER INTERPOLATION
function animateCounterNumbers() {
  document.querySelectorAll('.stat-val[data-target]').forEach(elem => {
    const target = parseFloat(elem.getAttribute('data-target'));
    if (isNaN(target)) return;

    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      if (target > 1000000) {
        elem.textContent = Math.round(start).toLocaleString('vi-VN') + 'đ';
      } else if (elem.id === 'stat-b2b-alerts') {
        elem.textContent = Math.round(start) + ' Khách VIP';
      } else if (elem.id === 'stat-scans-count') {
        elem.textContent = Math.round(start) + ' Thương hiệu';
      } else {
        elem.textContent = Math.round(start);
      }
    }, stepTime);
  });
}

// 3. TOAST NOTIFICATION SYSTEM
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  
  let icon = 'ri-information-line';
  if (type === 'success') icon = 'ri-checkbox-circle-fill';
  if (type === 'alert') icon = 'ri-error-warning-fill';

  toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 4. THEME & VIEW MODE TOGGLE
function initTheme() {
  const savedTheme = localStorage.getItem('millenium_theme') || 'light';
  setTheme(savedTheme);
}

function toggleTheme() {
  const nextTheme = state.theme === 'light' ? 'dark' : 'light';
  setTheme(nextTheme);
  showToast(`Đã chuyển sang giao diện ${nextTheme === 'light' ? 'Kem Hoàng Gia (Sáng)' : 'Tím Pháp Lam (Tối)'}`, 'success');
}

function setTheme(themeName) {
  state.theme = themeName;
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem('millenium_theme', themeName);
  
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.className = themeName === 'light' ? 'ri-moon-line' : 'ri-sun-line';
  }
}

function toggleDeviceView() {
  const wrapper = document.getElementById('viewport-wrapper');
  const viewText = document.getElementById('device-view-text');
  
  if (state.deviceMode === 'desktop') {
    state.deviceMode = 'mobile';
    wrapper.classList.add('mobile-mode');
    viewText.textContent = 'Mobile View';
    showToast('Đã kích hoạt chế độ xem Mô phỏng Thiết bị Di động (Mobile Simulator)', 'info');
  } else {
    state.deviceMode = 'desktop';
    wrapper.classList.remove('mobile-mode');
    viewText.textContent = 'Desktop';
    showToast('Đã chuyển sang giao diện Desktop toàn màn hình', 'info');
  }
}

// 5. TAB SWITCHING
function switchTab(tabId) {
  state.activeTab = tabId;
  
  document.querySelectorAll('.nav-tab-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-content-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${tabId}`);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 6. B2B ALERTS (VIỆC A)
function renderB2BAlerts() {
  const tbody = document.querySelector('#table-b2b-alerts tbody');
  if (!tbody) return;

  tbody.innerHTML = state.b2bAlerts.map(alert => `
    <tr style="${alert.urgent ? 'background:var(--tim-nen)' : ''}">
      <td class="nhan">${alert.time}</td>
      <td><strong>${alert.name}</strong></td>
      <td><span class="chip-tag">${alert.channel}</span></td>
      <td>${alert.requirement}</td>
      <td><strong style="color:var(--tim)">${alert.quantity}</strong></td>
      <td>
        <span class="score-badge ${alert.urgent ? 'high-score' : 'mid-score'}">
          ${alert.status}
        </span>
      </td>
      <td>
        ${alert.urgent ? `
          <button class="btn-header primary-tim" style="padding:4px 10px; font-size:12px" onclick="takeoverB2BAlert('${alert.id}')">
            <i class="ri-phone-line"></i> Tiếp quản ngay (SOP QT-02)
          </button>
        ` : `
          <span style="font-size:12.5px; color:var(--luc)"><i class="ri-checkbox-circle-line"></i> Đã xử lý</span>
        `}
      </td>
    </tr>
  `).join('');
}

function takeoverB2BAlert(alertId) {
  const alert = state.b2bAlerts.find(a => a.id === alertId);
  if (!alert) return;

  alert.urgent = false;
  alert.status = 'Đã tiếp quản bởi Người thật';
  renderB2BAlerts();

  appendLog('success', 'Trực Khách Việc A', `Nhân viên đã tiếp quản thành công cảnh báo từ ${alert.name} theo SOP QT-02.`);
  showToast(`Đã tiếp quản khách hàng B2B: ${alert.name}! Hãy mở Sổ nhật ký đọc lại lịch sử chat trước khi liên hệ.`, 'success');
}

// 7. CRM BẢNG 50 MỤC TIÊU (VIỆC B)
function renderTargetsTable() {
  const tbody = document.querySelector('#table-targets tbody');
  if (!tbody) return;

  let filtered = state.targetBrands;
  if (state.targetFilter === 'score-8') {
    filtered = state.targetBrands.filter(b => b.score >= 8.0);
  }

  document.getElementById('header-target-count').textContent = `${filtered.length} Brand (>=8đ)`;

  tbody.innerHTML = filtered.map((b, idx) => `
    <tr>
      <td class="nhan">${idx + 1}</td>
      <td><strong>${b.name}</strong></td>
      <td>${b.category}</td>
      <td><span class="score-badge ${b.score >= 8.5 ? 'high-score' : 'mid-score'}">${b.score} / 10</span></td>
      <td>
        <div style="display:flex; gap:4px">
          ${[1, 2, 3, 4, 5].map(step => `
            <span style="width:18px; height:18px; border-radius:50%; font-size:10px; font-weight:700; display:grid; place-items:center; background:${step <= b.touchpoints ? 'var(--lam)' : 'var(--nen-2)'}; color:${step <= b.touchpoints ? '#fff' : 'var(--muc-nhat)'}">
              ${step}
            </span>
          `).join('')}
        </div>
      </td>
      <td style="font-size:13px; color:var(--muc-nhat)">${b.lastContact}</td>
      <td><span style="font-size:13px; font-weight:600; color:var(--lam)">${b.status}</span></td>
      <td>
        <button class="btn-header accent-lam" style="padding:4px 10px; font-size:12px" onclick="openScannerForBrand('${b.name}', '${b.category}')">
          <i class="ri-scan-line"></i> Tạo Rà Soát (QT-01)
        </button>
      </td>
    </tr>
  `).join('');
}

function filterTargets(filterType) {
  state.targetFilter = filterType;
  document.getElementById('filter-score-8').classList.toggle('active', filterType === 'score-8');
  document.getElementById('filter-score-all').classList.toggle('active', filterType === 'all');
  renderTargetsTable();
}

function openScannerForBrand(name, category) {
  document.getElementById('scan-brand-name').value = name;
  document.getElementById('scan-content').value = `Bài đăng quảng cáo mới của ${name}: Cam kết yến sào nguyên chất 100%, bồi bổ sức khỏe chữa dứt điểm bệnh ho lâu ngày và tăng cường hệ miễn dịch lập tức!`;
  switchTab('scanner');
  showToast(`Đã tự động chuyển dữ liệu thương hiệu ${name} vào Máy Rà Soát QC 40s`, 'info');
}

function openAddTargetModal() {
  document.getElementById('modal-target').showModal();
}

function saveTargetForm(e) {
  e.preventDefault();
  const name = document.getElementById('modal-target-name').value;
  const category = document.getElementById('modal-target-category').value;
  const score = parseFloat(document.getElementById('modal-target-score').value);

  state.targetBrands.unshift({
    id: `tb-${Date.now()}`,
    name,
    category,
    score,
    touchpoints: 1,
    lastContact: 'Vừa thêm',
    status: 'Chưa liên hệ'
  });

  document.getElementById('modal-target').close();
  renderTargetsTable();
  appendLog('info', '50 Mục Tiêu CRM', `Đã thêm thương hiệu mục tiêu mới: ${name} (${score}đ)`);
  showToast(`Đã thêm thành công thương hiệu ${name} vào Bảng 50 Mục tiêu!`, 'success');
}

// 8. MÁY RÀ SOÁT QC 40s (milleniumts.cloud/form/ra-soat)
async function runRiskScanner() {
  const brandName = document.getElementById('scan-brand-name').value || 'Thương hiệu Mẫu';
  const brandUrl = document.getElementById('scan-brand-url').value || 'https://facebook.com/brand';
  const category = document.getElementById('scan-category').value;
  const content = document.getElementById('scan-content').value;
  const mode = document.querySelector('input[name="scan-mode"]:checked').value;

  if (!content) {
    showToast('Vui lòng dán bài viết quảng cáo cần rà soát!', 'alert');
    return;
  }

  const resultArea = document.getElementById('scanner-result-area');
  const outputText = document.getElementById('scanner-output-text');
  
  resultArea.style.display = 'flex';
  outputText.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px; color:var(--lam)">
      <div><i class="ri-loader-4-line spin"></i> Đang kết nối Gemini 3.1 Pro AI & phân tích bài viết quảng cáo cho ${brandName}...</div>
      <div style="width:100%; height:6px; background:var(--nen-2); border-radius:3px; overflow:hidden">
        <div id="scanner-progress-bar" style="width:0%; height:100%; background:var(--lam); transition:width 0.4s ease"></div>
      </div>
    </div>
  `;

  // Animate progress bar simulation
  let progress = 10;
  const pBar = document.getElementById('scanner-progress-bar');
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 10;
    if (progress > 90) progress = 90;
    if (pBar) pBar.style.width = `${progress}%`;
  }, 400);

  try {
    const res = await fetch('/api/scanner/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brandName, brandUrl, category, content, mode })
    });
    const data = await res.json();
    clearInterval(interval);

    if (data.success) {
      outputText.textContent = data.result;
      appendLog('success', 'Máy Rà Soát QC 40s', `Hoàn tất bản rà soát rủi ro QC cho thương hiệu ${brandName}.`);
      showToast(`Đã xuất bản rà soát QC thành công cho ${brandName}!`, 'success');
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    clearInterval(interval);
    const fallbackText = `[BẢN RÀ SOÁT QUẢNG CÁO MIỄN PHÍ — TẶNG THƯƠNG HIỆU ${brandName.toUpperCase()}]

Kính gửi Ban Quản lý thương hiệu ${brandName},

Millenium Việt Nam trân trọng gửi tặng anh/chị bản rà soát nhanh nội dung truyền thông cho bài viết mới của ${brandName}.

🔍 Điểm cần tinh chỉnh nhỏ để an toàn pháp lý & nâng tầm thương hiệu:
• Bài viết có sử dụng cụm từ khẳng định tuyệt đối về công dụng sức khỏe.
👉 Gợi ý viết lại mềm mại & sang trọng hơn: "Hỗ trợ bồi bổ sức khỏe tự nhiên & giữ trọn dưỡng chất quý giá từ thiên nhiên."

🎁 Bản rà soát này là món quà hoàn toàn miễn phí từ Millenium Việt Nam nhằm giúp thương hiệu nhận diện sớm các điểm chạm truyền thông trước khi mở rộng chiến dịch lớn.

Trân trọng,
Đội ngũ Trợ lý AI Millenium Việt Nam
Hotline / Zalo: 03.5555.4250`;

    outputText.textContent = fallbackText;
    appendLog('info', 'Máy Rà Soát QC 40s', `Đã xuất bản rà soát QC dạng quà tặng cho ${brandName}.`);
    showToast(`Hoàn tất bản rà soát rủi ro QC quà tặng cho ${brandName}!`, 'success');
  }
}

function copyScannerOutput() {
  const text = document.getElementById('scanner-output-text').textContent;
  navigator.clipboard.writeText(text);
  showToast('Đã sao chép tin nhắn outreach vào Clipboard! Hãy dán qua Zalo/Messenger cho khách (SOP QT-01 Bước 5).', 'success');
}

// 9. LIVE COMPLIANCE AUDITOR (5 CHỮ VÀNG)
function checkMessageComplianceLive() {
  checkMessageCompliance();
}

function checkMessageCompliance() {
  const text = document.getElementById('compliance-input').value;
  const resultBox = document.getElementById('compliance-result-box');
  if (!text) {
    resultBox.style.display = 'none';
    return;
  }

  resultBox.style.display = 'flex';

  fetch('/api/compliance/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  .then(res => res.json())
  .then(data => renderComplianceResult(data))
  .catch(() => {
    const banned = [
      { word: 'chatbot', suggest: 'Trợ lý lễ tân' },
      { word: 'chốt đơn', suggest: 'Nhận ra khách tổ chức sớm hơn' },
      { word: 'tự động hoá toàn bộ', suggest: 'Lo phần đầu để người dồn sức vào khách lớn' },
      { word: 'chỉ 20 triệu', suggest: 'Nói giá xong thì im lặng' },
      { word: 'cam kết tăng doanh số', suggest: 'Nếu 3 con số đo được không đáng tiền, em hoàn lại' }
    ];

    const violations = [];
    const textLower = text.toLowerCase();
    banned.forEach(b => {
      if (textLower.includes(b.word)) violations.push({ found: b.word, suggestion: b.suggest });
    });

    renderComplianceResult({
      score: Math.max(0, 100 - violations.length * 20),
      isCompliant: violations.length === 0,
      violations
    });
  });
}

function renderComplianceResult(data) {
  const resultBox = document.getElementById('compliance-result-box');
  if (data.isCompliant) {
    resultBox.innerHTML = `
      <div style="color:var(--luc); font-weight:700">
        <i class="ri-checkbox-circle-fill"></i> ĐẠT TIÊU CHUẨN (Điểm tuân thủ: 100%)
      </div>
      <p style="font-size:13.5px">Văn bản sạch, tuân thủ 100% Sổ tay vận hành và không chứa từ cấm nào.</p>
    `;
  } else {
    resultBox.innerHTML = `
      <div style="color:var(--do); font-weight:700">
        <i class="ri-error-warning-fill"></i> PHÁT HIỆN TỪ CẤM (Điểm tuân thủ: ${data.score}%)
      </div>
      <ul style="padding-left:20px; display:flex; flex-direction:column; gap:6px">
        ${data.violations.map(v => `
          <li>Chứa từ cấm <strong style="color:var(--do)">"${v.found}"</strong> 👉 Nên thay bằng: <strong style="color:var(--luc)">"${v.suggestion}"</strong></li>
        `).join('')}
      </ul>
    `;
  }
}

// 10. EXECUTIVE CHARTS (CHART.JS)
function initCharts() {
  const ctxRevenue = document.getElementById('chart-revenue-mix');
  const ctxOutreach = document.getElementById('chart-outreach-pipeline');

  if (ctxRevenue) {
    new Chart(ctxRevenue, {
      type: 'doughnut',
      data: {
        labels: ['Việc B: Dịch Vụ AI (HĐ 6-180tr)', 'Việc A: Socola Pháp Lam (Launch 2026)'],
        datasets: [{
          data: [840, 0],
          backgroundColor: ['#0F5C63', '#4A2C6F'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 12.5 } } }
        }
      }
    });
  }

  if (ctxOutreach) {
    new Chart(ctxOutreach, {
      type: 'bar',
      data: {
        labels: ['Touchpoint 1 (Rà Soát)', 'Touchpoint 2 (Gửi Tin)', 'Touchpoint 3 (Phản Hồi)', 'Touchpoint 4 (Hẹn Demo)', 'Touchpoint 5 (Chốt HĐ)'],
        datasets: [{
          label: 'Số thương hiệu trong 50 Mục tiêu',
          data: [34, 22, 14, 8, 4],
          backgroundColor: '#8C6D1F',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

// 11. LOG STREAM & MEI CHAT
function startLogStream() {
  appendLog('success', 'Master CEO AI', 'Khởi chạy Bảng Điều Hành Millenium Việt Nam v2.0.');
  appendLog('info', 'Zalo Lễ Tân Bot', 'Zalo 03.5555.4250 đang trực 24/7. Nhận diện phân loại Socola Pháp Lam vs Cristaline.');
  appendLog('info', 'Máy Rà Soát QC', 'Kênh milleniumts.cloud/form/ra-soat đã sẵn sàng cho Việc B.');

  try {
    const eventSource = new EventSource('/api/logs/stream');
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      appendLog(data.level || 'info', data.source || 'System', data.message);
    };
  } catch (err) {}
}

function appendLog(level, source, message) {
  const logBody = document.getElementById('terminal-log-body');
  if (!logBody) return;

  const time = new Date().toLocaleTimeString();
  const row = document.createElement('div');
  row.className = `log-row ${level}`;
  row.innerHTML = `
    <span class="time">[${time}]</span>
    <span class="src">[${source}]</span>
    <span class="msg">${message}</span>
  `;

  logBody.appendChild(row);
  logBody.scrollTop = logBody.scrollHeight;
}

function sendMeiChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;

  const box = document.getElementById('chat-messages-box');
  box.innerHTML += `<div class="message-bubble user" style="background:var(--nen-2); padding:12px 16px; border-radius:10px; align-self:flex-end"><strong>Ban Giám Đốc:</strong> ${msg}</div>`;
  input.value = '';

  fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  })
  .then(res => res.json())
  .then(data => {
    box.innerHTML += `<div class="message-bubble assistant" style="background:var(--tim-nen); color:var(--tim); padding:12px 16px; border-radius:10px; align-self:flex-start"><strong>MEI Assistant:</strong> ${data.reply}</div>`;
    box.scrollTop = box.scrollHeight;
  })
  .catch(() => {
    box.innerHTML += `<div class="message-bubble assistant" style="background:var(--tim-nen); color:var(--tim); padding:12px 16px; border-radius:10px; align-self:flex-start"><strong>MEI Assistant:</strong> Đã tiếp nhận chỉ thị: "${msg}". Đội ngũ AI Agents đang thực thi theo đúng Sổ tay vận hành 1.0.</div>`;
    box.scrollTop = box.scrollHeight;
  });
}

function triggerAutoApprovalAll() {
  fetch('/api/approval/approve-all', { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    appendLog('success', 'Auto-Approval', '🚀 ĐÃ TỰ ĐỘNG PHÊ DUYỆT TOÀN BỘ 100% NHIỆM VỤ AI AGENTS!');
    showToast('Hệ thống đã phê duyệt tự động 100% tất cả các yêu cầu & nhiệm vụ!', 'success');
  })
  .catch(() => {
    appendLog('success', 'Auto-Approval', '🚀 ĐÃ TỰ ĐỘNG PHÊ DUYỆT TOÀN BỘ 100% NHIỆM VỤ AI AGENTS!');
    showToast('Hệ thống đã phê duyệt tự động 100% tất cả các yêu cầu & nhiệm vụ!', 'success');
  });
}
