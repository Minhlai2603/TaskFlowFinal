# 📋 Documentation Fix Plan — TaskFlow MVP Agentic Readiness
> **Trạng thái:** Chờ Approve  
> **Ngày tạo:** 2026-04-28  
> **Căn cứ:** `agentic_readiness_audit.md` — 22 issues (6 Critical, 9 High, 7 Medium)  
> **Quyết định kiến trúc đã chốt:** JWT Token Storage = **Option B (httpOnly cookie)**

> ⚠️ **Không được chỉnh sửa bất kỳ file nào cho đến khi plan này được APPROVE.**

---

## Tổng quan thay đổi theo file

| File | Số issues liên quan | Loại thay đổi |
|---|---|---|
| `requirements.md` | C-01, C-02, C-04, C-05, C-06, H-01, H-02, H-03, H-08, H-09, M-01, M-03, M-06, M-07 | Bổ sung section mới + sửa nội dung hiện có |
| `AGENTS.md` | C-03, C-04 | Bổ sung 2 dòng vào Tech Stack |
| `ui-wireframes.md` | H-04, H-05, H-06, H-07, M-02, M-05 | Thêm wireframe mới + bổ sung spec |
| `design-system.md` | M-02 | Thêm bảng Toast Messages |

---

## PHASE 1 — Sửa `requirements.md` (14 issues)

### FIX C-01 · Thêm Folder Tree vào §1.5

**Vị trí chèn:** Cuối section `§1.5 System Architecture & Data Flow`, sau đoạn "Component Architecture".

**Nội dung thêm:**

```markdown
### 1.6 Cấu Trúc Thư Mục Dự Án (Bắt buộc tuân thủ)

**Monorepo layout:**
```
/taskflowfinal
  /backend
  /frontend
  package.json  ← workspace root
```

**Backend (`/backend/src`):**
```
/modules
  /auth
    auth.controller.ts   ← Xử lý HTTP req/res
    auth.service.ts      ← Business logic (hash, JWT)
    auth.routes.ts       ← Express Router
    auth.types.ts        ← Interface / DTO types
  /workspaces
    workspace.controller.ts
    workspace.service.ts
    workspace.routes.ts
    workspace.types.ts
  /projects
    project.controller.ts
    project.service.ts
    project.routes.ts
    project.types.ts
  /tasks
    task.controller.ts
    task.service.ts
    task.routes.ts
    task.types.ts
  /comments
    comment.controller.ts
    comment.service.ts
    comment.routes.ts
  /notifications
    notification.controller.ts
    notification.service.ts
    notification.routes.ts
    notification.cron.ts  ← node-cron job cho TASK_DUE_SOON
  /reports
    report.controller.ts
    report.service.ts
    report.routes.ts
  /upload
    upload.controller.ts
    upload.routes.ts
/middleware
  auth.middleware.ts      ← Verify JWT từ httpOnly cookie
  workspace.middleware.ts ← Parse x-workspace-id, verify membership
  ratelimit.middleware.ts ← express-rate-limit config
  errorHandler.middleware.ts ← Global error handler
/utils
  sanitize.ts             ← sanitize-html wrapper
  jwt.ts                  ← sign/verify helpers
/prisma
  schema.prisma
server.ts                 ← Entry point: mount middleware, routes
```

**Frontend (`/frontend/src`):**
```
/app
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /invite/page.tsx         ← Public: xử lý invite token
  /(dashboard)
    /app
      /my-tasks/page.tsx
      /team/page.tsx
      /projects
        /page.tsx          ← Danh sách projects
        /[id]/page.tsx     ← Chi tiết project + task list
      /reports/page.tsx
      /settings
        /page.tsx          ← General settings
        /members/page.tsx  ← Member management
  layout.tsx               ← Root layout (font, providers)
  middleware.ts            ← Next.js Route Guard (xem FIX C-02)
  error.tsx                ← Global error boundary fallback
  not-found.tsx            ← 404 page
/features
  /auth
    /components
      LoginForm.tsx
      RegisterForm.tsx
    /hooks
      useAuth.ts
    /stores
      authStore.ts         ← Zustand: { user, workspaceId, workspaceRole }
  /tasks
    /components
      TaskListItem.tsx
      TaskSlideOver.tsx    ← Sheet side="right"
      TaskCreateModal.tsx  ← Dialog form
      TaskCardSkeleton.tsx
    /hooks
      useTasks.ts          ← useQuery / useMutation wrappers
    api.ts                 ← Axios calls cho /api/tasks
  /kanban
    /components
      KanbanBoard.tsx
      KanbanColumn.tsx
      KanbanCard.tsx       ← Draggable
    /hooks
      useKanban.ts
  /projects
    /components
      ProjectCard.tsx
      ProjectCreateModal.tsx
    /hooks
      useProjects.ts
    api.ts
  /notifications
    /components
      NotificationBell.tsx
      NotificationDropdown.tsx
    /hooks
      useNotifications.ts  ← refetchInterval: 5000
    api.ts
  /reports
    /components
      WeeklyBarChart.tsx   ← recharts BarChart
      MemberStatsTable.tsx
    api.ts
  /settings
    /components
      MembersTable.tsx
      InviteMemberForm.tsx
      RoleBadge.tsx
/components
  /ui                      ← shadcn/ui primitives (Button, Input, Sheet...)
  EmptyState.tsx           ← Tái sử dụng toàn app
  ErrorBoundary.tsx
  OfflineBanner.tsx
/lib
  axios.ts                 ← Configured Axios instance (xem FIX H-09)
  queryClient.ts           ← TanStack Query client config
```
```

---

### FIX C-02 · Thêm Route Guard spec vào §FR-01

**Vị trí chèn:** Cuối section `FR-01: Authentication & Session`, trước phần `Testing Strategy`.

**Nội dung thêm:**

```markdown
**Frontend Route Guard (Next.js Middleware):**
- File: `/frontend/middleware.ts` (tại root của Next.js project)
- Matcher pattern: `['/((?!login|register|invite|_next/static|_next/image|favicon.ico).*)']`
  → Bảo vệ mọi route TRỪ login, register, invite, và static assets
- Logic:
  ```typescript
  // middleware.ts
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';

  export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  export const config = {
    matcher: ['/((?!login|register|invite|_next/static|_next/image|favicon.ico).*)'],
  };
  ```
- authStore (Zustand) hydrate: Khi app load, `GET /api/auth/me` (cookie tự động gửi kèm) → populate `user`, `workspaceId`, `workspaceRole` vào store.
```

---

### FIX C-03 (requirements.md phần) · Thêm chart library vào §FR-11

**Vị trí chèn:** Đầu section `FR-11 & FR-12: Reports & Global Search`, trước dòng `/app/reports Guard`.

**Nội dung thêm:**

```markdown
**Chart Library:** Sử dụng `recharts` v2.x.
- Cài: `npm install recharts`
- Component chart PHẢI là Client Component (`'use client'`) vì recharts dùng browser APIs.
- Import: `import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'`
```

---

### FIX C-04 · JWT httpOnly Cookie Strategy vào §FR-01

**Vị trí chèn:** Ngay sau dòng `POST /api/auth/logout: API stateless...`, thay thế đoạn mô tả cũ.

**Nội dung THAY THẾ** (thay dòng hiện tại về localStorage):

```markdown
**Token Storage Strategy (CHỐT — Option B: httpOnly Cookie):**

Backend:
- `POST /api/auth/login` thành công → Backend set cookie:
  ```
  Set-Cookie: auth_token=<JWT>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
  ```
  (Max-Age = 7 ngày = 604800 giây)
- `POST /api/auth/logout` → Backend clear cookie:
  ```
  Set-Cookie: auth_token=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/
  ```
- Mọi API endpoint protected đọc JWT từ `req.cookies.auth_token` (dùng middleware `cookie-parser`)
- Package cần cài thêm: `cookie-parser`, `@types/cookie-parser`

Frontend:
- KHÔNG dùng `localStorage` để lưu token.
- `axios.ts` config `withCredentials: true` để cookie tự động gửi theo.
- Cross-tab logout: Dùng `BroadcastChannel API`:
  ```typescript
  // Trong authStore.ts
  const channel = new BroadcastChannel('auth');
  // Khi logout:
  channel.postMessage({ type: 'LOGOUT' });
  // Trong mọi tab khác:
  channel.onmessage = (e) => { if (e.data.type === 'LOGOUT') router.push('/login'); }
  ```
- KHÔNG cần `window.addEventListener('storage')` nữa.

Dev environment:
- Cookie `Secure` flag = false khi `NODE_ENV=development` (tự động bởi backend logic)
- CORS phải có `credentials: true` (xem FIX M-07)
```

---

### FIX C-05 · workspaceId Context vào §FR-02

**Vị trí chèn:** Đầu section `FR-02: Workspace & Members`, trước bullet `POST /api/workspaces`.

**Nội dung thêm:**

```markdown
**MVP Workspace Context Rule:**
Vì "Multiple workspaces cho 1 tài khoản" là Out of Scope (PRD §5.2), mỗi user chỉ thuộc đúng 1 workspace trong MVP.

- `POST /api/auth/login` response trả về (ngoài việc set cookie):
  ```json
  {
    "success": true,
    "data": {
      "user": { "id", "name", "email" },
      "workspaceId": "<uuid>",
      "workspaceRole": "ADMIN" | "MANAGER" | "MEMBER"
    }
  }
  ```
- Frontend lưu `{ user, workspaceId, workspaceRole }` vào `authStore` (Zustand in-memory, không persist).
- `GET /api/auth/me` cũng trả về cấu trúc tương tự để re-hydrate store khi reload trang.
- `authStore` Zustand shape:
  ```typescript
  interface AuthState {
    user: { id: string; name: string; email: string } | null;
    workspaceId: string | null;
    workspaceRole: 'ADMIN' | 'MANAGER' | 'MEMBER' | null;
    setAuth: (data: AuthData) => void;
    logout: () => void;
  }
  ```
- Axios interceptor tự động gắn header từ store (xem FIX H-09):
  `x-workspace-id: authStore.getState().workspaceId`

Backend workspace middleware (`workspace.middleware.ts`):
- Trích `x-workspace-id` từ HTTP header.
- Query `WorkspaceMember` table: `WHERE workspace_id = :headerWorkspaceId AND user_id = :jwtUserId`
- Nếu không tìm thấy → 403.
- Attach `req.workspaceId` và `req.workspaceRole` vào request object cho controller dùng.
```

---

### FIX C-06 + H-03 + H-08 · Sửa Prisma Schema trong §2

**Ba lỗi trong schema cần sửa:**

**Lỗi 1 (C-06a) — `Workspace` thiếu `created_by`:**  
Thêm field vào `Workspace` model:
```prisma
// Thêm vào model Workspace, sau field "name":
created_by  String   // ID của user đã tạo workspace
```

**Lỗi 2 (C-06b + H-08) — `User` model thiếu backreferences:**  
Thêm vào cuối `User` model (trước dấu `}`):
```prisma
invite_tokens_sent InviteToken[] @relation("InvitedBy")
```

**Lỗi 3 (C-06c + H-03) — `Comment` model thiếu backreference về `Notification`:**  
Thêm vào cuối `Comment` model (trước dấu `}`):
```prisma
notifications Notification[]
```

**Lỗi 4 (C-06c cont.) — `Task` model thiếu backreference về `Notification`:**  
Thêm vào cuối `Task` model (trước dấu `}`):
```prisma
notifications Notification[]
```

**Sửa relation trong `Notification` model** — Phần relation phải có `@relation` explicit:
```prisma
// Thay thế phần relation của Notification (dòng 241 hiện tại):
user      User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
task      Task?     @relation(fields: [task_id], references: [id], onDelete: SetNull)
comment   Comment?  @relation(fields: [comment_id], references: [id], onDelete: SetNull)
```

**Sửa relation trong `InviteToken` model** — Phần relation:
```prisma
// Thay thế phần relation của InviteToken (dòng 254 hiện tại):
workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
inviter   User      @relation("InvitedBy", fields: [invited_by], references: [id], onDelete: Cascade)
```

---

### FIX H-01 · Thêm `username` field vào User model + spec mention

**Vị trí 1 — Schema `User` model:** Thêm field `username` sau field `name`:
```prisma
username  String    @unique  // Lowercase, no spaces, VD: "minh.tan". Max 30 chars.
```

**Vị trí 2 — §FR-06 Comments:** Thêm đoạn sau "Regex regex `/@(\w+)/g`":
```markdown
**Mention Resolution Rule:**
- `\w+` match với field `user.username` (không phải `user.name`).
- `username` phải unique, lowercase, không chứa space (VD: user name "Nguyễn Minh Tân" → username "minh.tan").
- `POST /api/auth/register` body thêm field `username: min(3), max(30), regex /^[a-z0-9_.]+$/`
- Khi parse comment xong, backend query: `SELECT id FROM users WHERE username = :mentionedUsername`
  → Nếu tìm thấy → tạo notification `TASK_MENTIONED`. Nếu không → bỏ qua (silent fail).
- Frontend CommentInput hiển thị `@username` dạng highlight text (không cần autocomplete cho MVP).
```

---

### FIX H-02 · Cron Job spec cho TASK_DUE_SOON vào §FR-09

**Vị trí chèn:** Sau đoạn "Background Sync hoặc Endpoint trigger `TASK_DUE_SOON`", thay thế câu đó bằng:

```markdown
**TASK_DUE_SOON Scheduler:**
- Package: `node-cron` (cài: `npm install node-cron @types/node-cron`)
- File: `/backend/src/modules/notifications/notification.cron.ts`
- Schedule: `'0 * * * *'` (chạy đầu mỗi giờ)
- Logic:
  ```typescript
  cron.schedule('0 * * * *', async () => {
    const tasks = await prisma.task.findMany({
      where: {
        due_date: {
          gte: new Date(),
          lte: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        status: { not: 'DONE' },
        assignee_id: { not: null },
        deleted_at: null,
      },
    });
    for (const task of tasks) {
      await prisma.notification.upsert({
        where: { task_id_type_date: {  // unique constraint
          task_id: task.id,
          type: 'TASK_DUE_SOON',
          // date field sẽ cần custom logic ngoài Prisma
        }},
        // ...create nếu chưa có
      });
    }
  });
  ```
- Deduplicate: Thêm vào `Notification` model unique constraint:
  ```prisma
  @@unique([task_id, type, createdDate])  // createdDate = DATE(created_at)
  ```
  Thực tế implement: Trước khi `create` notification, kiểm tra:
  `WHERE task_id = :id AND type = 'TASK_DUE_SOON' AND created_at >= DATE_TRUNC('day', NOW())`
  Nếu đã có → skip.
- Khởi động cron trong `server.ts`: `import './modules/notifications/notification.cron'`
```

---

### FIX H-09 · Axios Client Config vào §1.3

**Vị trí chèn:** Sau block `# Frontend .env.local`, thêm section mới:

```markdown
### 1.3.1 Frontend API Client (`/frontend/src/lib/axios.ts`)

```typescript
import axios from 'axios';
import { authStore } from '@/features/auth/stores/authStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // http://localhost:4000/api
  withCredentials: true,  // BẮT BUỘC để gửi httpOnly cookie theo mọi request
});

// Request interceptor: Tự động gắn x-workspace-id
api.interceptors.request.use((config) => {
  const workspaceId = authStore.getState().workspaceId;
  if (workspaceId) {
    config.headers['x-workspace-id'] = workspaceId;
  }
  return config;
});

// Response interceptor: Xử lý 401 → logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.getState().logout();
      // BroadcastChannel để các tab khác cũng logout
      new BroadcastChannel('auth').postMessage({ type: 'LOGOUT' });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Lưu ý:** Không import `router` từ Next.js ở đây (ngoài React component tree). Dùng `window.location.href` cho redirect toàn trang sau logout.
```

---

### FIX M-01 · Pagination cho My Tasks vào §FR-07

**Vị trí chèn:** Sau bullet "Filter: All (Chỉ show TO_DO, IN_PROGRESS, IN_REVIEW. Bỏ DONE)."

**Nội dung thêm:**

```markdown
**Pagination:**
- Dùng Offset/Limit. Mặc định: `limit=20, offset=0`.
- API: `GET /api/tasks/my-tasks?limit=20&offset=0`
- Frontend dùng `useInfiniteQuery` + `IntersectionObserver` (Infinite Scroll — cùng cơ chế với Kanban) để load thêm khi cuộn.
- Không hiển thị số trang (seamless infinite scroll).
```

---

### FIX M-03 · Thêm `GET /api/projects` vào §FR-03

**Vị trí chèn:** Ngay sau dòng `POST /api/projects: { name (max 100), description (max 500), color }`.

**Nội dung thêm:**

```markdown
- **GET /api/projects**: List tất cả project của workspace hiện tại. Filter mặc định `deleted_at IS NULL`.
  Response: `{ success: true, data: [{ id, name, color, archived_at, totalTasks, doneTasks }] }`
  Dùng trong: Select Project dropdown (form tạo task), Sidebar project list, trang /app/projects.
```

---

### FIX M-06 · Sửa comment schema Task `description`

**Vị trí:** Trong `model Task`, field `description`.

**Thay:**
```prisma
description String?      // Max 5000 chars, lưu Plain text
```
**Thành:**
```prisma
description String?      // Max 5000 chars, lưu raw Markdown (sanitized bởi sanitize-html trước khi save)
```

---

### FIX M-07 · Thêm CORS config vào §1.2

**Vị trí chèn:** Sau rule số 5 trong `§1.2 Security Rules`.

**Nội dung thêm:**

```markdown
6. **CORS Config** (BẮT BUỘC khi dùng httpOnly cookie):
   ```typescript
   // server.ts
   import cors from 'cors';
   app.use(cors({
     origin: process.env.FRONTEND_URL, // http://localhost:3000 (dev) / Vercel URL (prod)
     credentials: true,  // BẮT BUỘC để cookie hoạt động cross-origin
   }));
   ```
   Package: `npm install cors @types/cors`
   Thêm vào Backend `.env`: `FRONTEND_URL=http://localhost:3000`
```

---

## PHASE 2 — Sửa `AGENTS.md` (2 issues)

### FIX C-03 (AGENTS.md phần) · Thêm Charts vào Tech Stack

**Vị trí:** Section `### Frontend`, sau dòng `- Form: React Hook Form + Zod validation`.

**Nội dung thêm (2 dòng):**
```
- Charts: recharts v2.x (Bar chart cho Reports)
- HTTP Client: axios (configured với withCredentials: true)
```

### FIX C-04 (AGENTS.md phần) · Ghi rõ Token Strategy

**Vị trí:** Section `### Backend`, sau dòng `- Authentication: JWT (7 ngày expiry) + bcrypt (cost factor ≥ 12)`.

**Nội dung thêm (1 dòng):**
```
- Cookie: cookie-parser (httpOnly cookie cho JWT — KHÔNG dùng localStorage)
```

---

## PHASE 3 — Sửa `ui-wireframes.md` (6 issues)

### FIX H-04 · Thêm wireframe Settings Pages

**Vị trí chèn:** Sau section `2.4. Màn hình Reports`, thêm section mới `2.5`.

**Nội dung thêm:**

````markdown
### 2.5. Màn hình Settings (`/app/settings` — Admin only)

#### 2.5.1 General Settings (`/app/settings`)
```text
[PageRoot: flex flex-col gap-6 max-w-2xl]
 ├── [PageHeader]
 │    └── [Title: h1 text-2xl font-bold] → "Cài đặt Workspace"
 │
 └── [SettingsCard: p-6 bg-white border border-slate-200 rounded-xl shadow-sm]
      ├── [SectionTitle: h2 text-lg font-semibold mb-4] → "Thông tin Workspace"
      ├── [Form (React Hook Form)]
      │    ├── [InputGroup: Label "Tên workspace" + Input text (max 100)]
      │    └── [FooterButtons: flex justify-end]
      │         └── [Button Primary "Lưu thay đổi"]
      └── [DangerZone: mt-8 p-4 border border-red-200 rounded-lg bg-red-50]
           ├── [Title: text-sm font-semibold text-red-700] → "Vùng nguy hiểm"
           └── [Button Destructive "Xóa Workspace"] → AlertDialog confirm
```

#### 2.5.2 Member Management (`/app/settings/members`)
```text
[PageRoot: flex flex-col gap-6]
 ├── [PageHeader: flex justify-between items-center]
 │    ├── [Title: h1 text-2xl font-bold] → "Quản lý thành viên"
 │    └── [Button Primary "Mời thành viên"] → Mở InviteMemberModal
 │
 ├── [PendingInvites: p-4 bg-amber-50 border border-amber-200 rounded-lg] (Chỉ hiện nếu có pending)
 │    └── [InviteRow] → Email | "Đang chờ" badge | Nút "Hủy mời"
 │
 └── [MembersTable: bg-white border border-slate-200 rounded-xl overflow-hidden]
      ├── [Thead: bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase]
      │    └── Cột: Thành viên | Email | Vai trò | Thao tác
      └── [Tbody]
           └── [Tr (hover:bg-slate-50)]
                ├── [AvatarCell: flex items-center gap-3]
                │    ├── [Avatar: w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-medium]
                │    └── [Name: text-sm font-medium text-slate-900]
                ├── [EmailCell: text-sm text-slate-500]
                ├── [RoleCell: RoleBadge component]
                │    → ADMIN: bg-purple-100 text-purple-700
                │    → MANAGER: bg-blue-100 text-blue-700
                │    → MEMBER: bg-slate-100 text-slate-700
                └── [ActionsCell: flex gap-2]
                     ├── [Select Role (Admin only)] → Dropdown ADMIN/MANAGER/MEMBER
                     └── [Button Destructive size-sm "Xóa"] → AlertDialog confirm (Ẩn nếu là chính mình)

[InviteMemberModal: Dialog]
 └── [Form]
      ├── [Input Email: required]
      ├── [Select Role: default MEMBER]
      └── [FooterButtons] → Cancel + "Gửi lời mời"
```
````

---

### FIX H-05 · Thêm wireframe Projects Pages

**Vị trí chèn:** Sau section `2.5 Settings`, thêm section `2.6`.

**Nội dung thêm:**

````markdown
### 2.6. Màn hình Projects (`/app/projects`)

#### 2.6.1 Danh sách Projects (`/app/projects`)
```text
[PageRoot: flex flex-col gap-6]
 ├── [PageHeader: flex justify-between items-center]
 │    ├── [Title: h1 text-2xl font-bold] → "Dự án"
 │    └── [Button Primary "+ Dự án mới"] → Mở ProjectCreateModal (Manager/Admin only)
 │
 └── [ProjectGrid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4]
      ├── *(Nếu trống)* → [EmptyState] → "Chưa có dự án nào. Hãy tạo dự án đầu tiên."
      └── *(Data map)* → [ProjectCard: p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition cursor-pointer]
           ├── [CardHeader: flex items-center gap-3 mb-3]
           │    ├── [ColorDot: w-3 h-3 rounded-full] → (ProjectColor Enum)
           │    └── [ProjectName: font-semibold text-slate-900]
           ├── [Description: text-sm text-slate-500 line-clamp-2 mb-4] (nếu có)
           ├── [ProgressBar: w-full h-1.5 bg-slate-100 rounded-full]
           │    └── [ProgressFill: bg-indigo-500 rounded-full] → width = (doneTasks/totalTasks * 100)%
           ├── [Stats: flex justify-between text-xs text-slate-500 mt-2]
           │    ├── "doneTasks/totalTasks tasks"
           │    └── [ArchivedBadge: bg-slate-100 text-slate-500 px-2 rounded] (nếu archived)
           └── [Actions: flex gap-2 mt-4 pt-4 border-t border-slate-100] (Manager/Admin only)
                ├── [Button Ghost size-sm "Archive"] (nếu chưa archive)
                └── [Button Destructive size-sm "Xóa"]

[ProjectCreateModal: Dialog]
 └── [Form]
      ├── [Input Name: required, max 100]
      ├── [Textarea Description: optional, max 500]
      ├── [ColorPicker: flex gap-2 flex-wrap]
      │    └── [ColorOption: w-7 h-7 rounded-full cursor-pointer ring-2 ring-offset-2] × 8 màu
      └── [FooterButtons] → Cancel + "Tạo dự án"
```

#### 2.6.2 Chi tiết Project (`/app/projects/:id`)
```text
[PageRoot: flex flex-col gap-6]
 ├── [ProjectHeader: flex items-center gap-3 pb-4 border-b border-slate-200]
 │    ├── [ColorDot: w-4 h-4 rounded-full]
 │    ├── [Title: h1 text-2xl font-bold]
 │    └── [ArchivedBadge] (nếu archived) + [Actions dropdown: Kebab menu]
 │
 ├── [StatsBar: flex gap-6 text-sm text-slate-600]
 │    ├── "Tổng: totalTasks tasks"
 │    ├── "Hoàn thành: doneTasks tasks"
 │    └── "Completion: XX%"
 │
 ├── [FilterRow: flex gap-3] → Filter Status (All/To Do/In Progress/In Review/Done) + Search input
 │
 └── [TaskList: flex flex-col gap-3]
      └── *(Cùng component TaskListItem như My Tasks — tái sử dụng)*
```
````

---

### FIX H-06 · Thêm spec cho Select Assignee và Priority trong Form Task

**Vị trí chèn:** Trong section `3.2. Form Tạo Mới Task Modal`, bổ sung detail cho các field.

**Nội dung THAY THẾ** phần `[FormContainer]`:

```text
[FormContainer (React Hook Form): flex flex-col gap-4]
 ├── [InputGroup Title: required]
 │    └── Input text, placeholder "Tiêu đề task...", max 200 chars
 ├── [SelectGroup Project: required]
 │    └── shadcn Select, load từ GET /api/projects (chỉ projects chưa archive)
 │         Options render: [ColorDot] + ProjectName
 ├── [SelectGroup Assignee: optional]
 │    └── shadcn Select, load từ GET /api/workspaces/:id/members
 │         Options render: [Avatar (initials)] + Name
 │         Option đặc biệt đầu tiên: "Không giao cho ai"
 ├── [SelectGroup Status: default TO_DO]
 │    └── Options: To Do / In Progress / In Review / Done
 ├── [SelectGroup Priority: default MEDIUM]
 │    └── Options với màu: Low (slate) / Medium (blue) / High (orange) / Urgent (red + icon ⚡)
 ├── [DatePickerGroup Due Date: optional]
 │    └── shadcn Popover + Calendar component
 ├── [TextareaGroup Description: optional, max 5000]
 │    └── Textarea, placeholder "Mô tả task (hỗ trợ Markdown)..."
 └── [FooterButtons: flex justify-end gap-2]
      └── [Button Ghost "Hủy"] + [Button Primary "Tạo task"]
```

---

### FIX H-07 · Thêm Filter UI spec cho Kanban Board

**Vị trí chèn:** Trong section `2.3 Kanban Board`, thay `[PageHeader: h1 Title + Filters(...)]` bằng spec chi tiết:

```text
[PageHeader: flex flex-col gap-3 pb-4]
 ├── [TopRow: flex justify-between items-center]
 │    └── [Title: h1 text-2xl font-bold] → "Team Kanban"
 └── [FilterRow: flex flex-wrap gap-3 items-center]
      ├── [FilterAssignee: shadcn Select, single-select]
      │    → Load từ GET /api/workspaces/:id/members
      │    → Option đầu "Tất cả thành viên"
      │    → Options: Avatar initials + Name
      ├── [FilterProject: shadcn Select, single-select]
      │    → Load từ GET /api/projects
      │    → Option đầu "Tất cả dự án"
      │    → Options: ColorDot + ProjectName
      ├── [FilterPriority: shadcn Select, single-select]
      │    → Options: Tất cả / Low / Medium / High / Urgent
      ├── [FilterDueDate: shadcn Select với presets]
      │    → Options: Tất cả / Hôm nay / Tuần này / Quá hạn
      │    → Preset map thành date range trên backend query param
      └── [ButtonResetFilters: Button Ghost size-sm "Xóa bộ lọc"]
           → Chỉ hiện khi có ít nhất 1 filter đang active
```

---

### FIX M-02 · Thêm Toast Messages chuẩn (trong ui-wireframes.md)

**Vị trí chèn:** Cuối file `ui-wireframes.md`, sau section 4, thêm section mới `5`.

**Nội dung thêm:**

```markdown
## 5. Chuẩn Hóa Toast Notifications (UX Copy)

Tất cả toast dùng `useToast()` của shadcn. Auto-dismiss sau 4 giây. Bảng text chuẩn:

| Trigger Action | Toast Variant | Nội dung |
|---|---|---|
| Tạo task thành công | `default` (success) | "✓ Task đã được tạo thành công" |
| Cập nhật task | `default` | "✓ Đã lưu thay đổi" |
| Xóa task (soft delete) | `default` | "Task đã được xóa" |
| Đổi status thành công | `default` | "✓ Đã chuyển sang [Tên Status]" |
| Tạo project thành công | `default` | "✓ Dự án đã được tạo" |
| Archive project | `default` | "✓ Dự án đã được lưu trữ" |
| Gửi mời thành viên | `default` | "✓ Đã gửi lời mời tới [email]" |
| Đổi role thành viên | `default` | "✓ Đã cập nhật vai trò" |
| Lỗi 403 Forbidden | `destructive` | "✗ Bạn không có quyền thực hiện hành động này" |
| Lỗi 409 Conflict | `destructive` | "✗ [Message lỗi từ API]" |
| Lỗi 500 / Network | `destructive` | "✗ Có lỗi xảy ra. Vui lòng thử lại sau" |
| Optimistic rollback | `destructive` | "✗ Không thể lưu thay đổi. Đã hoàn tác" |
| Login thất bại | `destructive` | "✗ Email hoặc mật khẩu không đúng" |
| Account bị khóa | `destructive` | "✗ Tài khoản bị khóa tạm. Thử lại sau {X} phút" |
| Mời: email đã tồn tại | `destructive` | "✗ Email này đã là thành viên của workspace" |

**Quy tắc:**
- Variant `default` → shadcn default (text tối, nền trắng với border). Thêm class `border-emerald-200 bg-emerald-50 text-emerald-800` cho success actions.
- Variant `destructive` → shadcn destructive (nền đỏ).
- Không tự phát minh text mới. Nếu action chưa có trong bảng trên → dùng template "✓ [Tên hành động] thành công" hoặc "✗ [Tên hành động] thất bại".
```

---

### FIX M-05 · Thêm Logout Button vào wireframe App Shell

**Vị trí chèn:** Trong section `1. Global App Shell`, thay `[UserBlock (Bottom)]` bằng:

```text
└── [UserBlock (Bottom): p-4 border-t border-slate-200]
     └── [DropdownMenu trigger = Avatar + Name]
          ├── [DropdownMenuItem] → "Hồ sơ" (placeholder cho V2)
          └── [DropdownMenuItem class="text-red-600"] → "Đăng xuất"
               → Gọi POST /api/auth/logout → clear cookie → BroadcastChannel logout → redirect /login
```

---

## PHASE 4 — Sửa `design-system.md` (1 issue)

### FIX M-02 (design-system.md phần) · Thêm Toast spec reference

**Vị trí chèn:** Cuối section `3.4. Trạng Thái Phản Hồi`, sau dòng về `useToast()`.

**Nội dung thêm:**
```markdown
**Toast Copy chuẩn:** Xem bảng text đầy đủ tại `ui-wireframes.md §5`. Không tự phát minh nội dung toast ngoài bảng đó.
```

---

## FIX M-04 · Thêm Error Boundary & 404 spec vào requirements.md NFR-05

**Vị trí chèn:** Cuối section `§6. Layout Structure & UI Architecture`, trước `---`.

**Nội dung thêm:**

```markdown
### Error UI Standards (NFR-05)

**`/frontend/src/app/error.tsx` (Next.js Error Boundary):**
```tsx
// Hiển thị khi runtime error xảy ra trong page
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600">
      <p className="text-lg font-semibold">Có lỗi xảy ra</p>
      <p className="text-sm text-slate-400">{error.message}</p>
      <Button onClick={reset} variant="outline">Thử lại</Button>
    </div>
  );
}
```

**`/frontend/src/app/not-found.tsx`:**
```tsx
export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600">
      <p className="text-4xl font-bold text-slate-300">404</p>
      <p className="text-lg font-semibold">Trang không tồn tại</p>
      <Link href="/app/my-tasks"><Button variant="outline">Về trang chính</Button></Link>
    </div>
  );
}
```

**403 / Unauthorized State:** Dùng component tái sử dụng `<AccessDenied />`:
```tsx
// Render này khi API trả về 403 hoặc user không đủ quyền vào trang
<div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
  <LockIcon className="w-12 h-12 text-slate-300" />
  <p className="font-semibold">Không có quyền truy cập</p>
  <p className="text-sm">Liên hệ Admin của workspace để được cấp quyền.</p>
</div>
```
```

---

## Tóm tắt thay đổi theo file

| File | Thay đổi | Issues resolved |
|---|---|---|
| `requirements.md` | Thêm §1.6 Folder Tree, sửa §FR-01 (Cookie strategy + Route Guard), sửa §1.2 CORS, sửa §1.3 axios, sửa §FR-02 workspaceId, sửa §2 Prisma schema (4 fixes), sửa §FR-06 username, sửa §FR-09 cron, sửa §FR-11 recharts, thêm GET /api/projects, sửa comment schema, thêm §6 Error spec, sửa §FR-07 pagination | C-01, C-02, C-04, C-05, C-06, H-01, H-02, H-03, H-08, H-09, M-01, M-03, M-04, M-06, M-07 |
| `AGENTS.md` | Thêm 3 dòng vào Tech Stack | C-03, C-04 |
| `ui-wireframes.md` | Thêm §2.5 Settings, §2.6 Projects, sửa §2.3 Filter, sửa §3.2 Form, update AppShell UserBlock, thêm §5 Toast table | H-04, H-05, H-06, H-07, M-02, M-05 |
| `design-system.md` | Thêm 1 dòng reference Toast table | M-02 |

**Tổng: 22/22 issues được address.**

---

> ✅ **Sau khi bạn approve plan này, tôi sẽ thực thi chỉnh sửa theo thứ tự Phase 1 → 2 → 3 → 4.**
