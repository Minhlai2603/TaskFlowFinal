# Comprehensive Plan for Synthesizing requirements.md

Mục tiêu: Đưa ra bản thiết kế chi tiết (Blueprint) khắc phục triệt để sự thiếu sót. `requirements.md` sẽ ánh xạ 1-1 từng phần của `PRD_TaskFlow.md` (từ FR-01 tới FR-12) kết hợp với Technical constraints từ `AGENTS.md`, đồng thời tích hợp chi tiết sơ đồ thư mục, User Stories, UI Specifications và các Open Questions đã resolve.

---

## 1. Mục tiêu và Tiêu chí của requirements.md mới
- **Trọn vẹn 100% FR & NFR:** Không bỏ sót bất kỳ edge case hay tính năng nào được nêu ra trong mục 7, 8, và 10 của PRD.
- **Tiếp thu User Stories (US):** Ánh xạ trực tiếp US-01 đến US-05 vào từng Feature Requirement (FR) cụ thể để có Acceptance Criteria rõ ràng.
- **Micro-level Backend Specifications:** Định hình rõ Payload Request, Data Return, Error Codes (400, 401, 403, 409, 422, 429, 500) và các query rules (VD: filter `deleted_at: null`, isolation qua `workspace_id`).
- **Micro-level Frontend Specifications:** Mapping rõ từng Component với Zustand Store tương ứng và các action TanStack Query `useMutation` kèm Optimistic UI.
- **UI Design Specifications:** Cung cấp layout, color scheme, typography, spacing tokens và component guidelines để agent sinh giao diện đồng nhất.
- **Tiền đề sinh Tasks.md hoàn hảo:** Cấu trúc tài liệu bám sát chức năng (Features), tạo tiền đề chẻ nhỏ từng Task ra cho Agent sau này.

---

## 2. Cây thư mục dự án (Feature-based — đúng AGENTS.md)

> **AGENTS.md yêu cầu Feature-based folder structure.** Cây thư mục dưới đây đã điều chỉnh từ layer-based sang feature-based cho cả BE và FE.

```text
taskflow/
├── frontend/                         # Triển khai trên Vercel
│   ├── src/
│   │   ├── app/                      # Next.js App Router (pages + layouts)
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── invite/page.tsx       # /invite?token=xxx
│   │   │   ├── app/                  # Protected routes (layout có AuthGuard)
│   │   │   │   ├── layout.tsx        # Sidebar + TopBar + AuthGuard
│   │   │   │   ├── my-tasks/page.tsx
│   │   │   │   ├── team/page.tsx     # Kanban board
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── reports/page.tsx
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx
│   │   │   │       └── members/page.tsx
│   │   │   ├── layout.tsx            # Root layout & providers (QueryClient, Zustand, Toaster)
│   │   │   └── globals.css
│   │   ├── features/                 # Feature-based modules
│   │   │   ├── auth/                 # LoginForm.tsx, RegisterForm.tsx, useAuthStore.ts
│   │   │   ├── tasks/                # TaskCard.tsx, TaskSlideOver.tsx, useTasksQuery.ts, TaskCreateForm.tsx
│   │   │   ├── kanban/               # KanbanBoard.tsx, KanbanColumn.tsx, KanbanCard.tsx
│   │   │   ├── my-tasks/             # MyTasksList.tsx, MyTasksFilter.tsx
│   │   │   ├── comments/             # CommentThread.tsx, CommentInput.tsx, useMentionParser.ts
│   │   │   ├── notifications/        # NotificationBell.tsx, NotificationDropdown.tsx, useNotificationsQuery.ts
│   │   │   ├── reports/              # ReportsChart.tsx, MemberStatsTable.tsx, MemberDrillDown.tsx
│   │   │   ├── workspace/            # InviteMemberForm.tsx, MemberList.tsx, WorkspaceSettings.tsx
│   │   │   ├── projects/             # ProjectCard.tsx, ProjectCreateForm.tsx
│   │   │   └── search/               # GlobalSearch.tsx, SearchResults.tsx
│   │   ├── components/ui/            # shadcn/ui components (Button, Dialog, Toast, Skeleton, etc.)
│   │   ├── lib/                      # api.ts (axios instance + interceptor), utils.ts, validators.ts (Zod schemas)
│   │   ├── store/                    # Zustand stores (authStore.ts, uiStore.ts)
│   │   ├── hooks/                    # useDebounce.ts, usePollInterval.ts, useOnlineStatus.ts
│   │   └── types/                    # TS definitions (task.ts, user.ts, workspace.ts, etc.)
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
└── backend/                          # Triển khai trên Railway
    ├── src/
    │   ├── features/                 # Feature-based modules
    │   │   ├── auth/                 # auth.routes.ts, auth.controller.ts, auth.service.ts, auth.validator.ts
    │   │   ├── workspaces/           # workspace.routes.ts, workspace.controller.ts, workspace.service.ts
    │   │   ├── projects/             # project.routes.ts, project.controller.ts, project.service.ts
    │   │   ├── tasks/                # task.routes.ts, task.controller.ts, task.service.ts
    │   │   ├── comments/             # comment.routes.ts, comment.controller.ts, comment.service.ts
    │   │   ├── notifications/        # notification.routes.ts, notification.controller.ts, notification.service.ts
    │   │   ├── reports/              # report.routes.ts, report.controller.ts, report.service.ts
    │   │   └── search/               # search.routes.ts, search.controller.ts, search.service.ts
    │   ├── middlewares/              # jwt.middleware.ts, rate-limit.middleware.ts, error.middleware.ts, role.middleware.ts
    │   ├── lib/                      # prisma.ts (singleton client)
    │   ├── utils/                    # bcrypt.util.ts, jwt.util.ts, sanitize.util.ts, response.util.ts
    │   └── server.ts                 # Khởi chạy Express server
    ├── prisma/
    │   └── schema.prisma
    ├── package.json
    └── tsconfig.json
```

---

## 3. Environment Variables (AGENTS.md: KHÔNG hardcode secrets)

```bash
# Backend .env
DATABASE_URL=postgresql://...
JWT_SECRET=<random-256-bit>
JWT_EXPIRY=7d
BCRYPT_COST=12
RESEND_API_KEY=re_xxxxxxxx
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
PORT=4000
NODE_ENV=development

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 4. Open Questions — Resolved Stance cho MVP

> PRD §17 có 6 Open Questions chưa resolve. Mỗi câu cần stance rõ ràng trong `requirements.md` để Agent không tự quyết sai.

| OQ | Câu hỏi | Stance MVP | Lý do |
|---|---|---|---|
| OQ-01 | Task assign nhiều người? | **Không. 1 assignee duy nhất.** | PRD FR-04 đã ghi "Assignee (1 người)". Giữ nguyên cho MVP. |
| OQ-02 | Notification email hay chỉ in-app? | **Chỉ in-app cho MVP.** Email notification defer V2. | Giảm complexity + Resend free tier quota. Invite email vẫn gửi bình thường. |
| OQ-03 | Comment edit/delete? | **Không cho edit/delete comment ở MVP.** | Đơn giản hóa. Comment là immutable, chỉ thêm mới. Activity log không cần track comment edit. |
| OQ-04 | "In Review" bắt buộc? | **Giữ 4 status (TO_DO, IN_PROGRESS, IN_REVIEW, DONE).** | PRD FR-04, FR-05 đã define 4 status. Không tùy chỉnh cho MVP. |
| OQ-05 | Reports ai thấy? | **Manager + Admin thấy Reports.** Member KHÔNG thấy trang Reports. | PRD FR-11: "Manager xem trang Reports". Member chỉ thấy My Tasks. |
| OQ-06 | Sub-task? | **Không có sub-task ở MVP.** | PRD Out of Scope không đề cập, data model không hỗ trợ parent_task_id. Defer V2. |

---

## 5. Cấu trúc chi tiết của file requirements.md sẽ tạo

### Phần 1: Global Architecture & Rules Context
- Tech stack definitions (Next.js 16, Zustand, TanStack Query, Prisma, PostgreSQL, Express).
- Security rule enforcement (Row-level data isolation, BCrypt cost >=12, HTTPS/TLS 1.2+, rate limit 100/min/IP).
- Environment variables list (section 3 ở trên).
- Khẳng định feature-based project structure.
- Open Questions resolved stance (section 4 ở trên).
- **Refresh Token Strategy:** MVP dùng single JWT 7 ngày, KHÔNG implement refresh token rotation. Khi JWT hết hạn → client phải re-login. Refresh token rotation defer V2.

### Phần 1.5: System Architecture & Data Flow
- **Data Fetching Flow:** Sử dụng Server Components cho data fetching trang ban đầu (như prefetch data cho bảng/dashboard) hoặc render UI shell rỗng. Sau đó dùng TanStack Query (`staleTime`, `gcTime`) ở Client Components để hydrate và poll data trong background.
- **State Management Ranh giới:**
  - **Zustand:** KHÔNG chứa gọi API/data response. Chỉ dùng để lưu state UI tĩnh (`uiStore`: trạng thái Sidebar menu, mở/đóng TaskSlideOver) và phiên session (`authStore`: giữ thông tin current User).
  - **TanStack Query:** Quản lý toàn bộ Server State (tasks, projects, reports, loading) tích hợp chung với Optimistic UI để đảm bảo realtime data.
- **Component Architecture:** Tổ chức linh hoạt theo pattern Smart/Dumb. Page Server fetch init data -> chuyển qua Smart hook `useMutation` -> Pass xuống thành props cho các Dumb Component render UI đơn thuần.

### Phần 2: Đồ án Dữ liệu Chi tiết (Deep Database Schema)
- Lên schema cụ thể cho: `User`, `Workspace`, `WorkspaceMember` (Admin, Manager, Member), `Project` (màu sắc, archived), `Task` (TO_DO, IN_PROGRESS, IN_REVIEW, DONE), `Comment`, `Notification`, `ActivityLog`, `InviteToken`.
- Ghi chú mọi cascade delete, foreign key, default params. Đặc biệt chú ý `deleted_at` với Soft Delete cho **Task** và **Project**.
- Bổ sung columns cho `User`: `failed_attempts (default 0)`, `locked_until (nullable)`.
- `InviteToken.role`: default `MEMBER`. Admin chọn role khi invite.

### Phần 3: 1-to-1 Mapping: Specification theo Feature (Trái tim của requirements.md)

Tổ chức theo **Từng Functional Requirement** kết hợp **User Stories (US)** từ PRD (phần 9):
  - **Mô tả logic FR & US tương ứng.**
  - **Permission Rules** (role nào được phép).
  - **Database Impact** (Ai sửa, ghi log gì).
  - **API Contract(s)** (Đường dẫn, Method, Request Zod schema, Response type `T`, Error codes).
  - **Frontend Flow & Component** (Các Hook forms, validation, optimistic updates, UI behavior).
  - **Testing Strategy** (Ghi rõ ràng 3 lớp test cho từng FR: API Test, Unit Test, E2E Testing để AI test).

#### 5.1. Phân mục Tính năng — Thiết kế chi tiết:

---

**1. FR-01: Authentication & Session**
   - **Register:** tạo User → tạo Workspace mặc định (tên: "Workspace của {user.name}") → gán role Admin tự động. Response KHÔNG chứa password_hash.
   - **Login:** sai ≤5 lần → lock 15 phút, hiện countdown timer. Email đã tồn tại (register) → lỗi "Email này đã được đăng ký. Bạn có muốn đăng nhập không?"
   - **JWT 7 ngày** (single token, không refresh token ở MVP). Hết hạn → Intercept 401 toàn bộ API call → redirect `/login` kèm toast "Phiên làm việc đã hết hạn."
   - **Cross-tab logout:** tab B dùng `window.addEventListener('storage', ...)` để detect localStorage clear và tự redirect login.
   - **API:**
     - `POST /api/auth/register` — request payload: `{ name: min(2), email: string.email, password: min(8) }`, response: `{ success: true, data: { token, user: { id, name, email } } }`
     - `POST /api/auth/login` — request payload: `{ email, password }`, response: tương tự register, hoặc `429` nếu locked
     - `POST /api/auth/logout` — invalidate trên client (clear localStorage), không cần server-side invalidation (stateless JWT)
     - `GET /api/auth/me` — **[NEW]** Lấy thông tin user hiện tại. Dùng khi user reload/ F5 trang để app check valid JWT token, qua đó khôi phục lại session vào `authStore`.

---

**2. FR-02: Workspace & Members** kết hợp **US-04 (Invite thành viên)**
   - **Workspace CRUD APIs:**
     - `POST /api/workspaces` — tạo workspace (auto khi register, hoặc manual). Body: `{ name }`. Chỉ authenticated user.
     - `GET /api/workspaces` — list workspaces của user hiện tại (từ workspace_members).
     - `PATCH /api/workspaces/:id` — update workspace name. Chỉ Admin.
     - `GET /api/workspaces/:id/members` — list members + roles. Tất cả member trong workspace đều thấy.
     - `PATCH /api/workspaces/:id/members/:uid` — change role. Chỉ Admin. Không tự đổi role mình.
     - `DELETE /api/workspaces/:id/members/:uid` — remove member. Chỉ Admin. Middleware kiểm tra `uid === req.user.id` → 403 "Bạn không thể tự xóa mình khỏi workspace". Task của member bị xóa → `assignee_id = null`, hiển thị "[Removed User]", Manager nhận notification `REASSIGN_NEEDED`.
   - **Invite Flow:**
     - `invite_tokens` schema: `id, workspace_id, email, token (uuid), role (enum, default MEMBER), expires_at (+48h), accepted_at (nullable), invited_by`.
     - `POST /api/workspaces/:id/invites` — gửi email Resend, tạo record pending, trả về 409 nếu email đã là member. Admin chọn role khi invite (default MEMBER).
     - `GET /invite?token=xxx` — kiểm tra `expires_at`, nếu hết hạn → page "Link mời đã hết hạn. Vui lòng liên hệ Admin để được mời lại." Nếu user chưa có account → redirect `/register?invite=xxx`. Nếu đã có account → redirect `/login?invite=xxx`. Sau login/register → tự accept invite.
     - Admin nhận notification `INVITE_ACCEPTED` khi member click accept.
   - **Row-level isolation:** mọi query phải có `WHERE workspace_id = :workspaceId` từ JWT payload.

---

**3. FR-03: Projects**
   - **Permission:** Admin + Manager tạo/sửa/archive/xóa project. Member chỉ xem.
   - Tạo project: `name` (bắt buộc, max 100 ký tự), `description` (tùy chọn, max 500 ký tự), `color` (enum: RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, PINK, GRAY).
   - Task counter: `GET /api/projects/:id` trả về `{ totalTasks, doneTasks }` từ aggregation query (không join hết task list).
   - **Archive:** `PATCH /api/projects/:id/archive` → set `archived_at = NOW()`. Khi đã archive: không cho tạo task mới (API trả 422 "Không thể tạo task trong project đã archive"), task cũ vẫn update được. Frontend ẩn nút "+ New Task" nếu `project.archived_at != null`.
   - **Delete:** `DELETE /api/projects/:id` → **Soft delete** (`deleted_at = NOW()`). Mọi GET query filter `WHERE deleted_at IS NULL`. Admin có thể restore trong 30 ngày.
   - **API:** `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/:id`, `PATCH /api/projects/:id/archive`, `DELETE /api/projects/:id`.

---

**4. FR-04 + FR-05 + FR-10: Task CRUD & Status & Activity Log** kết hợp **US-01** và **US-02**
   - **Permission tạo task:** Admin, Manager, và Member đều có thể tạo task trong workspace mình thuộc về (PRD FR-04: "Manager và Member có thể tạo task"; Admin ⊃ Manager nên cũng được).
   - **Field constraints (đúng PRD FR-04):**
     - `title`: bắt buộc, **max 200 ký tự** (PRD FR-04)
     - `description`: tùy chọn, **max 5000 ký tự, hỗ trợ Markdown** (PRD FR-04)
     - `assignee_id`: 1 người, nullable (OQ-01: 1 assignee duy nhất)
     - `project_id`: bắt buộc (PRD FR-04)
     - `priority`: enum `LOW | MEDIUM | HIGH | URGENT`
     - `due_date`: tùy chọn, cho phép set quá khứ → ngay lập tức `isOverdue = true`
     - `status`: enum `TO_DO | IN_PROGRESS | IN_REVIEW | DONE` (default: `TO_DO`)
   - **Tách biệt 2 API:**
     - `PATCH /api/tasks/:id` — chỉnh sửa các trường thông tin (title, description, assignee, priority, due_date, project_id). Tạo bởi: Admin, Manager, hoặc creator/assignee.
     - `PATCH /api/tasks/:id/status` — đổi status. **Chỉ assignee hoặc Admin/Manager.** Nếu không phải → 403.
   - **Phân quyền đổi status (US-02):** Frontend check `currentUser.id === task.assigneeId || ['ADMIN','MANAGER'].includes(currentUser.role)`. Nếu không thỏa → nút dropdown/drag bị `disabled`, hiện tooltip "Chỉ assignee hoặc Manager mới có thể đổi trạng thái".
   - **Activity Log:** mỗi lần UPDATE task → ghi 1 record/field thay đổi (không gộp). Fields tracked: `title`, `description`, `status`, `assignee_id`, `priority`, `due_date`, `project_id`. `action_type` enum: `CREATED | UPDATED | STATUS_CHANGED | COMMENTED | DELETED`. `old_value` và `new_value` lưu dạng string.
   - **Optimistic UI + rollback:** `useMutation` của TanStack Query, `onMutate` update cache lạc quan, `onError` rollback về `previousData`, toast error "Có lỗi xảy ra. Thử lại?".
   - **Soft Delete:** `DELETE /api/tasks/:id` → set `deleted_at = NOW()`. Mọi `GET` query đều có `WHERE deleted_at IS NULL`. Admin restore: `PATCH /api/tasks/:id/restore` (chỉ trong 30 ngày).
   - **Task Create API:** `POST /api/tasks` — kiểm tra `project.archived_at != null` → 422. Nếu có assignee → tạo notification `TASK_ASSIGNED`.

---

**5. FR-06 + FR-09: Comments & Notifications**
   - **Comment:** immutable — không cho edit/delete ở MVP (OQ-03).
   - **Mention parser:** scan content bằng regex `/@(\w+)/g` sau khi submit. Resolve username → userId. Lưu vào DB: comment content dạng plain text.
   - **XSS:** sanitize toàn bộ comment content bằng `sanitize-html` trước khi lưu (strip HTML tags).
   - **Notification types** (enum): `TASK_ASSIGNED | TASK_COMMENTED | TASK_MENTIONED | TASK_DUE_SOON | INVITE_ACCEPTED | REASSIGN_NEEDED`.
   - **Notification schema:** `id, user_id (recipient), type (enum), task_id (nullable), comment_id (nullable), workspace_id, message (string), read_at (nullable), created_at`.
   - **API Comments:** 
     - `GET /api/tasks/:taskId/comments` — Lấy danh sách comment, sort ASC theo `created_at`.
     - `POST /api/tasks/:taskId/comments` — request payload: `{ content: string.max(5000) }`.
   - **Notification trigger:** comment mới → notify task.assignee_id (nếu không phải người comment) + notify tất cả userId được mention (trừ người comment). MVP: chỉ in-app, không gửi email notification (OQ-02).
   - **Polling:** `GET /api/notifications?unread=true` polling mỗi **5 giây** (không dùng WebSocket ở MVP). Badge counter hiển thị số unread. `PATCH /api/notifications/:id/mark-read` hoặc `PATCH /api/notifications/mark-read-all` (đúng kebab-case convention).
   - **DUE_SOON:** kiểm tra khi user load dashboard → task `due_date` trong vòng 24h AND `status != DONE` → tạo notification (deduplicate: chỉ gửi 1 lần/task/ngày, dùng unique constraint `(task_id, type, DATE(created_at))`).

---

**6. FR-07 + FR-08: Dashboards** kết hợp **US-03**
   - **My Tasks — 3-tier sort logic** (US-03): SQL `ORDER BY (CASE WHEN due_date < NOW() THEN 0 ELSE 1 END), due_date ASC NULLS LAST`. Overdue → có due_date tăng dần → không có due_date.
   - **Filter My Tasks:** `status IN (TO_DO, IN_PROGRESS, IN_REVIEW)` — mặc định bỏ DONE. Filter tab "All" = 3 status trên, KHÔNG phải tất cả 4 status.
   - **Overdue badge:** `due_date < DATE(NOW()) AND status != DONE` → hiển thị badge đỏ "Quá hạn".
   - **Kanban board (FR-08):** 4 cột theo status enum. `@dnd-kit` drag-drop gọi `PATCH /api/tasks/:id/status`. **Mobile fallback:** màn hình < 768px hiển thị dropdown thay vì drag-drop (PRD Risk R-03). Search theo title dùng `?q=` query param (debounce 300ms client-side trước khi gọi API).
   - **Kanban filter API:** `GET /api/workspaces/:id/tasks?assigneeId=&projectId=&priority=&dueDateFrom=&dueDateTo=&q=`.
   - **Kanban access:** tất cả role trong workspace đều xem Kanban, nhưng chỉ assignee/Admin/Manager mới drag-drop đổi status.

---

**7. FR-11 + FR-12: Reports & Global Search** kết hợp **US-05**
   - **Reports access:** chỉ Admin + Manager (OQ-05). Member truy cập `/app/reports` → redirect `/app/my-tasks` + toast "Bạn không có quyền xem báo cáo."
   - **Report queries:**
     - Bar chart: `SELECT DATE_TRUNC('week', updated_at) as week, COUNT(*) FROM tasks WHERE status = 'DONE' AND workspace_id = :id AND updated_at >= NOW() - INTERVAL '4 weeks' GROUP BY week ORDER BY week`.
     - Member table: `SELECT assignee_id, COUNT(*) as assigned, SUM(CASE WHEN status='DONE' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN due_date < NOW() AND status != 'DONE' THEN 1 ELSE 0 END) as overdue FROM tasks WHERE workspace_id = :id AND deleted_at IS NULL GROUP BY assignee_id`.
     - Completion Rate = `(completed / assigned * 100)` làm tròn 1 chữ số thập phân.
   - **Drill-down (US-05):** Manager click tên member → `GET /api/workspaces/:id/tasks?assigneeId=:memberId` → hiển thị task list read-only. URL: `/app/team?assigneeId=:memberId`.
   - **Report APIs:**
     - `GET /api/reports/weekly-completion` — Trả về kết quả bar chart gom theo tuần `[ { week: Date, completed: number } ]`.
     - `GET /api/reports/member-stats` — Trả về dữ liệu bảng task summary của user trong workspace (phân quyền chỉ trả dữ liệu nếu role là Manager/Admin).
   - **Global Search (FR-12):** `GET /api/search?q=:term` — search `tasks.title ILIKE '%:term%'` WHERE `deleted_at IS NULL AND workspace_id = :workspaceId` (workspaceId backend tự parse JWT token logic, KHÔNG chèn param URL để phòng tránh leak param auth bypass). Tối đa 10 kết quả.

### Phần 4: Error Response Codes chuẩn hóa

| HTTP Code | Ý nghĩa | Message mẫu (tiếng Việt) |
|---|---|---|
| 400 | Bad Request — validation fail | "Title không được để trống." |
| 401 | Unauthorized — JWT missing/invalid | "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại." |
| 403 | Forbidden — role không đủ quyền | "Bạn không có quyền thực hiện hành động này." |
| 404 | Not Found | "Không tìm thấy tài nguyên." |
| 409 | Conflict — duplicate | "Email này đã là thành viên của workspace." |
| 422 | Unprocessable — business rule violation | "Không thể tạo task trong project đã archive." |
| 429 | Too Many Requests — rate limit / account locked | "Tài khoản bị khóa tạm. Vui lòng thử lại sau {countdown}." |
| 500 | Server Error | "Có lỗi xảy ra. Vui lòng thử lại." |

Mọi response đều theo format: `{ success: boolean, data?: T, error?: string }`.

### Phần 5: Edge Cases Implementation Guide

Bao gồm toàn bộ PRD §10 (xem Section 8 bên dưới).

### Phần 6: Layout Structure & UI References

Layout structure cơ bản được define ở Section 9. Chi tiết design tokens, component styles, color palette, và micro-animations sẽ được định nghĩa trong file `design_system.md` riêng.

### Phần 7: Testing Blueprint

Xem Section 10 bên dưới.

---

## 6. NFR Coverage Trong requirements.md

| NFR | Nội dung cần spec trong requirements.md |
|---|---|
| **NFR-01 (Performance)** | API read < 500ms p95, write < 1s p95. Frontend LCP < 2.5s. Dùng TanStack Query cache (staleTime, gcTime) để giảm redundant fetch. |
| **NFR-02 (Availability)** | Uptime SLA ≥ 99.5%. Scheduled maintenance thông báo trước 24h. Railway auto-restart on crash. Health check endpoint: `GET /api/health` → `{ success: true, data: { status: "ok", timestamp } }`. |
| **NFR-03 (Security)** | bcrypt cost=12, JWT 7 ngày (**không refresh token ở MVP**), rate limit 100 req/phút/IP (express-rate-limit middleware), password không bao giờ trong response, **HTTPS/TLS 1.2+** (enforced by Railway/Vercel), input sanitization (`sanitize-html` + Prisma parameterized queries). |
| **NFR-04 (Scalability)** | Stateless API — không lưu session server-side. JWT là source of truth. Prisma connection pool `connection_limit=10`. |
| **NFR-05 (Usability)** | Mọi core action ≤ 3 click. Loading state > 300ms. Empty state có CTA. **Responsive design:** breakpoints 375px (mobile), 768px (tablet), 1024px (desktop). |
| **NFR-06 (Accessibility)** | Kanban board hỗ trợ keyboard navigation (Escape đóng modal, Tab focus qua cards, Enter mở task). Form có `aria-label`. Màu sắc đạt contrast ratio WCAG 2.1 AA. |
| **NFR-07 (Data Integrity)** | Soft delete task + project (deleted_at). Admin restore task trong 30 ngày: `PATCH /api/tasks/:id/restore`. Activity log không có DELETE endpoint. |
| **NFR-08 (Browser support)** | Target Chrome ≥ 110, Firefox ≥ 110, Safari ≥ 16, Edge ≥ 110. Test drag-drop trên Safari riêng. |

---

## 7. Responsive Design Specifications

| Breakpoint | Tên | Hành vi |
|---|---|---|
| < 768px | Mobile | Sidebar collapse thành hamburger menu. Kanban → dropdown thay drag-drop. Task detail mở fullscreen thay slide-over. |
| 768px – 1023px | Tablet | Sidebar ở chế độ collapsed (icons only). Kanban vẫn drag-drop nhưng cột nhỏ hơn. |
| ≥ 1024px | Desktop | Full layout: Sidebar mở + Content area. Slide-over panel cho task detail. |

---

## 8. Edge Cases Phải Được Cover (Mapping từ PRD Section 10)

| Edge Case | Spec trong requirements.md |
|---|---|
| Assignee bị xóa khỏi workspace | Task.assignee_id set `null`. Hiển thị: kiểm tra nếu userId không có trong workspace_members → label "[Removed User]". API trả về `assignee: null, assigneeRemoved: true`. Manager nhận notification `REASSIGN_NEEDED`. |
| Project bị archive khi còn task open | `POST /api/tasks` kiểm tra `project.archived_at != null` → 422 "Không thể tạo task trong project đã archive". Task cũ vẫn update được. |
| Last-write-wins khi 2 user edit đồng thời | Không implement optimistic lock. Ghi log mỗi lần save. `updated_at` tự động cập nhật. |
| Due date set vào quá khứ | Cho phép (không validate). Task ngay lập tức có `isOverdue = true` trong response. |
| `<script>` trong title/comment | Backend sanitize bằng `sanitize-html` (strip HTML tags). Prisma parameterized query ngăn SQL injection. Lưu plain text. |
| Member tự xóa mình | `DELETE /api/workspaces/:wid/members/:uid` — middleware kiểm tra nếu `uid === req.user.id` → 403 "Bạn không thể tự xóa mình khỏi workspace". |
| Token JWT hết hạn giữa chừng | Axios interceptor `response.use(_, error => { if (error.response?.status === 401) { clearAuth(); router.push('/login'); } })`. Toast: "Phiên làm việc đã hết hạn." |
| Đăng nhập sai 5 lần | Lưu `failed_attempts` + `locked_until` trong DB. Mỗi login check `locked_until > NOW()` → 429 + countdown `locked_until - NOW()`. |
| Mở 2 tab, logout 1 tab | Khi logout: `localStorage.removeItem('token')` → tab khác listen `storage` event, detect token removed → redirect login. |
| Mất kết nối internet | `window.addEventListener('online'/'offline')` → Zustand `uiStore.isOffline`. Banner fixed-top khi offline: "Bạn đang offline. Một số tính năng không hoạt động." |
| API 500 / timeout | Toast error: "Có lỗi xảy ra. Thử lại?" với nút Retry. Không mất dữ liệu user đã nhập (dùng React Hook Form state). |
| Trang load nhưng không có quyền | Hiển thị "Không có quyền truy cập" + nút "Về trang chính", KHÔNG để trang trắng. |

---

## 9. Layout Structure

> Chi tiết design tokens, component styles, color palette, typography, và micro-animations sẽ được định nghĩa trong file `design_system.md` riêng. Section này chỉ define layout cấu trúc tổng thể để đảm bảo tính nhất quán.

```
┌──────────────────────────────────────────────────────────────┐
│ TopBar (h-14, fixed top, z-50)                               │
│  ┌─Logo──┬──Workspace Name──┬──GlobalSearch──┬─Bell─┬─Avatar─│
│  └───────┴──────────────────┴───────────────┴──────┴────────│
├──────────┬───────────────────────────────────────────────────┤
│ Sidebar  │ Main Content Area                                 │
│ (w-64,   │ (flex-1, p-6, overflow-y-auto)                   │
│  fixed)  │                                                   │
│          │ ┌─Page Header (title + actions)──────────────┐    │
│ ─ My     │ │ h2 + "New Task" button                     │    │
│   Tasks  │ └────────────────────────────────────────────┘    │
│ ─ Team   │                                                   │
│ ─ Proj   │ ┌─Content──────────────────────────────────┐      │
│ ─ Report │ │ (Task list / Kanban / Table / Chart)      │      │
│ ─ Set    │ └───────────────────────────────────────────┘      │
│          │                                                   │
│          │          ┌─SlideOver Panel (w-[480px])──────┐     │
│          │          │ Task Detail, right-fixed, z-40   │     │
│          │          │ overlay bg-black/20              │     │
│          │          └──────────────────────────────────┘     │
└──────────┴───────────────────────────────────────────────────┘
```

> **Lưu ý:** Agent khi sinh giao diện phải tham chiếu file `design_system.md` để lấy design tokens, component styles, và animation specs.

---

## 10. Testing Blueprint (Cụ thể — đúng AGENTS.md)

### 10.1. API Unit Tests (mỗi endpoint)

| Module | Test File | Cases cần cover |
|---|---|---|
| Auth | `auth.service.test.ts` | Register success, register duplicate email (409), login success, login wrong password, login locked after 5 fails (429), JWT generation, password not in response |
| Workspace | `workspace.service.test.ts` | Create workspace, list my workspaces, update name (Admin only), add/remove member, role change, self-remove blocked (403) |
| Project | `project.service.test.ts` | CRUD, archive project, create task in archived project (422), soft delete, task counter aggregation |
| Task | `task.service.test.ts` | Create, update fields, change status (assignee allowed, non-assignee blocked 403), soft delete, restore, overdue flag, row-level isolation |
| Comment | `comment.service.test.ts` | Create comment, mention parsing, XSS sanitization, notification trigger |
| Notification | `notification.service.test.ts` | Create notification, mark read, mark all read, polling unread, deduplicate DUE_SOON |
| Report | `report.service.test.ts` | Weekly completion query, member stats, completion rate calculation |
| Search | `search.service.test.ts` | Search by title, max 10 results, soft-deleted not returned, workspace isolation |

### 10.2. Component Tests (interactive components)

| Component | Test File | Cases |
|---|---|---|
| LoginForm | `LoginForm.test.tsx` | Submit valid, submit empty email → error, submit wrong password → toast, account locked → countdown |
| TaskCreateForm | `TaskCreateForm.test.tsx` | Submit valid, title empty → error, title > 200 chars → error, select project required |
| KanbanBoard | `KanbanBoard.test.tsx` | Render 4 columns, drag card → status change, non-assignee cannot drag → disabled |
| TaskSlideOver | `TaskSlideOver.test.tsx` | Open/close animation, inline edit title, change status, add comment |
| NotificationBell | `NotificationBell.test.tsx` | Badge count, click opens dropdown, mark as read |
| InviteMemberForm | `InviteMemberForm.test.tsx` | Submit valid email, duplicate member → error (409) |

### 10.3. Edge Case Tests (PRD §10)

| Test | Scenario |
|---|---|
| `edge-assignee-removed.test.ts` | Remove member → task shows "[Removed User]" |
| `edge-archived-project.test.ts` | Archive project → create task returns 422 |
| `edge-login-lockout.test.ts` | 5 wrong passwords → 429 + countdown |
| `edge-cross-tab-logout.test.ts` | Logout tab A → tab B detects and redirects |
| `edge-xss-sanitize.test.ts` | `<script>alert('xss')</script>` in title → stripped |
| `edge-self-remove.test.ts` | Member tries DELETE self → 403 |

---

## 11. Các bước hành động (Action Plan — Cập Nhật)
1. ✅ **Review Plan v1:** Hoàn thành.
2. ✅ **Review Plan v2:** Đã bổ sung: field constraints đúng PRD, workspace CRUD APIs, NFR-02 coverage, HTTPS/TLS, refresh token stance, responsive breakpoints, route mapping, Open Questions resolved, env variables, error codes chuẩn hóa, layout structure, testing blueprint cụ thể, project soft delete decision. UI Design Specs sẽ nằm trong file `design_system.md` riêng.
3. **Thực thi:** Tạo file `requirements.md` (~800-1200 dòng) triển khai toàn bộ spec bên trên — đây là source of truth duy nhất cho Agent code.
4. **Sinh tasks.md:** Dùng `requirements.md` làm input để chẻ nhỏ từng task theo milestone (M0→M5).

*(Plan v2 đã hoàn chỉnh — sẵn sàng thực thi sinh `requirements.md`)*
