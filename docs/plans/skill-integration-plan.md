# Kế hoạch Tích hợp Skills cho Agentic Coding (TaskFlow)

## Mục tiêu
Cài cắm các trigger liên quan đến `.agents/skills` vào các tài liệu Blueprint của TaskFlow (`AGENTS.md`, `tasks.md`, `requirements.md`, `design-system.md`, `ui-wireframes.md`) để ép AI Agent luôn phải đọc và áp dụng các kỹ năng này khi thực thi dự án, nhằm đảm bảo chất lượng source code và UI vươn tới mức "Production-grade".

## Cần người dùng phê duyệt (User Review Required)
Dưới đây là kế hoạch thay đổi cụ thể trên từng file. Trước khi tôi tiến hành sửa file, tôi có một vài câu hỏi để đảm bảo đi đúng hướng:

1. **Mức độ khắt khe của Trigger**: Bạn muốn ép Agent đọc các file skill này **ở mọi tác vụ** Frontend, hay chỉ **nhấn mạnh ở một số task cốt lõi** (như Kanban, Dashboards) để tiết kiệm thời gian đọc context của Agent? (Tôi đề xuất nên nhấn mạnh ở AGENTS.md và lặp lại ở các task phức tạp trong tasks.md).
2. **Kế hoạch triển khai (Deployment)**: Trong danh sách có skill `deploy-to-vercel` và `vercel-cli-with-tokens`, bạn có muốn tôi thêm một Task mới ở Milestone 5 trong `tasks.md` chuyên biệt cho việc dùng Agent deploy tự động không?

## Chi tiết các thay đổi đề xuất (Proposed Changes)

---

### 1. Document cốt lõi (AGENTS.md)
#### [MODIFY] d:\taskflowfinal\docs\AGENTS.md
*Thêm section mới để quy định luật lệ cấp hệ thống.*
- **Vị trí**: Nằm dưới mục `## Security Rules`.
- **Nội dung thêm**: Thêm mục `## MANDATORY SKILL APPLICATION (KHÔNG ĐƯỢC BỎ QUA)`. Dặn dò Agent bắt buộc dùng biến `@` hoặc absolute path để đọc `vercel-react-best-practices`, `vercel-composition-patterns`, `frontend-design` và `vercel-react-view-transitions` trước khi code Frontend Component.

---

### 2. Document Spec & Constraints (requirements.md)
#### [MODIFY] d:\taskflowfinal\docs\requirements.md
*Reference các skill vào NFR để làm thước đo nghiệm thu.*
- **Section NFR-01 (Performance)**: Bổ sung text yêu cầu tuân thủ `@.agents/skills/vercel-react-best-practices`.
- **Section NFR-05 (Usability)**: Bổ sung text ép dùng `@.agents/skills/frontend-design` cho thiết kế cao cấp và `@.agents/skills/vercel-react-view-transitions` cho trải nghiệm chuyển cảnh.
- **Section NFR-06 (Accessibility)**: Bổ sung text tham chiếu chuẩn `@.agents/skills/web-design-guidelines`.

---

### 3. Document Vận hành (tasks.md)
#### [MODIFY] d:\taskflowfinal\docs\tasks.md
*Thêm trigger vào Definition of Done của các Task cốt lõi.*
- **Milestone 0 (Setup)**: Thêm sub-task yêu cầu đọc `frontend-design` trước khi setup Component shadcn.
- **Milestone 1 (FR-04 & FR-05)**: Trong DoD, yêu cầu tích hợp `vercel-react-view-transitions` khi làm Slide-over view Task.
- **Milestone 3 (FR-08 Kanban)**: Yêu cầu áp dụng `vercel-composition-patterns` trước khi tạo component KanbanCard để tránh cồng kềnh prop.

---

### 4. Document Thiết kế (design-system.md)
#### [MODIFY] d:\taskflowfinal\docs\design-system.md
*Bổ sung Master Prompt trên đầu file hướng dẫn.*
- **Vị trí**: Đỉnh file (Header).
- **Nội dung thêm**: "LƯU Ý DÀNH CHO AGENT: Bắt buộc kết hợp Design System này với `@.agents/skills/frontend-design/SKILL.md` để sinh ra UI có độ hoàn thiện cao, đổ bóng mượt và UI sinh động, nghiêm cấm sinh code UI cơ bản nhàm chán."

---

### 5. Document Layout (ui-wireframes.md)
#### [MODIFY] d:\taskflowfinal\docs\ui-wireframes.md
*Thêm ghi chú chuyển động (animation) theo action.*
- **Nội dung thêm**: Ở các vùng mô tả tương tác (như bấm chuyển view, trượt side panel, rê chuột qua Kanban), gắn trực tiếp text yêu cầu vận dụng API từ thư viện chuyển cảnh có trong tài liệu `@.agents/skills/vercel-react-view-transitions/SKILL.md`.

---

## Bước Tiếp Theo
Nếu bạn đồng ý với kế hoạch này và đã feedback các câu hỏi bên trên, tôi sẽ tiến hành update toàn bộ các file này ngay lập tức.
