# MH-03 — API Tài khoản và phân quyền

Triển khai theo `03_tai_khoan_phan_quyen.md`, Basic Design, Detail Design, sơ đồ di chuyển màn hình và đặc tả hệ thống. Module sử dụng phiên đăng nhập, Prisma/PostgreSQL và nhật ký thao tác hiện có.

## Endpoint

Tất cả đường dẫn bên dưới có tiền tố `/api/v1`, yêu cầu phiên hợp lệ và vai trò hiện tại trong database là `QUAN_TRI_VIEN`.

| Method | Đường dẫn | Chức năng |
| --- | --- | --- |
| GET | `/tai-khoan` | Tìm tên gần đúng không phân biệt hoa thường, lọc vai trò/trạng thái, sắp xếp, phân trang |
| POST | `/tai-khoan` | Tạo tài khoản và liên kết hồ sơ |
| GET | `/tai-khoan/:id` | Thông tin an toàn và hành động được phép |
| PATCH | `/tai-khoan/:id` | Cập nhật thông tin, vai trò, trạng thái, hồ sơ; không nhận mật khẩu |
| PATCH | `/tai-khoan/:id/trang-thai` | Khóa/mở khóa |
| POST | `/tai-khoan/:id/dat-lai-mat-khau` | Đặt lại mật khẩu, mặc định thu hồi phiên |
| GET | `/ho-so/giao-vien-kha-dung` | Hồ sơ giáo viên khả dụng |
| GET | `/ho-so/hoc-sinh-kha-dung` | Hồ sơ học sinh khả dụng |

Payload, cấu trúc `data`/`meta` và mã lỗi tuân theo Detail Design. Tạo trả 201; các thao tác còn lại trả 200. Dữ liệu body không hợp lệ trả 422, query/ID sai trả 400, thiếu phiên 401, thiếu quyền 403, không tồn tại 404, xung đột 409, quá giới hạn đặt lại 429.

## Quy ước và bảo mật

- API dùng trạng thái `KHOA`, ánh xạ sang enum database `BI_KHOA`. Giáo viên hoạt động trả `DANG_HOAT_DONG`.
- Database giữ quan hệ `HocSinh.taiKhoanId`/`GiaoVien.taiKhoanId`; API nhận `hoc_sinh_id`/`giao_vien_id` như tài liệu. Chỉ một hồ sơ đúng loại được liên kết; đổi sang Nhân viên/Quản trị viên phải gửi hai ID bằng `null`.
- Hồ sơ khả dụng gồm hồ sơ chưa liên kết hoặc đang thuộc tài khoản được sửa. Mặc định chỉ hồ sơ đang hoạt động, cộng hồ sơ đang liên kết dù đã ngừng hoạt động. Quản trị viên có thể dùng `include_inactive=true` để chọn hồ sơ khác trạng thái.
- ID API là số nguyên dương an toàn trong JSON, tối đa `Number.MAX_SAFE_INTEGER`; database vẫn dùng BigInt. Ngày giờ trả ISO-8601.
- Trang mặc định 1, 20 dòng/trang, tối đa 100; sắp xếp mặc định `-updated_at`, thêm ID để ổn định thứ tự. Các truy vấn đếm/danh sách dùng cùng snapshot.
- Chính sách mật khẩu cho module: 12–128 ký tự Unicode, không cắt khoảng trắng trong mật khẩu; băm Argon2id với salt. Giá trị này nằm ở `password()` trong `account.input.ts`.
- Mật khẩu/hash/token không có trong response hoặc audit. Audit chỉ ghi dữ liệu được chọn rõ ràng, không ghi raw request/exception. Lý do khóa chỉ ghi nhận có/không trong audit, tránh lưu nội dung tự do có thể chứa bí mật.
- Giao dịch ghi dùng advisory lock chung trên PostgreSQL, cùng row lock tài khoản, để bảo vệ quản trị viên cuối cùng và cập nhật hồ sơ đồng thời qua module. Đây là kiểm tra nghiệp vụ của API; các thao tác SQL trực tiếp phải tự tuân thủ quy tắc tương ứng.
- Migration bổ sung unique index `LOWER(BTRIM(ten_dang_nhap))`. Nếu dữ liệu cũ trùng sau chuẩn hóa, migration dừng để xử lý dữ liệu, không tự đổi tên/xóa tài khoản.
- JWT được đối chiếu với phiên, trạng thái và vai trò hiện tại trong database ở mỗi request. Khóa, đổi vai trò hoặc đổi hồ sơ sẽ thu hồi phiên; mở khóa yêu cầu đăng nhập mới. Tạo phiên đăng nhập khóa row và kiểm tra lại hash đã xác thực để tránh cuộc đua với đặt lại mật khẩu.
- Giới hạn đặt lại: 5 lần/tài khoản đích và 20 lần/người thực hiện trong 15 phút, lưu trên database và dùng chung giữa các worker. Tính cả lỗi validation; lỗi giới hạn có `Retry-After: 900`. Thành công/thất bại được audit an toàn.
- Với cookie authentication, các POST/PATCH phải gửi `X-CSRF-Token` khớp cookie CSRF lấy qua `GET /api/v1/auth/csrf-token`. Bearer authentication không yêu cầu CSRF nếu không có access cookie.

## Chạy và kiểm thử

Từ thư mục gốc:

```powershell
npm run prisma:generate -w backend
npx prisma migrate deploy --schema backend/prisma/schema.prisma
npm run build -w backend
npm test -w backend
```

Chạy migration từ thư mục `backend` nếu `DATABASE_URL` được cấu hình trong `backend/.env`. Không dùng `migrate reset` trên dữ liệu hiện có.

Kiểm thử PostgreSQL được bật bằng biến `ACCOUNT_TEST_DATABASE_URL` trỏ tới database local, rồi chạy `npm test -w backend`. Suite tự tạo schema tên `account_api_test_<uuid>`, áp dụng toàn bộ migration, gửi HTTP thật qua Nest và dọn đúng schema này sau kiểm thử. Cần tài khoản database có quyền tạo/xóa schema. Nếu biến chưa được đặt, suite tích hợp được bỏ qua và unit test vẫn chạy.

Các test bao phủ quyền của cả bốn vai trò, phiên bị thu hồi, CSRF, tìm kiếm/phân trang, hash và dữ liệu an toàn, trùng tên, liên kết hồ sơ, hai yêu cầu tranh cùng hồ sơ, hai quản trị viên tự khóa đồng thời, đổi vai trò quản trị viên cuối cùng, mật khẩu/thu hồi phiên và rate limit.

Phần này triển khai backend. Frontend tích hợp cần gửi CSRF cho thao tác ghi và áp dụng cùng chính sách mật khẩu.
