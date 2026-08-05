# Sử dụng hình ảnh Node.js 20 LTS chính thức
FROM node:20-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép file khai báo dependency
COPY package*.json ./

# Cài đặt các gói dependency ở chế độ production
RUN npm ci --only=production

# Sao chép toàn bộ mã nguồn ứng dụng
COPY . .

# Khai báo cổng ứng dụng lắng nghe
EXPOSE 3000

# Khai báo môi trường Production
ENV NODE_ENV=production
ENV PORT=3000

# Khởi chạy ứng dụng
CMD ["node", "server/index.js"]
