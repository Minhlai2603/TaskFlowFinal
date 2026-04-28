# Plan: Sửa Lỗi Agentic Coding — TaskFlow Docs

**Phạm vi:** Chỉ sửa 3 file: `requirements.md`, `tasks.md`, `design-system.md`.  
**Nguyên tắc:** Không thêm tính năng mới. Chỉ làm rõ, thống nhất, và sửa các điểm mơ hồ.  
**Tổng số vấn đề cần sửa:** 30

---

## 🔴 CRITICAL — Sửa trước (Blocking, Agent implement sai hoàn toàn)

### Fix C-1: Xung đột Pagination Strategy (Kanban)
**File:** `requirements.md` (FR-08) và `tasks.md` (Milestone 2 / FR-08)

**Vấn đề:** `requirements.md` nói "Cursor-based **hoặc** Offset/Limit", còn `tasks.md` nói "loại trừ Cursor-based".

**Fix:**
- Trong `requirements.md` FR-08: đổi thành **"Offset/Limit Pagination (limit mặc định = 50). Không dùng Cursor-based ở MVP."**
- Trong `tasks.md` Milestone 2 / FR-08: giữ nguyên chữ "loại trừ Cursor-based" — đã đúng, chỉ cần đồng bộ với requirements.

---

### Fix C-2: Prisma Schema — Escape `\n` literal bị lỗi (Notification)
**File:** `requirements.md` dòng 241

**Vấn đề:** Dòng schema của `Notification` model chứa ký tự `\n` literal thay vì xuống dòng thật, khiến 2 relations (`task`, `comment`) không hợp lệ khi paste vào Prisma.

**Fix:** Tách dòng 241 thành 4 dòng riêng biệt:
```prisma
  user      User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  task      Task?     @relation(fields: [task_id], references: [id], onDelete: SetNull)
  comment   Comment?  @relation(fields: [comment_id], references: [id], onDelete: SetNull)
```

---

### Fix C-3: Prisma Schema — Escape `\n` literal bị lỗi (InviteToken)
**File:** `requirements.md` dòng 254

**Vấn đề:** Relation `workspace` và `inviter` của `InviteToken` bị dính vào 1 dòng với `\n` literal.

**Fix:** Tách thành 2 dòng riêng:
```prisma
  workspace Workspace @relation(fields: [workspace_id], references: [id], onDelete: Cascade)
  inviter   User      @relation("InvitedBy", fields: [invited_by], references: [id], onDelete: Cascade)
```

---

### Fix C-4: Xung đột Task Description — Plain Text vs Markdown
**File:** `requirements.md` (schema comment dòng 168 vs FR-04 dòng 309)

**Vấn đề:** Schema comment ghi `lưu Plain text` nhưng FR-04 lại dùng `react-markdown` + `remark-gfm` và `![image](url)` — mâu thuẫn hoàn toàn.

**Fix:**
- Trong schema Prisma, đổi comment của `description` thành: `// Max 5000 chars, lưu Markdown text (hỗ trợ image URL syntax)`
- Trong FR-04: xóa cụm "Plain text", thay bằng: `"Title < 200 ký tự plain text. Description < 5000 ký tự Markdown (sanitized via sanitize-html trước khi lưu DB)."`

---

## 🟠 HIGH — Thiếu spec, Agent phải đoán

### Fix H-1: Thiếu API `GET /api/projects` (list all projects)
**File:** `requirements.md` FR-03

**Vấn đề:** Chỉ có spec `GET /api/projects/:id`, không có spec cho list endpoint.

**Fix:** Thêm vào FR-03:
```
- **GET /api/projects**: List tất cả projects trong workspace hiện tại.
  - Filter: WHERE workspace_id = :workspaceId AND deleted_at IS NULL
  - Response: Array of { id, name, description, color, archived_at, totalTasks, doneTasks }
  - Sort: ORDER BY created_at DESC
  - Note: Trả về cả archived projects (FE tự filter/group nếu cần).
```

---

### Fix H-2: Thiếu API `GET /api/tasks/:id/activity`
**File:** `requirements.md` — cần thêm vào FR-04 hoặc tạo FR-10 riêng

**Vấn đề:** FR-10 được nhắc như tính năng nhưng API GET activity log không được định nghĩa.

**Fix:** Thêm vào section FR-04 (hoặc tạo section FR-10 Activity Log riêng):
```
- **GET /api/tasks/:id/activity**: Lấy danh sách activity log của 1 task.
  - Auth: Bất kỳ member nào trong workspace đều xem được.
  - Response: Array of { id, action_type, field_changed, old_value, new_value, created_at, user: { id, name } }
  - Sort: ORDER BY created_at ASC
```

---

### Fix H-3: Làm rõ Kanban Endpoint URL đầy đủ
**File:** `requirements.md` FR-08

**Vấn đề:** URL `api/workspaces/.../tasks` mơ hồ.

**Fix:** Thay bằng URL cụ thể:
```
GET /api/tasks
Query params: projectId (optional), assigneeId (optional), status (optional), page (default 1), limit (default 50)
workspace_id: lấy từ header x-workspace-id (KHÔNG đặt trong query param để tránh auth bypass)
```

---

### Fix H-4: Làm rõ `@mention` dùng field nào của User
**File:** `requirements.md` FR-06

**Vấn đề:** `User` model không có field `username`. Regex match cái gì?

**Fix:** Thêm vào FR-06:
```
@mention parser: Regex /@(\w+)/g match phần đầu tiên của user.name (trước dấu space, không phân biệt hoa/thường).
VD: User "Nguyen Van A" → mention bằng @Nguyen.
Backend: query WHERE LOWER(SPLIT_PART(name, ' ', 1)) = LOWER(:mention) AND workspace_id = :id.
Frontend: Gợi ý autocomplete danh sách member khi user gõ @.
```

---

### Fix H-5: Làm rõ Register → Invite flow (auto-accept token)
**File:** `requirements.md` FR-02

**Vấn đề:** Sau khi register qua link invite thì token có auto-accept không?

**Fix:** Thêm vào FE Flow Invite:
```
Nếu user chưa có account → redirect /register?invite=TOKEN.
Sau khi register thành công, backend nhận invite token từ body/query và tự động:
1. Accept token (JOIN workspace với role trong InviteToken).
2. Mark InviteToken.accepted_at = NOW().
3. Gửi Notification INVITE_ACCEPTED cho Admin.
Không yêu cầu thêm bước nào từ phía user.
```

---

### Fix H-6: Làm rõ `POST /api/upload` — ai được upload & form field name
**File:** `requirements.md` FR-04

**Vấn đề:** Không nói ai được upload, multipart key tên gì.

**Fix:** Thêm vào spec `POST /api/upload`:
```
- Auth: Bất kỳ authenticated user nào trong workspace đều có thể upload.
- Request: multipart/form-data với field name là "file" (single file duy nhất).
- Validation: Chỉ chấp nhận image/jpeg, image/png, image/webp, image/gif. Size < 5MB.
- Throw 413 nếu quá dung lượng. Throw 415 nếu sai định dạng file MIME type.
- Thư viện: multer (middleware Express) + cloudinary SDK.
```

---

### Fix H-7: Làm rõ TASK_DUE_SOON trigger mechanism
**File:** `requirements.md` FR-09

**Vấn đề:** "Background Sync hoặc Endpoint trigger" — mơ hồ, Railway không có cron built-in.

**Fix:** Quyết định rõ:
```
TASK_DUE_SOON trigger: Implement bằng in-request check.
Khi user gọi GET /api/notifications, backend thực hiện query phụ:
  WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '24h'
  AND status != 'DONE' AND assignee_id = req.user.id AND deleted_at IS NULL
Với mỗi task tìm được, tạo Notification nếu chưa có (dedup bằng application-layer check, xem Fix H-8).
Không cần cron job riêng cho MVP.
```

---

### Fix H-8: Làm rõ Dedup Constraint DUE_SOON — DB hay Application?
**File:** `requirements.md` FR-09

**Vấn đề:** Unique constraint `(task_id, type, DATE(created_at))` không có trong Prisma schema.

**Fix:** Dedup bằng **application layer** (không dùng DB unique constraint vì DATE() function khó map trong Prisma):
```
Trước khi tạo Notification DUE_SOON, query:
  WHERE task_id = :taskId AND type = 'TASK_DUE_SOON'
  AND created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'
Nếu đã tồn tại → skip, không tạo duplicate.
```

---

### Fix H-9: Làm rõ REASSIGN_NEEDED — gửi cho Manager nào?
**File:** `requirements.md` FR-02

**Vấn đề:** "gửi Notice REASSIGN_NEEDED cho Manager" — Manager nào?

**Fix:**
```
Gửi notification REASSIGN_NEEDED cho TẤT CẢ user có role = 'MANAGER' trong cùng workspace
(query WorkspaceMember WHERE role = 'MANAGER' AND workspace_id = :workspaceId).
```

---

### Fix H-10: Clarify Restore Project — restore Tasks nào?
**File:** `requirements.md` FR-03

**Vấn đề:** Không rõ restore tasks "cùng batch" hay tất cả tasks đã soft-delete.

**Fix:**
```
Khi restore Project (PATCH /api/projects/:id/restore):
- Chỉ restore các Tasks có deleted_at >= Project.deleted_at - 1s (tức là bị xóa cùng lúc với Project).
- Tasks bị user xóa riêng lẻ trước đó KHÔNG được restore.
- Implement: Lưu field batch_delete_id (UUID) vào cả Project và Tasks khi soft-delete.
  Khi restore: updateMany Tasks WHERE batch_delete_id = Project.batch_delete_id.
- Cần thêm field batch_delete_id String? vào model Task và Project trong schema.prisma.
```

---

### Fix H-11: Xác nhận Settings page — out of scope
**File:** `requirements.md` Section 6 Layout

**Vấn đề:** Sidebar diagram có "─ Set" nhưng không có spec.

**Fix:** Thêm note vào Section 6:
```
⚠️ Settings page: OUT OF SCOPE cho MVP.
Sidebar chỉ render 4 nav links: My Tasks, Team, Projects, Reports.
```
Và xóa "─ Set" khỏi layout diagram.

---

### Fix H-12: Typo — Reports guard
**File:** `requirements.md` dòng 350

**Vấn đề:** "chỉ Member Admin và Manager" — typo.

**Fix:** Đổi thành: "Chỉ **Admin và Manager** được xem Reports. Member truy cập → 403 → redirect `/app/my-tasks`."

---

## 🟡 MEDIUM — Thiếu context giữa các session

### Fix M-1: Thêm mapping FR-10 rõ ràng vào `tasks.md`
**Fix:** Cập nhật header task FR-10: `(Mapping: requirements.md -> Phần 3 / FR-10 Activity Log)`.  
Thêm checklist: `[Backend] Build GET /api/tasks/:id/activity (xem Fix H-2 của plan này).`

---

### Fix M-2: Thêm checklist `GET /api/auth/me` vào FR-01
**File:** `tasks.md` Milestone 1 / FR-01

**Fix:** Thêm vào Implementation:
```
- [ ] [Backend] Build GET /api/auth/me: verify JWT, trả về { id, name, email } (exclude password_hash). Dùng để hydrate authStore khi reload page.
- [ ] [Frontend] authStore init: gọi /api/auth/me để restore session nếu token còn tồn tại trong localStorage.
```

---

### Fix M-3: Thêm DoD verify auto-create Workspace + Project
**File:** `tasks.md` Milestone 1 / FR-01

**Fix:** Thêm vào DoD:
```
- [ ] Verify: Register thành công → DB tự tạo 1 Workspace tên "Workspace của {name}" và 1 Project tên "Dự án đầu tiên". User được gắn role ADMIN.
```

---

### Fix M-4: Thêm Cloudinary setup vào Milestone 0
**File:** `tasks.md` Milestone 0

**Fix:** Thêm vào Infrastructure setup:
```
- [ ] Tạo Cloudinary account (free tier). Lấy CLOUDINARY_URL, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET. Cấu hình vào /backend/.env.
```

---

### Fix M-5: Tạo file `AGENT_STATE.md`
**File:** Mới — `d:\taskflowfinal\docs\AGENT_STATE.md`

**Fix:** Tạo template:
```markdown
# Agent State — TaskFlow MVP
Đọc file này mỗi khi bắt đầu session mới. Cập nhật sau mỗi Milestone.

## Decisions Đã Chốt
| Decision | Value |
|----------|-------|
| Pagination Kanban | Offset/Limit, limit=50 |
| @mention match field | user.name (first word, case-insensitive) |
| DUE_SOON trigger | In-request check khi GET /api/notifications |
| Settings page | OUT OF SCOPE MVP |
| Task description format | Markdown (stored as-is, rendered by react-markdown) |

## Tiến Độ Hiện Tại
- [ ] Milestone 0
- [ ] Milestone 1
- [ ] Milestone 2
- [ ] Milestone 3
- [ ] Milestone 4+5

## Ghi Chú / Blockers
(Ghi vào đây khi gặp vấn đề để session sau tiếp tục)
```

---

### Fix M-6: Thêm "Getting Started" section đầu `tasks.md`
**File:** `tasks.md`

**Fix:** Thêm vào đầu file (sau phần LƯU Ý):
```markdown
## 🚀 Getting Started (Đọc mỗi session mới)
1. Đọc `docs/AGENT_STATE.md` để nắm tiến độ.
2. Start Backend: `cd backend && npm run dev` (Port 4000)
3. Start Frontend: `cd frontend && npm run dev` (Port 3000)
4. Migrate DB: `cd backend && npx prisma migrate dev`
5. (Nếu cần seed): `cd backend && npx prisma db seed`
```

---

## 🔵 LOW — Lỗi nhỏ / Typo / Design gaps

### Fix L-1: Z-index `\n` literal trong `design-system.md`
**File:** `design-system.md` dòng 81

**Fix:** Tách Z-Index System thành các dòng riêng, xóa `\n` literal trong chuỗi text.

---

### Fix L-2: Thêm Sidebar Active/Inactive State
**File:** `design-system.md` Section 4

**Fix:** Thêm vào mô tả Sidebar:
```
- Active NavLink: bg-indigo-50 text-indigo-700 font-medium rounded-md
- Inactive NavLink: text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-md
```

---

### Fix L-3: Thêm Input default state
**File:** `design-system.md` Section 3.2

**Fix:** Thêm trước phần error state:
```
- Input Default: border border-slate-300 rounded-md h-9 px-3 text-sm bg-white
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
```

---

### Fix L-4: Thêm spec Bar Chart library
**File:** `design-system.md` — thêm section mới 3.5

**Fix:**
```markdown
### 3.5. Data Visualization (Recharts)
- Thư viện: Recharts (compatible Next.js, nhẹ, không cần canvas setup).
- Bar Chart màu cột: fill="#4f46e5" (indigo-600, đồng bộ brand color).
- Tooltip: bg-white border border-slate-200 shadow-sm rounded-md text-sm.
- isAnimationActive={false} ở MVP để giảm re-render.
```

---

### Fix L-5: Thêm spec Notification Dropdown UI
**File:** `design-system.md` — thêm vào Section 3.4 hoặc 4

**Fix:**
```markdown
### Notification Dropdown
- Width: w-80 (320px), max-height: max-h-96 overflow-y-auto
- Unread item: bg-indigo-50, border-l-2 border-indigo-600
- Read item: bg-white hover:bg-slate-50
- Empty state: text-slate-500 text-sm, centered text "Không có thông báo nào."
```

---

## 📋 Thứ Tự Thực Thi

```
Bước 1: Fix C-1 → C-4   → requirements.md (Critical)
Bước 2: Fix H-1 → H-12  → requirements.md (High)
Bước 3: Fix L-1 → L-5   → design-system.md (Low)
Bước 4: Fix M-1 → M-4   → tasks.md (Medium)
Bước 5: Fix M-5          → Tạo mới AGENT_STATE.md
Bước 6: Fix M-6          → tasks.md (Getting Started)
```

**Tổng:** 3 file chỉnh sửa + 1 file tạo mới (`AGENT_STATE.md`)
