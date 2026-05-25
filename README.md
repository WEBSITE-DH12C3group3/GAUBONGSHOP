# GAUBONGSHOP

Hướng dẫn này dành cho người mới clone project về và chạy local nhanh.

## 1) Stack
- `backend/`: Spring Boot (Java 21, Maven, MySQL)
- `frontend/`: Angular
- Database mẫu: `thu_bong_shop.sql`

## 2) Yêu cầu máy
- JDK 21
- Node.js 20+ và npm
- MySQL 8+

## 3) Clone và cài frontend
```bash
git clone <repo-url>
cd GAUBONGSHOP/frontend
npm i
```

## 4) Tạo database
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS thu_bong_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p thu_bong_shop < ../thu_bong_shop.sql
```

## 5) Cấu hình biến môi trường cho backend
File mẫu: [backend/.env.example](/c:/xampp/htdocs/GAUBONGSHOP/backend/.env.example)

Bạn có 2 cách:
- Cách A (nhanh): set biến trong terminal trước khi chạy backend.
- Cách B: sửa trực tiếp `backend/src/main/resources/application.properties` theo máy của bạn.

Ví dụ (PowerShell):
```powershell
$env:AI_API_KEY="your_ai_api_key_here"
```

Ví dụ (Git Bash):
```bash
export AI_API_KEY="your_ai_api_key_here"
```

## 6) Chạy backend
```bash
cd backend
./mvnw spring-boot:run
```
Windows cmd có thể dùng:
```bat
mvnw.cmd spring-boot:run
```

Backend chạy tại: `http://localhost:8080`

## 7) Chạy frontend
Mở terminal mới:
```bash
cd frontend
npm start
```

Frontend chạy tại: `http://localhost:4200`

## 8) Biến nào bắt buộc?
- Bắt buộc để app core chạy:
  - DB (`spring.datasource.*` trong `application.properties`)
- Tùy chọn:
  - `AI_API_KEY`: chat AI tự nhiên hơn
  - Pusher config: realtime chat
  - Mail/VNPay: chỉ cần khi test các chức năng đó

## 9) File mẫu cho người mới
- Backend: [backend/.env.example](/c:/xampp/htdocs/GAUBONGSHOP/backend/.env.example)
- Frontend: [frontend/.env.example](/c:/xampp/htdocs/GAUBONGSHOP/frontend/.env.example)

## 10) Lỗi hay gặp
- `ERR_CONNECTION_REFUSED` tới `:8080`: backend chưa chạy hoặc bị crash.
- `Access denied for user root@localhost`: sai user/pass DB.
- `503 /api/chat/pusher/auth`: cấu hình Pusher sai hoặc chưa bật.
