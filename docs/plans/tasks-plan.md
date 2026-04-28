# Kế hoạch xây dựng `tasks.md` cho TaskFlow MVP

Mục tiêu: Xây dựng bản mô tả công việc (to-do list) `tasks.md` cực kỳ chi tiết nhằm hướng dẫn AI Agent làm việc tự động (autonomous execution) đúng hướng, tuân thủ nghiêm ngặt các quy tắc. 

Điểm then chốt ở phiên bản cập nhật này là **bất kỳ task/tính năng nào cũng sẽ được map (liên kết) trực tiếp đến phân vùng cụ thể trong file `d:\taskflowfinal\docs\requirements.md`**. Phải tuân thủ các rule (như validation, constraints, soft-delete, data isolation) trước khi bắt tay thực hiện để đảm bảo tính chính xác 100%.

## 1. Cấu trúc tổng thể của `tasks.md`
Tài liệu `tasks.md` sẽ bám sát lộ trình 6 Milestones đã được vạch ra trong PRD (Từ M0 đến M5).
Sử dụng chuẩn markdown checklist để Agent có thể dễ dàng quản lý state (`[ ]`, `[/]`, `[x]`).
Lộ trình tiến hành theo dạng **Feature-based & Fullstack slice**: Làm xong Backend của một logic -> Làm luôn Frontend tương ứng để đảm bảo flow xuyên suốt, không gãy khúc.

### 🌟 Yêu cầu Sub-Checklist (AI Checklist) Bắt Buộc cho mỗi Functional Requirement (FR)
Để đảm bảo Agent không bỏ sót bước nào và test cặn kẽ, với mỗi FR từ Milestone 1 trở đi, `tasks.md` sẽ áp dụng một sub-checklist nghiệm thu tiêu chuẩn. Đặc biệt MỖI FR đều phải liệt kê đủ 3 loại test. Cấu trúc mỗi FR sẽ bao gồm:

- [ ] **FR-XX: [Tên tính năng]** (Mapping: `requirements.md` -> Phần Y)
  - [ ] **1. Xong chức năng cốt lõi (Implementation):**
    - [ ] [Backend] Thêm Schema, tạo Endpoint, Services, Input Validation.
    - [ ] [Frontend] Tạo UI Component, State Management (TanStack/Zustand), Logic Fetching.
  - [ ] **2. Pass hết tất cả các loại Test (Testing Verification):**
    - [ ] **API Test (Integration):** Verify logic BE, auth isolation, error responses.
    - [ ] **Unit Test:** Verify functions, custom hooks, helper utilities.
    - [ ] **E2E Testing:** Verify luồng drag-drop, login flows, hành vi click trên Web.
  - [ ] **3. Thỏa mãn Definition of Done (DoD):**
    - [ ] Code không hardcode secrets, không lỗi TS/Lint.
    - [ ] Code thỏa mãn tất cả constraints và Edge cases (PRD §10).

## 2. Phác thảo các phân đoạn chính (KÈM MAPPING TỚI REQUIREMENTS.MD)

### Milestone 0: Setup & Infrastructure (Nền móng)
- **Quy định chung & Kiến trúc (Mapping: `requirements.md` -> Phần 1 & 1.5)**
  - Đảm bảo Backend sử dụng Express, Prisma. Frontend là Next.js 16 App Router. Cấu trúc feature-based.
- **Data Layer (Mapping: `requirements.md` -> Phần 2)**
  - Khởi tạo `schema.prisma`. Tuân thủ chi tiết các relations, rule set `deleted_at`.

### Milestone 1: Core CRUD (Xương sống hệ thống)
*Mỗi FR bên dưới ÁP DỤNG TRỌN VẸN CẤU TRÚC AI CHECKLIST trên (Có đủ API, Unit, E2E)*
- **FR-01: Authentication & Sessions** (Mapping: `requirements.md` -> Phần 3 / FR-01)
  - *Setup JWT 7 ngày, chặn password, chặn request (5 fail).*
- **FR-02: Workspace & Members** (Mapping: `requirements.md` -> Phần 3 / FR-02)
  - *Tự động gán quyền Admin. Gửi Invite email 48h. Row-level Isolation.*
- **FR-03: Projects** (Mapping: `requirements.md` -> Phần 3 / FR-03)
  - *CRUD Projects, Soft-Delete, rule archive 422.*
- **FR-04 & FR-05: Tasks CRUD** (Mapping: `requirements.md` -> Phần 3 / FR-04 -> FR-05)
  - *Phân quyền theo Assignee/Manager, Optimistic UI.*

### Milestone 2: Collaboration (Tương tác team)
*Mỗi FR bên dưới ÁP DỤNG TRỌN VẸN CẤU TRÚC AI CHECKLIST trên (Có đủ API, Unit, E2E)*
- **FR-06: Comment System** (Mapping: `requirements.md` -> Phần 3 / FR-06)
  - *Sanitize XSS, `@username` parser.*
- **FR-09: Notification API** (Mapping: `requirements.md` -> Phần 3 / FR-09)
  - *Job `TASK_DUE_SOON`. Polling 5s.*
- **FR-10: Activity Log** (Mapping: `requirements.md` -> Phần 3 / FR-10)
  - *Track update theo fields.*

### Milestone 3: Dashboards (Hiển thị & Báo cáo)
*Mỗi FR bên dưới ÁP DỤNG TRỌN VẸN CẤU TRÚC AI CHECKLIST trên (Có đủ API, Unit, E2E)*
- **FR-07: My Tasks View** (Mapping: `requirements.md` -> Phần 3 / FR-07)
  - *Sort 3-tier: Overdue -> Due Date -> None.*
- **FR-08: Kanban Board** (Mapping: `requirements.md` -> Phần 3 / FR-08)
  - *Fallback dropdown khi mobile.*
- **FR-11: Reports** (Mapping: `requirements.md` -> Phần 3 / FR-11)
  - *Phân quyền Manager/Admin. Drill down report.*

### Milestone 4 & M5: Polish & Deploy
- **FR-12: Global Search** (Mapping: `requirements.md` -> Phần 3 / FR-12)
- **Edge cases Check** (Mapping: `requirements.md` -> Phần 5)
  - *Handle offline, removed member, concurrent edits.*

## 3. Các quy tắc "Bất di bất dịch" (Preamble của tasks.md)
- PHẢI đọc reference ở phần `Mapping: [Đường dẫn tới mục]` trong `requirements.md` TRƯỚC khi gõ code tính năng đó. 
- Mọi feature đều phải "Pass hết test (API/Unit/E2E)" và "Xong logic DoD" thì mới tick Done task `[x]`.
