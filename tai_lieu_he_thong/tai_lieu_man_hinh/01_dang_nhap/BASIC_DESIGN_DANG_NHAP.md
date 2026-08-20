# Basic Design — MH-01 Đăng nhập

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-01 |
| Tên màn hình | Đăng nhập |
| Tài liệu nguồn | `../01_dang_nhap.md` |
| Yêu cầu liên quan | FR-AUTH-01, FR-AUTH-02, NFR-02, NFR-04 |
| Người dùng | Quản trị viên, nhân viên, giáo viên, học sinh |
| Mục đích | Xác thực người dùng, tạo phiên đăng nhập và đưa họ đến khu vực phù hợp với vai trò. |

## 2. Phạm vi và nguyên tắc

- Chỉ tài khoản có trạng thái hoạt động mới được đăng nhập.
- Mật khẩu không được hiển thị, ghi log hoặc truyền/lưu dưới dạng văn bản thuần.
- Khi xác thực thất bại, giao diện chỉ hiển thị một thông báo chung; không tiết lộ tên đăng nhập, mật khẩu hay trạng thái tài khoản là nguyên nhân cụ thể.
- Sự kiện đăng nhập thành công và thất bại phải được ghi nhật ký.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------+
|                    HỆ THỐNG QUẢN LÝ                     |
|                    HỌC SINH TIẾNG NHẬT                  |
|                                                          |
|                 ĐĂNG NHẬP                               |
|                                                          |
|  Tên đăng nhập *                                         |
|  [_______________________________________________]      |
|                                                          |
|  Mật khẩu *                                              |
|  [_______________________________________________] [👁] |
|                                                          |
|                    [ Đăng nhập ]                         |
|                                                          |
|  [Khu vực hiển thị lỗi/xác thực]                         |
+----------------------------------------------------------+
```

Màn hình căn giữa, sử dụng tốt trên máy tính và điện thoại. Trường mật khẩu có nút bật/tắt hiển thị; trạng thái mặc định luôn che ký tự.

## 4. Thành phần giao diện

| Mã | Thành phần | Loại | Bắt buộc | Hành vi |
| --- | --- | --- | --- | --- |
| LGN-01 | Tên đăng nhập | Ô nhập văn bản | Có | Nhận tên đăng nhập, hỗ trợ phím Enter để gửi biểu mẫu. |
| LGN-02 | Mật khẩu | Ô nhập mật khẩu | Có | Che ký tự; nút hiển thị chỉ có tác dụng cục bộ trên giao diện. |
| LGN-03 | Hiển thị mật khẩu | Nút biểu tượng | Không | Đổi kiểu hiển thị giữa `password` và `text`; không lưu lựa chọn. |
| LGN-04 | Đăng nhập | Nút chính | — | Gửi dữ liệu khi biểu mẫu hợp lệ; bị vô hiệu trong lúc đang xử lý. |
| LGN-05 | Thông báo | Vùng cảnh báo | — | Hiển thị lỗi kiểm tra trường hoặc lỗi xác thực chung. |

## 5. Luồng xử lý

1. Người dùng mở màn hình đăng nhập; nếu đã có phiên hợp lệ, chuyển thẳng đến Tổng quan.
2. Người dùng nhập tên đăng nhập và mật khẩu rồi chọn **Đăng nhập** hoặc nhấn Enter.
3. Giao diện kiểm tra hai trường bắt buộc. Nếu có lỗi, hiển thị lỗi dưới trường tương ứng và không gửi yêu cầu.
4. Hệ thống xác thực tên đăng nhập, mật khẩu mã hóa và trạng thái tài khoản.
5. Nếu thành công, tạo phiên an toàn, ghi nhật ký và chuyển đến Tổng quan trong phạm vi quyền của vai trò.
6. Nếu thất bại, ghi nhật ký thất bại, xóa giá trị mật khẩu trên giao diện và hiển thị thông báo chung.

## 6. Điều hướng sau đăng nhập

| Vai trò | Trang đích ban đầu | Phạm vi dữ liệu |
| --- | --- | --- |
| Quản trị viên | Tổng quan quản trị | Toàn bộ dữ liệu theo quyền quản trị. |
| Nhân viên | Tổng quan nghiệp vụ | Học sinh, đăng ký lớp, lớp học, học phí và báo cáo được cấp quyền. |
| Giáo viên | Tổng quan giảng dạy | Lớp, môn và dữ liệu được phân công. |
| Học sinh | Tổng quan học sinh | Dữ liệu cá nhân và lớp đang tham gia. |

## 7. Thông báo

| Tình huống | Nội dung hiển thị |
| --- | --- |
| Bỏ trống tên đăng nhập | `Vui lòng nhập tên đăng nhập.` |
| Bỏ trống mật khẩu | `Vui lòng nhập mật khẩu.` |
| Xác thực thất bại hoặc tài khoản không hoạt động | `Không thể đăng nhập. Vui lòng kiểm tra thông tin đăng nhập hoặc liên hệ quản trị viên.` |
| Lỗi hệ thống/kết nối | `Không thể kết nối đến hệ thống. Vui lòng thử lại sau.` |

## 8. Tiêu chí nghiệm thu giao diện

- Người dùng có thể đăng nhập bằng tên đăng nhập và mật khẩu hợp lệ.
- Mật khẩu luôn bị che trước khi người dùng chọn biểu tượng hiển thị.
- Tài khoản không hoạt động không vào được hệ thống và nhận thông báo chung.
- Người dùng được điều hướng đúng phạm vi vai trò sau khi đăng nhập.
- Không có thông báo nào tiết lộ riêng trường nào (tên đăng nhập, mật khẩu hoặc trạng thái tài khoản) đã sai.
