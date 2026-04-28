# Plan: Chỉnh Sửa Tài Liệu Để Agentic Coding Đạt 100%

> **Mục tiêu:** Sửa 6 file tài liệu context/prompt để loại bỏ mâu thuẫn, thêm verification rules, thêm anti-patterns, và bổ sung micro-context cho từng task — giúp AI agent code đúng từ lần đầu.
>
> **Quyết định đã chốt với user:**
> 1. ❌ Xóa bỏ trường `username` khỏi schema & UI
> 2. ❌ Bỏ việc tạo project mặc định khi register
> 3. ✅ Chốt dùng `sonner` (KHÔNG react-toastify)
> 4. ✅ Gmail App Password cho demo SMTP
> 5. ✅ Đổi font `Inter` → `Roboto`
> 6. ✅ Mention bằng `user.name` (Option A — parse text `@[Name](userId)`)
> 7. ✅ Nâng cấp UI Login/Register cho premium hơn

---

## File 1: [agent-master-prompt.md](file:///d:/taskflowfinal/docs/prompts/agent-master-prompt.md)

### Thay đổi 1.1 — Thêm QUY TẮC 5: Runtime Verification
Sau QUY TẮC 4 (dòng 16), thêm:
```markdown
- QUY TẮC 5 (RUNTIME VERIFY BẮT BUỘC): Trước khi đánh dấu [x] cho bất kỳ task nào, bạn BẮT BUỘC phải:
  a) Nếu có DB schema changes → chạy `cd backend && npx prisma migrate dev`
  b) Start backend server `cd backend && npm run dev` — confirm không crash
  c) Start frontend server `cd frontend && npm run dev` — confirm không crash
  d) Tối thiểu 1 lần test endpoint vừa code (dùng curl, browser tool, hoặc Postman)
  e) Nếu test fail → fix TRƯỚC KHI đánh [x], tuyệt đối KHÔNG skip
```

### Thay đổi 1.2 — Thêm QUY TẮC 6: Incremental Build
```markdown
- QUY TẮC 6 (INCREMENTAL BUILD): Sau mỗi 3-5 file code xong, bạn PHẢI:
  a) Chạy `npx tsc --noEmit` (backend) hoặc `npm run build` (frontend) để bắt type errors
  b) Fix mọi lỗi TypeScript TRƯỚC KHI tiếp tục code file mới
  c) KHÔNG batch code 20+ files rồi mới test
```

### Thay đổi 1.3 — Thêm section ANTI-PATTERNS
Sau section QUY TẮC, thêm section mới:
```markdown
# ANTI-PATTERNS (Lỗi Phổ Biến Agent HAY MẮC — TRÁNH NGAY)
1. ❌ staleTime: Infinity cho auth queries → gây cache stale, user login xong không redirect được
2. ❌ Quên chạy `prisma migrate dev` sau khi sửa schema → table không tồn tại, crash
3. ❌ Axios interceptor 401 redirect /login mà KHÔNG check URL hiện tại → infinite loop ở public routes
4. ❌ Zod v3+: dùng `error.errors` (API cũ) → phải dùng `error.issues`
5. ❌ Nodemailer hardcode `secure: false` → crash khi port 465 yêu cầu SSL
6. ❌ Quên tạo `page.tsx` cho route mới → 404 trên production
7. ❌ Import trực tiếp `nodemailer` hoặc `resend` → BẮT BUỘC qua EmailProviderFactory
8. ❌ Trả raw Prisma error / stack trace về client → lộ logic hệ thống, phải dùng errorHandler middleware
9. ❌ Tự chế UI component structure khác với ui-wireframes.md → layout shift
10. ❌ Quên `npm install` dependency mới trước khi code → build fail
11. ❌ QUÊN ĐÁNH DẤU [x] trong tasks.md sau khi hoàn thành sub-task → mất tracking tiến độ
```

### Thay đổi 1.4 — Cập nhật bước [VERIFY] trong Agent Loop
Sửa bước 3 hiện tại (dòng 22):
```diff
- 3. [VERIFY]: Check lại code xem error handling đủ chưa? Quá 300ms call API có loading state chưa? Input XSS có sanitize chưa?
+ 3. [VERIFY]: Thực hiện 2 bước verify:
+    a) CODE REVIEW: error handling đủ? loading state > 300ms? input sanitize XSS? password_hash excluded?
+    b) RUNTIME TEST: chạy server, test endpoint thực tế (xem QUY TẮC 5). Nếu fail → quay lại [ACT].
```

### Thay đổi 1.5 — Tăng cường QUY TẮC 3 (Tick [x] Enforcement)
Sửa QUY TẮC 3 hiện tại (dòng 15) để mạnh hơn, thêm cơ chế nhắc lại:
```diff
- - QUY TẮC 3 (TRACKING STATE): Khi bạn làm xong bất kỳ một sub-task `[ ]` nào trong `tasks.md` và đã pass phần Verification, bạn PHẢI sửa nội dung file `tasks.md` cập nhật thành `[x]` thay vì chỉ báo cáo bằng text.
+ - QUY TẮC 3 (TRACKING STATE — KHÔNG ĐƯỢC QUÊN): Khi bạn làm xong bất kỳ một sub-task `[ ]` nào trong `tasks.md` và đã pass phần Verification, bạn BẮT BUỘC PHẢI thực hiện ngay 2 việc:
+   a) Mở file `tasks.md` và sửa `[ ]` thành `[x]` cho sub-task vừa hoàn thành
+   b) Kiểm tra xem có sub-task nào phía trước đã làm xong nhưng quên tick [x] không — nếu có, tick luôn
+   ⚠️ CẢNH BÁO: Nếu bạn hoàn thành code mà KHÔNG tick [x], toàn bộ tiến độ sẽ bị mất và task sẽ bị làm lại. Đây là lỗi nghiêm trọng.
```

### Thay đổi 1.6 — Tăng cường bước [COMMIT] trong Agent Loop
Sửa bước 4 (dòng 23):
```diff
- 4. [COMMIT]: Cập nhật `[x]` vào `tasks.md`. Báo cáo lại tôi 1 dòng tóm tắt và xin phép đi tiếp.
+ 4. [COMMIT]: BẮT BUỘC thực hiện theo thứ tự:
+    a) Mở file `tasks.md` → tick `[x]` cho TẤT CẢ sub-tasks vừa hoàn thành (KHÔNG ĐƯỢC BỎ QUA BƯỚC NÀY)
+    b) Báo cáo lại tôi 1 dòng tóm tắt kèm danh sách các mục đã tick [x]
+    c) Chờ tôi xác nhận trước khi đi tiếp
```

---

## File 2: [AGENTS.md](file:///d:/taskflowfinal/docs/AGENTS.md)

### Thay đổi 2.1 — Thêm SMTP Config vào Backend section
Trong phần Backend (sau dòng 19 - Email), thêm chi tiết:
```diff
- - Email: Hỗ trợ linh hoạt Resend (Production) và Nodemailer (Demo) phụ thuộc vào env EMAIL_PROVIDER.
+ - Email: Hỗ trợ linh hoạt Resend (Production) và Nodemailer (Demo) phụ thuộc vào env `EMAIL_PROVIDER`.
+   - Nodemailer Config (Demo - Gmail App Password):
+     ```
+     SMTP_HOST="smtp.gmail.com"
+     SMTP_PORT="465"
+     SMTP_USER="<gmail address>"
+     SMTP_PASS="<gmail app password>"
+     SMTP_SECURE="true"
+     ```
+   - Nodemailer code PHẢI đọc config từ env vars trên, KHÔNG hardcode `secure`, `host`, hay `port`.
```

### Thay đổi 2.2 — Xóa `username` trong Coding Conventions nếu có mention
Kiểm tra và loại bỏ bất kỳ reference nào đến `username` field. (Hiện file này không mention username trực tiếp - chỉ cần note lại trong context.)

### Thay đổi 2.3 — Clarify Toast Library
Trong Architecture Patterns (dòng 44), thêm:
```diff
  - Toast notifications: auto-dismiss sau 4 giây
+ - Toast library: BẮT BUỘC dùng `sonner`. KHÔNG dùng `react-toastify`.
```

---

## File 3: [requirements.md](file:///d:/taskflowfinal/docs/requirements.md)

### Thay đổi 3.1 — Xóa `username` khỏi Prisma Schema
Trong phần User model (dòng 268-286):
```diff
  model User {
    id              String    @id @default(uuid())
    email           String    @unique
-   username        String    @unique  // Lowercase, no spaces, VD: "minh.tan". Max 30 chars.
    name            String
    password_hash   String
    ...
  }
```

### Thay đổi 3.2 — Xóa `username` khỏi Register API
Trong FR-01 (dòng 465):
```diff
- - Schema: `{ name: min(2), email: string.email, username: string, password: min(8) }`
+ - Schema: `{ name: min(2), email: string.email, password: min(8) }`
```

### Thay đổi 3.3 — Bỏ tạo Project mặc định khi Register
Trong FR-01 (dòng 466):
```diff
- - Logic: Hash bcrypt cost 12. Tạo User. Tạo sẵn Workspace tên `"Workspace của {user.name}"` và tự động tạo một Project mặc định tên `"Dự án đầu tiên"`. Gắn tự động làm ADMIN cho Workspace này.
+ - Logic: Hash bcrypt cost 12. Tạo User. Tạo sẵn Workspace tên `"Workspace của {user.name}"`. Gắn tự động làm ADMIN cho Workspace này. KHÔNG tạo Project mặc định.
```

### Thay đổi 3.4 — Thêm SMTP Env Vars
Trong phần Backend .env (dòng 38-53), thêm:
```diff
  EMAIL_PROVIDER=resend # Chấp nhận: 'resend' | 'nodemailer'
+ # Nodemailer / SMTP Config (chỉ cần khi EMAIL_PROVIDER=nodemailer)
+ SMTP_HOST="smtp.gmail.com"
+ SMTP_PORT="465"
+ SMTP_USER="minh43937@gmail.com"
+ SMTP_PASS=""
+ SMTP_SECURE="true"
```

### Thay đổi 3.5 — Fix Axios Interceptor 401 (infinite loop prevention)
Trong phần Frontend API Client (dòng 79-91), sửa response interceptor:
```diff
  api.interceptors.response.use(
    (response) => response,
    (error) => {
-     if (error.response?.status === 401) {
+     const publicRoutes = ['/login', '/register', '/invite'];
+     const currentPath = window.location.pathname;
+     const isPublicRoute = publicRoutes.some(route => currentPath.startsWith(route));
+     if (error.response?.status === 401 && !isPublicRoute) {
        authStore.getState().logout();
        new BroadcastChannel('auth').postMessage({ type: 'LOGOUT' });
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
```

### Thay đổi 3.6 — Đổi Mention từ `username` sang `user.name`
Trong FR-06 (dòng 581-584), chốt dùng **Option A — Mention bằng `user.name`**:
```diff
- - `/@(\w+)/g` match với field `user.username`.
- - Khi parse comment xong, backend query: `SELECT id FROM users WHERE username = :mentionedUsername`
+ - Mention bằng `user.name`: FE hiển thị dropdown gợi ý user khi gõ `@`. Khi chọn user từ dropdown, FE chèn `@[User Name](userId)` vào comment text.
+ - Backend parse pattern `/@\[([^\]]+)\]\(([a-f0-9-]+)\)/g` để extract `userId` trực tiếp — không cần tìm kiếm by name.
+ - Hiển thị trên UI: render `@User Name` dạng `text-indigo-600 font-medium` (highlight link style).
```

> [!NOTE]
> Pattern `@[Name](userId)` tương tự Markdown link syntax — đảm bảo chính xác 100% vì dùng UUID, không lo trùng tên.

### Thay đổi 3.7 — Xóa `username` khỏi Settings API
Trong FR-02 (dòng 50, 53):
```diff
- - Tab **Profile**: Form sửa Name, Username (Email disabled). Gọi `PATCH /api/auth/profile`, validate username unique + max 30 chars.
+ - Tab **Profile**: Form sửa Name (Email disabled). Gọi `PATCH /api/auth/profile`.
- - [Backend] `PATCH /api/auth/profile` → update `name`, `username`. Validate: `username` unique, lowercase, no spaces, max 30 chars.
+ - [Backend] `PATCH /api/auth/profile` → update `name`. Validate: `name` min 2 chars, max 100 chars.
```

---

## File 4: [tasks.md](file:///d:/taskflowfinal/docs/tasks.md)

### Thay đổi 4.1 — Thêm Smoke Test Commands cho Milestone 0
Sau Milestone 0 items (trước dòng 29 `---`), thêm:
```markdown
- [ ] **Smoke Test Milestone 0 (BẮT BUỘC pass trước khi sang Milestone 1)**
  - [ ] `cd backend && npx prisma migrate dev --name init` → Confirm migration success
  - [ ] `cd backend && npm run dev` → Confirm "Server running on port 4000"
  - [ ] `curl http://localhost:4000/api/health` → Confirm `{"status":"ok"}`
  - [ ] `cd frontend && npm run dev` → Confirm "Ready on http://localhost:3000"
  - [ ] Mở browser → Navigate `/login` → Confirm page renders không lỗi
```

### Thay đổi 4.2 — Thêm Smoke Test cho Milestone 1
Sau Milestone 1 items, trước `---` separator:
```markdown
- [ ] **Smoke Test Milestone 1 (BẮT BUỘC pass trước khi sang Milestone 2)**
  - [ ] Register user mới → Confirm tạo account + workspace thành công (KHÔNG tạo project mặc định)
  - [ ] Login → Confirm redirect về `/app/my-tasks` (không loop)
  - [ ] Navigate `/app/projects` → Confirm page renders (không 404)
  - [ ] Tạo project mới → Confirm không Zod error
  - [ ] Tạo task trong project → Confirm không crash
```

### Thay đổi 4.3 — Thêm Micro-Context CONSTRAINTS cho FR-01
Trong FR-01 (dòng 33), thêm block constraints ngay dưới dòng tiêu đề:
```markdown
- [ ] **FR-01: Authentication & Sessions** (Mapping: `requirements.md` -> Phần 3 / FR-01)
  > **CONSTRAINTS (đọc trước khi code):**
  > 1. JWT lưu httpOnly cookie, KHÔNG localStorage
  > 2. Axios interceptor: skip redirect 401 nếu đang ở /login, /register, /invite
  > 3. Login success → `queryClient.setQueryData(['auth', 'me'], userData)` ngay lập tức
  > 4. staleTime cho /auth/me: 5*60*1000 (5 phút), KHÔNG dùng Infinity
  > 5. Register tạo Workspace, KHÔNG tạo Project mặc định
  > 6. Schema register: { name, email, password } — KHÔNG có username
  > 7. Font: dùng Roboto (next/font/google), KHÔNG dùng Inter hay font có chân
```

### Thay đổi 4.4 — Thêm Micro-Context cho FR-02
```markdown
- [ ] **FR-02: Workspace & Members** (Mapping: `requirements.md` -> Phần 3 / FR-02)
  > **CONSTRAINTS:**
  > 1. Email provider: dùng Factory pattern EmailProviderFactory, KHÔNG import trực tiếp
  > 2. Nodemailer: đọc SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE từ env
  > 3. SMTP_SECURE=true khi port=465, KHÔNG hardcode
  > 4. Settings Profile form: chỉ có Name (KHÔNG có Username), Email disabled
  > 5. npm install nodemailer @types/nodemailer resend TRƯỚC khi code
```

### Thay đổi 4.5 — Thêm Micro-Context cho FR-03
```markdown
- [ ] **FR-03: Projects** (Mapping: `requirements.md` -> Phần 3 / FR-03)
  > **CONSTRAINTS:**
  > 1. Zod validation: dùng `error.issues` (KHÔNG phải `error.errors`)
  > 2. Color picker UI: hiển thị color swatch (hình tròn màu), KHÔNG hiển thị text tên màu
  > 3. Soft delete project → phải soft delete TẤT CẢ tasks trong transaction
  > 4. BẮT BUỘC tạo file `page.tsx` cho route `/app/projects` VÀ `/app/projects/[id]`
  > 5. Backend error response: dùng errorHandler middleware, KHÔNG trả raw Prisma stack trace
```

### Thay đổi 4.6 — Thêm Micro-Context cho FR-04 & FR-05
```markdown
- [ ] **FR-04 & FR-05: Tasks CRUD** (Mapping: `requirements.md` -> Phần 3 / FR-04 -> FR-05)
  > **CONSTRAINTS:**
  > 1. Form tạo task PHẢI có đủ: title, project, assignee, priority, status, due_date, description
  > 2. Toast dùng `sonner` (import { toast } from 'sonner'), KHÔNG react-toastify
  > 3. Sidebar phải có button tạo task nhanh
  > 4. Optimistic UI: update cache trước, rollback nếu API fail
  > 5. Slide-over panel: dùng Sheet side="right", PHẢI có overlay bg-black/20
```

### Thay đổi 4.7 — Thêm Dependency Chain cho mỗi FR
Thêm dòng `DEPENDS ON` vào mỗi task, đặt trước block CONSTRAINTS:
```
FR-01: không dependency
FR-02: DEPENDS ON FR-01 ✅
FR-03: DEPENDS ON FR-01 ✅, FR-02 ✅
FR-04 & FR-05: DEPENDS ON FR-01 ✅, FR-02 ✅, FR-03 ✅
FR-06: DEPENDS ON FR-04 ✅
FR-09: DEPENDS ON FR-04 ✅, FR-06 ✅
FR-10: DEPENDS ON FR-04 ✅
FR-07: DEPENDS ON FR-04 ✅
FR-08: DEPENDS ON FR-04 ✅, FR-07 ✅
FR-11: DEPENDS ON FR-04 ✅, FR-08 ✅
FR-12: DEPENDS ON FR-04 ✅
```

---

## File 5: [design-system.md](file:///d:/taskflowfinal/docs/design-system.md)

### Thay đổi 5.1 — Đổi font Inter → Roboto
Trong phần Typography (dòng 70-77), thay toàn bộ Inter thành Roboto:
```diff
  ### 2.3. Typography (Định dạng chữ tĩnh)
- Toàn bộ dự án dùng sans-serif hiện đại. **Bắt buộc** dùng `next/font/google` (KHÔNG dùng CDN link) để optimize Web Font loading:
+ Toàn bộ dự án dùng font **Roboto** (sans-serif, Google Font). **Bắt buộc** dùng `next/font/google` (KHÔNG dùng CDN link) để optimize Web Font loading:
  ```typescript
  // /frontend/src/app/layout.tsx
- import { Inter } from 'next/font/google';
- const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
- // Apply: <body className={inter.variable}>
+ import { Roboto } from 'next/font/google';
+ const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-roboto' });
+ // Apply: <body className={roboto.variable}>
  ```
```

> [!IMPORTANT]
> Agent PHẢI apply font variable vào `<body>` tag VÀ config Tailwind `fontFamily` để toàn bộ app render đúng Roboto.
> Trong `tailwind.config.ts`:
> ```typescript
> theme: { extend: { fontFamily: { sans: ['var(--font-roboto)', 'Roboto', 'sans-serif'] } } }
> ```

### Thay đổi 5.2 — Sonner enforcement đã đúng, không sửa

---

## File 6: [ui-wireframes.md](file:///d:/taskflowfinal/docs/ui-wireframes.md)

### Thay đổi 6.1 — Fix Toast library reference
Dòng 326:
```diff
- - Sử dụng `sonner` hoặc `react-toastify`.
+ - BẮT BUỘC sử dụng `sonner`. KHÔNG dùng `react-toastify`.
```

### Thay đổi 6.2 — Xóa Username khỏi Settings wireframe
Dòng 183:
```diff
- │    └── [Form: grid grid-cols-2 gap-4] -> Email (disabled), Name, Username
+ │    └── [Form: grid grid-cols-2 gap-4] -> Email (disabled), Name
```

### Thay đổi 6.3 — Nâng cấp Login/Register UI (Premium Aesthetic)
Thay thế phần Auth Screens wireframe (dòng 47-65) bằng thiết kế premium hơn:

**Mô tả nâng cấp:**
- Left panel: `bg-indigo-600` đơn sắc → gradient `bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800` + subtle decorative SVG pattern overlay
- Quote block đơn điệu → Hero content với tagline mạnh + feature checklist (✓ Kanban, ✓ Real-time, ✓ Reports)
- Logo: text thuần → icon box `bg-white/20 rounded-xl backdrop-blur-sm` + text lớn hơn
- Trust badge nhỏ ở dưới cùng → social proof

```diff
  [AuthContainer: flex min-h-screen]
-  ├── [LeftPanel: hidden lg:flex w-1/2 bg-indigo-600 flex-col items-center justify-center p-12]
-  │    └── [QuoteBlock: text-white text-center max-w-sm]
-  │         ├── [AppLogo: text-white font-bold text-2xl mb-12] → "TaskFlow"
-  │         ├── [QuoteText: text-2xl font-light italic leading-relaxed text-indigo-100]
-  │         └── [QuoteAuthor: text-sm text-indigo-300 mt-4] → „— Tên tác giả"
+  ├── [LeftPanel: hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col items-center justify-center p-12 relative overflow-hidden]
+  │    ├── [BGDecor: absolute inset-0 opacity-10] → SVG pattern hoặc subtle geometric shapes (circles, dots grid)
+  │    └── [HeroContent: z-10 text-center max-w-md]
+  │         ├── [AppLogo: flex items-center justify-center gap-3 mb-10]
+  │         │    ├── [LogoIcon: w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm]
+  │         │    └── [LogoText: text-white font-bold text-3xl tracking-tight] → "TaskFlow"
+  │         ├── [Tagline: text-xl font-light text-indigo-100 leading-relaxed mb-8]
+  │         │    → "Quản lý công việc thông minh. Đơn giản. Hiệu quả. Cho mọi team."
+  │         ├── [FeatureList: flex flex-col gap-3 text-left]
+  │         │    ├── [Feature: flex items-center gap-3 text-indigo-200 text-sm] → ✓ Kanban board trực quan
+  │         │    ├── [Feature] → ✓ Theo dõi tiến độ real-time
+  │         │    └── [Feature] → ✓ Báo cáo team thông minh
+  │         └── [TrustBadge: mt-10 text-xs text-indigo-300/70] → "Được tin dùng bởi 1,000+ teams"
```

**Nâng cấp Right Panel (Form Card):**
```diff
   └── [RightPanel: flex-1 flex items-center justify-center p-8 bg-slate-50]
-       └── [AuthCard: w-full max-w-[400px] bg-white p-8 rounded-xl shadow-sm border border-slate-200]
-            ├── [Header: h1 text-2xl font-bold text-slate-900 mb-6] → "Chào mừng trở lại" / "Đăng ký tài khoản"
+       └── [AuthCard: w-full max-w-[420px] bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100]
+            ├── [MobileLogo (lg:hidden): flex items-center gap-2 mb-6 justify-center]
+            │    ├── [LogoIcon: w-8 h-8 bg-indigo-600 rounded-lg]
+            │    └── [LogoText: font-bold text-xl text-slate-900] → "TaskFlow"
+            ├── [Header: mb-6]
+            │    ├── [Title: h1 text-2xl font-bold text-slate-900] → "Chào mừng trở lại" / "Tạo tài khoản mới"
+            │    └── [Subtitle: text-sm text-slate-500 mt-1] → "Đăng nhập để tiếp tục quản lý công việc" / "Bắt đầu miễn phí, không cần thẻ tín dụng"
             ├── [Form: flex flex-col gap-4 (React Hook Form)]
-            │    ├── [InputGroup (Email): label + input. Nếu lỗi → border-red-500 + text-xs red]
-            │    ├── [InputGroup (Password)]
-            │    └── [Button (Submit): w-full bg-indigo-600 text-white]
-            └── [Footer: text-sm text-center text-slate-500 mt-4] → "Chưa có tài khoản? Đăng ký"
+            │    ├── [InputGroup (Email): label text-sm font-medium text-slate-700 + Input h-11 rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all]
+            │    ├── [InputGroup (Password): có toggle show/hide icon bên phải]
+            │    ├── [InputGroup (Name): CHỈ ở Register — KHÔNG có Username]
+            │    └── [Button (Submit): w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm shadow-indigo-600/25 hover:shadow-md hover:shadow-indigo-600/30]
+            └── [Footer: text-sm text-center text-slate-500 mt-6]
+                 └── "Chưa có tài khoản?" + [Link: text-indigo-600 hover:text-indigo-700 font-medium hover:underline] → "Đăng ký ngay"
```

**Lý do nâng cấp:**
| Trước (đơn điệu) | Sau (premium) |
|---|---|
| Left panel flat `bg-indigo-600` | Gradient `from-indigo-600 to-purple-800` + SVG pattern |
| Quote văn học (không liên quan app) | Tagline mạnh + feature checklist → user hiểu ngay app làm gì |
| Card `rounded-xl shadow-sm` | Card `rounded-2xl shadow-lg` → cảm giác floating premium |
| Input mặc định | Input `h-11` cao hơn + focus ring animation |
| Button mặc định | Button có `shadow-indigo-600/25` → micro-interaction khi hover |
| Không có logo mobile | MobileLogo hiện trên form khi cột trái bị ẩn |
| Không có subtitle | Subtitle mô tả ngắn dưới title → context rõ ràng |
| Password input thường | Toggle show/hide → UX thiết yếu |

---

## File 7: [tasks.md](file:///d:/taskflowfinal/docs/tasks.md) — Bổ sung Task "Build App Shell"

> **Nguyên nhân bỏ sót Header/TopBar:** Wireframe `ui-wireframes.md` §1 đã spec rõ TopBar (Search + Bell + Avatar) nằm trong `MainContentArea` của layout. Tuy nhiên `tasks.md` **không có task nào** yêu cầu Agent build App Shell layout (Sidebar + TopBar) trước khi build các pages con. Agent chỉ code theo task list → bỏ qua shell.

### Thay đổi 7.1 — Thêm Task "Build App Shell" vào Milestone 0
Sau task "Error & Fallback Pages" (trước `---` separator của Milestone 1), thêm:
```markdown
- [ ] **Build App Shell Layout** (Mapping: `ui-wireframes.md` → §1 Global App Shell)
  > **CONSTRAINTS (đọc trước khi code):**
  > 1. Phải build TRƯỚC mọi page component — đây là skeleton chứa Sidebar + TopBar + PageContainer
  > 2. TopBar PHẢI có 3 phần: Hamburger (mobile), Global Search Input, Notification Bell + User Avatar
  > 3. Sidebar PHẢI có: Logo, NavMenu (My Tasks, Team Kanban, Projects, Reports, Settings), UserBlock, **Button "+ Tạo Task" nổi bật**
  > 4. Layout file: `/frontend/src/app/(dashboard)/app/layout.tsx` — KHÔNG code trong root `layout.tsx`
  > 5. TopBar chưa cần logic Search/Bell hoạt động — chỉ cần render UI placeholder, logic sẽ gắn khi code FR-09, FR-12
  > 6. Mobile: Sidebar ẩn thành Hamburger menu (md:hidden ↔ md:flex)
  > 7. Font Roboto phải được apply đúng từ root layout
  - [ ] [Frontend] Tạo component `Sidebar.tsx` với NavMenu items + Button "+ Tạo Task" (mở CreateTaskModal)
  - [ ] [Frontend] Tạo component `TopBar.tsx` với Search placeholder + NotificationBell placeholder + UserAvatar dropdown (Logout)
  - [ ] [Frontend] Tạo `(dashboard)/app/layout.tsx` compose Sidebar + TopBar + PageContainer
  - [ ] [Frontend] Verify: navigate giữa các route → Sidebar/TopBar persistent, không re-mount
```

### Thay đổi 7.2 — Thêm Sidebar "+ Tạo Task" vào CONSTRAINTS FR-04
Bổ sung vào block CONSTRAINTS của FR-04 & FR-05 (Thay đổi 4.6):
```diff
  > 3. Sidebar phải có button tạo task nhanh
+ > 3a. Button "+ Tạo Task" ở Sidebar phải mở cùng CreateTaskModal dùng chung với nút ở PageHeader
+ > 3b. NFR-05: Thao tác tạo task KHÔNG QUÁ 3 click từ BẤT KỲ màn hình nào (Sidebar button = 1 click → Modal = 2 click fill+submit)
```

---

## File 8: [ui-wireframes.md](file:///d:/taskflowfinal/docs/ui-wireframes.md) — Bổ sung Sidebar Quick-Create & Color Swatch

### Thay đổi 8.1 — Thêm Button "+ Tạo Task" vào Sidebar wireframe
Dòng 26-31, sửa NavMenu trong Sidebar:
```diff
  │    ├── [NavMenu: flex-1 py-4 flex flex-col gap-1 px-3]
  │    │    ├── [NavItem (My Tasks): flex outline-none ring-indigo-600 focus-visible:ring-2]
  │    │    ├── [NavItem (Team Kanban)]
  │    │    ├── [NavItem (Projects)]
  │    │    ├── [NavItem (Reports)]
  │    │    └── [NavItem (Settings)]
+ │    ├── [QuickCreateButton: mx-3 mt-2 w-[calc(100%-24px)] h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm]
+ │    │    └── Icon Plus + "Tạo Task" → onClick → mở <CreateTaskModal> global
  │    └── [UserBlock (Bottom): p-4 border-t border-slate-200 text-sm font-medium]
```

### Thay đổi 8.2 — Fix Color Picker trong Create/Edit Project
Trong §2.6 (Projects wireframe), thêm note rõ ràng cho ColorPicker:
```markdown
> **COLOR PICKER RULE:** UI chọn màu project PHẢI hiển thị dưới dạng color swatch (hình tròn/ô vuông tô màu thực tế),
> KHÔNG được hiển thị text tên màu (VD: "RED", "BLUE"). Mỗi swatch là `w-6 h-6 rounded-full bg-{color}-500 cursor-pointer
> ring-2 ring-offset-2 ring-transparent hover:ring-indigo-500 transition`. Swatch đang chọn có `ring-indigo-600`.
```

---

## File 9: [requirements.md](file:///d:/taskflowfinal/docs/requirements.md) — Bổ sung các fix còn thiếu

### Thay đổi 9.1 — Enforce Role Permission tạo Project
Trong FR-03 (dòng 538-539), requirement đã ghi `Manager + Admin tạo được. Member chỉ GET.` nhưng cần thêm enforcement chi tiết:
```diff
  ### FR-03: Projects
  - Manager + Admin tạo được. Member chỉ GET.
+ - **RBAC Enforcement (BẮT BUỘC):**
+   - Backend `POST /api/projects`: Middleware check `req.workspaceRole` ∈ ['ADMIN', 'MANAGER']. Nếu MEMBER → return 403 "Bạn không có quyền tạo dự án."
+   - Frontend: Button "+ New Project" phải ẩn hoặc disabled + tooltip khi `workspaceRole === 'MEMBER'`
```

### Thay đổi 9.2 — Fix Prisma Client Initialization cho v7
Trong phần 1.1 Tech Stack hoặc phần 2 Database Schema, thêm note:
```markdown
> [!WARNING]
> **Prisma 7.x Breaking Change:** `new PrismaClient()` không tham số có thể crash.
> File `backend/src/lib/prisma.ts` BẮT BUỘC khởi tạo với option:
> ```typescript
> const prisma = new PrismaClient({
>   log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
> });
> ```
> Nếu dùng adapter (pg), phải truyền đúng cú pháp. LUÔN verify `DATABASE_URL` tồn tại trước khi khởi tạo.
```

### Thay đổi 9.3 — Enforce Error Handler Middleware (chặn leak stack trace)
Trong phần 4 Error Code Standards (dòng 648), bổ sung:
```diff
  Backend trả định dạng Format cố định mọi errors:
+ 
+ **QUAN TRỌNG — Error Handler Middleware (BẮT BUỘC):**
+ File `backend/src/middleware/errorHandler.middleware.ts` PHẢI là middleware cuối cùng trong Express pipeline.
+ Nó phải:
+ 1. Bắt mọi error throw từ controller/service
+ 2. Nếu là ZodError → extract `error.issues[0].message`, return 400
+ 3. Nếu là PrismaClientKnownRequestError → map sang message thân thiện (VD: unique constraint → 409), KHÔNG trả raw error
+ 4. Nếu là custom AppError → return đúng statusCode + message
+ 5. Mọi error khác → log chi tiết ra console (server-side), nhưng CHỈ trả `{ success: false, error: "Có lỗi xảy ra. Vui lòng thử lại." }` (500) về client
+ 6. **TUYỆT ĐỐI KHÔNG** trả `error.stack`, `error.message` raw từ Prisma, hoặc bất kỳ internal trace nào về phía client
```

### Thay đổi 9.4 — Default route phải là Login
Trong phần Frontend Route Guard (dòng 490-503), bổ sung:
```diff
  **Frontend Route Guard (Next.js Middleware):**
+ - Route `/` (root) PHẢI redirect về `/login` nếu chưa auth, hoặc `/app/my-tasks` nếu đã auth.
+ - Ứng dụng BẮT ĐẦU với trang `/login` — không có landing page.
```

### Thay đổi 9.5 — Project Description hỗ trợ Markdown + Upload ảnh
Trong FR-03 (dòng 540), làm rõ description field:
```diff
  - **POST /api/projects**: `{ name (max 100), description (max 500), color }`
+ - Description field hỗ trợ Markdown text (render bằng `react-markdown` + `remark-gfm` ở FE).
+ - Upload ảnh trong description: FE gọi `POST /api/upload` lấy URL, chèn `![image](url)` vào markdown content.
+ - UI tạo/sửa project: textarea với toolbar markdown cơ bản (Bold, Italic, Image upload button).
```

---

## File 10: [tasks.md](file:///d:/taskflowfinal/docs/tasks.md) — Bổ sung Micro-Context còn thiếu

### Thay đổi 10.1 — Thêm CONSTRAINTS cho Milestone 0 (App Shell)
```markdown
- [ ] **Build App Shell Layout**
  > **CONSTRAINTS:**
  > 1. Build App Shell (Sidebar + TopBar) TRƯỚC mọi page — đây là điều kiện tiên quyết
  > 2. TopBar: Search (placeholder) + Bell (placeholder) + Avatar (Logout functional)
  > 3. Sidebar: "+ Tạo Task" button mở CreateTaskModal — NFR-05 compliance
  > 4. Route `/` redirect → `/login` (no auth) hoặc `/app/my-tasks` (has auth)
  > 5. Font Roboto apply từ root layout.tsx
```

### Thay đổi 10.2 — Thêm CONSTRAINTS cho FR-03 (Project)
Bổ sung vào block CONSTRAINTS đã có ở Thay đổi 4.5:
```diff
  > 5. Backend error response: dùng errorHandler middleware, KHÔNG trả raw Prisma stack trace
+ > 6. RBAC: Button "+ New Project" ẩn/disabled khi role = MEMBER (chỉ ADMIN/MANAGER tạo project)
+ > 7. Color picker: hiển thị color swatch (tròn tô màu), KHÔNG hiển thị text tên màu
+ > 8. Description: hỗ trợ Markdown text + upload ảnh qua POST /api/upload
```

### Thay đổi 10.3 — Thêm Smoke Test cho Milestone 0 (App Shell verify)
Thêm vào Smoke Test Milestone 0 (Thay đổi 4.1):
```diff
  - [ ] Mở browser → Navigate `/login` → Confirm page renders không lỗi
+ - [ ] Login thành công → Confirm redirect về `/app/my-tasks`
+ - [ ] Confirm Sidebar hiển thị (desktop) với đầy đủ NavItems + Button "+ Tạo Task"
+ - [ ] Confirm TopBar hiển thị với Search placeholder + Avatar dropdown
+ - [ ] Resize browser < 768px → Confirm Sidebar ẩn, Hamburger icon xuất hiện
```

---

## File 11: [agent-master-prompt.md](file:///d:/taskflowfinal/docs/prompts/agent-master-prompt.md) — Bổ sung Anti-Patterns mới

### Thay đổi 11.1 — Thêm Anti-Patterns từ bug-v0
Bổ sung vào section ANTI-PATTERNS (Thay đổi 1.3):
```diff
  10. ❌ Quên `npm install` dependency mới trước khi code → build fail
  11. ❌ QUÊN ĐÁNH DẤU [x] trong tasks.md sau khi hoàn thành sub-task → mất tracking tiến độ
+ 12. ❌ Code pages TRƯỚC KHI build App Shell (Sidebar + TopBar) → thiếu layout chung, mỗi page tự render riêng lẻ
+ 13. ❌ Prisma v7: `new PrismaClient()` không tham số → crash. PHẢI truyền options `{ log: [...] }`
+ 14. ❌ Backend trả raw Prisma error stack trace về client → lộ logic hệ thống. PHẢI dùng errorHandler middleware
+ 15. ❌ Color picker dùng text (VD: "RED") thay vì color swatch → UX kém
+ 16. ❌ Member role tạo được Project → vi phạm RBAC. PHẢI check role ∈ [ADMIN, MANAGER]
+ 17. ❌ Route `/` không redirect → user thấy trang trắng hoặc 404. PHẢI redirect về /login hoặc /app/my-tasks
```

### Thay đổi 11.2 — Thêm QUY TẮC 7: Build Order Enforcement
```markdown
- QUY TẮC 7 (BUILD ORDER): Agent PHẢI build theo thứ tự nghiêm ngặt sau:
  a) Milestone 0: Infrastructure + Database + **App Shell (Sidebar + TopBar)** + Error Pages
  b) Milestone 1: Auth → Workspace → Projects → Tasks (theo dependency chain)
  c) Milestone 2+: Features tiếp theo
  ⚠️ KHÔNG ĐƯỢC skip App Shell để code pages trước. TopBar và Sidebar là layout chung, phải có TRƯỚC.
```

---

## File 12: [design-system.md](file:///d:/taskflowfinal/docs/design-system.md) — Bổ sung Color Swatch Spec

### Thay đổi 12.1 — Thêm spec cho Color Picker Component
Trong phần Component-specific tokens hoặc cuối file, thêm:
```markdown
### Color Picker (Project Form)
- Hiển thị: Grid các color swatch (hình tròn `w-8 h-8 rounded-full`), KHÔNG hiển thị text tên màu
- Mapping:
  | Enum       | Tailwind Class  | Hex       |
  |-----------|----------------|-----------|
  | RED       | bg-red-500      | #EF4444   |
  | ORANGE    | bg-orange-500   | #F97316   |
  | YELLOW    | bg-yellow-500   | #EAB308   |
  | GREEN     | bg-green-500    | #22C55E   |
  | BLUE      | bg-blue-500     | #3B82F6   |
  | PURPLE    | bg-purple-500   | #A855F7   |
  | PINK      | bg-pink-500     | #EC4899   |
  | GRAY      | bg-gray-500     | #6B7280   |
- Selected state: `ring-2 ring-offset-2 ring-indigo-600`
- Hover state: `scale-110 transition-transform`
```

---

## Verification Plan

Sau khi sửa xong **12 nhóm files**, verify bằng cách:

### Automated Check (Agent tự chạy)
1. **Consistency check `username`:** Grep toàn bộ 6 files cho từ "username" → kết quả phải = 0 (trừ mention pattern discussion nếu giữ lại note).
   ```powershell
   Select-String -Path "d:\taskflowfinal\docs\*.md" -Pattern "username" -Recurse
   ```
2. **Consistency check `react-toastify`:** Grep → kết quả phải = 0.
   ```powershell
   Select-String -Path "d:\taskflowfinal\docs\*.md" -Pattern "react-toastify" -Recurse
   ```
3. **Consistency check `Dự án đầu tiên`:** Grep → kết quả phải = 0.
   ```powershell
   Select-String -Path "d:\taskflowfinal\docs\*.md" -Pattern "Dự án đầu tiên" -Recurse
   ```
4. **Font consistency:** Grep `Inter` trong docs → phải = 0 (chỉ còn Roboto).
   ```powershell
   Select-String -Path "d:\taskflowfinal\docs\*.md" -Pattern "\bInter\b" -Recurse
   ```
5. **SMTP vars present:** Grep `SMTP_HOST` trong `requirements.md` và `AGENTS.md` → phải có.
6. **Tick enforcement:** Grep `KHÔNG ĐƯỢC QUÊN` trong `agent-master-prompt.md` → phải có.
7. **App Shell task present:** Grep `Build App Shell` trong `tasks.md` → phải có.
8. **TopBar component:** Grep `TopBar` trong `tasks.md` → phải có ít nhất 2 match.
9. **errorHandler middleware:** Grep `errorHandler` trong `requirements.md` → phải có ít nhất 2 match.
10. **Color swatch:** Grep `color swatch` trong `ui-wireframes.md` hoặc `design-system.md` → phải có.
11. **Build Order rule:** Grep `BUILD ORDER` trong `agent-master-prompt.md` → phải có.
12. **Default route redirect:** Grep `redirect.*login` trong `requirements.md` → phải có match cho root route `/`.

### Manual Review (User kiểm tra)
1. Đọc lại `agent-master-prompt.md` → xác nhận **7 QUY TẮC** + **17 ANTI-PATTERNS** + tick [x] enforcement.
2. Đọc lại `tasks.md` → xác nhận:
   - Milestone 0 có task **"Build App Shell Layout"** với CONSTRAINTS
   - Mỗi FR có block CONSTRAINTS, DEPENDS ON, và Smoke Tests
   - Smoke Test Milestone 0 bao gồm verify Sidebar + TopBar
3. Đọc lại `requirements.md` → xác nhận:
   - Prisma schema không còn `username`
   - Register không tạo project mặc định
   - Mention dùng `@[Name](userId)`
   - FR-03 có RBAC enforcement chi tiết
   - Error Handler middleware spec đầy đủ
   - Route `/` redirect logic
   - Prisma v7 init warning
4. Đọc lại `design-system.md` → xác nhận font Roboto + Tailwind config đúng + Color Swatch spec.
5. Đọc lại `ui-wireframes.md` → xác nhận:
   - Login/Register wireframe mới đã premium hơn
   - Sidebar có QuickCreateButton "+ Tạo Task"
   - Color Picker Rule ghi rõ swatch (không text)

---

## Tổng Kết Thay Đổi

| File | Số Thay Đổi | Loại |
|---|---|---|
| `agent-master-prompt.md` | 8 | Thêm rules (QUY TẮC 7: Build Order), 17 anti-patterns, sửa verify step, tăng cường tick [x] |
| `AGENTS.md` | 3 | Thêm SMTP config, clarify toast, note username |
| `requirements.md` | 12 | Xóa username, bỏ default project, fix interceptor, SMTP env, fix mention, RBAC project, Prisma v7, errorHandler, default route, project description markdown |
| `tasks.md` | 10 | Thêm App Shell task, smoke tests (Milestone 0+1), micro-context constraints, dependency chains |
| `design-system.md` | 3 | Đổi font Inter→Roboto, Tailwind fontFamily config, Color Swatch spec |
| `ui-wireframes.md` | 6 | Fix toast, xóa username, nâng cấp Login/Register UI, Sidebar QuickCreate, Color Picker Rule |
| **Tổng** | **42** | |
