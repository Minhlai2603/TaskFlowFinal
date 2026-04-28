# Kế Hoạch Xây Dựng `ui-wireframes.md` (TaskFlow MVP)

## 1. Mục đích của file `ui-wireframes.md`
Tạo ra một bản thiết kế "Text-based Component Tree" tuyệt đối chính xác cho AI Agent. File này kết hợp giữa:
- **How it looks (Giao diện)**: Kế thừa từ `design-system.md` (Tailwind classes, shadcn components).
- **How it works (Luồng dữ liệu/Hành vi)**: Kế thừa từ `requirements.md` và `PRD_TaskFlow.md`.
- **How it's built (Kiến trúc Tech)**: Tuân thủ `AGENTS.md` (Next.js 16, Client/Server Components).

## 2. Các phần nội dung dự kiến trong `ui-wireframes.md`

### Phần 1: Global App Shell & Layout Skeleton
Mô tả kiến trúc layout gốc bao bọc mọi trang `/app/...`
- **Layout Grid**: Cấu trúc chia khung `TopBar` (h-14, fixed top) và `Sidebar` (w-64) với main content nằm giữa.
- **Mobile Fallback**: Định nghĩa điểm gãy breakpoint (md: `<768px`) cho Hamburger menu.
- **TopBar Context**: Chứa cấu trúc của Logo, Global Search Input, Notification Bell Dropdown, và User Menu.
- **Sidebar Context**: Cấu trúc Navigation Item links.

### Phần 2: Cấu trúc màn hình cốt lõi (Text-based Wireframe Tree)
Mỗi màn hình sẽ được vẽ ra thành cấu trúc cây cha - con với CSS Flex/Grid properties.

1. **Auth Screens (`/login`, `/register`)**
   - Bố cục Split-Screen hiện đại 50/50 hoặc 40/60:
     - **Cột Trái (Visual & Inspiration)**: Chứa component hình nền minh hoạ đẹp mắt, gradient mềm mại và một câu cảm hứng (Inspirational Quote).
     - **Cột Phải (Interactive Box)**: Chứa Form đăng nhập/đăng ký chính.
   - Các validation message text placeholders được bố trí trực quan dưới từng trường nhập liệu.

2. **My Tasks Dashboard (`/app/my-tasks`)**
   - Header title và filter tabs.
   - Danh sách task dưới dạng cuộn dọc. Cấu trúc `TaskListItem` component.
   - Xử lý mảng Empty State ("Chưa có task nào...").

3. **Kanban Board (`/app/team`)**
   - Vùng không gian kéo thả (DndContext).
   - 4 Column containers ứng với 4 trạng thái (`TO_DO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`).
   - Cấu trúc `<TaskCard>` (Gồm Title, Due Date Badge đỏ, Avatar gán ghép).

4. **Reports Screen (`/app/reports`)** (Chỉ Manager/Admin)
   - Khung Grid hiển thị biểu đồ Bar Chart.
   - Table Component (Member | Assigned | Completed | Overdue | %).

### Phần 3: Overlays & Interactive Panels (Dùng Chung)
1. **Task Detail Slide-over Panel (`/app/tasks/:id`)**
   - Khung `Sheet` nằm lề phải đè `z-40`.
   - Phần trên: Header, Edit status dropdown. Mảng Body chứa Markdown Description.
   - Phần dưới: Tabs chia 2 vùng -> (1) Thread Comments, (2) Activity Log Timeline.

2. **Modals & Create Forms**
   - Cấu trúc "Tạo Task Mới" form modal (React Hook Form).

### Phần 4: Nguyên lý Rendering & Trạng Thái 
- Cấu trúc component nào buộc là `use client` (dnd-kit, form).
- Skeleton UI placements khi fetching data.

## 3. Các bước hành động kế tiếp (Sau khi Approve)
1. Agent sẽ tự động sinh file `d:\taskflowfinal\docs\ui-wireframes.md` nội dung đầy đủ dựa trên sườn kế hoạch này.
2. Tuân thủ 100% việc không sửa đổi nội dung các file hiện có nào khác.
