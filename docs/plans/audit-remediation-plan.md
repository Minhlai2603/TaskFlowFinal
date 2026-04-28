# Kế Hoạch Khắc Phục Lỗi Kiểm Toán Tài Liệu (Audit Remediation Plan)

**Nguồn:** [audit_report.md](file:///C:/Users/Admin/.gemini/antigravity/brain/ff7f1c38-1b97-4d71-b6e2-25bf2df8b194/audit_report.md)  
**Ngày:** 2026-04-28  
**Nguyên tắc:** KHÔNG chỉnh sửa file nào trước khi User approve plan này.

---

## Tổng quan thay đổi

| # | Mức độ | File bị ảnh hưởng | Mô tả ngắn |
|---|--------|--------------------|-------------|
| C-01 | 🔴 CRITICAL | `requirements.md` | Tạo section `### FR-10: Activity Log` riêng |
| C-02 | 🔴 CRITICAL | `ui-wireframes.md` | Cập nhật Auth layout → **⚠️ CẦN USER QUYẾT ĐỊNH** |
| C-03 | 🔴 CRITICAL | `requirements.md` | Sửa diễn đạt RBAC Reports L619 |
| C-04 | 🔴 CRITICAL | `design-system.md` | Bỏ Logo khỏi Topbar, giữ Logo ở Sidebar |
| M-01 | 🟡 MODERATE | `requirements.md` | Thêm endpoint `GET /api/tasks/:taskId/activity-logs` |
| M-02 | 🟡 MODERATE | `tasks.md` | Thêm sub-tasks cho Settings page |
| M-03 | 🟡 MODERATE | `ui-wireframes.md` | Thêm wireframe Notification Dropdown |
| M-04 | 🟡 MODERATE | `tasks.md` | Mở rộng FR-03 sub-tasks cho Project Detail |
| M-05 | 🟡 MODERATE | `design-system.md` | Chốt Toast library = `sonner` |
| M-06 | 🟡 MODERATE | `design-system.md`, `ui-wireframes.md` | Thêm Settings vào Sidebar nav |
| M-07 | 🟡 MODERATE | `tasks.md` | Thêm task cho Error/404/403 pages |
| E-01→E-06 | 🟠 EDGE | `requirements.md` | Bổ sung 6 edge cases vào §5 |

---

## Chi tiết thay đổi theo file

---

### 1. [MODIFY] [requirements.md](file:///d:/taskflowfinal/docs/requirements.md)

#### Fix C-01 + M-01: Tạo section FR-10 Activity Log
Thêm heading mới `### FR-10: Activity Log` vào §3 (sau FR-09, trước FR-11) với nội dung:

```markdown
### FR-10: Activity Log
- **GET /api/tasks/:taskId/activity-logs**
  - Query params: `page` (default 0), `limit` (default 20)
  - Bắt buộc filter: `task.workspace_id = :workspaceId AND task.deleted_at IS NULL`
  - Sort: `created_at DESC`
  - Response: `{ success: true, data: { logs: ActivityLog[], total, page, limit } }`
  - Mỗi log entry: `{ id, action_type, field_changed, old_value, new_value, user: { id, name }, created_at }`
  - RBAC: Mọi member trong workspace đều xem được activity log của task thuộc workspace.
  - Không có DELETE/PATCH endpoint (immutable logs).
- **Testing Strategy:**
  - API Test: Verify log entries tạo đúng khi update task fields.
  - Unit Test: Map `old_value`/`new_value` string thành human-readable diff.
  - E2E: Mở Task Slide-over → Tab Activity → verify timeline render.
```

#### Fix C-03: Sửa diễn đạt RBAC Reports
**Dòng ~619**, thay đổi:

```diff
- `/app/reports` Guard chỉ Member Admin và Manager. Member thì đẩy vể `/app/my-tasks` có Toast "Không có quyền".
+ `/app/reports` Guard: Chỉ cho phép role ADMIN và MANAGER truy cập. Nếu role = MEMBER → redirect `/app/my-tasks` kèm Toast "Không có quyền".
```

#### Fix E-01→E-06: Bổ sung Edge Cases vào §5
Thêm 6 dòng mới vào bảng Edge Cases (§5):

| Trường Hợp | Giải Quyết |
|---|---|
| **API trả 429 (Rate Limit thường)** | FE intercept 429 → Toast "Bạn đang thao tác quá nhanh. Vui lòng chờ." + disable nút submit 5 giây. |
| **JWT hết hạn giữa thao tác form** | Trước redirect `/login`, lưu form draft vào `sessionStorage`. Sau login, restore draft nếu `from` param khớp. Tối thiểu hiện warning Toast trước redirect. |
| **Double-click / Race Condition submit** | Button submit BẮT BUỘC `disabled` khi `formState.isSubmitting = true`. Áp dụng toàn bộ form trong app. |
| **Cloudinary upload thất bại (timeout/5xx)** | FE hiện Toast "Upload ảnh thất bại, vui lòng thử lại." + cho phép submit task description không kèm ảnh (ảnh optional). |
| **Admin cuối cùng bị xóa khỏi Workspace** | BE check: nếu target là Admin duy nhất → 400 "Không thể xóa Admin cuối cùng. Hãy chỉ định Admin khác trước." |
| **Cron TASK_DUE_SOON dedup** | Ghi rõ query dedup: `WHERE task_id = :id AND type = 'TASK_DUE_SOON' AND created_at >= CURRENT_DATE`. |

---

### 2. [MODIFY] [design-system.md](file:///d:/taskflowfinal/docs/design-system.md)

#### Fix C-04: Loại Logo khỏi Topbar
**Dòng ~146**, thay đổi:

```diff
- **Topbar**: Cố định ngay cạnh trên cùng (...). Chứa khối Logo/Tên Workspace bên trái, Thanh Search Text Input ở trung tâm, Bell Notifications + User Avatar bên phải.
+ **Topbar**: Cố định ngay cạnh trên cùng (...). Chứa Thanh Search Text Input bên trái/trung tâm, Bell Notifications + User Avatar bên phải. (Logo nằm ở Sidebar theo `ui-wireframes.md`).
```

#### Fix M-05: Chốt Toast = `sonner`
**Dòng ~125**, thay đổi:

```diff
- **Toast Notifications**: Sử dụng `sonner` hoặc `react-toastify` (useToast()).
+ **Toast Notifications**: BẮT BUỘC sử dụng `sonner` (KHÔNG dùng `react-toastify`). Import: `import { toast } from 'sonner'`.
```

#### Fix M-06: Thêm Settings vào Sidebar NavLinks
**Dòng ~147**, thay đổi:

```diff
- Render NavLinks: My Tasks, Team, Project, Reports.
+ Render NavLinks: My Tasks, Team, Projects, Reports, Settings.
```

---

### 3. [MODIFY] [ui-wireframes.md](file:///d:/taskflowfinal/docs/ui-wireframes.md)

#### Fix C-02: Auth Screen Layout — ⚠️ CẦN USER QUYẾT ĐỊNH (xem phần Câu hỏi bên dưới)

**Nếu User chọn Phương án A (Split-Screen):** Thay toàn bộ §2.1 bằng layout mới:
```text
[AuthContainer: flex min-h-screen]
 ├── [LeftPanel: hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center p-12]
 │    └── [QuoteBlock: text-white text-center]
 │         ├── [QuoteText: text-2xl font-light italic leading-relaxed]
 │         └── [QuoteAuthor: text-sm text-indigo-200 mt-4]
 └── [RightPanel: flex-1 flex items-center justify-center p-8 bg-slate-50]
      └── [AuthCard: w-full max-w-[400px]]
           ├── [Header: h1 text-2xl font-bold text-slate-900 mb-6]
           ├── [Form: flex flex-col gap-4 (React Hook Form)]
           │    ├── [InputGroup (Email)]
           │    ├── [InputGroup (Password)]
           │    └── [Button Submit: w-full bg-indigo-600]
           └── [Footer: text-sm text-slate-500 mt-4]
```

**Nếu User chọn Phương án B (Giữ Centered Card):** Không thay đổi §2.1.

#### Fix M-03: Thêm wireframe Notification Dropdown
Thêm section mới `### 3.3. Notification Dropdown` sau §3.2:

```text
### 3.3. Notification Dropdown (Bell Click → Dropdown)

[NotificationTrigger: relative]
 └── [BellIcon + UnreadBadge: absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full]

[NotificationDropdown: absolute right-0 top-full mt-2 w-[380px] bg-white border border-slate-200 rounded-lg shadow-lg z-50]
 ├── [DropdownHeader: flex justify-between items-center p-4 border-b border-slate-200]
 │    ├── [Title: font-semibold text-slate-900] → "Thông báo"
 │    └── [MarkAllRead: text-xs text-indigo-600 hover:underline cursor-pointer] → "Đánh dấu tất cả đã đọc"
 ├── [NotificationList: max-h-[400px] overflow-y-auto]
 │    └── [NotificationItem: flex gap-3 p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100]
 │         ├── [UnreadDot: w-2 h-2 rounded-full bg-indigo-600 mt-2 (ẩn nếu đã đọc)]
 │         ├── [Content: flex-1]
 │         │    ├── [Message: text-sm text-slate-700] → "Minh Tân đã assign bạn vào task 'Fix bug header'"
 │         │    └── [Timestamp: text-xs text-slate-400 mt-1] → "2 phút trước"
 │         └── [TaskLink: click → mở SlideOver panel task tương ứng]
 └── [EmptyState (nếu trống): p-8 text-center text-slate-400] → "Không có thông báo mới"
```

#### Fix M-06: Thêm Settings vào Sidebar NavMenu
**Dòng ~29**, thêm NavItem:

```diff
  │    │    ├── [NavItem (Projects)]
  │    │    └── [NavItem (Reports)]
+ │    │    └── [NavItem (Settings): chỉ hiển thị cho role ADMIN]
```

---

### 4. [MODIFY] [tasks.md](file:///d:/taskflowfinal/docs/tasks.md)

#### Fix M-02: Thêm sub-tasks Settings Page
Thêm vào FR-02 (sau L50), sub-task mới:

```markdown
    - [ ] [Frontend] Build Settings Page: Profile edit form (Name, Username — Email disabled), Workspace rename (Admin), Members table (list/edit role/remove), Invite Member form.
    - [ ] [Backend] `PATCH /api/auth/profile` → update name, username. Validate username unique + max 30 chars.
```

#### Fix M-04: Mở rộng FR-03 sub-tasks
Thêm vào FR-03 Implementation (sau L55):

```markdown
    - [ ] [Frontend] Build Project Detail page (`/app/projects/:id`): task list embedded, progress bar, filter tabs (All/To Do/In Progress/In Review/Done), archive badge, disable "New Task" button khi `archived_at != null`.
```

#### Fix M-07: Thêm task Error/404/403 pages
Thêm vào Milestone 0 (sau L22):

```markdown
- [ ] **Error & Fallback Pages** (Mapping: `requirements.md` → Phần 6 / NFR-05)
  - [ ] [Frontend] Tạo `error.tsx` (global error boundary, nút "Thử lại", tiếng Việt).
  - [ ] [Frontend] Tạo `not-found.tsx` (404 page, link về trang chính).
  - [ ] [Frontend] Tạo component `<AccessDenied />` (hiển thị khi 403, redirect button).
```

---

## Câu hỏi cần User trả lời trước khi thực hiện

> [!IMPORTANT]
> **Câu 1 — Auth Layout (C-02):** Bạn muốn chọn phương án nào cho màn hình Login/Register?
> - **A) Split-Screen** (quote bên trái + form bên phải, như đã thảo luận trước đó)
> - **B) Centered Card** (giữ nguyên layout hiện tại trong `ui-wireframes.md`)

> [!IMPORTANT]
> **Câu 2 — Settings Nav:** Settings link trong Sidebar nên hiển thị cho **tất cả roles** (mọi user đều xem/sửa profile) hay **chỉ ADMIN** (vì Workspace settings chỉ Admin mới thấy)?

> [!IMPORTANT]
> **Câu 3 — Scope:** Bạn muốn tôi fix **tất cả 12 lỗi** (4 CRITICAL + 7 MODERATE + Edge Cases) trong lần này, hay chỉ fix **4 CRITICAL** trước và defer phần MODERATE + Edge Cases sang lần sau?

---

## Verification Plan

Sau khi thực hiện tất cả thay đổi, tôi sẽ chạy lại prompt `agent-review-prompt.md` trên toàn bộ 5 file đã sửa để xác nhận:
1. Không còn lỗi CRITICAL nào.
2. Điểm sẵn sàng tăng lên ≥ 90/100.
3. Cross-reference giữa các file đồng bộ.
