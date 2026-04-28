# Kế hoạch Thực thi Sinh tài liệu Design System (`design_system-plan.md`)

Tài liệu này đóng vai trò là "Prompts & Execution Plan" cực kỳ chi tiết, hướng dẫn 1 AI Agent tự động sinh ra file `design-system.md` cho dự án TaskFlow MVP. Bất kỳ AI Agent nào khi thực thi việc tạo Design System phải tuân thủ nghiêm ngặt từng bước lập kế hoạch và các ràng buộc dưới đây.

---

## 1. Yêu Cầu Đầu Vào (Inputs) & Mục Đích (Objectives)

### Mục Đích:
Sản sinh ra file `d:\taskflowfinal\docs\design-system.md` hoàn chỉnh, chuẩn mực. Đây sẽ là tài liệu tham chiếu (Source of Truth) về styling, component standards, UX patterns cho Front-end Developer (dùng Next.js 16 App Router, Tailwind CSS, shadcn/ui).

### Dữ liệu đầu vào Agent CẦN ĐỌC KỸ TRƯỚC:
1. `d:\taskflowfinal\docs\PRD_TaskFlow.md` (Chú ý Phần 12. UX Design Notes, Mục 7, Mục 8).
2. `d:\taskflowfinal\docs\requirements.md` (Chú ý Phần 6. Layout Structure, Phần NFR Coverage).
3. `AGENTS.md` (Chú ý phần Coding Conventions và Tech Stack).

---

## 2. Cấu Trúc Khung Của File `design-system.md`
Agent phải sinh file `design-system.md` với đầy đủ các phần tử sau theo đúng thứ tự:

### 2.1. Design Principles & Visual Aesthetic (Nguyên tắc & Phong cách thiết kế)
- **Visual Aesthetic (Phong cách chủ đạo - Minimalist, Linear-like)**:
  - Định hướng "Nhẹ hơn Jira, chắc hơn Trello", sản phẩm hướng đến team nhỏ đề cao tốc độ. Giao diện yêu cầu sự Tối giản, Tinh gọn (Clean & Crisp).
  - Lấy cảm hứng từ Linear.app và Height.app: Background dùng màu trung tính (VD: `bg-slate-50` hoặc `bg-zinc-50`), dùng đường viền mỏng (`border-slate-200 / border-zinc-200`) để phân tách thẻ (Card) thay vì lạm dụng hiệu ứng shadow nặng nề.
  - Màu sắc phải đằm, tránh phối màu sặc sỡ, rườm rà hay gradients lòe loẹt. Dồn sự tập trung vào typography sắc nét và khoảng trắng (white-space) được tính toán tỉ mỉ.
- **Design Principles**: Trích xuất từ PRD: Speed first (thao tác <= 3 clicks), Clarity over features (rõ ràng hiển thị), Progressive disclosure (ẩn bớt tùy chọn nâng cao chưa cần thiết vào menu).
- Phải đảm bảo quy trình Optimistic UI và thiết kế Mobile Fallbacks mạch lạc.

### 2.2. Design Tokens (Định danh cấp thấp - Tailwind Standard)
Bắt buộc Agent phải quy định rõ tên class Tailwind thực tế:
- **Colors Palette**: 
  - Brand/Primary, Secondary, Background, Surface/Card, Border.
  - **Màu Trạng thái Task (Status)**: TO_DO, IN_PROGRESS, IN_REVIEW, DONE (đề xuất màu + background tint).
  - **Màu Mức độ ưu tiên (Priority)**: LOW, MEDIUM, HIGH, URGENT (Màu cho Badge).
  - **Màu Nhãn Dự Án (ProjectColor)**: RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE, PINK, GRAY. Yêu cầu tạo Tailwind config map.
  - **Màu Trạng Thái Quá Hạn (Overdue)**: Highlight cảnh báo (Ví dụ text đỏ, background đỏ nhạt `bg-red-50 text-red-600`) cho khu vực My Tasks.
- **Typography**:
  - Font family (Nên dùng `Inter` cho app hiện đại).
  - Scale: H1, H2, H3, Body, Small, Muted (Kèm theo class ví dụ `text-2xl font-bold`, `text-sm text-slate-500`).
- **Spacing & Shadows**:
  - Các step margin/padding: `p-4`, `p-6`.
  - Box shadow cho card, modal, dropdown (`shadow-sm`, `shadow-md`).
  - **Z-Index Layering**: Định nghĩa layer tĩnh (Bắt buộc): `Topbar` là `z-50`, `SlideOver Panel` là `z-40` + overlay `bg-black/20`.

### 2.3. Core Components (Quy ước Shadcn/UI)
Định nghĩa cách sử dụng các components lấy từ `shadcn/ui`:
- **Buttons**: Liệt kê variants (`default`, `secondary`, `destructive`, `outline`, `ghost`).
- **Forms & Inputs**: Text field, Textarea, Checkbox, Select, Validation Error State (Text màu đỏ kết hợp Zod).
- **Badges/Tags**: Dành cho Status và Priority.
- **Overlays**: 
  - **Slide-over Panel** (dùng `Sheet` component của shadcn) cho Task Detail. Quy định kích thước trên Desktop là `w-[480px]`.
  - **Modals/Dialogs** cho việc Create Task hoặc Delete Confirmation.
- **Feedback & Feedback States**: Toast notification (shadcn `useToast`, auto-dismiss 4s), Empty States (luôn có illustrations + Call to Action).

### 2.4. Layout Systems & Breakpoints
Dịch lại chính xác Phần 6 của `requirements.md` sang specs thực tế:
- **Breakpoints**: Mobile (`<768px`), Tablet (`768px - 1023px`), Desktop (`>=1024px`).
- Mô tả bố cục (Layout Layout): Fixed Topbar (`h-14`), Fixed Sidebar (`w-64`), Content Area (overflow-y-auto).
- **Mobile Fallback**: Sidebar biến thành Hamburger Menu, SlideOver tràn 100% màn hình, Kanban chuyển từ Drag & Drop sang Button tap (Dropdown menu update).

### 2.5. Accessibility & UX Patterns (A11y)
- Tất cả phần tử interactive phải có `:focus-visible` (Ví dụ `ring-2 ring-primary ring-offset-2`).
- Contrast ratio > 4.5:1.
- Loading bằng Skeletons khi fetch > 300ms.

---

## 3. Các Bước Thực Thi (Step-by-Step Instructions) Dành Cho Agent

**Để sinh ra file `design-system.md`, Agent PHẢI thực hiện đúng các bước sau:**

*   **Bước 1:** Đọc và analyze 3 file `requirements.md`, `PRD_TaskFlow.md` và `AGENTS.md`. Tìm keywords: "Tailwind", "shadcn", "MVP quy định", "Màu sắc", "Trạng thái", "Slide-over".
*   **Bước 2:** Bắt đầu soạn thảo document với tiêu đề `# TaskFlow Design System`. Nhấn mạnh và cắt nghĩa tính chất thiết kế (Minimalist, Linear-like, Speed-first) cho các developer biết.
*   **Bước 3:** Lập bảng mã màu Tailwind map 1-1 với Enum Data (Status, Priority) để team dev làm frontend không bị lúng túng.
*   **Bước 4:** Xây dựng mục Layout and Responsive Breakpoints bằng ASCII diagram hoặc bullet points chặt chẽ.
*   **Bước 5:** Đặc tả cơ chế Empty States và Loading States để đáp ứng NFR-05.
*   **Bước 6:** Review lại tài liệu nháp. Hãy tự hỏi: *"Tài liệu này đã đủ chi tiết để 1 Dev chỉ việc copy class Tailwind và cài đặt shadcn/ui chưa?"*. Nếu chưa, thêm các config dự kiến cho `tailwind.config.ts`.
*   **Bước 7:** Output toàn bộ vào file `docs/design-system.md` (Lưu ý tiếng Việt là ngôn ngữ bắt buộc).

---

## 4. Những Ràng Buộc Khắt Khe (Strict Constraints & Anti-Patterns)

- **KHÔNG** đưa vào thiết kế Dark Mode (Nằm ngoài scope của MVP V1.0).
- **KHÔNG** cung cấp mã CSS thuần (`.my-box { padding: 10px; }`), tất cả BẮT BUỘC là Utility-classes của TailwindCSS.
- **KHÔNG** sử dụng thư viện UI nào khác ngoài `shadcn/ui` và `@dnd-kit/core`.
- **KHÔNG** đưa ra các hiệu ứng Animation quá phức tạp. Chỉ sử dụng: `fade-in`, `slide-in-from-right`, `duration-200`. UI/UX phải cho cảm giác Nhanh Phản Hồi (Instant Feedback).
- Tôn trọng triệt để nguyên tắc **Không bao giờ hiển thị không gian trống (Empty Space) mà không có hướng dẫn**. Phải có Placeholder hoặc CTA đi kèm.

---
> **End of Plan.** Nếu Agent đã thẩm thấu toàn bộ plan này, Agent có thể tiến hành generate file `design-system.md`.
