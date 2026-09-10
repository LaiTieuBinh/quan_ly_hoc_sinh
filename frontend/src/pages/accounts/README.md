# MH-03 — Tài khoản và phân quyền

Mở `/tai-khoan` bằng phiên Quản trị viên. Menu và màn hình kiểm tra vai trò qua `AuthContext` hiện có.

Giao diện dùng nền đen mận, sắc đỏ hồng và tím; CSS được giới hạn trong `accounts-shell` để không đổi giao diện màn hình khác.

## Dữ liệu

- Mặc định là **Bản xem thử UI**, gồm 26 tài khoản mẫu để thử phân trang 20 dòng.
- Tạo, sửa, đổi vai trò và khóa/mở khóa chỉ cập nhật bộ nhớ của trang. Tải lại hoặc rời trang sẽ mất thay đổi mẫu.
- Mật khẩu chỉ tồn tại trong biểu mẫu đang mở, không được đưa vào dữ liệu mẫu, localStorage, thông báo hay nhật ký. Luồng đặt lại mật khẩu mẫu không thay đổi thông tin đăng nhập.
- Đặt `VITE_ACCOUNTS_DEMO=false` trong cấu hình môi trường frontend để sử dụng các endpoint trong Detail Design qua `services/http.ts` và phiên cookie hiện có. Không tự chuyển sang dữ liệu mẫu khi API lỗi.
- Backend hiện chưa triển khai nhóm endpoint này. Việc băm mật khẩu, thu hồi phiên, phân quyền API, kiểm tra giao dịch và audit phải được triển khai phía máy chủ trước khi dùng thực tế.
- Liên kết hồ sơ thật trỏ tới `/hoc-sinh?id=…` hoặc `/giao-vien?id=…`; màn hình đích cần hỗ trợ mở chi tiết theo ID. Hồ sơ mẫu không điều hướng sang dữ liệu thật.

## Kiểm tra thủ công

1. Mở menu bằng Quản trị viên; thử URL trực tiếp bằng vai trò khác và kiểm tra không thấy dữ liệu tài khoản.
2. Tìm tên có khoảng trắng đầu/cuối, kết hợp vai trò và trạng thái; đặt lại và chuyển trang 2.
3. Tạo tài khoản Nhân viên; thử tên trùng với chữ hoa/thường khác nhau.
4. Tạo Giáo viên/Học sinh và chọn hồ sơ còn trống; kiểm tra hồ sơ đang dùng không xuất hiện.
5. Sửa tài khoản có hồ sơ sang Nhân viên; yêu cầu xác nhận gỡ liên kết.
6. Khóa/mở khóa một tài khoản; thử khóa hoặc đổi vai trò `admin.tokuda` khi đó là quản trị viên hoạt động duy nhất.
7. Đặt lại mật khẩu với hai giá trị khác nhau; đóng/mở lại hộp thoại và kiểm tra trường mật khẩu rỗng.
8. Đặt `VITE_ACCOUNTS_DEMO=false` và khởi động lại frontend khi API chưa sẵn sàng; kiểm tra thông báo lỗi và nút Thử lại.
9. Dùng Tab, Shift+Tab, Escape trong hộp thoại; thử bố cục điện thoại và cuộn ngang bảng.

Kiểm tra build: `npm run build -w frontend`.
