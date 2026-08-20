# MH-03 — Tài khoản và phân quyền

**Người dùng:** Quản trị viên.  
**Liên quan:** FR-AUTH-02, FR-AUTH-03, NFR-02.

## Danh sách tài khoản

Hiển thị tên đăng nhập, vai trò, trạng thái, hồ sơ liên kết, thời gian tạo/cập nhật. Có tìm kiếm theo tên đăng nhập và lọc theo vai trò, trạng thái.

## Biểu mẫu tạo/cập nhật

| Trường | Quy tắc |
| --- | --- |
| Tên đăng nhập | Bắt buộc, duy nhất. |
| Mật khẩu | Bắt buộc khi tạo; lưu dạng mã hóa, không hiển thị lại. |
| Vai trò | Bắt buộc: Quản trị viên, Nhân viên, Giáo viên hoặc Học sinh. |
| Trạng thái | Hoạt động hoặc khóa; tài khoản khóa không thể đăng nhập. |
| Hồ sơ liên kết | Tối đa một hồ sơ học sinh hoặc giáo viên khi vai trò tương ứng. |

## Thao tác

- Tạo, sửa, khóa/mở khóa, đặt lại mật khẩu và gán vai trò.
- Không cho phép người không phải quản trị viên truy cập màn hình hoặc API này.
