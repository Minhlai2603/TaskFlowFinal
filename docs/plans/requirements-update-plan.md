# Kế hoạch Cập nhật Blueprint requirements.md (Bản vá 4 kẽ hở lớn)

Tài liệu này xác định 4 điểm trọng yếu cần bổ sung vào `requirements.md` nhằm lấp các kẽ hở so với `PRD_TaskFlow.md` đã được phát hiện. Mục đích là để đảm bảo bộ tài liệu "water-tight" 100% trước khi giao cho Agent AI bắt đầu code.

---

## 1. Tích hợp Image Upload & Markdown Render (Ref: FR-04, PRD 10.3)
**Vấn đề:** NFR và Edge Cases của PRD có đề cập việc upload file ảnh lên Cloudinary giới hạn 5MB và hỗ trợ viết Markdown cho Description của Task, tuy nhiên Requirements.md hoàn toàn trống phần này.
**Hành động bổ sung vào thẻ FR-04 & Global Rules của `requirements.md`:**
- **Environment Variables**: Bổ sung key `CLOUDINARY_URL`, `CLOUDINARY_API_KEY` và `CLOUDINARY_API_SECRET` vào mục biến môi trường.
- **REST API Contract mới**: Bổ sung đặc tả cho API `POST /api/upload` (xử lý `multipart/form-data`) upload thẳng lên Cloudinary. Cần ghi rõ Validation middleware (Size < 5MB, format `jpg/png/webp/gif`). API throw `413 Payload Too Large` nếu vi phạm, hoặc `200 Success` kèm `{ success: true, data: { url: "..." } }`.
- **Frontend / Client Component**: Bắt buộc Agent cài và sử dụng `react-markdown` kết hợp plugin `remark-gfm` để render trường Description. Bổ sung mô phỏng tính năng Upload ảnh (ví dụ: click up hoặc paste img clipboard) gắn url markdown dạng `![image](url)` vào description form.

## 2. Chiến lược Phân trang (Pagination) ngăn chặn sập App (Ref: NFR-04)
**Vấn đề:** PRD đặt chỉ tiêu hỗ trợ quy mô 10,000 tasks/workspace. API Board lấy dữ liệu nếu Fetch ALL sẽ dẫn đến sập client render và vi phạm SLA performance.
**Hành động bổ sung vào thẻ FR-07/08 của `requirements.md`:**
- **API Parameters**: Cập nhật hợp đồng API `GET /api/workspaces/:id/tasks` phải hỗ trợ Cursor-based Pagination (ưu tiên cho Kanban real-time) hoặc ít nhất Offset/Limit với `limit` mặc định là 50.
- **Frontend Optimization**: Yêu cầu Agent sử dụng `useInfiniteQuery` của TanStack Query kết hợp cùng `IntersectionObserver` ở cuối mỗi cột dạng UI Kanban để xử lý "Infinite Scroll".

## 3. Phục hồi cấu trúc Feature-based Folder & Next.js App Router (Tuân thủ AGENTS.md & PRD 12.2)
**Vấn đề:** PRD định nghĩa URL navigation cụ thể, nhưng tài liệu hiện tại thiếu kiến trúc Folder Frontend, dễ dẫn đến Agent code lộn xộn, vi phạm rule "Feature-based folder structure" và "Server Components by default" trong `AGENTS.md`.
**Hành động bổ sung vào `requirements.md`:**
- **Sơ đồ thư mục Feature-based**: Phác thảo lại sơ đồ cây thư mục chia rẽ rạch ròi: thư mục `src/app/` chỉ dùng để define Page & Route (Server Components theo mặc định của Next.js 16), trong khi đó mọi business logic, UI Component sẽ được tổ chức theo tính năng tại `src/features/` (VD: `features/tasks/`, `features/kanban/`, `features/auth/`).
- **Routing Map**: Định hướng URL Map (`/app/my-tasks`, `/login`) thông qua Route Groups của Next.js v13+ `(auth)/` và `(dashboard)/app/`.
- **Client/Server Component Rules**: Nhắc lại chặt chẽ nguyên tắc "Server Components by default, 'use client' chỉ khi cần interactivity" theo chuẩn AGENTS.md.
