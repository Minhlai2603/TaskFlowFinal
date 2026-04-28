# Kế hoạch triển khai tích hợp Nodemailer (Demo) song song với Resend

Dựa trên yêu cầu thêm một service sử dụng `nodemailer` để phục vụ cho mục đích demo (bên cạnh thư viện `resend` đang được sử dụng ở `FR-02`), dưới đây là kế hoạch chi tiết (Agentic Blueprint) để agent tiến hành cập nhật các tài liệu cốt lõi trong dự án. Kế hoạch này được giới hạn nghiêm ngặt ở phần Logic/Backend, không ảnh hưởng đến UI/UX đã thiết kế.

## 1. Cập nhật `d:\taskflowfinal\docs\requirements.md`
*   **Mục tiêu:** Bổ sung yêu cầu về đa nền tảng gửi email (Dual Email Provider) vào hệ thống.
*   **Chi tiết chỉnh sửa:**
    *   Tại phần mô tả Non-Functional Requirements (NFR) hoặc Technical Stack: Ghi rõ hệ thống cần hỗ trợ cơ chế chuyển đổi (Strategy Pattern) giữa `Resend` (Production) và `Nodemailer` (Demo/Local Development).
    *   Tại mô tả của `FR-02` (Mời thành viên): Bổ sung thêm luồng quy trình: Hệ thống sẽ dựa trên biến môi trường (ví dụ `EMAIL_PROVIDER=resend` hoặc `EMAIL_PROVIDER=nodemailer`) để quyết định dùng service nào khi gửi link lời mời.
    *   Quy định rõ đối với Nodemailer, cấu hình mặc định nên dùng SMTP ảo như Ethereal Email hoặc Mailtrap để phục vụ mục đích "Demo" (khách hàng có thể kiểm tra email trong local console/platform test mà không trỏ đến email thật).

## 2. Cập nhật `d:\taskflowfinal\docs\tasks.md`
*   **Mục tiêu:** Thêm các checklist task để AI Agent thực thi code.
*   **Chi tiết chỉnh sửa:**
    *   Vào khu vực task của `FR-02: Workspace & Members` (Milestone 1).
    *   Thêm một Sub-task về Backend: "Tạo cấu trúc interface `IEmailService` và implement 2 class `ResendEmailService` và `NodemailerEmailService`. Thiết lập DI (Dependency Injection) hoặc Factory class để khởi tạo service dựa trên biến `process.env.EMAIL_PROVIDER`."
    *   Thêm Sub-task về Unit Test: "Bổ sung Unit test kiểm tra Factory trả về đúng instance của Nodemailer khi env là `nodemailer` và trả về Resend khi môi trường là production."

## 3. Cập nhật `d:\taskflowfinal\docs\AGENTS.md`
*   **Mục tiêu:** Hướng dẫn AI Agent viết code liên quan đến gửi mail một cách chuẩn mực.
*   **Chi tiết chỉnh sửa:**
    *   Bổ sung thêm một "Rule" hoặc "Context" trong `AGENTS.md` đối với kỹ sư Backend: "Khi cần gọi logic gửi thư, KHÔNG ĐƯỢC import trực tiếp library (`resend` hay `nodemailer`) vào trong Business Logic (như Controllers hay Actions). BẮT BUỘC phải gọi qua interface của Provider/Factory (`EmailProviderFactory.sendMail()`)."
    *   Thêm quy định về xử lý lỗi (Error Handling): "Cả 2 service đều phải map các lỗi (như timeout, sai credential) về một dạng Custom Error chuẩn như `EmailDeliveryException` để app dễ dàng bắt lỗi đồng nhất."

---
*(Kế hoạch đã loại bỏ hoàn toàn các thay đổi liên quan đến Giao diện và Design System theo yêu cầu).*
