# Plan Chỉnh Sửa Tài Liệu — TaskFlow MVP (v2)
> **Ngày tạo:** 2026-04-28  
> **Dựa trên:** Kết quả audit `doc_audit_report.md`  
> **Trạng thái:** ⏳ Chờ Approve — CHƯA THỰC HIỆN BẤT KỲ THAY ĐỔI NÀO  
> **Loại trừ theo yêu cầu:** CONFLICT-03 (Reports Access Control — Admin có toàn quyền, không cần sửa)

---

## Tổng quan các thay đổi

| # | ID | Mức độ | File đích | Loại thay đổi |
|---|---|---|---|---|
| 1 | CONFLICT-01 | 🔴 CRITICAL | `requirements.md` | Sửa 1 từ (Cursor → Offset/Limit) |
| 2 | CONFLICT-02 | 🔴 CRITICAL | `ui-wireframes.md` | Thêm Project filter vào Kanban |
| 3 | HIGH-02 | 🟠 HIGH | `AGENTS.md` | Thêm dòng Cloudinary vào Backend stack |
| 4 | HIGH-03a | 🟠 HIGH | `ui-wireframes.md` | Thêm Due Date field vào Task Create Modal |
| 5 | HIGH-03b | 🟠 HIGH | `design-system.md` | Thêm Date Picker component spec |
| 6 | HIGH-04 | 🟠 HIGH | `ui-wireframes.md` | Thêm wireframe Project Detail page |
| 7 | MEDIUM-02 | 🟡 MEDIUM | `requirements.md` | Thêm `GET /api/tasks` endpoint spec |
| 8 | MEDIUM-03 | 🟡 MEDIUM | `ui-wireframes.md` | Thêm Invite Accept Screen wireframe |
| 9 | MEDIUM-04 | 🟡 MEDIUM | `tasks.md` | Thêm task `/api/health` vào M0 |
| 10 | MEDIUM-05 | 🟡 MEDIUM | `design-system.md` | Ghi rõ phương thức load font |
| 11 | MEDIUM-06 | 🟡 MEDIUM | `AGENTS.md` | Sửa "soft delete cho tasks" → "tasks và projects" |

---

## Chi tiết từng thay đổi

---

### Fix #1 — CONFLICT-01: Pagination Strategy Kanban

**File:** `d:\taskflowfinal\docs\requirements.md`  
**Vị trí:** §3 / FR-07 → FR-08, dòng 593

**Vấn đề:**
- Dòng hiện tại ghi: *"Kanban API hỗ trợ **Cursor-based Pagination** (Limit mặc định = 50)"*
- `tasks.md` §M3/FR-08 ghi ngược lại: *"BẮT BUỘC tích hợp Offset/Limit Pagination, **Cốt lõi loại trừ Cursor-based**"*
- → Agent không biết phải làm theo cái nào

**Thay đổi cụ thể (diff):**
```diff
- **Kanban (Team)**: 4 thẻ status enum. Gọi Kanban API hỗ trợ **Cursor-based Pagination** (Limit mặc định = 50). Frontend sử dụng Infinite Scroll.
+ **Kanban (Team)**: 4 thẻ status enum. Gọi Kanban API hỗ trợ **Offset/Limit Pagination** (Limit mặc định = 50, page = 0). Frontend sử dụng Infinite Scroll với `useInfiniteQuery`.
```

**Lý do chọn Offset/Limit:**
- Đơn giản hơn cho backend MVP
- Tương thích với filter đa tham số (status + assignee + project + priority)
- Cursor-based phức tạp hơn khi kết hợp filtering, dễ bug
- `tasks.md` (document thực thi) đã chọn Offset/Limit và giải thích lý do rõ

---

### Fix #2 — CONFLICT-02: Thiếu Project filter trong Kanban UI

**File:** `d:\taskflowfinal\docs\ui-wireframes.md`  
**Vị trí:** §2.3 Màn hình Kanban Board, phần "Kanban Filter UI"

**Vấn đề:**
- PRD §FR-08: *"Filter theo: Assignee, **Project**, Priority, Due date range"* — 4 filter
- `ui-wireframes.md` §2.3 hiện tại chỉ liệt kê 3 filter: Assignee, Priority, Due Date
- → Agent code Frontend sẽ thiếu Project filter

**Thay đổi cụ thể (diff):**
```diff
 **Kanban Filter UI:**
 - **Assignee**: Multiple Select (Avatar Group)
+- **Project**: Single Select Dropdown (All / [tên project trong workspace])
 - **Priority**: Dropdown (All, Low, Med, High, Urgent)
 - **Due Date**: Date Range Picker (Optional)
```

**Ghi chú thêm:** Query param gửi lên backend sẽ là `?project_id=` (optional), backend filter `WHERE project_id = :projectId AND workspace_id = :workspaceId`.

---

### Fix #3 — HIGH-02: AGENTS.md thiếu Cloudinary

**File:** `d:\taskflowfinal\docs\AGENTS.md`  
**Vị trí:** Section `### Backend`, sau dòng `Email: Resend (free tier)`

**Vấn đề:**
- `requirements.md` §FR-04 và §1.3 env vars đều định nghĩa Cloudinary cho upload ảnh
- `AGENTS.md` (quick-reference cho Agent) không đề cập → Agent đọc AGENTS.md và bỏ qua upload hoàn toàn

**Thay đổi cụ thể (diff):**
```diff
 ### Backend
 - Runtime: Node.js + Express
 - ORM: Prisma
 - Database: PostgreSQL ≥ 14
 - Authentication: JWT (7 ngày expiry) + bcrypt (cost factor ≥ 12)
 - Cookie: cookie-parser (httpOnly cookie cho JWT — KHÔNG dùng localStorage)
 - Email: Resend (free tier)
+- File Storage: Cloudinary (free tier) — upload ảnh task description < 5MB (jpg/png/webp/gif). Endpoint: POST /api/upload. Env: CLOUDINARY_URL, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

---

### Fix #4 — HIGH-03a: Thiếu Due Date field trong Task Create Modal

**File:** `d:\taskflowfinal\docs\ui-wireframes.md`  
**Vị trí:** §3.2 Form Tạo Mới Task Modal, trong `[FormContainer (React Hook Form)]`

**Vấn đề:**
- PRD §FR-04 liệt kê `Due date (tùy chọn)` là field của Task
- `requirements.md` schema Prisma có `due_date DateTime?`
- Form modal wireframe thiếu field này → Agent sẽ tạo form không có Due Date

**Thay đổi cụ thể (diff):**
```diff
 ├── [FormContainer (React Hook Form)]
 │    ├── [Input Title: require]
 │    ├── [Select Project: require]
 │    ├── [Select Assignee: useAvatar + name]
 │    ├── [Select Priority: Dot + Label (LOW-Urgent)]
 │    ├── [Select Status default To Do]
+│    ├── [DatePicker Due Date: Optional — shadcn/ui <Popover> + <Calendar> component]
 │    ├── [Textarea Description]
 │    └── [FooterButtons: flex justify-end gap-2] -> [Cancel (ghost)] + [Create Task (primary)]
```

---

### Fix #5 — HIGH-03b: Thiếu Date Picker spec trong design-system.md

**File:** `d:\taskflowfinal\docs\design-system.md`  
**Vị trí:** §3.2 Forms & Inputs, sau phần Zod Error state

**Vấn đề:**
- Due Date field xuất hiện ở Task Create Modal và Task SlideOver nhưng không có component spec

**Thay đổi cụ thể:** Thêm đoạn sau vào cuối §3.2:
```markdown
- **Date Picker (Due Date)**: Dùng combo `<Popover>` + `<Calendar>` của shadcn/ui.
  - Trigger: Button dạng `<Button variant="outline">` hiển thị ngày đã chọn hoặc text "Chọn ngày" nếu chưa có.
  - Nếu trống (optional): Không báo lỗi.
  - Nếu ngày đã qua (past date): Cho phép chọn, nhưng field hiển thị màu `text-red-500` để cảnh báo.
  - Format hiển thị: `dd/MM/yyyy` (VD: 15/05/2026).
```

---

### Fix #6 — HIGH-04: Thiếu wireframe trang Chi tiết Project `/app/projects/:id`

**File:** `d:\taskflowfinal\docs\ui-wireframes.md`  
**Vị trí:** Sau §2.6 (Projects List), thêm §2.7 mới

**Vấn đề:**
- PRD §12.2 routing: `/app/projects/:id — Chi tiết project + task list`
- `requirements.md` §1.6 folder structure: `/app/projects/[id]/page.tsx` có trong tree
- Không có wireframe → Agent phải tự sáng chế layout, dễ inconsistent

**Thay đổi cụ thể:** Thêm section mới vào cuối §2 (trước phần 3):
````markdown
### 2.7. Màn hình Chi tiết Project (`/app/projects/:id`)
Hiển thị chi tiết project và danh sách task thuộc project đó. Layout tương tự My Tasks nhưng filter cứng theo project.

```text
[PageRoot: flex flex-col h-full gap-6]
 ├── [PageHeader: flex justify-between items-center]
 │    ├── [Left: flex items-center gap-3]
 │    │    ├── [ProjectColorDot: w-3 h-3 rounded-full bg-{color}-500]
 │    │    ├── [Title: h1 text-2xl font-bold text-slate-900] -> "{Project Name}"
 │    │    └── [ArchiveBadge (Nếu archived): text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded]
 │    └── [Actions: flex gap-2]
 │         ├── [Button Archive/Unarchive: ghost variant]
 │         └── [Button "+ New Task": primary — disabled nếu project archived]
 │
 ├── [ProjectStats: flex gap-6 text-sm text-slate-500]
 │    ├── [Stat: "{done} / {total} tasks hoàn thành"]
 │    └── [ProgressBar: w-full h-1.5 bg-slate-200 rounded — filled bg-emerald-500]
 │
 ├── [FilterTabs: flex gap-4 text-sm font-medium border-b border-slate-200 pb-2]
 │    -> All / To Do / In Progress / In Review / Done
 │
 └── [TaskListContainer: flex flex-col gap-3 overflow-y-auto]
      ├── *(Nếu Trống)* -> [EmptyState] -> "Project này chưa có task nào. Nhấn '+ New Task' để bắt đầu."
      └── *(Data map)* -> [TaskListItem] (giống §2.2 My Tasks, nhưng không show ProjectDotBadge)
```
````

---

### Fix #7 — MEDIUM-02: Thiếu GET /api/tasks endpoint spec

**File:** `d:\taskflowfinal\docs\requirements.md`  
**Vị trí:** §3 / FR-04→FR-05 & Activity Log (Task CRUD), sau dòng `POST /api/tasks`

**Vấn đề:**
- Có `POST`, `PATCH`, `DELETE` nhưng không document `GET /api/tasks` với query params
- My Tasks (FR-07) và Kanban (FR-08) đều call endpoint này nhưng không có contract rõ

**Thay đổi cụ thể:** Thêm spec sau dòng `POST /api/tasks`:
```markdown
- **GET /api/tasks**: Lấy danh sách task. Query params:
  - `status`: `TO_DO | IN_PROGRESS | IN_REVIEW | DONE` (optional, multi-value: `status=TO_DO&status=IN_PROGRESS`)
  - `assignee_id`: UUID (optional)
  - `project_id`: UUID (optional)
  - `priority`: `LOW | MEDIUM | HIGH | URGENT` (optional)
  - `q`: string tìm kiếm theo title ILIKE (optional, max 100 chars)
  - `page`: number, default 0
  - `limit`: number, default 20 (My Tasks) hoặc 50 (Kanban)
  - `sort`: `due_date_asc` | `created_at_desc` (optional)
  - Bắt buộc filter: `deleted_at IS NULL AND workspace_id = :workspaceId`
  - Response: `{ success: true, data: { tasks: Task[], total: number, page: number, limit: number } }`
```

---

### Fix #8 — MEDIUM-03: Thiếu wireframe Invite Accept Screen

**File:** `d:\taskflowfinal\docs\ui-wireframes.md`  
**Vị trí:** §2.1 (Auth Screens), thêm mục 2.1.1 ngay sau phần Login/Register wireframe

**Vấn đề:**
- PRD §12.2: `/invite?token=xxx — Accept invite`
- `requirements.md` §FR-02: Mô tả logic nhưng không có UI spec
- Không có wireframe → Agent tự sáng chế giao diện

**Thay đổi cụ thể:** Thêm sau §2.1:
````markdown
### 2.1.1. Invite Accept Screen (`/invite?token=xxx`)
Màn hình public (không cần auth). Hiển thị khi người dùng click vào link invite email.

**Trường hợp 1 — Token hợp lệ, user chưa có tài khoản:**
```text
[InviteContainer: flex items-center justify-center min-h-screen bg-slate-50]
 └── [InviteCard: bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-[400px] text-center]
      ├── [Logo: TaskFlow logo hoặc icon]
      ├── [Title: h1 text-2xl font-bold text-slate-900] -> "Bạn được mời tham gia"
      ├── [WorkspaceName: text-lg text-indigo-600 font-semibold mb-4] -> "{workspace_name}"
      ├── [Message: text-sm text-slate-500 mb-6] -> "Điền thông tin để tạo tài khoản và tham gia workspace."
      ├── [Form: RegisterForm rút gọn (Name, Password, Confirm Password) — email disabled, hiển thị sẵn]
      └── [Button: "Tham gia Workspace" primary w-full]
```

**Trường hợp 2 — Token hợp lệ, user đã có tài khoản (email khớp):**
```text
[InviteCard]
 ├── [Title] -> "Xác nhận tham gia"
 ├── [Message] -> "Tài khoản {email} sẽ được thêm vào workspace {workspace_name}."
 └── [Button: "Đồng ý tham gia" primary] + [Button: "Từ chối" ghost]
```

**Trường hợp 3 — Token hết hạn hoặc không hợp lệ:**
```text
[InviteCard]
 ├── [Icon: cảnh báo màu amber]
 ├── [Title] -> "Link mời đã hết hạn"
 ├── [Message: text-sm text-slate-500] -> "Link mời đã hết hạn hoặc không hợp lệ. Vui lòng liên hệ Admin để được mời lại."
 └── [Button: "Về trang chủ" ghost] -> redirect /login
```
````

---

### Fix #9 — MEDIUM-04: Thiếu task health endpoint trong tasks.md

**File:** `d:\taskflowfinal\docs\tasks.md`  
**Vị trí:** §Milestone 0: Setup & Infrastructure, block "Thiết lập Database Layer"

**Vấn đề:**
- `requirements.md` §7.4 (NFR-02): *"thêm `GET /api/health` status Endpoint"*
- `tasks.md` không có task này → Agent có thể bỏ qua endpoint health check

**Thay đổi cụ thể (diff):**
```diff
 - [ ] **Thiết lập Database Layer** (Mapping: `requirements.md` -> Phần 2)
   - [ ] Khởi tạo cấu trúc `schema.prisma` với PostgreSQL, tuân thủ nghiêm ngặt các relations, Rule Soft Delete (`deleted_at`), Failed attempts (`locked_until`).
+  - [ ] [Backend] Implement `GET /api/health` endpoint trả về `{ status: "ok", timestamp: ISO_string }`. Không cần auth. Phục vụ Railway Auto-recovery check (NFR-02).
```

---

### Fix #10 — MEDIUM-05: Thiếu phương thức load font trong design-system.md

**File:** `d:\taskflowfinal\docs\design-system.md`  
**Vị trí:** §2.3 Typography, sau dòng "Toàn bộ dự án dùng sans-serif hiện đại, khuyến nghị `font-inter`."

**Vấn đề:**
- "khuyến nghị font-inter" là mơ hồ — Agent có thể dùng CDN link thay vì `next/font` (làm giảm performance)
- Next.js 16 best practice là dùng `next/font/google` để tránh layout shift và optimize loading

**Thay đổi cụ thể (diff):**
```diff
-Toàn bộ dự án dùng sans-serif hiện đại, khuyến nghị `font-inter`.
+Toàn bộ dự án dùng sans-serif hiện đại. **Bắt buộc** dùng `next/font/google` (KHÔNG dùng CDN link) để optimize Web Font loading:
+```typescript
+// /frontend/src/app/layout.tsx
+import { Inter } from 'next/font/google';
+const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
+// Apply: <body className={inter.variable}>
+```
```

---

### Fix #11 — MEDIUM-06: AGENTS.md thiếu soft delete cho Projects

**File:** `d:\taskflowfinal\docs\AGENTS.md`  
**Vị trí:** §Architecture Patterns, dòng "Soft delete cho tasks (deleted_at timestamp)"

**Vấn đề:**
- Prisma schema trong `requirements.md` có `deleted_at` cho cả `Task` và `Project`
- `AGENTS.md` chỉ nhắc tasks → Agent có thể bỏ soft delete cho Projects

**Thay đổi cụ thể (diff):**
```diff
-- Soft delete cho tasks (deleted_at timestamp)
+- Soft delete cho tasks và projects (deleted_at timestamp) — KHÔNG hard delete
```

---

## Thứ tự thực hiện đề xuất

```
Batch 1 (CRITICAL — làm trước):
  Fix #1 → requirements.md (1 dòng sửa)
  Fix #2 → ui-wireframes.md §2.3 (thêm 1 dòng)

Batch 2 (HIGH — làm liền sau, gộp theo file):
  AGENTS.md:        Fix #3 + Fix #11 (2 chỗ khác nhau trong cùng file)
  ui-wireframes.md: Fix #4 + Fix #6 + Fix #8 (3 chỗ khác nhau trong cùng file)
  design-system.md: Fix #5 + Fix #10 (2 chỗ khác nhau trong cùng file)

Batch 3 (MEDIUM — cuối cùng):
  Fix #7 → requirements.md §3 (thêm GET /api/tasks spec)
  Fix #9 → tasks.md §M0 (thêm 1 sub-item)
```

**Tổng cộng:** 5 file bị chỉnh sửa, không có file nào bị xóa hay tạo mới.

---

## Danh sách file sẽ bị thay đổi

| File | Loại thay đổi | Số chỗ sửa |
|---|---|---|
| `d:\taskflowfinal\docs\requirements.md` | Sửa 1 dòng + Thêm ~12 dòng | 2 chỗ |
| `d:\taskflowfinal\docs\ui-wireframes.md` | Thêm ~80 dòng | 4 chỗ |
| `d:\taskflowfinal\docs\design-system.md` | Thêm ~15 dòng | 2 chỗ |
| `d:\taskflowfinal\docs\AGENTS.md` | Sửa 1 dòng + Thêm 1 dòng | 2 chỗ |
| `d:\taskflowfinal\docs\tasks.md` | Thêm 1 sub-item (~2 dòng) | 1 chỗ |

> ⚠️ **Nhắc lại: Chưa thực hiện bất kỳ thay đổi nào. Đang chờ User approve plan này.**
