# MH-03 — Tài khoản và phân quyền

Mở `/tai-khoan` bằng phiên Quản trị viên. Menu và màn hình kiểm tra vai trò qua `AuthContext` hiện có.

Giao diện dùng nền đen mận, sắc đỏ hồng và tím; CSS được giới hạn trong `accounts-shell` để không đổi giao diện màn hình khác.

## Dữ liệu

- Bốn thẻ vai trò hiển thị tổng tài khoản thực tế từ `role_counts` trong API danh sách, gồm cả tài khoản hoạt động và bị khóa. Các số này không bị giới hạn bởi bộ lọc hay trang hiện tại; cập nhật sau thao tác lưu. Trong lúc tải hoặc có lỗi, hiển thị `—`.

- Màn hình luôn sử dụng API thật; đã loại bỏ dữ liệu mẫu và biến `VITE_ACCOUNTS_DEMO`.
- `VITE_API_URL` mặc định là `http://localhost:3000/api/v1`. Frontend và backend cần dùng cùng hostname khi chạy local để cookie SameSite hoạt động (không trộn `localhost` với `127.0.0.1`). `FRONTEND_URL` của backend phải khớp origin frontend.
- Tạo, sửa, đổi vai trò, khóa/mở khóa và đặt lại mật khẩu lưu trong PostgreSQL. Sau khi tạo, danh sách trở về bộ lọc mặc định và trang đầu để hiển thị bản ghi mới. Các cập nhật khác tải lại danh sách theo bộ lọc hiện tại.
- Trước khi mở biểu mẫu/chọn thao tác trên tài khoản, FE tải chi tiết mới nhất từ `GET /tai-khoan/:id`. Hồ sơ liên kết được tìm kiếm từ API khả dụng đúng loại.
- `mutation()` lấy token qua `/auth/csrf-token`, gửi `X-CSRF-Token` cùng cookie cho POST/PATCH. Chỉ thử lại khi backend từ chối CSRF trước thao tác ghi; không tự gửi lại thao tác khi lỗi mạng.
- Lỗi trường từ backend được chuẩn hóa từ mảng thành chuỗi và hiển thị dưới trường tương ứng, gồm `mat_khau_moi` và hai trường ID hồ sơ.
- Chính sách mật khẩu đồng bộ BE: 12–128 ký tự Unicode; không cắt khoảng trắng. Mật khẩu chỉ tồn tại trong biểu mẫu đang mở, không lưu localStorage, thông báo hay nhật ký.
- HTTP 401 được thử refresh phiên một lần. Nếu không khôi phục được phiên, `AuthContext` xóa người dùng và router chuyển về đăng nhập. Thay đổi tài khoản của chính mình tải lại phiên để xử lý ngay việc bị khóa, đổi vai trò/hồ sơ hoặc đặt lại mật khẩu.
- Backend băm mật khẩu, kiểm tra quyền, liên kết hồ sơ, bảo vệ quản trị viên cuối cùng, thu hồi phiên và audit. Xem `backend/src/tai-khoan/README.md`.
- Liên kết hồ sơ trỏ tới `/hoc-sinh?id=…` hoặc `/giao-vien?id=…`; khả năng mở chi tiết theo ID thuộc màn hình đích và chưa được bổ sung trong phần tích hợp MH-03.

## Kiểm tra thủ công

1. Mở menu bằng Quản trị viên; thử URL trực tiếp bằng vai trò khác và kiểm tra không thấy dữ liệu tài khoản.
2. Tìm tên có khoảng trắng đầu/cuối, kết hợp vai trò và trạng thái; đặt lại và chuyển trang 2.
3. Tạo tài khoản Nhân viên; thử tên trùng với chữ hoa/thường khác nhau.
4. Tạo Giáo viên/Học sinh và chọn hồ sơ còn trống; kiểm tra hồ sơ đang dùng không xuất hiện.
5. Sửa tài khoản có hồ sơ sang Nhân viên; yêu cầu xác nhận gỡ liên kết.
6. Khóa/mở khóa một tài khoản; thử khóa hoặc đổi vai trò của quản trị viên hoạt động duy nhất.
7. Đặt lại mật khẩu với hai giá trị khác nhau; đóng/mở lại hộp thoại và kiểm tra trường mật khẩu rỗng.
8. Dừng backend; kiểm tra thông báo lỗi và nút Thử lại, không xuất hiện dữ liệu mẫu.
9. Dùng Tab, Shift+Tab, Escape trong hộp thoại; thử bố cục điện thoại và cuộn ngang bảng.

Kiểm tra build: `npm run build -w frontend`.

Kiểm thử tự động: đặt `ACCOUNT_TEST_DATABASE_URL` tới PostgreSQL local rồi chạy `npm test -w backend`. Suite tích hợp chạy service FE thật với cookie qua HTTP tới Nest và schema database riêng: đăng nhập, CSRF, tạo/sửa, trùng tên, tìm hồ sơ, khóa/mở khóa, đặt lại mật khẩu, lưu dữ liệu và refresh/thu hồi phiên. Đây là kiểm thử service FE–BE, không phải kiểm thử tương tác giao diện trong trình duyệt.
