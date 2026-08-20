# Công nghệ và database đã chốt

## 1. Công nghệ sử dụng

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | ReactJS + TypeScript + Vite |
| Backend | Node.js + TypeScript + NestJS |
| ORM | Prisma |
| Database | PostgreSQL 17 |
| Môi trường local | PostgreSQL 17 cài trực tiếp trên Windows, chạy bằng Windows Service |
| Công cụ quản lý database | pgAdmin (khuyến nghị) hoặc DBeaver Community |
| Kiểu API | REST API, base URL `/api/v1` |

## 2. Kiến trúc tổng quát

```text
ReactJS
   ↓ HTTP/JSON
NestJS API
   ↓ Prisma ORM
PostgreSQL
```

Frontend không kết nối trực tiếp tới database. Mọi thao tác dữ liệu phải đi qua backend để kiểm tra xác thực, phân quyền, dữ liệu đầu vào và các quy tắc nghiệp vụ.

## 3. Lý do chọn PostgreSQL

PostgreSQL phù hợp với hệ thống vì dữ liệu có nhiều quan hệ giữa học sinh, lớp học, giáo viên, điểm danh, điểm số, học phí, bài tập và tài liệu. Database hỗ trợ tốt:

- Khóa chính, khóa ngoại, unique và check constraint.
- Transaction và khóa bản ghi cho các nghiệp vụ quan trọng như thu học phí.
- Kiểu `numeric` chính xác cho dữ liệu tiền tệ.
- Truy vấn báo cáo, thống kê, phân trang và đánh index.
- Ràng buộc và kiểm tra lịch học bị chồng chéo.

## 4. Cấu trúc dự án dự kiến

```text
quan_ly_hoc_sinh/
├── frontend/
├── backend/
│   ├── src/
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       └── seed.ts
└── tai_lieu_he_thong/
```

## 5. Cấu hình kết nối local dự kiến

```env
DATABASE_URL="postgresql://qlhs_user:change_me_local@localhost:5432/quan_ly_hoc_sinh?schema=public"
```

Thông số kết nối:

| Thuộc tính | Giá trị |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| Database | `quan_ly_hoc_sinh` |
| Username | `qlhs_user` |
| Password | Đặt trong file `.env`, không commit lên Git |

## 6. Quy trình khởi tạo dự kiến

1. Cài PostgreSQL 17 trực tiếp trên Windows bằng bộ cài chính thức.
2. Đảm bảo dịch vụ PostgreSQL đang chạy và lắng nghe tại `localhost:5432`.
3. Dùng pgAdmin hoặc `psql` để tạo user và database local:

```sql
CREATE USER qlhs_user WITH PASSWORD 'change_me_local';
CREATE DATABASE quan_ly_hoc_sinh OWNER qlhs_user;
```

4. Tạo file `backend/.env` từ `backend/.env.example`, sau đó chạy Prisma:

```powershell
cd backend
npx prisma migrate dev --name init
npx prisma db seed
npx prisma studio
```

Database phải được tạo và cập nhật bằng Prisma migration, không chỉnh sửa cấu trúc thủ công trong DBeaver hoặc pgAdmin.

Docker Desktop và Docker Compose không phải là yêu cầu của môi trường local. File `compose.yaml`, nếu còn được giữ trong repository, chỉ là phương án tùy chọn cho máy có hỗ trợ Docker và không thuộc quy trình local đã chốt.

## 7. Các bước triển khai tiếp theo

1. Cài PostgreSQL 17 trực tiếp trên Windows và tạo database local bằng pgAdmin hoặc `psql`.
2. Khởi tạo backend NestJS và cấu hình Prisma.
3. Chuyển ERD hiện có thành `schema.prisma`.
4. Tạo migration đầu tiên và dữ liệu seed.
5. Xây dựng API theo tài liệu `/api/v1`.
6. Khởi tạo frontend React và tích hợp với backend.
