# Quy trình Hệ thống TaskFlow: Lịch sử Kiến tạo & Agentic Coding A-Z

Tài liệu này ghi nhận lại toàn bộ quá trình đã thực hiện để xây dựng hệ thống Blueprint (Nguồn chân lý) và quy định quy trình chuẩn mực (End-to-End) để điều khiển AI Agent lập trình dự án TaskFlow.

---

## PHẦN 1: LỊCH SỬ KIẾN TẠO TÀI LIỆU (DOCUMENTATION CREATION HISTORY)

Quá trình xây dựng hệ thống tài liệu từ con số 0 đã được thực hiện theo một quy trình đa mô hình (Multi-Model Workflow) chặt chẽ:
- **Gemini 3.1 Pro:** Đóng vai trò lên ý tưởng ban đầu và định hình khung sườn.
- **Claude Sonnet 4.6:** Đóng vai trò phản biện, review và chuẩn hóa lại các ý tưởng của Gemini 3.1 Pro.
- **Claude Opus 4.6:** Đóng vai trò "Trùm cuối" Tổng kiểm toán, đánh giá toàn bộ Hệ thống Tài liệu (Docs) đã thực sự sẵn sàng 100% cho Agentic Coding chưa.
- **Gemini 3 Flash:** Đóng vai trò thực thi (Execution), trực tiếp viết code và triển khai dự án dựa trên tài liệu Blueprint đã được chuẩn bị.

### Quy trình 7 bước đã thực hiện để tạo ra Blueprint hiện tại:

1. **Khởi tạo Requirements:** Prompt dựa trên bản thảo lưu trữ `docs/archive/PRD_TaskFlow.md` để sinh ra bản kế hoạch `docs/plans/requirements-plan.md`.
2. **Khởi tạo Design System:** Tiếp tục sử dụng `docs/archive/PRD_TaskFlow.md` để prompt và sinh ra bản kế hoạch `docs/plans/design-system-plan.md`.
3. **Thực thi Nền móng:** Triển khai (implement) 2 bản plan trên để chính thức tạo ra 2 file cốt lõi: `docs/requirements.md` và `docs/design-system.md`.
4. **Xây dựng Wireframes:** Lấy đầu vào là `requirements.md` để prompt sinh ra `docs/plans/ui-wireframes-plan.md`, sau đó implement thành file `docs/ui-wireframes.md`.
5. **Lập Kế hoạch Thực thi (Tasks):** Tổng hợp bối cảnh từ `requirements.md`, `design-system.md` và `ui-wireframes-plan.md` để prompt sinh ra `docs/plans/tasks-plan.md`. Từ plan này, implement ra file danh sách công việc chính thức `docs/tasks.md`.
6. **Kiểm toán & Vá lỗi (Pre-Coding Audit):** 
   - Sử dụng `docs/prompts/agent-review-prompt.md` để các model review chéo và đánh giá mâu thuẫn giữa các tài liệu.
   - Quá trình này đã đẻ ra hàng loạt các bản Plan sửa lỗi và đồng bộ hóa: `agentic-fixes-plan.md`, `audit-remediation-plan.md`, `doc-fix-plan.md`, `doc-fix-plan-v2.md`, `fix-docs-for-agentic-coding.md`, `nodemailer-integration-plan.md`, `requirements-update-plan.md`, `skill-integration-plan.md`. Toàn bộ đã được xử lý triệt để.
7. **Khởi động Code:** Sử dụng `docs/prompts/agent-master-prompt.md` để chính thức bắt đầu tiến trình Agentic Coding.

---

## PHẦN 2: QUY TRÌNH AGENTIC CODING (THE EXECUTION WORKFLOW)

Quy trình dưới đây quy định cách thức giao tiếp và điều khiển Coding Agent trong giai đoạn Thực thi (sau Bước 7 ở trên).

### GIAI ĐOẠN 1: THIẾT LẬP MASTER AGENT (SETUP & SYSTEM PROMPT)
Đây là bước khởi động Coding Agent. Thiết lập vai trò, ranh giới và luật lệ tuyệt đối cho Agent.

**Prompt Thiết lập (Sử dụng `docs/prompts/agent-master-prompt.md`):**
```text
[Dán toàn bộ nội dung của file agent-master-prompt.md vào đây]
Đính kèm các file ngữ cảnh cốt lõi:
- docs/AGENTS.md
- docs/requirements.md
- docs/tasks.md
- docs/design-system.md
- docs/ui-wireframes.md
```

**Kết quả mong đợi:** 
Agent in ra một bản báo cáo ngắn (chứng minh đã hiểu hệ thống) và đề xuất hành động đầu tiên của `Milestone 0`. Chờ con người "Duyệt" (Approve) để bắt đầu.

---

### GIAI ĐOẠN 2: THỰC THI TỰ ĐỘNG (AUTONOMOUS EXECUTION)
Trong giai đoạn này, Agent (Gemini 3 Flash) sẽ tự động làm việc dựa trên hệ thống Blueprint. Vai trò của con người lúc này là **"Đợi kết quả và nghiệm thu"**.

**Cách thức hoạt động:**
1. Khi đã nhận `agent-master-prompt.md`, Agent đã biết rõ mình phải làm gì dựa trên file `docs/tasks.md`.
2. Agent sẽ tự động đối chiếu các tài liệu (requirements, wireframes, skills), tiến hành viết code, tự động verify (build test) và tự động cập nhật trạng thái `[x]` vào `tasks.md`.
3. Con người chỉ việc **đợi Agent báo cáo hoàn thành Milestone/Task**. Nếu mọi thứ suôn sẻ, bạn xác nhận để Agent làm tiếp.

---

### GIAI ĐOẠN 3: XỬ LÝ LỖI VÀ ĐỊNH HƯỚNG (TROUBLESHOOTING & BUG FIXING)
Khi Agent báo cáo kết quả nhưng có lỗi (ví dụ: build fail, bug logic, sai UI), hoặc hệ thống thực tế chạy không như ý, con người mới cần can thiệp để cung cấp thông tin lỗi và định hướng Agent sửa đổi. Tuyệt đối không để Agent tự ý "sửa mò" chồng chéo mã nguồn.

**Prompt Fix Bug (Khi code lỗi, crash server, sai logic):**
```text
Đã xảy ra lỗi sau khi chạy code:
[Dán mã lỗi console / Chụp ảnh màn hình lỗi vào đây]

QUY TRÌNH FIX LỖI YÊU CẦU BẠN TUÂN THỦ:
1. KHÔNG vội vàng viết code mới.
2. Dùng `grep_search` hoặc `view_file` phân tích lại các file vừa sửa.
3. Đối chiếu với `requirements.md` và 17 Anti-patterns trong `agent-master-prompt.md`.
4. Tìm ra nguyên nhân gốc rễ (Root Cause) và trình bày phương án sửa lỗi.
5. Chờ tôi duyệt phương án rồi mới sửa code.
```

**Prompt Review/Refactor UI (Khi giao diện sai lệch hoặc không thẩm mỹ):**
```text
Giao diện bạn vừa tạo không khớp với `ui-wireframes.md` hoặc thiết kế thiếu tính thẩm mỹ.
Yêu cầu:
1. Đọc lại `docs/design-system.md` và tool skill `frontend-design/SKILL.md`.
2. Kiểm tra lại Component Tree.
3. Cập nhật lại Tailwind classes để đảm bảo UI mượt mà, spacing chuẩn, có màu sắc/border đúng thiết kế hệ thống. Báo cáo lại các file đã sửa.
```

---
## TỔNG KẾT
Sức mạnh của Agent nằm ở **Bối cảnh (Context)** và **Ràng buộc (Constraints)**. 
Với sự chuẩn bị tài liệu Blueprint hoàn hảo qua 7 bước ở Phần 1, luồng thực thi Phần 2 diễn ra hoàn toàn tự động (Autonomous). Con người chỉ đóng vai trò **Người giám sát (Supervisor)**: ngồi đợi kết quả, nghiệm thu, và cung cấp mã lỗi để định hướng Agent Fix Bug ở Phần 3. Quy trình này đảm bảo dự án TaskFlow đạt chất lượng tối đa với thời gian và công sức can thiệp ít nhất từ con người.
