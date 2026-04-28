# TaskFlow — Agent Instructions

## Tech Stack (KHÔNG ĐƯỢC thay đổi trừ khi có justification từ Tech Lead)
### Frontend
- Framework: Next.js **16.2.x** (App Router) + TypeScript (strict mode)
- UI Components: shadcn/ui + Tailwind CSS
- State Management: Zustand (client state) + TanStack Query (server state)
- Drag & Drop: @dnd-kit/core (Kanban board)
- Form: React Hook Form + Zod validation
- Charts: recharts v2.x (Bar chart cho Reports)
- HTTP Client: axios (configured với withCredentials: true)
- Markdown Rendering: react-markdown + remark-gfm (task/project description)
- Date Formatting: date-fns — dùng `format(date, 'dd/MM/yyyy')` cho ngày cố định, `formatDistanceToNow(date, { locale: vi, addSuffix: true })` cho relative time ("2 phút trước")

### Backend
- Runtime: Node.js + Express
- ORM: Prisma **v7.x** (latest). PHẢI khởi tạo với options: `new PrismaClient({ log: [...] })` — xem requirements.md §4
- Database: PostgreSQL ≥ 14
- Authentication: JWT (7 ngày expiry) + bcrypt (cost factor ≥ 12)
- Cookie: cookie-parser (httpOnly cookie cho JWT — KHÔNG dùng localStorage)
- Email: Hỗ trợ linh hoạt Resend (Production) và Nodemailer (Demo) phụ thuộc vào env `EMAIL_PROVIDER`.
  - Nodemailer Config (Demo - Gmail App Password):
    ```
    SMTP_HOST="smtp.gmail.com"
    SMTP_PORT="465"
    SMTP_USER="<gmail address>"
    SMTP_PASS="<gmail app password>"
    SMTP_SECURE="true"
    ```
  - Nodemailer code PHẢI đọc config từ env vars trên, KHÔNG hardcode `secure`, `host`, hay `port`.
- File Storage: Cloudinary (free tier) — upload ảnh task description < 5MB (jpg/png/webp/gif). Endpoint: POST /api/upload. Env: CLOUDINARY_URL, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Sanitization: sanitize-html (backend input sanitization — bắt buộc wrap mọi user input trước khi lưu DB)
- Scheduler: node-cron (TASK_DUE_SOON cron job — schedule `'0 * * * *'`)

### DevOps
- Hosting: Railway (backend + DB), Vercel (frontend)
- CI/CD: GitHub Actions
- Monitoring: Sentry

## Coding Conventions
- TypeScript strict mode bắt buộc
- Component naming: PascalCase (e.g., TaskCard.tsx)
- API routes: kebab-case (e.g., /api/tasks/update-status)
- API response format chuẩn: { success: boolean, data?: T, error?: string }
- Luôn có error handling cho mọi API call
- Mọi form dùng React Hook Form + Zod validation
- UI text bằng tiếng Việt
- Loading state hiển thị khi API call > 300ms
- Empty states phải có hướng dẫn hành động (không để trang trắng)

## Architecture Patterns
- Mail Services: KHÔNG import trực tiếp `resend` hoặc `nodemailer` trong Business Logic. BẮT BUỘC dùng Interface/Factory `EmailProviderFactory`. Error map chung về Custom Exception.
- Feature-based folder structure
- Server Components by default, 'use client' chỉ khi cần interactivity
- Soft delete cho tasks và projects (deleted_at timestamp) — KHÔNG hard delete
- Optimistic UI cho status changes, rollback nếu API lỗi
- Toast notifications: auto-dismiss sau 4 giây
- Toast library: BẮT BUỘC dùng `sonner`. KHÔNG dùng `react-toastify`.
- Slide-over panel cho task detail (không navigate ra trang mới)

## MANDATORY SKILL APPLICATION (KHÔNG ĐƯỢC BỎ QUA)
Khi thực hiện các task liên quan đến Frontend, Code Architecture hay Deploy, Agent BẮT BUỘC phải sử dụng tool `view_file` để đọc gốc các SKILL sau và apply nguyên tắc của nó:
- Khi viết/sửa React Components: Đọc `@d:\taskflowfinal\.agents\skills\vercel-react-best-practices\SKILL.md` và `@d:\taskflowfinal\.agents\skills\vercel-composition-patterns\SKILL.md`
- Khi làm UI, CSS, Tailwind, shadcn: Bắt buộc tuân thủ `@d:\taskflowfinal\.agents\skills\frontend-design\SKILL.md` để đảm bảo UI cao cấp, mượt mà.
- Khi tạo các action chuyển trang/chuyển trạng thái UI: Đọc `@d:\taskflowfinal\.agents\skills\vercel-react-view-transitions\SKILL.md` để thêm micro-animations.

## Security Rules (KHÔNG BAO GIỜ vi phạm)
- KHÔNG hardcode secrets — dùng env variables
- Input sanitization cho mọi user input (ngăn XSS, SQL injection)
- Rate limiting: 100 requests/phút per IP
- Row-level isolation: data workspace A không lộ sang workspace B
- Password KHÔNG BAO GIỜ xuất hiện trong API response

## Testing
- Viết test cho mọi API endpoint (unit test)
- Component test cho interactive components (form, drag-drop)
- Edge case test theo requirements.md §5 (Edge Cases)

## TypeScript Config (Backend)
File `backend/tsconfig.json` BẮT BUỘC có:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## Package Versions (Pin để tránh breaking changes)
Xem danh sách đầy đủ tại `requirements.md` §1.3.2 Required Dependencies.