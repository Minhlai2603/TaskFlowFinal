# TaskFlow MVP - Master System Requirements Specification (requirements.md)

Tài liệu này là bản thiết kế chi tiết (Blueprint) duy nhất và đầy đủ nhất dành cho Agent để thực thi dự án TaskFlow MVP. Nó ánh xạ 1-1 từ PRD, các quy tắc Technical Constraints trong `AGENTS.md`, xử lý triệt để các User Stories, Edge Cases và Open Questions. 

BẤT CỨ AI / AGENT NÀO CODE DỰ ÁN NÀY ĐỀU PHẢI TUÂN THỦ NGHIÊM NGẶT TÀI LIỆU NÀY.

---

## 1. Global Architecture & Rules Context

### 1.1 Tech Stack
- **Frontend**: Next.js 16 (App Router) + TypeScript, UI Components bằng shadcn/ui + Tailwind CSS. Component naming theo PascalCase.
- **State Management**: Zustand (chỉ dùng cho client state tĩnh/ui/auth) + TanStack Query (dành cho server state, data fetching, optimistic UI). 
- **Utilities**: Drag & Drop dùng `@dnd-kit/core`, Form dùng React Hook Form kết hợp Zod validation.
- **Backend**: Node.js + Express, ORM Prisma, Database PostgreSQL ≥ 14. API routes naming theo kebab-case (VD: `/api/tasks/update-status`). Mọi API call đều phải có error handling.
- **Auth & Security**: JWT (7 ngày expiry, stateless), bcrypt (cost factor ≥ 12), Email gửi đa chế độ qua Resend (Production) hoặc Nodemailer (Demo). Soft delete cho tasks/projects (dùng cột `deleted_at`).
- **DevOps**: Deployment trên Railway (Backend+DB) và Vercel (Frontend). CI/CD qua GitHub Actions, Monitoring bằng Sentry.

### 1.2 Security Rules (BẤT DI BẤT DỊCH)
1. **KHÔNG** hardcode secrets. Toàn bộ dùng env variables.
2. Cấp tốc input sanitization mọi user input (bằng `sanitize-html` trên BE) kết hợp Prisma parameterized query để ngăn chặn XSS và SQL injection.
3. Rate Limiting: Giới hạn 100 requests/phút cho 1 IP (qua express-rate-limit).
4. Row-level Isolation: **MỌI query** đều phải có điều kiện `WHERE workspace_id = :workspaceId` ngoại trừ các Auth APIs. Workspace A tuyệt đối không lộ data cho Workspace B.
5. Password Hash không bao giờ được trả về dưới dạng kết quả API response. Cần exclude `password_hash` triệt để.
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

### 1.3 Environment Variables (Backend & Frontend)
```bash
# Backend .env
DATABASE_URL=postgresql://...
JWT_SECRET=<random-256-bit>
JWT_EXPIRY=7d
BCRYPT_COST=12
RESEND_API_KEY=re_xxxxxxxx
EMAIL_PROVIDER=resend # Chấp nhận: 'resend' | 'nodemailer'
# Nodemailer / SMTP Config (chỉ cần khi EMAIL_PROVIDER=nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="minh43937@gmail.com"
SMTP_PASS=""
SMTP_SECURE="true"
CLOUDINARY_URL=cloudinary://...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
PORT=4000
NODE_ENV=development

# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 1.3.2 Required Dependencies (BẮT BUỘC npm install trước khi code)

**Backend (`/backend`):**
```bash
npm install express cors cookie-parser bcryptjs jsonwebtoken prisma @prisma/client \
  express-rate-limit sanitize-html multer cloudinary node-cron resend nodemailer \
  zod uuid
npm install -D typescript ts-node-dev @types/express @types/cors @types/cookie-parser \
  @types/bcryptjs @types/jsonwebtoken @types/sanitize-html @types/multer \
  @types/nodemailer @types/uuid jest @types/jest supertest @types/supertest ts-jest
```

**Frontend (`/frontend`):**
```bash
npm install next@16.2.x react react-dom typescript
npm install @tanstack/react-query zustand axios sonner
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-hook-form @hookform/resolvers zod
npm install react-markdown remark-gfm recharts date-fns
npm install tailwindcss shadcn-ui
```

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
    const publicRoutes = ['/login', '/register', '/invite'];
    const currentPath = window.location.pathname;
    const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
    if (error.response?.status === 401 && !isPublicRoute) {
      authStore.getState().logout();
      // Dùng storage event để cross-tab logout (tương thích mọi trình duyệt)
      localStorage.setItem('logout-event', Date.now().toString());
      localStorage.removeItem('logout-event');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 1.3.3 TanStack Query Client Config (`/frontend/src/lib/queryClient.ts`)
```typescript
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1 phút — data fresh
      gcTime: 5 * 60 * 1000,      // 5 phút — giữ cache sau khi unmount
      retry: 1,                   // 1 lần retry tự động
      refetchOnWindowFocus: false, // Không refetch khi focus lại tab
    },
  },
});
// staleTime cho /auth/me: 5*60*1000 (5 phút), KHÔNG dùng Infinity
```

### 1.4 Resolved Stance cho MVP (Từ Open Questions của PRD)
- Nhắc lại: Task chỉ assign cho **1 người duy nhất**.
- Notifications: **Chỉ in-app**. Không gửi email notification cho MVP, trừ phần gửi email Mời vào workspace.
- Comments: **Không edit/delete** trong MVP. (Immutable string plain text).
- Trạng thái bắt buộc của Task giữ nguyên 4 level: `TO_DO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`.
- Reports page: **Chỉ Admin và Manager** được xem. Member không được xem Reports. (Member access trả về 403 / redirect My Tasks).
- Sub-tasks: Không có ở MVP.
- **Refresh Token Strategy:** Single JWT 7 ngày. Khi hết 7 ngày, API trả 401, FE intercept và đẩy ra ngoài form Login.

---

## 1.5 System Architecture & Data Flow

- **Cấu trúc Source Code (Feature-based)**: Phác thảo sơ đồ thư mục chia rẽ rạch ròi: thư mục `src/app/` chỉ dùng để define Page & Route (Server Components theo mặc định của Next.js 16), trong khi đó mọi business logic, UI Component sẽ được tổ chức theo tính năng tại `src/features/` (VD: `features/tasks/`, `features/kanban/`, `features/auth/`). Đối với Backend, BẮT BUỘC tổ chức thư mục Node.js/Express theo chuẩn Feature-based (VD: `[backend]/src/modules/tasks/` chứa tự trọn vẹn controller, route, service cho từng thực thể).
- **Routing Map**: Định hướng URL Map (`/app/my-tasks`, `/login`) thông qua Route Groups của Next.js v13+ `(auth)/` và `(dashboard)/app/`.
- **Client/Server Component Rules**: Nhắc lại chặt chẽ nguyên tắc "Server Components by default, 'use client' chỉ khi cần interactivity" theo chuẩn AGENTS.md.
- **Data Flow Fetching**: Khởi tạo UI Shell bằng Server Components (Next.js). TanStack Query (`staleTime`, `gcTime`) làm nhận diện tại Client Components, sử dụng các hook useQuery/useMutation để hydrate UI. Background poll khi cần.
- **Zustand Boundary**: KHÔNG fetch API. Chỉ chứa `uiStore` (sidebar, modal states) và `authStore` (giữ session ID, role, current User object).

  ```typescript
  // authStore interface (/frontend/src/features/auth/stores/authStore.ts)
  interface AuthState {
    user: { id: string; name: string; email: string } | null;
    workspaceId: string | null;
    workspaceRole: 'ADMIN' | 'MANAGER' | 'MEMBER' | null;
    setAuth: (user: AuthState['user'], workspaceId: string, workspaceRole: AuthState['workspaceRole']) => void;
    logout: () => void;
  }

  // uiStore interface (/frontend/src/features/ui/stores/uiStore.ts)
  interface UIState {
    sidebarOpen: boolean;
    createTaskModalOpen: boolean;
    taskSlideOverId: string | null; // null = đóng
    toggleSidebar: () => void;
    openCreateTask: () => void;
    closeCreateTask: () => void;
    openTaskSlideOver: (taskId: string) => void;
    closeTaskSlideOver: () => void;
  }
  ```
- **TanStack Boundary**: Xử lý toàn bộ data lists, loading states (Tasks, Projects...). Sử dụng Optimistic UI.
- **Component Architecture**: Tổ chức linh hoạt theo pattern Smart/Dumb. Page Server fetch init data -> chuyển qua Smart hook `useMutation` -> Pass xuống thành props cho các Dumb Component render UI đơn thuần.

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
    upload.service.ts     ← Cloudinary validation + upload logic
    upload.routes.ts
/middleware
  auth.middleware.ts      ← Verify JWT từ httpOnly cookie
  workspace.middleware.ts ← Parse x-workspace-id, verify membership
  ratelimit.middleware.ts ← express-rate-limit config
  errorHandler.middleware.ts ← Global error handler
/utils
  sanitize.ts             ← sanitize-html wrapper
  softDelete.ts           ← Helper: dùng manual WHERE deleted_at IS NULL trong MỌI service query
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
        /page.tsx          ← Settings page chứa 3 Tabs: Profile / General (Admin) / Members (Admin)
                           ← KHÔNG tạo /members/page.tsx riêng — Members là Tab trong cùng page
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

---

## 2. Deep Database Schema (Prisma)

Data model phải có đầy đủ relations và cascade options. Soft delete thông qua cột `deleted_at`. `workspace_id` phủ xuyên suốt.

```prisma
// schema.prisma (Pseudo-spec)
model User {
  id              String    @id @default(uuid()) // UUID v4
  email           String    @unique
  name            String
  password_hash   String
  failed_attempts Int       @default(0)
  locked_until    DateTime?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  
  workspace_members WorkspaceMember[]
  tasks             Task[] @relation("TaskAssignee")
  created_tasks     Task[] @relation("TaskCreator")
  comments          Comment[]
  activity_logs     ActivityLog[]
  notifications     Notification[]
  invite_tokens_sent InviteToken[] @relation("InvitedBy")
}

enum Role {
  ADMIN
  MANAGER
  MEMBER
}

model Workspace {
  id         String   @id @default(uuid())
  name       String
  created_by String   // ID của user đã tạo workspace
  created_at DateTime @default(now())
  
  members       WorkspaceMember[]
  projects      Project[]
  tasks         Task[]
  notifications Notification[]
  invite_tokens InviteToken[]
}

model WorkspaceMember {
  id           String    @id @default(uuid())
  workspace_id String
  user_id      String
  role         Role      @default(MEMBER)
  
  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@unique([workspace_id, user_id])
}

enum ProjectColor {
  RED
  ORANGE
  YELLOW
  GREEN
  BLUE
  PURPLE
  PINK
  GRAY
}

model Project {
  id           String       @id @default(uuid())
  workspace_id String
  name         String       // Max 100 char
  description  String?      // Max 500 char
  color        ProjectColor @default(BLUE)
  archived_at  DateTime?
  created_at   DateTime     @default(now())
  deleted_at   DateTime?
  
  tasks Task[]
  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
}

enum TaskStatus {
  TO_DO
  IN_PROGRESS
  IN_REVIEW
  DONE
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

model Task {
  id          String       @id @default(uuid())
  workspace_id String
  project_id  String
  title       String       // Max 200 chars
  description String?      // Max 5000 chars, lưu raw Markdown (sanitized)
  status      TaskStatus   @default(TO_DO)
  priority    TaskPriority @default(MEDIUM)
  due_date    DateTime?
  assignee_id String?
  created_by  String
  created_at  DateTime     @default(now())
  updated_at  DateTime     @updatedAt
  deleted_at  DateTime?
  
  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  project   Project   @relation(fields: [project_id], references: [id], onDelete: Cascade)
  assignee  User?     @relation("TaskAssignee", fields: [assignee_id], references: [id], onDelete: SetNull)
  creator   User      @relation("TaskCreator", fields: [created_by], references: [id])
  
  comments      Comment[]
  activity_logs ActivityLog[]
  notifications Notification[]
}

model Comment {
  id         String   @id @default(uuid())
  task_id    String
  user_id    String
  content    String   // Max 5000 chars, plain text sanitized
  created_at DateTime @default(now())
  
  task Task @relation(fields: [task_id], references: [id], onDelete: Cascade)
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  notifications Notification[]
}

enum ActionType {
  CREATED
  UPDATED
  STATUS_CHANGED
  COMMENTED
  DELETED
}

model ActivityLog {
  id            String     @id @default(uuid())
  task_id       String
  user_id       String
  action_type   ActionType
  field_changed String?
  old_value     String?
  new_value     String?
  created_at    DateTime   @default(now())
  
  task Task @relation(fields: [task_id], references: [id], onDelete: Cascade)
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_COMMENTED
  TASK_MENTIONED
  TASK_DUE_SOON
  INVITE_ACCEPTED
  REASSIGN_NEEDED
}

model Notification {
  id           String           @id @default(uuid())
  workspace_id String
  user_id      String           // Recipient
  type         NotificationType
  task_id      String?
  comment_id   String?
  message      String
  read_at      DateTime?
  created_at   DateTime         @default(now())
  
  user      User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  task      Task?     @relation(fields: [task_id], references: [id], onDelete: SetNull)
  comment   Comment?  @relation(fields: [comment_id], references: [id], onDelete: SetNull)
}

model InviteToken {
  id           String    @id @default(uuid())
  workspace_id String
  email        String
  token        String    @unique @default(uuid())
  role         Role      @default(MEMBER)
  expires_at   DateTime
  accepted_at  DateTime?
  invited_by   String
  
  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  inviter   User      @relation("InvitedBy", fields: [invited_by], references: [id], onDelete: Cascade)
}
```
```

---

## 3. 1-to-1 Mapping: Specification theo Feature (API Contracts)

### FR-01: Authentication & Session
- **POST /api/auth/register**
  - Schema: `{ name: min(2), email: string.email, password: min(8) }`
  - Logic: Hash bcrypt cost 12. Tạo User. Tạo sẵn Workspace tên `"Workspace của {user.name}"`. Gắn tự động làm ADMIN cho Workspace này. KHÔNG tạo Project mặc định. Email đã tồn tại (register) → lỗi "Email này đã được đăng ký. Bạn có muốn đăng nhập không?"
  - Trả về: `{ success: true, data: { user: { id, name, email, workspaceId, workspaceRole } } }`
- **POST /api/auth/login**
  - Mọi trường email không tồn tại -> báo lỗi gen tương tự. 
  - Trả về: `{ success: true, data: { user: { id, name, email, workspaceId, workspaceRole } } }`
  - Khóa: Update `failed_attempts` DB mỗi lần sai mã, sai >= 5 lần `locked_until = NOW() + 15m`. Code 429 kèm Message `"Tài khoản bị khóa tạm. Vui lòng thử lại sau {countdown}."`.
- **POST /api/auth/logout**: Backend clear cookie `auth_token`. Respond `{ success: true }`.
- **GET /api/auth/me**: Lấy thông tin user. Response: `{ success: true, data: { user: { id, name, email, workspaceId, workspaceRole } } }`.
- **PATCH /api/auth/profile**: Cập nhật tên hiển thị.
  - Schema: `{ name: string.min(2).max(100) }`. Email KHÔNG được update.
  - Response: `{ success: true, data: { user: { id, name, email } } }`
  - Auth: Yêu cầu JWT hợp lệ. Không cần workspace role.

**Token Storage Strategy (CHỐT — Option B: httpOnly Cookie):**

Backend:
- `POST /api/auth/login` thành công → Backend set cookie:
  ```
  Set-Cookie: auth_token=<JWT>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800; Path=/
  ```
- `POST /api/auth/logout` → Backend clear cookie.
- Mọi API endpoint protected đọc JWT từ `req.cookies.auth_token`.

Frontend:
- KHÔNG dùng `localStorage` để lưu token.
- `axios.ts` config `withCredentials: true`.
- Cross-tab logout: Dùng `window.addEventListener('storage', handler)` — KHÔNG dùng BroadcastChannel (không tương thích Safari).
  ```typescript
  // Trong authStore hoặc AppProvider
  window.addEventListener('storage', (e) => {
    if (e.key === 'logout-event') window.location.href = '/login';
  });
  ```

**Frontend Route Guard (Next.js Middleware):**
- Route `/` (root) PHẢI redirect về `/login` nếu chưa auth, hoặc `/app/my-tasks` nếu đã auth.
- Ứng dụng BẮT ĐẦU với trang `/login` — không có landing page.
- File: `/frontend/middleware.ts`
- Logic:
  ```typescript
  export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
  ```

- **Testing Strategy**:
  - **API Test (Integration)**: `POST /api/auth/login` fail -> lock sau 5 lần, verify Cookie set.
  - **Unit Test**: Validate hash bcrypt logic. Mock prisma calls for login.
  - **E2E Testing**: Cypress/Playwright login flow.

### FR-02: Workspace & Members (+ US-04)

**MVP Workspace Context Rule:**
Vì mỗi user chỉ thuộc đúng 1 workspace trong MVP:
- `POST /api/auth/login` response trả về `workspaceId` và `workspaceRole`.
- Frontend lưu vào `authStore` (Zustand in-memory).
- Axios interceptor gắn header: `x-workspace-id: authStore.getState().workspaceId`

Backend workspace middleware:
- Trích `x-workspace-id` từ header.
- Verify membership: `WHERE workspace_id = :headerWorkspaceId AND user_id = :jwtUserId`
- Attach `req.workspaceId` và `req.workspaceRole` vào request object.

- **POST /api/workspaces**: `{ name }`. Response: `{ success: true, data: { workspace: { id, name } } }`.
- **GET /api/workspaces**: List. Response: `{ success: true, data: { workspaces: Workspace[] } }`.
- **PATCH /api/workspaces/:id**: `{ name }`. ADMIN only. Response: `{ success: true, data: { workspace: { id, name } } }`.
- **GET /api/workspaces/:id/members**: Response: `{ success: true, data: { members: [{ id, name, email, role }][] } }`.
- **PATCH /api/workspaces/:id/members/:uid**: Đổi role. User không được tự đổi. ADMIN only. Response: `{ success: true, data: { member: { id, role } } }`.
- **DELETE /api/workspaces/:id/members/:uid**: Check self-remove 403. Response: `{ success: true }`.
  - **Edge Case Admin cuối**: Nếu target là Admin duy nhất → 400 "Không thể xóa Admin cuối cùng. Hãy chỉ định Admin khác trước."
  - **Edge Case**: Khi xóa member, set `assignee_id = null` cho tất cả tasks được assign cho user đó trong workspace + tạo `REASSIGN_NEEDED` notification cho tất cả ADMIN/MANAGER trong workspace.
- **POST /api/workspaces/:id/invites**: `{ email, role }`. Gửi email qua EmailProviderFactory. Response: `{ success: true, data: { invite: { id, email, role, expires_at } } }`.
- **FE Flow Invite**: user ấn `/invite?token=xxx` -> token hỏng/quá hạn hiện màn hình "Thông báo".
- **Acceptance Criteria (US-04)**:
  - *Given* Admin vào Settings > Members nhập email hợp lệ. *When* Click "Send Invite". *Then* Hệ thống gửi email link invite có token 48h.
- **Testing Strategy**:
  - **API Test**: Test Role changes, Self-remove -> 403.
  - **Unit Test**: Test invite token payload & logic timeout 48h.
  - **E2E Testing**: Mời thành viên từ UI Admin -> verify Toast.

### FR-03: Projects
- Manager + Admin tạo được. Member chỉ GET.
- **RBAC Enforcement (BẮT BUỘC):**
  - Backend `POST /api/projects`: Middleware check `req.workspaceRole` ∈ ['ADMIN', 'MANAGER']. Nếu MEMBER → return 403 "Bạn không có quyền tạo dự án."
  - Frontend: Button "+ New Project" phải ẩn hoặc disabled + tooltip khi `workspaceRole === 'MEMBER'`
- **POST /api/projects**: `{ name (max 100), description (max 500), color }`
  - Description field hỗ trợ Markdown text (render bằng `react-markdown` + `remark-gfm` ở FE).
  - Upload ảnh trong description: FE gọi `POST /api/upload` lấy URL, chèn `![image](url)` vào markdown content.
  - UI tạo/sửa project: textarea với toolbar markdown cơ bản (Bold, Italic, Image upload button).
- **GET /api/projects**: List tất cả project của workspace hiện tại. Filter mặc định `deleted_at IS NULL`.
- **GET /api/projects/:id**: `SELECT ...`. Chứa `{ totalTasks, doneTasks }`. `deleted_at IS NULL`.
- **DELETE /api/projects/:id**: Soft delete bằng cách set `deleted_at = NOW()`. **LƯU Ý:** Back-end bắt buộc phải tự động gọi `updateMany` để đánh dấu soft delete `deleted_at = NOW()` cho toàn bộ Tasks thuộc project này. (Lưu ý cho Agent: Prisma KHÔNG hỗ trợ Native Cascade Soft Delete. Giao dịch này phải dùng `prisma.$transaction` chứa lệnh `update` Project và `updateMany` Tasks độc lập). Admin có thể restore trong 30 ngày qua `PATCH /api/projects/:id/restore` (kèm theo restore Tasks).
- **PATCH /api/projects/:id/archive**: `archived_at = NOW()`. Response: `{ success: true, data: { project: { id, archived_at } } }`. KHÔNG tạo thêm task khi `project.archived_at != null` → báo 422.
- **PATCH /api/projects/:id/unarchive**: `archived_at = null`. ADMIN/MANAGER only. Response: `{ success: true, data: { project: { id, archived_at: null } } }`.
- **PATCH /api/projects/:id/restore**: `deleted_at = null` cho Project + Tasks (Admin only, within 30 days). Response: `{ success: true }`.

**Soft Delete Implementation (BẮT BUỘC):**
- KHÔNG dùng Prisma global middleware (deprecated). PHẢI thêm `where: { deleted_at: null }` thủ công trong MỌI service function GET.
- Pattern chuẩn: `prisma.task.findMany({ where: { workspace_id, deleted_at: null } })`

- **Testing Strategy**:
  - **API Test**: Verify `GET /projects` return counts. Soft Delete project check. Test 422 archive rules on POST task.
  - **Unit Test**: Testing functions schema Prisma update `deleted_at`.
  - **E2E Testing**: Click archive project trong list -> check nút "+ New Task" bị disable hoặc ẩn.

### FR-04 -> FR-05 & Activity Log (Task CRUD)
- Member, Manager, Admin đều tạo Tasks đc nếu trong Workspace.
- **GET /api/tasks**: Lấy danh sách task. Query params:
  - `status`: `TO_DO | IN_PROGRESS | IN_REVIEW | DONE` (optional, multi-value: `?status=TO_DO&status=IN_PROGRESS`)
  - `assignee_id`: UUID (optional)
  - `project_id`: UUID (optional)
  - `priority`: `LOW | MEDIUM | HIGH | URGENT` (optional)
  - `q`: string tìm kiếm theo title ILIKE (optional, max 100 chars)
  - `page`: number, default 0 (**offset-based**: page 0 = offset 0, page 1 = offset limit*1). FE dùng `useInfiniteQuery` với `pageParam` bắt đầu từ 0.
  - `limit`: number, default 20 (My Tasks) hoặc 50 (Kanban)
  - `sort`: `due_date_asc` | `created_at_desc` (optional)
  - Bắt buộc filter: `deleted_at IS NULL AND workspace_id = :workspaceId`
  - Response: `{ success: true, data: { tasks: Task[], total: number, page: number, limit: number } }`
- **POST /api/tasks**: Title < 200, Desc < 5000 ký tự HTML Sanitize. Yêu cầu sử dụng thư viện `react-markdown` và `remark-gfm` ở Frontend để render Description Markdown hỗ trợ upload ảnh dạng `![image](url)`. Mặc định vào TO_DO. Ghi log: "Created by [Name]".
- **POST /api/upload**: Endpoint upload ảnh lên Cloudinary. Xử lý `multipart/form-data`, file < 5MB (chỉ `jpg/png/webp/gif`). Throw 413 Payload Too Large nếu lố dung lượng. Thành công trả về `{ success: true, data: { url: "..." } }`.
- **PATCH /api/tasks/:id**: Ghi nhận field gì bị change, save log entry 1 dòng. Tracked fields: `title`, `description`, `status`, `assignee_id`, `priority`, `due_date`, `project_id`. Các trường `old_value` và `new_value` lưu dạng string.
- **PATCH /api/tasks/:id/status**: Cần query `role` từ bảng `WorkspaceMember` của user trong workspace. `if(currentUser.id !== task.assigneeId && !['ADMIN','MANAGER'].includes(workspaceMember.role)) return 403`. Chuyển log.
- **DELETE /api/tasks/:id**: Soft delete `deleted_at = NOW()`. Mọi GET query global phải filter `deleted_at IS NULL`. Admin restore trong 30 ngày: `PATCH /api/tasks/:id/restore`.
- FE Optimistic Update trên queryKey của TanStack (Rollback nếu rớt).
- FE Disable Drag Drop / Select Menu nếu đang check user k đủ quyền (có tooltip giải thích).
- **Acceptance Criteria (US-01, US-02)**:
  - *US-01 Given* Manager ở trong Project, *When* điền đủ Title + Project và submit, *Then* Status default TO_DO, notification gửi cho Assignee "Bạn được assign task mới...", log ghi "Created by Manager". Nghịch lý nếu Title trống thì báo đỏ Form: "Title không được để trống", ko được lưu.
  - *US-02 Given* Member đang xem task của mình. *When* đổi Status TO_DO sang IN_PROGRESS. *Then* UI đổi ngay lập tức (optimistic UX), log ghi "[Member] changed status...". Dashboard team update rớt lại sau. Nếu Member đổi task ko phải của mình -> Check failed -> Nút bị disabled kèm tooltip "Chỉ assignee hoặc Manager mới có thể đổi trạng thái".
- **Testing Strategy**:
  - **API Test**: Test create task status default, test status transition (Owner pass, non-owner fail 403). Test activity log count increment.
  - **Unit Test**: Test middleware update sanitize inputs HTML (XSS prevention test).
  - **E2E Testing**: Simulate drag & drop task UI -> assert server request. Verify rollback if network disconnects.

### FR-06 & FR-09: Comments & Notifications
- Immutable comment, lưu db `content` (Sanitized XSS HTML). 

**Mention Resolution Rule:**
- Mention bằng `user.name`: FE hiển thị dropdown gợi ý user khi gõ `@`. Khi chọn user từ dropdown, FE chèn `@[User Name](userId)` vào comment text.
- Backend parse pattern `/@\[([^\]]+)\]\(([a-f0-9-]+)\)/g` để extract `userId` trực tiếp — không cần tìm kiếm by name.
- Hiển thị trên UI: render `@User Name` dạng `text-indigo-600 font-medium` (highlight link style).
- Nếu tìm thấy userId hợp lệ → tạo notification `TASK_MENTIONED`.

- **GET /api/tasks/:taskId/comments**: Order. ASC.
- **POST /api/tasks/:taskId/comments**: Request payload: `{ content: string.max(5000) }`. Response: `{ success: true, data: { comment: { id, content, user: {id, name}, created_at } } }`.
  - Sau khi tạo comment: tạo notification `TASK_COMMENTED` gửi cho **task.assignee_id** (nếu `task.assignee_id != null` VÀ `task.assignee_id !== commenter.id`).
  - Nếu content có mention `@[Name](userId)`: tạo thêm notification `TASK_MENTIONED` gửi cho userId đó (nếu userId ≠ commenter.id).
- **GET /api/notifications?unread=true**: Polling 5s bằng React Query.
- **PATCH /api/notifications/:id/mark-read**: Đánh dấu 1 notification đã đọc.
- **PATCH /api/notifications/mark-read-all**: Đánh dấu toàn bộ notification của user trong workspace đã đọc. **LƯU Ý route order**: `mark-read-all` phải được register TRƯỚC `:id` trong Express router để tránh bị bắt nhầm.

**TASK_DUE_SOON Scheduler:**
- Package: `node-cron`
- File: `/backend/src/modules/notifications/notification.cron.ts`
- Schedule: `'0 * * * *'` (chạy đầu mỗi giờ)
- Logic: Trước khi `create` notification, kiểm tra `task_id`, `type`, và `created_at` để tránh trùng trong ngày.
- **Testing Strategy**:
  - **API Test**: Tạo task comment có mention `@[Name](userId)` → GET notifications xem TASK_MENTIONED trigger đúng không. Mark-All-Read API call valid state.
  - **Unit Test**: Match regex parsing helper function `/@\[([^\]]+)\]\(([a-f0-9-]+)\)/g` — đúng regex pattern của mention format.
  - **E2E Testing**: Gõ `@` → dropdown users → chọn → submit → assert Notification bell tăng, dropdown render đúng message.

### FR-10: Activity Log
- **GET /api/tasks/:taskId/activity-logs**
  - Query params: `page` (default 0), `limit` (default 20).
  - Bắt buộc filter: Task phải thuộc workspace của request user (`task.workspace_id = :workspaceId`) và `task.deleted_at IS NULL`.
  - Sort: `created_at DESC` (mới nhất lên đầu).
  - Response: `{ success: true, data: { logs: ActivityLog[], total: number, page: number, limit: number } }`
  - Mỗi log entry trả về: `{ id, action_type, field_changed, old_value, new_value, user: { id, name }, created_at }`
  - RBAC: **Mọi role** (MEMBER, MANAGER, ADMIN) trong workspace đều được phép đọc activity log của task thuộc workspace mình.
  - **KHÔNG có DELETE / PATCH endpoint** — activity logs là immutable, không ai được sửa hoặc xoá.
- **Testing Strategy**:
  - **API Test**: Update task fields → verify log entry tạo đúng action_type và old/new values.
  - **Unit Test**: Hàm map `old_value`/`new_value` string → human-readable diff (VD: `"TO_DO" → "IN_PROGRESS"`).
  - **E2E Testing**: Mở Task Slide-over → Tab Activity → assert timeline render đúng thứ tự DESC.

### FR-07 & FR-08: Dashboards
- **My Tasks (Member)**: Front/Back Sort `ORDER BY (CASE WHEN due_date < NOW() THEN 0 ELSE 1 END), due_date ASC NULLS LAST`.
  - Filter: All (Chỉ show TO_DO, IN_PROGRESS, IN_REVIEW. Bỏ DONE).
  - **Pagination**: Offset/Limit 20/0. FE sử dụng Infinite Scroll.
- **Kanban (Team)**: 4 thẻ status enum. Gọi Kanban API hỗ trợ **Offset/Limit Pagination** (Limit mặc định = 50, page = 0). Frontend sử dụng Infinite Scroll với `useInfiniteQuery`.
- Global Search bằng `q=` queryParam sử dụng `ILIKE '%term%'`. 
- **Acceptance Criteria (US-03)**:
  - *Given* Member vào My Tasks. *When* load. *Then* Hiển thị task assigned, trừ DONE. Sort Overdue ưu tiên đẩy lên với màu highlight đỏ, sau đó due_date từ gần đến xa, none due date nằm cuối. 
  - *Given* Không có tasks. *When* My Tasks render. *Then* Thấy Empty State: "Bạn chưa có task nào. Hãy liên hệ Manager để được assign công việc" kèm Icon.
- **Testing Strategy**:
  - **API Test**: Kanban fetching param check sql filter works. 
  - **Unit Test**: Sort Algorithm JS Test: Overdue lên trước, due date None sau cùng.
  - **E2E Testing**: Filter board với status TO_DO -> test DOM render element length correct. Resize layout to tablet (width=700) check no-drag mode dropdown displays.

### FR-11 & FR-12: Reports & Global Search 

**Chart Library:** Sử dụng `recharts` v2.x.
- Component chart PHẢI là Client Component (`'use client'`).
- `/app/reports` Guard: Chỉ cho phép role **ADMIN** và **MANAGER** truy cập. Nếu role = **MEMBER** → redirect `/app/my-tasks` kèm Toast "Không có quyền".
- API: `GET /api/reports/weekly-completion` (`SELECT DATE_TRUNC('week', t.updated_at) as week, COUNT(t.id) FROM tasks t WHERE t.status = 'DONE' AND t.workspace_id = :workspaceId AND t.updated_at >= NOW() - INTERVAL '4 weeks' GROUP BY week ORDER BY week`)
- API: `GET /api/reports/member-stats` (`SELECT wm.user_id as assignee_id, COUNT(t.id) as assigned, SUM(CASE WHEN t.status='DONE' THEN 1 ELSE 0 END) as completed, SUM(CASE WHEN t.due_date < NOW() AND t.status != 'DONE' THEN 1 ELSE 0 END) as overdue FROM workspace_members wm LEFT JOIN tasks t ON wm.user_id = t.assignee_id AND t.workspace_id = wm.workspace_id AND t.deleted_at IS NULL WHERE wm.workspace_id = :workspaceId GROUP BY wm.user_id`). Tỉ lệ `Completion Rate = (completed / assigned * 100)` làm tròn 1 chữ số thập phân.
- Data trả vể Member | Assigned | Completed | Overdue | Percentage(%). Click user -> Link sang Tab Kanban kèm Param `/app/team?assigneeId=xxx`.
- **Global Search API (TÁCH RIÊNG)**: `GET /api/tasks/search?q=<term>&limit=10`
  - Route phải được register TRƯỚC `GET /api/tasks/:id` trong Express router.
  - Logic: `tasks.title ILIKE '%:term%'` bắt buộc gắn `WHERE deleted_at IS NULL AND workspace_id = :workspaceId`.
  - Response: `{ success: true, data: { tasks: [{id, title, status, project: {id, name, color}}][] } }` — max 10 items.
  - `workspaceId` backend tự parse từ JWT/middleware, KHÔNG lấy từ query param URL để phòng auth bypass.
  - FE: debounce 300ms trước khi gọi API.
- **Acceptance Criteria (US-05)**:
  - *Given* Manager load Reports. *When* success. *Then* thấy Bar Chart Tasks Completed trong 4 tuần. Có Table Data liệt kê Member | Assigned | Completed | Overdue | %.
  - *Given* Manager click vào tên ở Table. *When* navigate. *Then* Lọt sang Kanban Tab, filter cứng bằng member (Read-only view).
- **Testing Strategy**:
  - **API Test**: Test Role RBAC trên Reports (`Admin` 200, `Member` 403 HTTP Error). Search API limit results = 10.
  - **Unit Test**: Calculation function metrics, percentage calculation without Null divide crash.
  - **E2E Testing**: Type search keyword delay 300ms, mock api payload check debounce UI behavior not freezing. Chart rendering test loading sequence.

---

## 4. Error Code Standards

> [!WARNING]
> **Prisma 7.x Breaking Change:** `new PrismaClient()` không tham số có thể crash.
> File `backend/src/lib/prisma.ts` BẮT BUỘC khởi tạo với option:
> ```typescript
> const prisma = new PrismaClient({
>   log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
> });
> ```
> Nếu dùng adapter (pg), phải truyền đúng cú pháp. LUÔN verify `DATABASE_URL` tồn tại trước khi khởi tạo.

Backend trả định dạng Format cố định mọi errors:

**QUAN TRỌNG — Error Handler Middleware (BẮT BUỘC):**
File `backend/src/middleware/errorHandler.middleware.ts` PHẢI là middleware cuối cùng trong Express pipeline.
Nó phải:
1. Bắt mọi error throw từ controller/service
2. Nếu là ZodError → extract `error.issues[0].message`, return 400
3. Nếu là PrismaClientKnownRequestError → map sang message thân thiện (VD: unique constraint → 409), KHÔNG trả raw error
4. Nếu là custom AppError → return đúng statusCode + message
5. Mọi error khác → log chi tiết ra console (server-side), nhưng CHỈ trả `{ success: false, error: "Có lỗi xảy ra. Vui lòng thử lại." }` (500) về client
6. **TUYỆT ĐỐI KHÔNG** trả `error.stack`, `error.message` raw từ Prisma, hoặc bất kỳ internal trace nào về phía client
```json
{
  "success": false,
  "error": "Message lỗi"
}
```
Và format chuẩn cho Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Các mã HTTP tiêu biểu:
- **400**: Bad Request (VD "Title không được để trống")
- **401**: Unauthorized ("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.")
- **403**: Forbidden ("Bạn không có quyền thực hiện hành động này.")
- **404**: Not Found (Kèm message Entity)
- **409**: Conflict ("Email này đã là thành viên của workspace.")
- **422**: Unprocessable Entity ("Không thể tạo task trong project đã archive.")
- **429**: Too Many Requests (Lock tài khoản sau đăng nhập sai 5 lần. Giới hạn IP 100req/min)
- **500**: Internal Server Error ("Có lỗi xảy ra. Vui lòng thử lại.")

---

## 5. Edge Cases Implementation Guide

| Trường Hợp | Giải Quyết |
|---|---|
| **Member Assignee bị Removed** | `assignee_id` set `null`. Render UI thấy `null` và History check DB ghi `[Removed User]`. Thông báo MANAGER cần re-assign. |
| **Archive Project khi còn Task đang Open** | Không thể push `POST /api/tasks` (Reject 422). Task cũ vẫn edit và update bình thường. Ẩn nút "New Task" ở Front End. |
| **Due date trong quá khứ** | Pass được. Frontend lập tức hiển đánh dấu đỏ Overdue. Sort index lên đầu tiên trong DB. |
| **XSS `<script>`** | Sanitize bằng `sanitize-html` ở backend. Front end render plaintext. Có sử dụng Parameterized Query Prisma. |
| **Cross-tab logout / Tab B** | Client bind `window.addEventListener('storage', handler)`. Khi `auth_token` cookie bị clear (storage event), Tab B detect và redirect `/login` immediately. **LƯU Ý**: KHÔNG dùng BroadcastChannel — dùng storage event để tương thích mọi trình duyệt. |
| **Mất mạng (Offline)** | Bind `online`/`offline` handler qua Zustand. Render banner đỏ cố định ở đỉnh màn hình báo Offline (PWA rules). Bỏ cache rớt. |
| **Member tự xóa User mình ở Workspace** | Chặn 403 Error trong Middleware API `DELETE member`. Không cho phép tự Kick-out. |
| **Concurrent Edit Task Title** | Thiết lập rule MVP "Last Write Wins". DB log lại toàn bộ history qua API calls Activity Logs. Không implement soft-lock MVP. |
| **API trả 429 (Rate Limit thường)** | FE intercept response status 429 → hiện Toast "Bạn đang thao tác quá nhanh. Vui lòng chờ." + disable nút submit 5 giây rồi tự re-enable. |
| **JWT hết hạn giữa thao tác form** | Trước khi redirect `/login`, lưu draft form data vào `sessionStorage` với key = route pathname. Sau khi đăng nhập lại, restore draft nếu `from` param khớp. Tối thiểu bắt buộc hiện Toast warning trước khi redirect. |
| **Double-click / Race Condition submit** | Button submit **BẮT BUỘC** `disabled` khi `formState.isSubmitting = true` (React Hook Form hỗ trợ sẵn). Áp dụng cho toàn bộ form trong app. |
| **Cloudinary upload thất bại (timeout / 5xx)** | FE hiện Toast "Upload ảnh thất bại, vui lòng thử lại." + CHO PHÉP submit task description không kèm ảnh (trường ảnh là optional). Không block submit. |
| **Admin cuối cùng bị xóa khỏi Workspace** | BE check: nếu target là Admin duy nhất trong workspace → trả 400 "Không thể xóa Admin cuối cùng. Hãy chỉ định Admin khác trước." |
| **Cron TASK_DUE_SOON dedup** | Query dedup bắt buộc: `WHERE task_id = :id AND type = 'TASK_DUE_SOON' AND created_at >= CURRENT_DATE`. Đảm bảo mỗi task chỉ nhận tối đa 1 notification DUE_SOON mỗi ngày. |

---

---

## 6. Layout Structure & UI Architecture

Tổ chức màn hình (Responsive Design): Breakpoint 375px(MB) / 768px(TB) / 1024px+(Desk)
*Desktop (>=1024px):*
```
┌──────────┬───────────────────────────────────────────────────┐
│ Sidebar  │ TopBar (h-14, fixed top, z-50)                    │
│ (Logo ở  │  ┌──GlobalSearch──────────────────┬─Bell─┬─Avatar─│
│ Sidebar) │  └────────────────────────────────┴──────┴────────│
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
**Mobile Fallbacks (<768px):**
- Sidebar hẹp đóng thành Hamburger.
- SlideOver bung 100% Fullscreen dạng Dialog Modal dài.
- Kanban Board mất tính năng kéo thả Drag & Drop (đổi sang Edit Status Button).

### Error UI Standards (NFR-05)

**Next.js Error & Not Found:**
- `/frontend/src/app/error.tsx`: Hiển thị lỗi runtime có nút "Thử lại".
- `/frontend/src/app/not-found.tsx`: Trang 404 có link về trang chính.
- **403 / Access Denied**: Hiển thị component `<AccessDenied />` khi user không đủ quyền.

*Chi tiết design tokens (colors, anim) sẽ do `design-system.md` quy định.*

---

## 7. Testing Blueprint & NFR Coverage 

### 7.1 Automated API Verification / Testing (Unit Tests cho Endpoint)
- `auth.service.test.ts`: Register success, register duplicate email (409), login success, login wrong password, login locked after 5 fails (429), JWT generation, password not in response.
- `workspace.service.test.ts`: Create workspace, list my workspaces, update name (Admin only), add/remove member, role change, self-remove blocked (403).
- `project.service.test.ts`: CRUD, archive project, create task in archived project (422), soft delete, task counter aggregation, restore.
- `task.service.test.ts`: Create, update fields, change status (assignee allowed, non-assignee blocked 403), soft delete, restore, overdue flag, row-level isolation.
- `comment.service.test.ts`: Create comment, mention parsing, XSS sanitization, notification trigger.
- `notification.service.test.ts`: Create notification, mark read, mark all read, polling unread, deduplicate DUE_SOON.
- `report.service.test.ts`: Weekly completion query, member stats, completion rate calculation.
- `search.service.test.ts`: Search by title, max 10 results, soft-deleted not returned, workspace isolation.

### 7.2 Component Tests (interactive components)
- `LoginForm.test.tsx`: Submit valid, submit empty email -> error, submit wrong password -> toast, account locked -> countdown.
- `TaskCreateForm.test.tsx`: Submit valid, title empty -> error, title > 200 chars -> error, select project required.
- `KanbanBoard.test.tsx`: Render 4 columns, drag card -> status change, non-assignee cannot drag -> disabled.
- `TaskSlideOver.test.tsx`: Open/close animation, inline edit title, change status, add comment.
- `NotificationBell.test.tsx`: Badge count, click opens dropdown, mark as read.
- `InviteMemberForm.test.tsx`: Submit valid email, duplicate member -> error (409).
Tất cả các trạng thái Loading UI sử dụng Skeleton Component hoặc Spinner khi API request delay quá 300ms. Empty State phải có Call-To-Action.

### 7.3 Edge Case Tests (PRD §10)
- `edge-assignee-removed.test.ts`: Remove member -> task shows "[Removed User]"
- `edge-archived-project.test.ts`: Archive project -> create task returns 422
- `edge-login-lockout.test.ts`: 5 wrong passwords -> 429 + countdown
- `edge-cross-tab-logout.test.ts`: Logout tab A -> tab B detects and redirects
- `edge-xss-sanitize.test.ts`: `<script>alert('xss')</script>` in title -> stripped
- `edge-self-remove.test.ts`: Member tries DELETE self -> 403

### 7.4 NFR Coverage
- NFR-02 SLA: Railway triển khai Auto-recovery và thêm `GET /api/health` status Endpoint.
- NFR-03 Security: Không lưu session DB, Stateless JWT, CORS và Rate Limiting bật trên file Entrypoint Express.
- NFR-05 Usability: Mọi luồng API không quá 3 bước. Không bao giờ Error Loading trắng trang - Có UI "Không có quyền" hoặc errorBoundary Fallback UI.
- NFR-06 A11y: Contrast Text, ARIA label ở mọi Modal/Input. Tab Order support (chủ yếu dựa trên standard của shadcn/ui framework).
- NFR-08 Browser Support: Target Chrome ≥ 110, Firefox ≥ 110, Safari ≥ 16, Edge ≥ 110. Bắt buộc test drag-drop trên Safari riêng.

---

> END OF REQUIREMENT SPECIFICATION. All tasks and prompt executions should strictly treat this document as the core guiding blueprint for the scope of the TaskFlow MVP.
