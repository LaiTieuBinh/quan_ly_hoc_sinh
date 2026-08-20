# Basic Design — MH-09 Thời khóa biểu và buổi học

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-09 |
| Tên màn hình | Thời khóa biểu và buổi học |
| Tài liệu nguồn | `../09_thoi_khoa_bieu_buoi_hoc.md` |
| Yêu cầu liên quan | FR-SCH-01 đến FR-SCH-03 |
| Người dùng | Quản trị viên, Nhân viên, Giáo viên được phân công, Học sinh |
| Mục đích | Lập, theo dõi và hiển thị lịch ngày/tuần/tháng cùng danh sách chi tiết buổi học theo phạm vi quyền. |

## 2. Phân quyền và phạm vi dữ liệu

| Vai trò | Xem lịch | Tạo/sửa buổi học |
| --- | --- | --- |
| Quản trị viên | Toàn bộ lịch theo bộ lọc hợp lệ. | Toàn bộ lớp/môn/phòng trong phạm vi được cấp. |
| Nhân viên | Theo quyền được cấp. | Theo quyền được cấp. |
| Giáo viên | Chỉ buổi học thuộc phân công hiệu lực của mình. | Chỉ lớp/môn thuộc phân công hiệu lực. |
| Học sinh | Chỉ buổi học của các lớp có đăng ký liên quan. | Không có quyền. |

Máy chủ xác định phạm vi từ phiên đăng nhập. Khi tạo/sửa, giáo viên chỉ được chọn phân công hiệu lực của chính mình; không thể dùng ID lớp/môn/giáo viên do client gửi để vượt quyền.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Thời khóa biểu và buổi học                    [Ngày] [Tuần] [Tháng] [List]|
+----------------------------------------------------------------------------+
| [<] [Hôm nay] [>] [Lớp ▼] [Môn ▼] [Giáo viên ▼] [Phòng ▼] [+ Tạo buổi]  |
+----------------------------------------------------------------------------+
|                    Lịch theo chế độ đang chọn                             |
|  08:00  [N5-01 | Nghe | GV A | P101]                                      |
|  10:00  [N4-02 | Ngữ pháp | GV B | P102]                                  |
+----------------------------------------------------------------------------+
| Danh sách: Lớp | Môn | Giáo viên | Phòng | Bắt đầu | Kết thúc | TT | [⋮] |
+----------------------------------------------------------------------------+
```

Trên màn hình nhỏ, lịch ưu tiên chế độ ngày/danh sách, bộ lọc xếp dọc. Người không có quyền ghi không nhìn thấy nút tạo và hành động sửa.

## 4. Hiển thị lịch và danh sách

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| SCH-VIEW-01 | Chế độ xem | Ngày, tuần, tháng, danh sách; mặc định tuần hoặc cấu hình người dùng. |
| SCH-VIEW-02 | Điều hướng thời gian | Lùi/tiến một đơn vị theo chế độ xem; `Hôm nay` đưa về ngày hiện tại. |
| SCH-FLT-01 | Lớp, môn, giáo viên, phòng | Chỉ hiển thị giá trị trong phạm vi quyền. |
| SCH-FLT-02 | Khoảng thời gian/trạng thái | Thu hẹp buổi học hiển thị; mặc định theo chế độ xem. |
| SCH-LST-01 | Buổi học | Lớp, môn, giáo viên, phòng, thời điểm bắt đầu/kết thúc, trạng thái. |
| SCH-LST-02 | Chi tiết | Chọn sự kiện/dòng để xem chi tiết và thao tác được cấp quyền. |

Học sinh chỉ nhìn thấy buổi thuộc lớp có đăng ký hiệu lực; giáo viên chỉ thấy buổi thuộc phân công hiệu lực. Thông tin không thuộc phạm vi không được trả về để hiển thị.

## 5. Biểu mẫu tạo/sửa buổi học

| Mã | Trường | Quy tắc |
| --- | --- | --- |
| SCH-FRM-01 | Phân công | Chọn một phân công hiệu lực; có thể tự điền lớp, môn, giáo viên. |
| SCH-FRM-02 | Lớp, môn, giáo viên | Bắt buộc nếu không chọn phân công trực tiếp; phải khớp một phân công hợp lệ. |
| SCH-FRM-03 | Phòng | Bắt buộc; phòng hợp lệ/đang sử dụng được. |
| SCH-FRM-04 | Thời điểm bắt đầu | Bắt buộc, định dạng ngày giờ hợp lệ. |
| SCH-FRM-05 | Thời điểm kết thúc | Bắt buộc, phải sau thời điểm bắt đầu. |
| SCH-FRM-06 | Trạng thái | Theo danh mục buổi học; mặc định `Đã lên lịch` khi tạo. |
| SCH-FRM-07 | Ghi chú | Không bắt buộc. |

Khi người dùng đổi phân công hoặc các trường lớp/môn/giáo viên, hệ thống làm mới dữ liệu liên quan và kiểm tra lại quyền cùng tính hợp lệ.

## 6. Kiểm tra xung đột thời gian

Trước khi lưu, hệ thống kiểm tra khoảng thời gian mở `(bắt đầu, kết thúc)` của buổi học mới/cập nhật với các buổi chưa hủy:

| Đối tượng kiểm tra | Điều kiện xung đột |
| --- | --- |
| Lớp học | Cùng lớp và hai khoảng thời gian chồng lấn. |
| Giáo viên | Cùng giáo viên và hai khoảng thời gian chồng lấn. |
| Phòng | Cùng phòng và hai khoảng thời gian chồng lấn. |

Khi có xung đột, không lưu dữ liệu. Hộp lỗi nêu rõ loại đối tượng, mã/tên đối tượng và buổi học đang xung đột, nhưng chỉ tiết lộ thông tin người dùng được phép biết.

## 7. Trạng thái và tiêu chí nghiệm thu

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ lịch/danh sách/chi tiết riêng. |
| Không có dữ liệu | `Không có buổi học trong khoảng thời gian đã chọn.` |
| Lỗi kiểm tra | Lỗi dưới trường hoặc hộp xung đột; giữ dữ liệu đã nhập. |
| Không có quyền | Ẩn thao tác; API từ chối độc lập. |
| Thành công | Thông báo xác nhận, cập nhật sự kiện trên lịch và danh sách. |

- Lịch ngày/tuần/tháng và danh sách hiển thị thống nhất cùng dữ liệu theo bộ lọc.
- Chỉ buổi có lớp, môn, giáo viên, phòng và thời gian hợp lệ mới được lưu.
- Không thể tạo/sửa buổi gây xung đột lớp, giáo viên hoặc phòng.
- Giáo viên/học sinh chỉ xem và thao tác trong phạm vi được xác định bởi phân công/đăng ký lớp.
