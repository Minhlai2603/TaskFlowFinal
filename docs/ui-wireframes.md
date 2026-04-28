# UI Wireframes & Layout Specs (TaskFlow MVP)

Tài liệu này chứa cấu trúc Giao diện UI/UX dưới dạng "Text-based Component Tree". Đây là xương sống để AI Agent thực hiện code frontend chính xác đến từng class CSS. Nguồn tham chiếu:
- Hiển thị (styling): `design-system.md`
- Chức năng (logic): `requirements.md`

Tất cả các file Component của Next.js (trong `src/app` và `src/features`) sẽ được code đúng theo sơ đồ bên dưới.

---

## 1. Global App Shell & Layout Skeleton (`/app/layout.tsx`)

Layout gốc bọc mọi trang nằm sau authentication.

### Điểm gãy giao diện (Breakpoint)
- **Mobile Fallback (`< 768px`)**: Hamburger menu, Component ẩn hiện đè màn hình.
- **Desktop (`>= 1024px`)**: Bố cục tiêu chuẩn Grid/Flex như sau.

### Cấu trúc cơ sở (Root Layout)
```text
[AppShell: flex h-screen w-full bg-slate-50 overflow-hidden]
 │
 ├── [Sidebar: w-64 border-r border-slate-200 bg-white flex flex-col hidden md:flex]
 │    ├── [LogoBlock: h-14 flex items-center px-6 border-b border-slate-200 font-bold]
 │    ├── [NavMenu: flex-1 py-4 flex flex-col gap-1 px-3]
 │    │    ├── [NavItem (My Tasks): flex outline-none ring-indigo-600 focus-visible:ring-2]
 │    │    ├── [NavItem (Team Kanban)]
 │    │    ├── [NavItem (Projects)]
 │    │    ├── [NavItem (Reports)]
 │    │    └── [NavItem (Settings)]
 │    ├── [QuickCreateButton: mx-3 mt-2 w-[calc(100%-24px)] h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm]
 │    │    └── Icon Plus + "Tạo Task" → onClick → mở <CreateTaskModal> global
 │    └── [UserBlock (Bottom): p-4 border-t border-slate-200 text-sm font-medium]
 │
 └── [MainContentArea: flex-1 flex flex-col relative]
      ├── [TopBar: h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-50]
      │    ├── [Left: Mobile Hamburger Icon (md:hidden)]
      │    ├── [Center: Global Search Input w-96 max-w-full rounded bg-slate-100 text-sm]
      │    └── [Right: Notification Bell Dropdown + User Avatar]
      │
      └── [PageContainer: flex-1 overflow-y-auto p-4 md:p-6 relative]
           └── **(Vị trí render các màn hình chức năng bên dưới)**
```

---

## 2. Màn hình Chức năng cốt lõi (Pages)

### 2.1. Authentication Screens (`/login`, `/register`)
Sử dụng layout 2 cột (Split-Screen) — cột trái hiển thị hero content + feature list, cột phải chứa form đăng nhập/đăng ký.

```text
[AuthContainer: flex min-h-screen]
 ├── [LeftPanel: hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex-col items-center justify-center p-12 relative overflow-hidden]
 │    ├── [BGDecor: absolute inset-0 opacity-10] → SVG pattern hoặc subtle geometric shapes (circles, dots grid)
 │    └── [HeroContent: z-10 text-center max-w-md]
 │         ├── [AppLogo: flex items-center justify-center gap-3 mb-10]
 │         │    ├── [LogoIcon: w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm]
 │         │    └── [LogoText: text-white font-bold text-3xl tracking-tight] → "TaskFlow"
 │         ├── [Tagline: text-xl font-light text-indigo-100 leading-relaxed mb-8]
 │         │    → "Quản lý công việc thông minh. Đơn giản. Hiệu quả. Cho mọi team."
 │         ├── [FeatureList: flex flex-col gap-3 text-left]
 │         │    ├── [Feature: flex items-center gap-3 text-indigo-200 text-sm] → ✓ Kanban board trực quan
 │         │    ├── [Feature] → ✓ Theo dõi tiến độ real-time
 │         │    └── [Feature] → ✓ Báo cáo team thông minh
 │         └── [TrustBadge: mt-10 text-xs text-indigo-300/70] → "Được tin dùng bởi 1,000+ teams"
 └── [RightPanel: flex-1 flex items-center justify-center p-8 bg-slate-50]
      └── [AuthCard: w-full max-w-[420px] bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100]
           ├── [MobileLogo (lg:hidden): flex items-center gap-2 mb-6 justify-center]
           │    ├── [LogoIcon: w-8 h-8 bg-indigo-600 rounded-lg]
           │    └── [LogoText: font-bold text-xl text-slate-900] → "TaskFlow"
           ├── [Header: mb-6]
           │    ├── [Title: h1 text-2xl font-bold text-slate-900] → "Chào mừng trở lại" / "Tạo tài khoản mới"
           │    └── [Subtitle: text-sm text-slate-500 mt-1] → "Đăng nhập để tiếp tục quản lý công việc" / "Bắt đầu miễn phí, không cần thẻ tín dụng"
           ├── [Form: flex flex-col gap-4 (React Hook Form)]
           │    ├── [InputGroup (Email): label text-sm font-medium text-slate-700 + Input h-11 rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all]
           │    ├── [InputGroup (Password): có toggle show/hide icon bên phải]
           │    ├── [InputGroup (Name): CHỈ ở Register — KHÔNG có Username]
           │    └── [Button (Submit): w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm shadow-indigo-600/25 hover:shadow-md hover:shadow-indigo-600/30]
           └── [Footer: text-sm text-center text-slate-500 mt-6]
                └── "Chưa có tài khoản?" + [Link: text-indigo-600 hover:text-indigo-700 font-medium hover:underline] → "Đăng ký ngay"
```

### 2.1.1. Invite Accept Screen (`/invite?token=xxx`)
Màn hình public (không cần auth). Hiển thị khi người dùng click vào link invite email.

**Trường hợp 1 — Token hợp lệ, user chưa có tài khoản:**
```text
[InviteContainer: flex items-center justify-center min-h-screen bg-slate-50]
 └── [InviteCard: bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-[400px] text-center]
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

### 2.2. Màn hình Cá nhân - My Tasks (`/app/my-tasks`)
Liệt kê danh sách các task của bản thân, sắp xếp ưu tiên overdue.

```text
[PageRoot: flex flex-col h-full gap-6]
 ├── [PageHeader: flex justify-between items-center]
 │    ├── [Title: h1 text-2xl font-bold] -> "Công việc của tôi"
 │    └── [Actions: Button "+ New Task"] -> Mở khung Tạo Task (Modal)
 │
 ├── [FilterTabs: flex gap-4 text-sm font-medium border-b border-slate-200 pb-2] → All / To Do / In Progress / In Review
 │    (LƯU Ý: Tab DONE bị ẩn — My Tasks chỉ show TO_DO, IN_PROGRESS, IN_REVIEW. DONE tasks không xuất hiện)
 │
 └── [TaskListContainer: flex flex-col gap-3 overflow-y-auto]
      ├── *(Nếu Trống)* -> [EmptyState: flex items-center flex-col gap-2 text-slate-500 py-10] -> "Bạn chưa có task nào"
      │
      └── *(Data map)* -> [TaskListItem: flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm transition cursor-pointer]
           ├── [LeftInfo: flex flex-col gap-1]
           │    ├── [TitleRow: flex items-center gap-2 text-slate-900 font-semibold]
           │    └── [MetaRow: flex gap-3 text-xs text-slate-500] 
           │         ├── [ProjectDotBadge] -> (Tham chiếu ProjectColor Enum db)
           │         └── [DueDateBadge] -> (Nếu overdue: text-red-600 bg-red-50 p-1, ngược lại bình thường)
           │
           └── [RightStatus: StatusBadge] -> (Enum UI TO_DO, IN_PROGRESS...)
```

### 2.3. Màn hình Kanban Board (`/app/team`)
Quản lý tổng quan tiến độ của project team, kéo thả (Dnd-kit). Khi di chuyển Card hoặc đổi cột, BẮT BUỘC sử dụng view transitions (`@d:\taskflowfinal\.agents\skills\vercel-react-view-transitions\SKILL.md`) để có UI chuẩn ứng dụng đỉnh cao. Trên mobile sẽ fallback về dạng click select.

```text
[PageRoot: flex flex-col h-full overflow-hidden (ko scroll ngang dọc tại flex page)]
 ├── [PageHeader: h1 Title + Filters(Assignee, Priority, Due Date)]
 │
 └── [KanbanBoardContainer: flex-1 flex gap-6 overflow-x-auto pb-4]
      └── [DndContext: bọc toàn bộ cột]
           │
           ├── [Column (TO DO): w-80 min-w-[320px] flex flex-col gap-4 bg-slate-100 rounded-lg p-4]
           │    ├── [ColumnHeader: flex justify-between items-center]
           │    │    ├── [Title: font-bold text-slate-700]
           │    │    └── [CountBadge: bg-slate-200 text-xs px-2 rounded-full]
           │    ├── *(IntersectionObserver top)*
           │    ├── [CardList: flex flex-col gap-3 overflow-y-auto min-h-[50px]]
           │    │    └── [TaskCardComponent (Draggable): bg-white p-4 shadow-sm rounded-md border border-slate-200 cursor-grab active:cursor-grabbing]
           │    │         ├── [CardTitle: text-sm font-medium text-slate-900]
           │    │         └── [CardFooter: flex justify-between items-center mt-3]
           │    │              ├── [PriorityIcon: LOW/MED/HIGH/URGENT]
           │    │              └── [AssigneeAvatar: w-6 h-6 rounded-full]
           │    └── *(IntersectionObserver bottom - Infinity Load)*
           │
           ├── [Column (IN PROGRESS)]
           ├── [Column (IN REVIEW)]
           └── [Column (DONE)]

**Kanban Filter UI:**
- **Assignee**: Multiple Select (Popover + Checkbox list hiển Avatar + Name). Query param format: `?assignee_id=uuid1&assignee_id=uuid2` (multi-key). Backend parse: `req.query.assignee_id` sẽ là `string | string[]` — dùng `[].concat(req.query.assignee_id)` để normalize.
- **Project**: Single Select Dropdown (All / [tên project trong workspace]) — query param `?project_id=`
- **Priority**: Dropdown (All, Low, Med, High, Urgent)
- **Due Date**: Date Range Picker (Optional)
```

### 2.4. Màn hình Reports (Chỉ Manager/Admin) (`/app/reports`)
Chart và số liệu của member.

```text
[PageRoot: flex flex-col gap-6]
 ├── [Header: h1 text-2xl font-bold] -> "Team Reports"
 │
 ├── [ChartSection: p-6 bg-white border border-slate-200 rounded-xl shadow-sm]
 │    ├── [ChartTitle: h2 text-lg font-semibold mb-4] -> "Tasks Completed Mới Nhất"
 │    └── [BarChartComponent: h-[300px] w-full] -> (Render biểu đồ cột tương quan theo 4 tuần gần nhất)
 │
 └── [TableSection: p-6 bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto]
      └── [MetricsTable: w-full text-left text-sm]
           ├── [Thead: bg-slate-50 border-b border-slate-200] -> (Member | Assigned | Completed | Overdue | %)
           └── [Tbody: phân tách border-b rows]
                 └── [Tr (hover:bg-slate-50 cursor-pointer)] -> Click sẽ link sang Kanban filter User.
```

### 2.5. Màn hình Cài đặt - Settings (`/app/settings`)
Quản lý Profile và Workspace (Admin only).

```text
[PageRoot: flex flex-col gap-8]
 ├── [Header: h1 text-2xl font-bold] -> "Cài đặt"
 │
 ├── [Section: Profile]
 │    ├── [Title: h2 text-lg font-semibold]
 │    └── [Form: grid grid-cols-2 gap-4] → Email (disabled), Name
 │
 └── [Section: Workspace (Admin Only)]
      ├── [Tabs: flex gap-4 border-b] -> General / Members
      │
      ├── *(Tab General)*
      │    └── [Form: Name, Archive Project...]
      │
      └── *(Tab Members)*
           ├── [Header: List Members + Button "Invite Member"]
           └── [Table: Name | Email | Role | Actions (Edit/Remove)]
```

### 2.6. Màn hình Dự án - Projects (`/app/projects`)
Danh sách và quản lý Project.

```text
[PageRoot: flex flex-col gap-6]
 ├── [PageHeader: flex justify-between]
 │    ├── [Title: h1] -> "Dự án"
 │    └── [Actions: Button "+ New Project"]
 │
 └── [ProjectGrid: grid grid-cols-1 md:grid-cols-3 gap-4]
      └── [ProjectCard: p-4 bg-white border border-slate-200 rounded-lg]
           ├── [ColorHeader: w-full h-2 rounded-t-lg] → (bg-color-500)
           ├── [Title: font-semibold text-slate-900 mt-2]
           ├── [Stats: text-xs text-slate-500] → "{done}/{total} tasks"
           └── [Footer: flex justify-end] → Icon Edit, Delete

> **COLOR PICKER RULE:** UI chọn màu project PHẢI hiển thị dưới dạng color swatch (hình tròn/ô vuông tô màu thực tế),
> KHÔNG được hiển thị text tên màu (VD: "RED", "BLUE"). Mỗi swatch là `w-6 h-6 rounded-full bg-{color}-500 cursor-pointer
> ring-2 ring-offset-2 ring-transparent hover:ring-indigo-500 transition`. Swatch đang chọn có `ring-indigo-600`.
```

---

## 3. Overlays & Slide-Over Panel (Global Context)

### 3.1. Chức năng Xem/Sửa chi tiết Task (Slide-over Panel)
Component này được nạp đè dưới dạng `<Sheet side="right">` trên nền toàn hệ thống. BẮT BUỘC trượt mượt thông qua API Transitions (`@d:\taskflowfinal\.agents\skills\vercel-react-view-transitions\SKILL.md`) để UX được êm ái.

```text
[SlideOverMask: z-40 fixed inset-0 bg-black/20] -> Nền tối mờ.
 └── [SlideOverPanel: fixed top-0 right-0 h-full w-full md:w-[480px] bg-white shadow-xl flex flex-col animate-in slide-in-from-right]
      │
      ├── [PanelHeader: flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 sticky top-0]
      │    ├── [Left: ProjectDotBadge + StatusDropdownTrigger]
      │    └── [Right: CloseButton] -> Icon X, z-index cao
      │
      ├── [PanelBody: flex-1 overflow-y-auto px-6 py-6]
      │    ├── [TitleEditArea: text-2xl font-bold text-slate-900 focus:outline-none focus:bg-slate-50 mb-4]
      │    ├── [MetaGrid: grid grid-cols-2 gap-4 text-sm border-b border-slate-200 pb-6 mb-6]
      │    │    ├── [Col 1: Assignee + Due Date]
      │    │    └── [Col 2: Priority (Enum mapping)]
      │    │
      │    ├── [DescriptionArea: Markdown View (`react-markdown`)]
      │    │
      │    └── [TabsContainer: flex flex-col gap-4 mt-8] (Tabs: Comments / Activity Log)
      │         ├── *(Tab Comments)* -> Lặp [CommentItem]
      │         │    └── [CommentInputArea: relative]
      │         │         ├── [Textarea: rows=3 placeholder="Viết bình luận... Gõ @ để mention"]
      │         │         ├── [MentionDropdown (hiện khi gõ @): absolute bottom-full left-0 w-[250px] bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto]
      │         │         │    └── [MentionItem (lặp lại): flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer]
      │         │         │         ├── [Avatar: w-6 h-6 rounded-full bg-slate-200]
      │         │         │         └── [Name: text-sm text-slate-700] -> chọn: insert @[Name](userId) vào textarea
      │         │         └── [SubmitButton: primary h-9 px-4] -> POST /api/tasks/:id/comments
      │         └── *(Tab Activity)* -> Lặp [LogItem: "Created task at..." text-xs text-slate-500 timeline]
      │
      └── [PanelFooter: p-4 border-t border-slate-200 bg-white sticky bottom-0] -> (Xóa Task / Copy Link)
```

### 3.2. Form Tạo Mới Task Modal (`<Dialog>`)
Form tạo mới sẽ bật lên che màn hình.

```text
[ModalOverlay: z-[60] fixed inset-0 bg-black/20]
 <!-- z-[60] cao hơn TopBar (z-50) nhưng thấp hơn Toast (z-[100]); shadcn Dialog dùng Radix Portal nên tự động escape context -->
 └── [ModalContent: bg-white rounded-lg shadow-xl w-full max-w-lg p-6]
      ├── [ModalTitle: h2] -> "Tạo Task Mới"
      ├── [FormContainer (React Hook Form)]
      │    ├── [Input Title: require]
      │    ├── [Select Project: require]
      │    ├── [Select Assignee: useAvatar + name]
      │    ├── [Select Priority: Dot + Label (LOW-Urgent)]
      │    ├── [Select Status default To Do]
      │    ├── [DatePicker Due Date: Optional — shadcn/ui <Popover> + <Calendar> component]
      │    ├── [Textarea Description]
      │    └── [FooterButtons: flex justify-end gap-2] -> [Cancel (ghost)] + [Create Task (primary)]
```

### 3.3. Form Tạo/Sửa Dự án Modal (`<Dialog>`)
Form tạo và sửa project. Mở từ nút "+ New Project" hoặc Edit icon trên ProjectCard.

```text
[ModalOverlay: z-50 fixed inset-0 bg-black/20]
 └── [ModalContent: bg-white rounded-xl shadow-xl w-full max-w-lg p-6]
      ├── [ModalTitle: h2 text-lg font-semibold] -> "Tạo Dự án Mới" / "Chỉnh sửa Dự án"
      ├── [FormContainer (React Hook Form + Zod)]
      │    ├── [Input Name: required, max 100 chars, placeholder "Tên dự án..."]
      │    ├── [Textarea Description: optional, max 500 chars, hỗ trợ Markdown, placeholder "Mô tả ngắn..."]
      │    │    └── [MarkdownToolbar: flex gap-2 border-b pb-2 mb-2] -> [Bold B] [Italic I] [Image ↑ -> gọi POST /api/upload]
      │    ├── [ColorPickerSection: flex flex-col gap-2]
      │    │    ├── [Label: text-sm font-medium text-slate-700] -> "Màu dự án"
      │    │    └── [ColorGrid: flex gap-3 flex-wrap]
      │    │         └── [ColorSwatch (lặp 8 màu): w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110]
      │    │              (RED=bg-red-500, ORANGE=bg-orange-500, YELLOW=bg-yellow-500, GREEN=bg-green-500,
      │    │               BLUE=bg-blue-500, PURPLE=bg-purple-500, PINK=bg-pink-500, GRAY=bg-gray-500)
      │    │              Swatch đang chọn: `ring-2 ring-offset-2 ring-indigo-600`
      │    │              KHÔNG hiển thị text tên màu (VD: "RED", "BLUE") -- chỉ hiển màu sẺch
      │    └── [FooterButtons: flex justify-end gap-2 pt-4 border-t border-slate-100]
      │         ├── [Cancel: Button ghost] -> đóng modal
      │         └── [Create/Save: Button primary, disabled khi isSubmitting]
      └── Validation errors (Zod): border-red-500 + <FormMessage> text-xs text-red-500
```

---

### 3.4. Notification Dropdown (`Bell Click → Dropdown`)

```text
[NotificationTrigger: relative inline-flex]
 ├── [BellIcon: w-6 h-6 text-slate-600 cursor-pointer]
 └── [UnreadBadge (hiển khi có unread): absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center]

[NotificationDropdown: absolute right-0 top-full mt-2 w-[380px] bg-white border border-slate-200 rounded-lg shadow-lg z-50]
 ├── [DropdownHeader: flex justify-between items-center px-4 py-3 border-b border-slate-200]
 │    ├── [Title: font-semibold text-sm text-slate-900] → "Thông báo"
 │    └── [MarkAllRead: text-xs text-indigo-600 hover:underline cursor-pointer] → "Đánh dấu tất cả đã đọc"
 ├── [NotificationList: max-h-[400px] overflow-y-auto]
 │    └── [NotificationItem (lặp lại): flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100]
 │         ├── [UnreadDot: w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 (hidden nếu đã read)]
 │         └── [Content: flex-1 min-w-0]
 │              ├── [Message: text-sm text-slate-700 leading-snug] → "Minh Tân đã assign bạn vào task 'Fix bug header'"
 │              └── [Timestamp: text-xs text-slate-400 mt-0.5] → "2 phút trước"
 │              └── (Click item → mở SlideOver panel task tương ứng + đánh dấu đã đọc)
 └── [EmptyState (nếu không có notification): p-8 text-center]
      └── [Text: text-sm text-slate-400] → "Không có thông báo mới"
```

---

### 3.5. Global Search Results Dropdown
Hiển thị khi user gõ vào Global Search Input (debounce 300ms). Gọi `GET /api/tasks/search?q=<term>&limit=10`.

```text
[SearchWrapper: relative w-96 max-w-full]
 ├── [SearchInput: h-9 w-full bg-slate-100 rounded-lg px-4 text-sm border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20]
 └── [SearchDropdown: (hiện khi có focus + query != "") absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50]
      ├── [ResultItem (lặp, tối đa 10): flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100]
      │    ├── [ProjectDot: w-2 h-2 rounded-full bg-{project.color}-500]
      │    ├── [TaskTitle: text-sm font-medium text-slate-900 truncate]
      │    ├── [ProjectName: text-xs text-slate-500]
      │    └── [StatusBadge: text-xs] -> click item -> mở SlideOver task
      └── [NoResult (nếu 0 kết quả): p-4 text-center text-sm text-slate-400] -> "Không tìm thấy kết quả"
```

---

## 2.7. Màn hình Chi tiết Project (`/app/projects/:id`)
Hiển thị chi tiết project và danh sách task thuộc project. Layout tương tự My Tasks nhưng filter cứng theo project.

```text
[PageRoot: flex flex-col h-full gap-6]
 ├── [PageHeader: flex justify-between items-center]
 │    ├── [Left: flex items-center gap-3]
 │    │    ├── [ProjectColorDot: w-3 h-3 rounded-full bg-{color}-500]
 │    │    ├── [Title: h1 text-2xl font-bold text-slate-900] -> "{Project Name}"
 │    │    └── [ArchiveBadge (Nếu archived): text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded]
 │    └── [Actions: flex gap-2]
 │         ├── [Button Archive/Unarchive: ghost variant] (Manager/Admin only)
 │         └── [Button "+ New Task": primary — disabled & tooltip "Project đã lưu trữ" nếu project archived]
 │
 ├── [ProjectStats: flex gap-6 text-sm text-slate-500]
 │    ├── [Stat: "{done} / {total} tasks hoàn thành"]
 │    └── [ProgressBar: w-full h-1.5 bg-slate-200 rounded — filled bg-emerald-500]
 │
 ├── [FilterTabs: flex gap-4 text-sm font-medium border-b border-slate-200 pb-2]
 │    -> All / To Do / In Progress / In Review / Done
 │    (LƯU Ý: Project Detail CÓ tab DONE vì đây là project-scoped view — cần thấy toàn bộ trạng thái.
 │     Khác với My Tasks là personal view nên ẨN DONE để giảm noise cho user.)
 │
 └── [TaskListContainer: flex flex-col gap-3 overflow-y-auto]
      ├── *(Nếu Trống)* -> [EmptyState] -> "Project này chưa có task nào. Nhấn '+ New Task' để bắt đầu."
      └── *(Data map)* -> [TaskListItem] (giống §2.2 My Tasks, không hiển thị ProjectDotBadge)
```

---

## 4. Xử lý Trạng thái Trống (Empty) & Skeleton Loading

1. **Skeleton Loading**:
   - Thay thế các khối nội dung data API bằng `[SkeletonBlock: bg-slate-200 animate-pulse rounded]`. Kích thước Skeleton phải khớp 80% giao diện nội dung thực.
   - Ví dụ: List task sẽ trả ra 3 khối `[TaskCardSkeleton: h-[100px] w-full bg-slate-200]`.
2. **Offline Mode**:
   - `[OfflineBanner: fixed top-0 w-full h-8 bg-red-600 text-white flex justify-center text-xs z-[90]]` -> "Mất mạng. Vui lòng kiểm tra Internet."
   - (z-[90] nằm DƯỜI Toast z-[100] để Toast vẫn đọc được)
3. **Empty States**:
   - Mọi mảng danh sách rỗng KHÔNG GIAN BẠCH không được để trống hoàn toàn. LUÔN thêm Component `[EmptyPlaceholder: chứa Icon nhạt, text trợ giúp, action button]`.
4. **Toast Notifications**:
   - BẮT BUỘC sử dụng `sonner`. KHÔNG dùng `react-toastify`.
   - Vị trí: `bottom-right`. 
   - Timing: 4 giây auto-dismiss.
   - Types: Success (Green), Error (Red), Info (Blue).
5. **Logout Flow**:
   - Menu Avatar -> Click Logout.
   - Hiện Confirm Dialog -> "Bạn có chắc chắn muốn đăng xuất không?".
   - Thành công: Clear `authStore`, clear Cookie, Toast "Đăng xuất thành công", Redirect `/login`.

### 6. Standardized Toast Messages

| Hành động | Success Message | Error Message |
|---|---|---|
| Đăng nhập | Đăng nhập thành công! | Email hoặc mật khẩu không đúng. |
| Tạo Task | Tạo task thành công! | Không thể tạo task. Vui lòng kiểm tra lại. |
| Đổi Status | Đã cập nhật trạng thái. | Lỗi cập nhật trạng thái: {error} |
| Mời thành viên | Đã gửi lời mời tới {email}. | Email này đã là thành viên hoặc không hợp lệ. |
| Xóa Task | Đã xóa task thành công. | Bạn không có quyền xóa task này. |

> **Mô hình Tree Validation:** AI Agent code Frontend bằng Next.js buộc phải xem xét map lại chuẩn từng `div` và `flex container` y hệt như các cây Component con trên. Không tự ý sáng chế ra cấu trúc chéo tránh layout shifts.
