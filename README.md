# TaskFlow

TaskFlow là một ứng dụng quản lý dự án và công việc nhóm (Task Management) với tính năng bảng Kanban (kéo thả), quản lý nhiều không gian làm việc (Workspaces), hệ thống phân quyền (RBAC), và hệ thống báo cáo (Reports).

## 🚀 Công nghệ sử dụng

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui
- **State Management:** Zustand (Client-side), TanStack Query (Server-side/API state)
- **Drag & Drop:** `@dnd-kit/core` (Kanban Board)
- **Forms & Validation:** React Hook Form + Zod
- **Charts:** recharts v2.x
- **HTTP Client:** axios (withCredentials: true)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL (≥ 14)
- **Authentication:** JWT (JSON Web Tokens) lưu trong HTTP-Only Cookies, bcrypt
- **Storage/File Upload:** Cloudinary
- **Email:** Resend (Production) / Nodemailer (Development) qua `EmailProviderFactory`

---

## 💻 Yêu cầu hệ thống (Prerequisites)

Để chạy dự án ở môi trường local, bạn cần cài đặt:
- **Node.js** (Phiên bản >= 18.x)
- **PostgreSQL** (Phiên bản >= 14.x) đang chạy trên máy của bạn
- **Git**

---

## 🛠 Hướng dẫn cài đặt local (Local Setup)

Dự án được tổ chức theo kiến trúc monorepo với 2 thư mục chính là `frontend` và `backend`.

### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd taskflowfinal
```

### Bước 2: Thiết lập Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Cấu hình biến môi trường:
   - Tạo file `.env` ở thư mục `backend/` với nội dung dưới đây. Hãy thay đổi chuỗi kết nối `DATABASE_URL` cho phù hợp với tài khoản PostgreSQL local của bạn:

   ```env
   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow_dev?schema=public"

   # Auth
   JWT_SECRET="super-secret-key-change-me-in-production"
   JWT_EXPIRY="7d"
   BCRYPT_COST=12

   # Email
   EMAIL_PROVIDER="nodemailer" # Chọn nodemailer cho local dev
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="465"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_SECURE="true"

   # Cloudinary (Tuỳ chọn cho tính năng upload ảnh description)
   CLOUDINARY_URL="cloudinary://..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."

   # App
   FRONTEND_URL="http://localhost:3000"
   PORT=4000
   NODE_ENV="development"
   ```

4. Thiết lập Database (Prisma):
   ```bash
   npx prisma migrate dev --name init_db
   ```
   *(Lệnh này sẽ tự động tạo database `taskflow_dev` nếu chưa có, và apply các bảng dựa theo `schema.prisma`).*

5. Khởi động server backend:
   ```bash
   npm run dev
   ```
   Backend sẽ chạy tại `http://localhost:4000`.

### Bước 3: Thiết lập Frontend

1. Mở một terminal mới và di chuyển vào thư mục frontend từ thư mục gốc dự án:
   ```bash
   cd frontend
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Cấu hình biến môi trường (Tuỳ chọn):
   - Mặc định ứng dụng sẽ gọi API tới `http://localhost:4000/api`. Nếu muốn thay đổi port API backend, bạn có thể tạo file `.env.local` trong thư mục `frontend`:
     ```env
     NEXT_PUBLIC_API_URL="http://localhost:4000/api"
     ```

4. Khởi động ứng dụng frontend:
   ```bash
   npm run dev
   ```
   Frontend sẽ chạy tại `http://localhost:3000`. Mở đường dẫn này trên trình duyệt để bắt đầu sử dụng.

---

## 📂 Cấu trúc dự án

```text
taskflowfinal/
├── backend/                  # Mã nguồn server (Node.js, Express, Prisma)
│   ├── prisma/               # Database Schema & Migrations
│   ├── src/                  # Controllers, Services, Middleware, Routes
│   └── ...
├── frontend/                 # Mã nguồn giao diện (Next.js)
│   ├── src/
│   │   ├── app/              # App Router (Pages, Layouts)
│   │   ├── features/         # Feature-based Architecture (Modules)
│   │   ├── components/       # Shared UI Components (shadcn)
│   │   └── ...
│   └── ...
├── .agents/                  # Thư mục cấu hình cho AI Agent (skills, instructions)
└── README.md                 # Tài liệu chính của dự án
```
