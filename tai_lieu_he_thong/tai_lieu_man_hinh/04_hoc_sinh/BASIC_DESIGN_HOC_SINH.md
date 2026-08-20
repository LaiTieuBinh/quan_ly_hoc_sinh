# Basic Design — MH-04 Quản lý học sinh

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-04 |
| Tên màn hình | Quản lý học sinh |
| Tài liệu nguồn | `../04_hoc_sinh.md` |
| Yêu cầu liên quan | FR-STU-01 đến FR-STU-03, BR-08 |
| Người dùng | Quản trị viên, Nhân viên, Giáo viên, Học sinh |
| Mục đích | Quản lý hồ sơ học sinh và cung cấp thông tin học tập phù hợp với phạm vi quyền của từng vai trò. |

## 2. Phân quyền hiển thị

| Vai trò | Danh sách | Hồ sơ | Thao tác |
| --- | --- | --- | --- |
| Quản trị viên | Xem toàn bộ | Xem toàn bộ | Thêm, sửa, xem chi tiết và các tab lịch sử. |
| Nhân viên | Xem toàn bộ theo quyền được cấp | Xem toàn bộ theo quyền được cấp | Thêm, sửa, xem chi tiết và các tab được cấp quyền. |
| Giáo viên | Chỉ học sinh thuộc lớp được phân công hợp lệ | Chỉ học sinh trong phạm vi trên | Chỉ xem hồ sơ và dữ liệu học tập được cấp quyền. |
| Học sinh | Không xem danh sách chung | Chỉ hồ sơ của chính mình | Chỉ xem các tab dữ liệu cá nhân được cấp quyền. |

- Máy chủ xác định phạm vi dữ liệu từ phiên đăng nhập; không chấp nhận `hoc_sinh_id`, `lop_hoc_id` hoặc vai trò do trình duyệt dùng để mở rộng quyền.
- Không hỗ trợ xóa cứng hồ sơ có dữ liệu phát sinh. Thay đổi trạng thái được dùng để lưu vết lịch sử.

## 3. Bố cục giao diện

```text
+--------------------------------------------------------------------------+
| Quản lý học sinh                                        [+ Thêm học sinh] |
+--------------------------------------------------------------------------+
| [Mã/Họ tên] [Trạng thái ▼] [Cấp độ ▼] [Lớp ▼] [Niên khóa ▼] [Kỳ học ▼]  |
|                                                       [Tìm kiếm] [Đặt lại] |
+--------------------------------------------------------------------------+
| Mã HS | Họ tên | Ngày sinh | Liên hệ | Trạng thái | Cấp độ | Lớp | [⋮] |
| HS001 | ...    | ...       | ...     | Đang học   | N5     | ... | [⋮] |
|                                                                        ... |
|                                            [<] Trang 1 / N [>]            |
+--------------------------------------------------------------------------+
```

Trên màn hình nhỏ, bộ lọc hiển thị theo cột; bảng cho phép cuộn ngang. Nút tạo/sửa chỉ hiện khi vai trò có quyền ghi.

## 4. Danh sách và bộ lọc

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| STU-LST-01 | Mã học sinh | Duy nhất; chọn để mở chi tiết nếu có quyền. |
| STU-LST-02 | Họ tên / ngày sinh | Hiển thị thông tin định danh cơ bản. |
| STU-LST-03 | Liên hệ | Hiển thị theo chính sách bảo vệ dữ liệu và quyền vai trò. |
| STU-LST-04 | Trạng thái | `Đang học`, `Bảo lưu`, `Nghỉ học`. |
| STU-LST-05 | Cấp độ hiện tại | N5, N4, N3, N2, N1 hoặc `—` khi không áp dụng. |
| STU-LST-06 | Lớp đang học | Danh sách lớp đang có đăng ký hiệu lực trong điều kiện lọc. |
| STU-FLT-01 | Tìm kiếm | Tìm gần đúng theo mã học sinh hoặc họ tên; bỏ khoảng trắng thừa. |
| STU-FLT-02 | Trạng thái/cấp độ | Chọn một giá trị hoặc `Tất cả`. |
| STU-FLT-03 | Lớp, niên khóa, kỳ học | Chỉ hiển thị giá trị thuộc phạm vi truy cập; kỳ học phải thuộc niên khóa được chọn. |
| STU-FLT-04 | Phân trang | Mặc định 20 dòng/trang; khi đổi bộ lọc, quay về trang 1. |

## 5. Biểu mẫu hồ sơ

| Nhóm | Trường | Quy tắc |
| --- | --- | --- |
| Định danh | Mã học sinh | Bắt buộc, duy nhất trong hệ thống. |
| Định danh | Họ tên | Bắt buộc. |
| Cá nhân | Ngày sinh | Bắt buộc, là ngày hợp lệ và không ở tương lai. |
| Cá nhân | Giới tính | Chọn theo danh mục cấu hình. |
| Cá nhân | Ảnh | Tệp ảnh hợp lệ; hỗ trợ xem trước và thay thế ảnh. |
| Liên hệ | Số điện thoại, email, địa chỉ, liên hệ người giám hộ | Lưu thông tin liên hệ; kiểm tra định dạng các trường có cấu trúc. |
| Học vụ | Trạng thái | Đang học, Bảo lưu hoặc Nghỉ học. |
| Học vụ | Cấp độ hiện tại | Bắt buộc khi trạng thái là Đang học; N5, N4, N3, N2 hoặc N1. |

## 6. Chi tiết hồ sơ và các tab

| Tab | Nội dung | Quyền mở |
| --- | --- | --- |
| Thông tin chung | Dữ liệu hồ sơ, ảnh, liên hệ, trạng thái và cấp độ hiện tại. | Theo phạm vi hồ sơ. |
| Lịch sử cấp độ | Các lần chuyển/điều chỉnh cấp độ, thời điểm và ghi chú. | Theo quyền xem học vụ. |
| Đăng ký lớp | Lớp đã/đang đăng ký, trạng thái và thời gian hiệu lực. | Theo quyền xem lớp học. |
| Chuyên cần | Tổng hợp và chi tiết điểm danh. | Theo quyền điểm danh. |
| Điểm | Kết quả đánh giá theo lớp/môn/kỳ. | Theo quyền xem điểm. |
| Học phí | Nghĩa vụ, giao dịch và công nợ. | Chỉ vai trò có quyền học phí; giáo viên/học sinh theo chính sách cấp quyền. |
| Bài tập | Bài tập được giao, bài nộp và trạng thái xử lý. | Theo quyền bài tập. |

Tab không được phép truy cập không hiển thị; API của tab vẫn phải kiểm tra quyền độc lập.

## 7. Luồng thao tác và trạng thái

| Thao tác | Kết quả |
| --- | --- |
| Thêm học sinh | Kiểm tra dữ liệu, lưu hồ sơ và hiển thị trong danh sách. |
| Sửa hồ sơ | Cập nhật các trường được phép, giữ lại lịch sử dữ liệu phát sinh. |
| Xem chi tiết | Mở hồ sơ cùng các tab phù hợp quyền. |
| Đổi trạng thái | Ghi nhận Đang học/Bảo lưu/Nghỉ học; không xóa cứng hồ sơ. |
| Tải ảnh | Kiểm tra loại/kích thước ảnh, lưu tệp và liên kết với hồ sơ. |

| Trạng thái giao diện | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ tại bảng, biểu mẫu hoặc tab đang nạp. |
| Không có dữ liệu | `Không tìm thấy học sinh phù hợp.` |
| Lỗi | Thông báo ngắn và nút `Thử lại`; không hiển thị dữ liệu ngoài quyền. |
| Dữ liệu không hợp lệ | Lỗi đặt dưới trường tương ứng, giữ lại dữ liệu đã nhập. |

## 8. Tiêu chí nghiệm thu

- Danh sách phản ánh đúng bộ lọc và phạm vi dữ liệu của người dùng.
- Học sinh đang học luôn có cấp độ hiện tại hợp lệ; mã học sinh không trùng.
- Giáo viên không thể xem học sinh ngoài lớp được phân công; học sinh chỉ xem hồ sơ của mình.
- Các tab chỉ xuất hiện và trả dữ liệu khi người dùng có quyền.
- Hồ sơ có dữ liệu phát sinh không thể bị xóa cứng; lịch sử vẫn truy vết được sau đổi trạng thái.
