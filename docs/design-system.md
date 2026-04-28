# TaskFlow Design System

> LƯU Ý DÀNH CHO AGENT: Bắt buộc kết hợp Design System này cùng đặc tả tại `@d:\taskflowfinal\.agents\skills\frontend-design\SKILL.md` để sinh ra UI có độ hoàn thiện cao nhất, bóng mượt, bo góc tinh xảo. Nghiêm cấm sinh code UI cơ bản nhàm chán (ví dụ: cần tự tin thêm subtle gradients, hover text đổi trạng thái thật smooth).

Tài liệu này là đặc tả Styling, Giao diện (UI) và UX phục vụ cho việc phát triển Frontend của dự án TaskFlow MVP. Nó bắt buộc phải được tuân thủ nghiêm ngặt bằng cách kết hợp **Tailwind CSS v3+** và **shadcn/ui**.

---

## 1. Design Principles & Visual Aesthetic (Nguyên tắc & Phong cách)

- **Phong cách chủ đạo (Minimalist, Linear-like)**: Tập trung vào dữ liệu và con chữ (Clean & Crisp). Định hướng "Nhẹ hơn Jira, chắc hơn Trello".
- **Chất liệu nền**: Sử dụng background trung tính (`bg-slate-50`), sử dụng viền mỏng (`border-slate-200`) để tách các thẻ nội dung thay vì dùng shadow cầu kỳ, nặng nề. Không dùng Dark Mode ở MVP.
- **Speed First & Clarity**: Thao tác trọng tâm <= 3 clicks. Khái niệm hiển thị phải cực rõ ràng, ưu tiên văn bản hướng dẫn bằng **Tiếng Việt**.
- **UX Phản Hồi Tức Thì**: Chuyển trạng thái siêu nhanh. Chỉ dùng animation cơ bản và mượt (`animate-in fade-in slide-in-from-right duration-200`). Tránh animation phức tạp làm chậm luồng làm việc.
- **Progressive Disclosure**: Ẩn các option thừa trong menu khi không cần thiết.
- **Optimistic UI**: Chuyển trạng thái UI trên Client trước khi API trả về, đảm bảo trải nghiệm tức thì.

---

## 2. Design Tokens (Định danh chuẩn Tailwind)

### 2.1. Colors Palette (Hệ màu quy ước)
Sử dụng các class mặc định của Tailwind để thống nhất:

- **Primary / Brand Action**: Nền `bg-indigo-600` (Hover: `bg-indigo-700`). Text tương tác: `text-indigo-600`.
- **Backgrounds (Nền)**:
  - App Background (Nền tổng): `bg-slate-50`
  - Cards, Modals, Panels: `bg-white`
- **Borders & Separators**: `border-slate-200`.
- **Typography Colors**:
  - Headings, Text nhấn: `text-slate-900`
  - Text nội dung: `text-slate-700`
  - Text Muted/Phụ trợ: `text-slate-500`

### 2.2. Enum Colors (Màu map với Data Model)

**a. Màu Trạng Thái Task (Status)**  
Sử dụng trên Dropdown Status hoặc Label:
- **TO_DO**: `bg-slate-100 text-slate-700`
- **IN_PROGRESS**: `bg-blue-100 text-blue-700`
- **IN_REVIEW**: `bg-amber-100 text-amber-700`
- **DONE**: `bg-emerald-100 text-emerald-700`

**b. Màu Mức Độ Ưu Tiên (Priority)**  
Kèm icon tương ứng nếu cần:
- **LOW**: `text-slate-500`
- **MEDIUM**: `text-blue-600`
- **HIGH**: `text-orange-600`
- **URGENT**: `text-red-600` (Buộc phải có icon nhấm báo động đỏ)

**c. Màu Nhãn Dự Án (ProjectColor)**  
Map với Enum DB, sử dụng để render icon hình tròn (dot bullet) cạnh tên Project:
- **RED**: `bg-red-500`
- **ORANGE**: `bg-orange-500`
- **YELLOW**: `bg-yellow-500`
- **GREEN**: `bg-green-500`
- **BLUE**: `bg-blue-500`
- **PURPLE**: `bg-purple-500`
- **PINK**: `bg-pink-500`
- **GRAY**: `bg-gray-500`

**d. UX Feeback & Semantic Colors**
- **Success**: `text-emerald-600`
- **Error/Destructive**: `text-red-600 bg-red-50`
- **OVERDUE TASK (Task Quá Hạn)**: 
  - Text title task đổi sang: `text-red-600`.
  - Có thể phủ nền nhạt cho Block/Card: `bg-red-50`.
  - Hiển thị Badge: "Quá hạn" đỏ rực để đánh động người dùng.

### 2.3. Typography (Định dạng chữ tĩnh)
Toàn bộ dự án dùng font **Roboto** (sans-serif, Google Font). **Bắt buộc** dùng `next/font/google` (KHÔNG dùng CDN link) để optimize Web Font loading:
```typescript
// /frontend/src/app/layout.tsx
import { Roboto } from 'next/font/google';
const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '700'], variable: '--font-roboto' });
// Apply: <body className={roboto.variable}>
```

> [!IMPORTANT]
> Agent PHẢI apply font variable vào `<body>` tag VÀ config Tailwind `fontFamily` để toàn bộ app render đúng Roboto.
> Trong `tailwind.config.ts`:
> ```typescript
> theme: { extend: { fontFamily: { sans: ['var(--font-roboto)', 'Roboto', 'sans-serif'] } } }
> ```

- **H1 (Page Title/My Tasks Header)**: `text-2xl font-bold tracking-tight text-slate-900`
- **H2 (Card Detail/Section Title)**: `text-lg font-semibold text-slate-900`
- **H3 (Nhóm con/Label phụ)**: `text-sm font-medium text-slate-700`
- **Body Text**: `text-sm text-slate-700`
- **Small/Muted**: `text-xs text-slate-500`

### 2.4. Spacing, Box Shadows & Z-Index Layering

- **Spacing & Padding**: Container chung cách lề `p-4` (trên Mobile) và `p-6` (trên Desktop). Các item con thường cách nhau `gap-4`.
- **Shadows**: Chỉ dùng shadow rất tinh vi để tránh rườm rà. Dùng dropshadow: `shadow-sm` cho Card và Dropdown content.
- **Z-Index System (Bắt buộc thiết lập đúng lớp)**:\n  - Toast Notifications: `z-[100]` *(Thông báo luôn đè trên cùng)*
  - Offline Banner: `z-[90]` *(Banner mất mạng — nằm DƯỚI Toast để Toast vẫn đọc được)*
  - Header / Topbar Navigation: `z-50`
  - Slide-over Panel (Xem task chi tiết): `z-40` *(Phải có overlay màn đêm phía dưới mảng Panel bằng `bg-black/20`)*
  - Dropdown Menus & Popovers: `z-30`

---

## 3. Core Components bằng shadcn/ui

### 3.1. Buttons
Override và sử dụng biến thể mặc định của `shadcn/ui`:
- **Primary** (Mặc định `default`): Xác nhận, Tạo mới (`bg-indigo-600 hover:bg-indigo-700 text-white`).
- **Secondary**: Nút hủy Form, đóng mảng (`bg-slate-100 hover:bg-slate-200 text-slate-900`).
- **Ghost / Outline**: Nút cho các hành động phụ không lấn át giao diện chính.
- **Destructive**: Xóa dự án, xóa Task (`bg-red-600 text-white hover:bg-red-700`).

### 3.2. Forms & Inputs (Quản lý trạng thái Zod Error)
Bắt buộc tích hợp React Hook Form + resolver Zod. Shadcn cung cấp sẵn `<Form>`.
- Nếu validation lỗi (Ví dụ: Bỏ trống Title): 
  - Border của Input chuyển cấp bách: `border-red-500`.
  - Render Component `<FormMessage>` bằng tiếng Việt phía dưới Input: `text-xs text-red-500`.
- **Date Picker (Due Date)**: Dùng combo `<Popover>` + `<Calendar>` của shadcn/ui.
  - Trigger: Button dạng `<Button variant="outline">` hiển thị ngày đã chọn hoặc text "Chọn ngày" nếu chưa có.
  - Nếu trống (optional): Không báo lỗi.
  - Nếu ngày đã qua (past date): Cho phép chọn, nhưng field hiển thị màu `text-red-500` để cảnh báo.
  - Format hiển thị: `dd/MM/yyyy` (VD: 15/05/2026).

### 3.3. Overlays (Modals & Slide-over Panels)
- **Slide-over Panel (Xem/Sửa chi tiết Task)**:
  - Hiện thực bằng component `<Sheet side="right">`.
  - Trên kích thước Mobile: Bung ra 100% diện tích màn hình.
  - Trên màn Tablet/Desktop (bắt đầu từ md/lg): Cố định chiều rộng là `w-[480px]`. Nằm đè lên `z-40`.
- **Dialogs / Modals**:
  - Dùng component `<AlertDialog>` để đưa ra một cảnh báo cho hành động không thể khôi phục (như Xóa Dự Án).

### 3.4. Trạng Thái Phản Hồi (Feedback States)
- **Toast Notifications**: **BẮT BUỘC** sử dụng `sonner` (KHÔNG dùng `react-toastify`). Import: `import { toast } from 'sonner'`; mount `<Toaster />` trong root layout.
  - **Auto-dismiss**: 4 giây.
  - **Styling**:
    - **Success**: `bg-emerald-600 text-white border-none shadow-lg`.
    - **Error**: `bg-red-600 text-white border-none shadow-lg`.
    - **Info**: `bg-blue-600 text-white border-none shadow-lg`.
  - **Position**: `bottom-right`.
  - **Interaction**: Có nút "Dấu X" để đóng nhanh.
  - **Sonner Toaster Config (BẮT BUỘC dùng snippet này trong root layout):**
    ```tsx
    // /frontend/src/app/layout.tsx
    import { Toaster } from 'sonner';
    // Trong <body>:
    <Toaster
      position="bottom-right"
      duration={4000}
      toastOptions={{
        classNames: {
          success: 'bg-emerald-600 text-white border-none shadow-lg',
          error: 'bg-red-600 text-white border-none shadow-lg',
          info: 'bg-blue-600 text-white border-none shadow-lg',
        },
      }}
    />
    ```
- **Empty States (KHÔNG ĐỂ TRANG TRẮNG)**: 
  - Khi ListView hay Kanban không có Data, phải render 1 vùng trống chứa Icon slate mờ nhạt (như minh họa chiếc hộp rỗng).
  - Ghi text hướng dẫn hành động cụ thể. Text ví dụ (My Tasks rỗng): *"Bạn chưa có task nào. Hãy liên hệ Manager để được assign công việc"*.
  - Có thể lồng một Button CTA bên dưới nếu phân quyền User cho phép tự chủ động.
- **Loading UI (< 300ms)**: Không được render ngay Spinner gây chớp giật layout màn hình nếu API phản hồi cục bộ trong 100-200ms.
- **Skeleton (API > 300ms)**: Nếu mạng chậm, render component `<Skeleton>` (các khối màu slate-200/animate-pulse). Khối bắt buộc mang cùng diện mạo/kích thước với content dữ liệu gốc (vd 3 skeleton task nếu đang chờ load board).

---

## 4. Bố Cục Chức Năng Cốt Lõi (Layout Structure)

### 4.1. Desktop Breakpoint (>= 1024px)
Dàn cục bộ UI qua flex container:
- **Topbar**: Cố định ngay cạnh trên cùng (`fixed top-0`, chiều cao cố định `h-14`, lớp xếp hạng `z-50`). Chứa Thanh Search Text Input ở trung tâm/trái, Bell Notifications + User Avatar bên phải. (Logo nằm ở Sidebar — xem `ui-wireframes.md` §1).
- **Sidebar**: Cố định menu theo chiều dọc bên trái (`fixed left-0`, chui dưới / nằm liền sau Topbar, Fixed bề rộng `w-64`). Chứa Logo/Tên Workspace ở đỉnh. Render NavLinks: My Tasks, Team, Projects, Reports, Settings.
- **Main Content Khu Vực Nội Dung**: Giữa không gian còn lại là Main (`flex-1`, nền `bg-slate-50`, cách viền `p-6`). Không gian chứa Board / Table list cho phép sinh cuộn dọc (`overflow-y-auto`).

### 4.2. Khắc phục cho Mobile (Mobile Fallbacks / < 768px)
- Sidebar không thể fixed ngốn diện tích => Bị thu gọn thành Hamburger Menu Icon. Nhấn vào sẽ đẩy ra như 1 Drawer Sheet.
- Dò tìm độ khó: Màn hình điện thoại gặp khó trong thao tác Drag & Drop (Kanban) => Giao diện Kanban ngắt thao tác kéo, chuyển về giao diện Click vào Select Component trên mặt thẻ Card để nhả Status thành `Done`.
- Panel chi tiết bung rợp kính diện tích `100vw`, `100vh` để trở thành luồng view riêng biệt.

---

## 5. Tiêu Chuẩn Truy Cập Cơ Sở (A11y & NFR-06)
- **Keyboard Focus (Trọng tâm vòng ngoài)**: Component có thể tương tác phải bọc mảng `focus-visible:` để nhận dạng qua nút TAB bàn phím. Ví dụ config Tailwind ring: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2`.
- **Độ Tương Phản (Contrast Ratio)**: Mọi text có độ phủ size nhỏ cần độ tương phản > 4.5:1 với background (VD `text-slate-500` chuẩn so với `bg-slate-50`).
- **Aria-Labels**: Thêm `aria-label` cho những icon-button rỗng (như nút Close, nút chuông) để công cụ Screen Reader có đoạn text mà đọc cho người khiếm thị. Cấu trúc HTML cơ sở dựa dẫm trên tài nguyên của shadcn đã được set sẵn, dev chỉ việc giữ nguyên không được làm trái.

---

## 6. Color Picker Component Spec (Project Form)

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
