# MH-01 — Đăng nhập

**Người dùng:** Quản trị viên, nhân viên, giáo viên, học sinh.  
**Liên quan:** FR-AUTH-01, FR-AUTH-02, NFR-02, NFR-04.

## Thành phần

| Thành phần | Mô tả / kiểm tra |
| --- | --- |
| Tên đăng nhập | Bắt buộc. So khớp với `TaiKhoan.ten_dang_nhap`. |
| Mật khẩu | Bắt buộc, che ký tự; chỉ so sánh với mật khẩu đã mã hóa. |
| Đăng nhập | Xác thực tài khoản đang hoạt động, tạo phiên làm việc và chuyển đến Tổng quan. |
| Thông báo lỗi | Không tiết lộ tên đăng nhập hay mật khẩu nào sai; báo lỗi chung khi xác thực thất bại. |

## Luồng và quyền

1. Người dùng nhập tên đăng nhập và mật khẩu, sau đó chọn **Đăng nhập**.
2. Hệ thống kiểm tra tài khoản, trạng thái và mật khẩu mã hóa.
3. Khi thành công, điều hướng theo vai trò; mọi lần đăng nhập thành công/thất bại cần ghi nhật ký.
4. Tài khoản bị khóa hoặc không hoạt động không được tạo phiên đăng nhập.
