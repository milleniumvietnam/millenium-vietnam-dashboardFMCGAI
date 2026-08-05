# Millennium Vietnam - Autonomous AI Enterprise OS (v4.2)

Nền tảng quản trị và vận hành doanh nghiệp tự động hóa hoàn toàn bằng AI (Autonomous AI OS) hỗ trợ đa giao diện (Desktop & Mobile View), kết nối cơ sở dữ liệu SQLite thật, Claude API (Anthropic SDK) thật và n8n Workflow Engine thật.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Ứng Dụng (Chạy Thật)

### Bước 1: Cài đặt Dependencies của Node.js
Mở Terminal tại thư mục dự án và chạy lệnh sau để cài đặt các package cần thiết:
```bash
npm install
```

### Bước 2: Cấu hình Biến Môi Trường (API Keys)
1. Tạo file `.env` từ file mẫu `.env.example` hoặc mở trực tiếp file `server/.env` hiện có.
2. Thiết lập key cho các dịch vụ:
   - **`ANTHROPIC_API_KEY`**: Điền API Key của Claude (lấy từ [Anthropic Console](https://console.anthropic.com/)).
   - **`N8N_API_URL`**: Địa chỉ instance n8n của bạn (mặc định là `http://localhost:5678`).
   - **`N8N_API_KEY`**: API Key của n8n (lấy từ *Settings > API Keys* trong giao diện n8n).

> [!NOTE]
> Nếu bạn chưa điền các API Key, hệ thống sẽ tự động chuyển sang chế độ **Giả lập thông minh (Mock Mode)** để bạn vẫn có thể trải nghiệm đầy đủ các tính năng trên giao diện mà không gặp lỗi crash hệ thống.

### Bước 3: Khởi chạy n8n Workflow Engine (Tùy chọn nếu muốn kết nối thật)
Nếu bạn chưa cài n8n, bạn có thể chạy nhanh n8n local thông qua npm (không cần cài đặt phức tạp):
```bash
npx n8n start
```
Hoặc qua Docker (khuyên dùng cho production):
```bash
docker run -it --rm --name n8n -p 5678:5678 n8n/n8n
```

### Bước 4: Khởi động Server Vận Hành Millennium
Chạy lệnh khởi động cả Backend và Frontend Web Server:
```bash
npm start
```
Hệ thống sẽ chạy tại địa chỉ: **[http://localhost:3000](http://localhost:3000)**

---

## 💡 Luồng Vận Hành Của Hệ Thống

1. **Cơ sở dữ liệu (SQLite)**: File cơ sở dữ liệu `server/database.db` sẽ tự động khởi tạo khi chạy server lần đầu, tạo sẵn các bảng `agents`, `workflows`, `logs`, và `config`.
2. **Autonomous Loop (Vòng lặp tự vận hành)**: Một cron-job nền chạy 24/7. Định kỳ (mỗi 5 hoặc 10 phút), hệ thống sẽ:
   - Thu thập trạng thái hệ thống.
   - Gửi sang Claude API để Claude tư duy xem doanh nghiệp cần làm gì tiếp theo.
   - Claude trả về chỉ thị -> Gọi n8n Workflow Webhook thật để tự động chạy các tác vụ (Gửi email, crawl thông tin đối thủ, đăng bài viết).
3. **SSE Real-time Streaming**: Mọi thay đổi hoặc hành động của AI sẽ được stream trực tiếp lên màn hình Terminal của người dùng qua Server-Sent Events (SSE) mà không cần tải lại trang.
