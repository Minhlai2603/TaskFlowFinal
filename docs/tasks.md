# Kế hoạch thực thi dự án TaskFlow MVP dành cho Agent

> **LƯU Ý CỰC KỲ QUAN TRỌNG CHO AGENT:**
> - PHẢI đọc reference ở phần `Mapping: [Đường dẫn tới mục]` trong `d:\taskflowfinal\docs\requirements.md` TRƯỚC khi gõ code.
> - Bất cứ task `[x]` nào cũng phải được tích `[x]` khi hoàn thành để tracking.
> - Cấu trúc project PHẢI LÀ **Feature-based** (Không dùng layer-based).
> - Không bao giờ hardcode, không được thiếu error handling.
> - 1 FR chỉ được đánh dấu V (Done) khi và chỉ khi hoàn thành xong cả 3 bước nghiệm thu cốt lõi trong sub-checklist.

---

## Milestone 0: Setup & Infrastructure
- [x] **Khởi tạo và Cấu trúc dự án (Monorepo)** (Mapping: `requirements.md` -> Phần 1 & 1.5)\n  - [x] Khởi tạo Monorepo sử dụng `npm workspaces` mặc định (hoặc pnpm workspaces).
  - [x] Phân rã dự án làm 2 thư mục độc lập: `/backend` (API bằng Node.js/Express) và `/frontend` (Next.js). QUAN TRỌNG: Cấm tuyệt đối việc sử dụng Route Handlers của Next.js (`src/app/api/`) để xử lý logic Backend. Mọi API call bắt buộc phải trỏ về thư mục `/backend`.
  - [x] Trong `/backend`: Khởi tạo Express, TypeScript, cài đặt env (`CLOUDINARY_*`, v.v.), middleware (rate-limit, CORS, sanitize).
  - [x] Trong `/frontend`: Khởi tạo Next.js 16 App Router với shadcn/ui, Tailwind CSS, Zustand, TanStack Query. Feature-based (`src/app/`, `src/features/`).
  - [x] **MANDATORY**: Thực hiện `view_file` để học 2 kỹ năng cốt lõi bắt buộc của UI là `@d:\taskflowfinal\.agents\skills\frontend-design\SKILL.md` và `@d:\taskflowfinal\.agents\skills\vercel-react-best-practices\SKILL.md` để đảm bảo code chuẩn nền móng từ đầu.
- [x] **Thiết lập Database Layer** (Mapping: `requirements.md` -> Phần 2)
  - [x] Khởi tạo cấu trúc `schema.prisma` với PostgreSQL, tuân thủ nghiêm ngặt các relations, Rule Soft Delete (`deleted_at`), Failed attempts (`locked_until`).
  - [x] [Backend] Implement `GET /api/health` endpoint trả về `{ status: "ok", timestamp: ISO_string }`. Không cần auth. Phục vụ Railway Auto-recovery check (NFR-02).
- [x] **Setup Testing Framework**
  - [x] Cài đặt framework test cho Backend (Jest/Supertest) và Frontend (Vitest/Testing Library/Cypress).

- [x] **Error & Fallback Pages** (Mapping: `requirements.md` → Phần 6 / NFR-05)
  - [x] [Frontend] Tạo `error.tsx` (global error boundary, có nút "Thử lại", tiếng Việt).
  - [x] [Frontend] Tạo `not-found.tsx` (trang 404, link về trang chính).
  - [x] [Frontend] Tạo component `<AccessDenied />` (hiển thị khi 403, có button redirect về `/app/my-tasks`).

- [x] **Build App Shell Layout** (Mapping: `ui-wireframes.md` → §1 Global App Shell)
  > **CONSTRAINTS (đọc trước khi code):**
  > 1. Phải build TRƯỚC mọi page component — đây là skeleton chứa Sidebar + TopBar + PageContainer
  > 2. TopBar PHẢI có 3 phần: Hamburger (mobile), Global Search Input, Notification Bell + User Avatar
  > 3. Sidebar PHẢI có: Logo, NavMenu (My Tasks, Team Kanban, Projects, Reports, Settings), UserBlock, **Button "+ Tạo Task" nổi bật**
  > 4. Layout file: `/frontend/src/app/(dashboard)/app/layout.tsx` — KHÔNG code trong root `layout.tsx`
  > 5. TopBar chưa cần logic Search/Bell hoạt động — chỉ cần render UI placeholder, logic sẽ gắn khi code FR-09, FR-12
  > 6. Mobile: Sidebar ẩn thành Hamburger menu (md:hidden ↔ md:flex)
  > 7. Font Roboto phải được apply đúng từ root layout
  - [x] [Frontend] Tạo component `Sidebar.tsx` với NavMenu items + Button "+ Tạo Task" (mở CreateTaskModal)
  - [x] [Frontend] Tạo component `TopBar.tsx` với Search placeholder + NotificationBell placeholder + UserAvatar dropdown (Logout)
  - [x] [Frontend] Tạo `(dashboard)/app/layout.tsx` compose Sidebar + TopBar + PageContainer
  - [x] [Frontend] Verify: navigate giữa các route → Sidebar/TopBar persistent, không re-mount

- [x] **Smoke Test Milestone 0 — Infrastructure Only (BẮt BUỘC pass trước khi sang Milestone 1)**
  > ⚠️ Smoke Test này CHỂ kiểm tra infrastructure. Auth/Login/Shell verify sẽ ở Smoke Test Milestone 1.
  - [x] `cd backend && npx prisma migrate dev --name init` → Confirm migration success, 0 errors
  - [x] `cd backend && npm run dev` → Confirm "Server running on port 4000"
  - [x] `curl http://localhost:4000/api/health` → Confirm `{"status":"ok","timestamp":"..."}`
  - [x] `cd frontend && npm run dev` → Confirm "Ready on http://localhost:3000"
  - [x] Mở browser → Navigate `/login` → Confirm page renders không lỗi (form hiển thị)
  - [x] Mở browser → Navigate `/app/my-tasks` trực tiếp → Confirm redirect về `/login` (middleware guard hoạt động)
  - [x] `npx tsc --noEmit` (backend) → Confirm 0 TypeScript errors

---

## Milestone 1: Core CRUD (Xương sống hệ thống)

- [x] **FR-01: Authentication & Sessions** (Mapping: `requirements.md` -> Phần 3 / FR-01)
  > **CONSTRAINTS (đọc trước khi code):**
  > 1. JWT lưu httpOnly cookie, KHÔNG localStorage
  > 2. Axios interceptor: skip redirect 401 nếu đang ở /login, /register, /invite
  > 3. Login success → `queryClient.setQueryData(['auth', 'me'], userData)` ngay lập tức
  > 4. staleTime cho /auth/me: 5*60*1000 (5 phút), KHÔNG dùng Infinity
  > 5. Register tạo Workspace, KHÔNG tạo Project mặc định
  > 6. Schema register: { name, email, password } — KHÔNG có username
  > 7. Font: dùng Roboto (next/font/google), KHÔNG dùng Inter hay font có chân
  > 8. Install TRƯỚC khi code: `npm install cookie-parser @types/cookie-parser` (backend)
  > 9. Cross-tab logout: dùng `window.addEventListener('storage', handler)` — KHÔNG BroadcastChannel
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] Xây dựng Login/Register/Me/Logout endpoints, hash bcrypt cost 12, JWT 7 ngày, lock tài khoản sau 5 lần sai.
    - [x] [Frontend] Gắn React Hook Form cho UI login/register (fields: name, email, password — KHÔNG username).
    - [x] [Frontend] authStore Zustand: lưu { user, workspaceId, workspaceRole }. Axios withCredentials: true.
    - [x] [Frontend] Cross-tab logout: `window.addEventListener('storage', handler)` — khi logout-event xuất hiện → redirect /login.
    - [x] [Frontend] Logout flow: Avatar dropdown → `<AlertDialog>` xác nhận → POST /api/auth/logout → clear authStore → Toast "Đăng xuất thành công" → redirect /login.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Function Hash bcrypt, Token sign/verify).
    - [x] API Test (Integration payload login/register/logout 429 locks).
    - [x] E2E Testing (Luồng chạy Frontend sai pass 5 lần -> warning).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Pass Lint check, password tuyệt đối KHÔNG trả về trong response.

- [x] **FR-02: Workspace & Members** (Mapping: `requirements.md` -> Phần 3 / FR-02)
  > **CONSTRAINTS:**
  > 1. Email provider: dùng Factory pattern EmailProviderFactory, KHÔNG import trực tiếp
  > 2. Nodemailer: đọc SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE từ env
  > 3. SMTP_SECURE=true khi port=465, KHÔNG hardcode
  > 4. Settings Profile form: chỉ có Name (KHÔNG có Username), Email disabled
  > 5. npm install nodemailer @types/nodemailer resend TRƯỚC khi code
  >
  > DEPENDS ON FR-01 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] Thêm CRUD workspaces, Row-level isolation (mọi query kèm workspace_id).
    - [x] [Backend] `PATCH /api/auth/profile` → update `name`. Validate: min 2, max 100 chars. KHÔNG update email.
    - [x] [Backend] Invite system: POST /api/workspaces/:id/invites → gửi email qua EmailProviderFactory.
    - [x] [Backend] Tạo cấu trúc interface `IEmailService`, implement `ResendEmailService` & `NodemailerEmailService`. Cấu hình DI/Factory dựa trên `EMAIL_PROVIDER`.
    - [x] [Frontend] Build `/invite?token=xxx` page — 3 cases (xem ui-wireframes.md §2.1.1):
      - Case 1: Token hợp lệ + user CHƯA có tài khoản → RegisterForm rút gọn (Name, Password, Confirm Password; email disabled).
      - Case 2: Token hợp lệ + user ĐÃ có tài khoản (email khớp) → Confirm button "Đồng ý tham gia" + Ghost "Từ chối".
      - Case 3: Token hết hạn / không hợp lệ → Error message + Button redirect /login.
    - [x] [Frontend] Build **Settings Page** (`/app/settings`):
      - [x] Tab **Profile**: Form sửa Name (Email disabled). Gọi `PATCH /api/auth/profile`.
      - [x] Tab **General** (Admin only): Form đổi tên Workspace (`PATCH /api/workspaces/:id`).
      - [x] Tab **Members** (Admin only): Table liệt kê member (Name | Email | Role | Actions), nút Edit Role + Remove, form Invite Member.
    - [x] [Backend] `PATCH /api/auth/profile` → update `name`. Validate: `name` min 2 chars, max 100 chars.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Logic invite expire 48h).
    - [x] Unit Test (Factory/DI container trả về đúng instance Nodemailer khi process.env là `nodemailer`).
    - [x] API Test (Admin RBAC permission check, tự kick mình 403 error).
    - [x] E2E Testing (Nhập mail mời user UI -> Check List Pending).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Không rò rỉ quyền Admin, soft-isolate theo workspace ID chặt chẽ.

- [x] **FR-03: Projects** (Mapping: `requirements.md` -> Phần 3 / FR-03)
  > **CONSTRAINTS:**
  > 1. Zod validation: dùng `error.issues` (KHÔNG phải `error.errors`)
  > 2. Color picker UI: hiển thị color swatch (hình tròn màu), KHÔNG hiển thị text tên màu
  > 3. Soft delete project → phải soft delete TẤT CẢ tasks trong transaction
  > 4. BẮT BUỘC tạo file `page.tsx` cho route `/app/projects` VÀ `/app/projects/[id]`
  > 5. Backend error response: dùng errorHandler middleware, KHÔNG trả raw Prisma stack trace
  > 6. RBAC: Button "+ New Project" ẩn/disabled khi role = MEMBER (chỉ ADMIN/MANAGER tạo project)
  > 7. Color picker: hiển thị color swatch (tròn tô màu), KHÔNG hiển thị text tên màu
  > 8. Description: hỗ trợ Markdown text + upload ảnh qua POST /api/upload
  >
  > DEPENDS ON FR-01 ✅, FR-02 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] API CRUD Project (GET list, GET by id, POST, PATCH, DELETE soft).
    - [x] [Backend] `PATCH /api/projects/:id/archive` → set archived_at = NOW(). `PATCH /api/projects/:id/unarchive` → clear archived_at.
    - [x] [Backend] `DELETE /api/projects/:id` (soft) → `prisma.$transaction([updateProject, updateManyTasks])` set deleted_at cho cả Project lẫn Tasks. KHÔNG dùng cascade native.
    - [x] [Backend] `PATCH /api/projects/:id/restore` (Admin only, within 30 days) → clear deleted_at cho Project + Tasks.
    - [x] [Frontend] Form tạo màu sắc, Project detail UI.
    - [x] [Frontend] Build **Project Detail Page** (`/app/projects/:id`): task list embedded (filter cứng theo `project_id`), progress bar (`done/total`), filter tabs (All / To Do / In Progress / In Review / Done), archive badge (nếu `archived_at != null`), disable nút "+ New Task" + tooltip "Project đã lưu trữ" khi project archived.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Check mapper list aggregated counts totalTask/doneTask).
    - [x] API Test (Soft-delete Project thì Tasks không còn xuất hiện trong Kanban API trả về).
    - [x] E2E Testing (Giao diện Project bị disable nút New Task sau khi archive).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Đáp ứng NFR-07 Soft Delete `[deleted_at]` cho cả Project và Tasks.

- [x] **FR-04 & FR-05: Tasks CRUD & Update Status** (Mapping: `requirements.md` -> Phần 3 / FR-04 -> FR-05)
  > **CONSTRAINTS:**
  > 1. Form tạo task PHẢI có đủ: title, project, assignee, priority, status, due_date, description
  > 2. Toast dùng `sonner` (import { toast } from 'sonner'), KHÔNG react-toastify
  > 3. Sidebar phải có button tạo task nhanh
  > 4. Button "+ Tạo Task" ở Sidebar phải mở cùng CreateTaskModal dùng chung với nút ở PageHeader
  > 5. NFR-05: Thao tác tạo task KHÔNG QUÁ 3 click từ BẤT KỲ màn hình nào (Sidebar button = 1 click → Modal = 2 click fill+submit)
  > 4. Optimistic UI: update cache trước, rollback nếu API fail
  > 5. Slide-over panel: dùng Sheet side="right", PHẢI có overlay bg-black/20
  >
  > DEPENDS ON FR-01 ✅, FR-02 ✅, FR-03 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] Task CRUD: POST (default TO_DO, ghi activity log "Created"), PATCH (ghi log tracked fields), DELETE soft (deleted_at).
    - [x] [Backend] RBAC status change: `PATCH /api/tasks/:id/status` — chỉ assignee hoặc ADMIN/MANAGER mới đổi được, trả 403 nếu không đủ quyền.
    - [x] [Backend] `POST /api/upload` — Cloudinary multipart/form-data. Validate: file < 5MB, chỉ jpg/png/webp/gif. Throw 413 nếu quá size. Response: `{ success: true, data: { url } }`.
    - [x] [Backend] `PATCH /api/tasks/:id/restore` (Admin only, within 30 days) → clear deleted_at.
    - [x] [Frontend] Update Status thay đổi. Tích hợp `react-markdown` và `remark-gfm` render Description. Xử lý UI upload ảnh `![image](url)` lên form. Optimistic UI Updates state caching qua TanStack.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Sanitize-html helper hạn chế XSS tag vào title/desc).
    - [x] API Test (Ownership rules, non-owners get 403 status switch).
    - [x] E2E Testing (Luồng chạy tạo Task default, Edit save logs).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] TaskStatus Enum strictly enforced (`TO_DO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
    - [x] BẮT BUỘC sử dụng API của `@d:\taskflowfinal\.agents\skills\vercel-react-view-transitions\SKILL.md` khi hiển thị/bật tắt cửa sổ panel Slide-over view Task để code UI trượt chuyển mượt mà.

- [x] **Smoke Test Milestone 1 (BẮT BUỘC pass trước khi sang Milestone 2)**
  - [x] Register user mới → Confirm tạo account + workspace thành công (KHÔNG tạo project mặc định)
  - [x] Login → Confirm redirect về `/app/my-tasks` (không loop, không 404)
  - [x] Confirm Sidebar hiển thị (desktop) với đầy đủ NavItems + Button "+ Tạo Task"
  - [x] Confirm TopBar hiển thị với Search placeholder + NotificationBell + Avatar dropdown
  - [x] Resize browser < 768px → Confirm Sidebar ẩn, Hamburger icon xuất hiện
  - [x] Avatar dropdown → Click Logout → Confirm AlertDialog xuất hiện → Confirm → Redirect `/login`
  - [x] Navigate `/app/projects` → Confirm page renders (không 404)
  - [x] Tạo project mới → Confirm không Zod error, color swatch hiển thị (không phải text)
  - [x] Tạo task trong project → Confirm không crash, status default TO_DO

---

## Milestone 2: Collaboration (Tương tác team)

- [x] **FR-06: Comment System & Mention** (Mapping: `requirements.md` -> Phần 3 / FR-06)
  > DEPENDS ON FR-04 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] Comment CRUD: POST /api/tasks/:taskId/comments, GET /api/tasks/:taskId/comments (order ASC).
    - [x] [Backend] Parse mention pattern `/@\[([^\]]+)\]\(([a-f0-9-]+)\)/g` → extract userId → tạo notification TASK_MENTIONED.
    - [x] [Backend] Sanitize content: `sanitize-html`. Comment immutable — KHÔNG có PATCH/DELETE endpoint.
    - [x] [Frontend] Comment Input box, Scroll thread list.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Mention parser logic regex).
    - [x] API Test (Check sanitize hook stripped out `<script>`).
    - [x] E2E Testing (Gõ @ -> dropdown gợi ý user -> chọn -> comment hiện @User Name highlight).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Comment immutable (Không cho phép edit/delete).

- [x] **FR-09: Notification API** (Mapping: `requirements.md` -> Phần 3 / FR-09)
  > **CONSTRAINTS:**
  > 1. 6 notification types BẮT BUỘC implement: TASK_ASSIGNED, TASK_COMMENTED, TASK_MENTIONED, TASK_DUE_SOON, INVITE_ACCEPTED, REASSIGN_NEEDED
  > 2. TASK_DUE_SOON: dedup bắt buộc — `WHERE task_id=:id AND type='TASK_DUE_SOON' AND created_at >= CURRENT_DATE`
  > 3. Routes: GET /api/notifications?unread=true, PATCH /api/notifications/mark-read-all (register TRƯỚC :id), PATCH /api/notifications/:id/mark-read
  > 4. FE polling: `refetchInterval: 5000`, tự động pause khi tab blur (`refetchIntervalInBackground: false`)
  >
  > DEPENDS ON FR-04 ✅, FR-06 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] Sinh API Polling unread messages. Job TASK_DUE_SOON cron (`'0 * * * *'`) với dedup check.
    - [x] [Frontend] UI Dropdown Bell cài đặt TanStack Query cấu hình `refetchInterval: 5000` để polling và tự động ngưng poll khi tab bị blur (hạn chế Rate Limit).
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Check deduping Due Soon).
    - [x] API Test (Mark-read/mark-all-read endpoint checks).
    - [x] E2E Testing (Check UI Bell counter behavior click to close).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Logic Real-Time, Notification không bị kẹt unread.

- [x] **FR-10: Activity Log** (Mapping: `requirements.md` -> Phần 3 / FR-10)
  > DEPENDS ON FR-04 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] Ghi ActivityLog mỗi khi PATCH /api/tasks/:id: tracked fields = title, description, status, assignee_id, priority, due_date, project_id. Lưu old_value/new_value dạng string.
    - [x] [Backend] `GET /api/tasks/:taskId/activity-logs` — pagination (page default 0, limit default 20), sort created_at DESC. RBAC: mọi role trong workspace đều xem được. Response: `{ logs: [{id, action_type, field_changed, old_value, new_value, user: {id, name}, created_at}][], total, page, limit }`.
    - [x] [Frontend] UI render lịch sử Timeline.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Mapping JSON strings -> human diff texts).
    - [x] API Test (Request parallel check trigger multiple logs without overrides).
    - [x] E2E Testing (Nhìn Task Activity Tab renders old_value -> new_value).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Không ai được phép xóa Log (No DELETE API expose).

---

## Milestone 3: Dashboards (Hiển thị & Báo cáo)

- [x] **FR-07: My Tasks View** (Mapping: `requirements.md` -> Phần 3 / FR-07)
  > DEPENDS ON FR-04 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] SQL Sort 3-tier: Overdue ưu tiên -> Có DueDate tăng dần -> None due date.
    - [x] [Frontend] Build My Tasks page (xem ui-wireframes.md §2.2):
      - FilterTabs: All / To Do / In Progress / In Review (KHÔNG có DONE tab).
      - TaskListItem: title, ProjectDotBadge, DueDateBadge (overdue: text-red-600 bg-red-50), StatusBadge.
      - Infinite Scroll: `useInfiniteQuery` + IntersectionObserver, limit 20/page.
      - Empty State: "Bạn chưa có task nào. Hãy liên hệ Manager để được assign công việc" + icon.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Sorting algorithm on edge arrays).
    - [x] API Test (Verify output list orders).
    - [x] E2E Testing (Dashboard visual testing over-due red texts).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Empty state rõ ràng, có CTA Button.

- [x] **FR-08: Kanban Board** (Mapping: `requirements.md` -> Phần 3 / FR-08)
  > DEPENDS ON FR-04 ✅, FR-07 ✅
  - [x] **0. Chuẩn bị (Pre-flight):** Dùng lệnh `view_file` đọc file `@d:\taskflowfinal\.agents\skills\vercel-composition-patterns\SKILL.md` để thiết kế cấu trúc KanbanCard và KanbanColumn tuyệt đối tối ưu, tránh phình to Props.
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] Endpoint filter linh hoạt nhiều tham số, bắt buộc tích hợp Offset/Limit Pagination (mặc định limit 50). Cốt lõi loại trừ Cursor-based để tránh xung đột Frontend/Backend MVP.
    - [x] [Frontend] Tích hợp `useInfiniteQuery` + IntersectionObserver cho Infinite Scroll (limit 50/page). Tích hợp `@dnd-kit/core` drag & drop.
    - [x] [Frontend] Build Kanban Filter Bar (xem ui-wireframes.md §2.3):
      - Assignee: Multiple Select (Avatar group), query param `?assignee_id=`.
      - Project: Single Select Dropdown, query param `?project_id=`.
      - Priority: Dropdown (All/Low/Medium/High/Urgent), query param `?priority=`.
      - Due Date: Date Range Picker (optional).
    - [x] [Frontend] Mobile fallback (<768px): ẩn drag, hiện Status Select dropdown trên mỗi card.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Dnd hooks boundary calculations).
    - [x] API Test (Query parameters matches correctly).
    - [x] E2E Testing (Drag drop fails -> Rollback old position optimistic assert).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Giao diện Responsive mọi kích cỡ, A11y keyboard support check.

- [x] **FR-11: Reports** (Mapping: `requirements.md` -> Phần 3 / FR-11)
  > DEPENDS ON FR-04 ✅, FR-08 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] API Weekly aggregated chart và Member metrics Table có Postgres TRUNC DATE.
    - [x] [Frontend] Build Reports page (xem ui-wireframes.md §2.4):
      - Guard: role MEMBER → redirect `/app/my-tasks` + Toast "Không có quyền".
      - `WeeklyBarChart`: recharts BarChart, h-[300px], data 4 tuần gần nhất, PHẢI là Client Component ('use client').
      - `MemberStatsTable`: columns Member | Assigned | Completed | Overdue | %. Click row → navigate `/app/team?assigneeId={id}`.
      - Completion Rate: `(completed / assigned * 100)` làm tròn 1 chữ số thập phân. Guard chia cho 0.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Tính Zero-divide khi calc completion %).
    - [x] API Test (Chỉ Manager/Admin access (200), Member bị chặn lỗi (403)).
    - [x] E2E Testing (Click Report table -> Route sang my-team board filter).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Dữ liệu chính xác. View an toàn.

---

## Milestone 4 & 5: Polish & Edge Cases

- [x] **FR-12: Global Search** (Mapping: `requirements.md` -> Phần 3 / FR-12)
  > DEPENDS ON FR-04 ✅
  - [x] **1. Xong chức năng (Implementation):**
    - [x] [Backend] Build `ILIKE` quick search, limit max 10 dòng.
    - [x] [Frontend] Header Searchbar, debounce input.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (Debounce function logic timeout).
    - [x] API Test (Search exclude Soft-deleted/Archived data).
    - [x] E2E Testing (Type & Dropdown UI layout overlap check).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] Phản hồi API request trong < 300ms.

- [x] **Edge Cases Fixes** (Mapping: `requirements.md` -> Phần 5)
  - [x] **1. Xong chức năng (Implementation):**
    - [x] Frontend tích hợp PWA offline watcher, Event listener bind.
    - [x] Xử lý gán lại task cho assigner bị vô hiệu hóa `[Removed User]`.
  - [x] **2. Pass hết tất cả test (Verification):**
    - [x] Unit Test (State offline flag).
    - [x] API Test (Removed users fallback null payload object).
    - [x] E2E Testing (Kiểm tra Banner báo đỏ "Mất mạng" ghim screen root).
  - [x] **3. Thỏa mãn Definition of Done (DoD):**
    - [x] UI không bao giờ sụp lỗi trắng trang, phải có error boundary block catch.
