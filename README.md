# Sora Academy — Hệ thống quản lý học sinh tiếng Nhật

MVP được xây dựng theo `tai_lieu_he_thong/CONG_NGHE_VA_DATABASE_DA_CHOT.md`:

- Frontend: React 19 + TypeScript + Vite.
- Backend: Node.js + TypeScript + NestJS.
- ORM/database: Prisma + PostgreSQL 17.
- REST API: `/api/v1`.

## Chạy dự án

Yêu cầu Node.js 22+, npm và Docker Desktop.

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
npm install
docker compose up -d
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Mở `http://localhost:5173`. Tài khoản seed: `admin` / `Admin@123`.

## Phạm vi hiện có

- Đăng nhập JWT và endpoint `/auth/me`.
- Dashboard tổng hợp dữ liệu thật từ PostgreSQL.
- Danh sách, tìm kiếm, phân trang, tạo và cập nhật học sinh.
- Audit khi tạo/cập nhật hồ sơ.
- Prisma schema đầy đủ các bảng cốt lõi trong ERD: tài khoản, học sinh, giáo viên, lớp, đăng ký, lịch học, điểm danh, đánh giá, JLPT, học phí, bài tập và tài liệu.

Các màn hình còn lại đã có điều hướng và nền dữ liệu; triển khai API/use case tiếp theo theo `tai_lieu_he_thong/tai_lieu_api/README.md`.

## Lệnh hữu ích

```powershell
npm run build
npm run test
npm run db:migrate -- --name ten_thay_doi
cd backend; npx prisma studio
```

Không commit `.env`. Trước khi deploy phải thay `JWT_SECRET`, mật khẩu PostgreSQL và bật HTTPS.
