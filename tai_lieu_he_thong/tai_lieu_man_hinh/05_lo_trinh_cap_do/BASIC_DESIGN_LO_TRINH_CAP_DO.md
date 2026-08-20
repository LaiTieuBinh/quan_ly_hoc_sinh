# Basic Design — MH-05 Lộ trình cấp độ JLPT

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-05 |
| Tên màn hình | Lộ trình cấp độ JLPT |
| Tài liệu nguồn | `../05_lo_trinh_cap_do.md` |
| Yêu cầu liên quan | FR-LVL-01 đến FR-LVL-04, BR-01, BR-10, BR-02 |
| Người dùng | Quản trị viên, Nhân viên được cấp quyền |
| Mục đích | Theo dõi mức độ sẵn sàng lên cấp của học sinh, quản lý lịch sử cấp độ và cấu hình tiêu chí xét cấp độ JLPT. |

## 2. Nguyên tắc truy cập và nghiệp vụ

- Chỉ Quản trị viên hoặc Nhân viên có quyền quản lý lộ trình cấp độ được truy cập giao diện và API.
- Cấp độ hiện tại của mỗi học sinh chỉ có một giá trị tại một thời điểm, thuộc tập `N5`, `N4`, `N3`, `N2`, `N1`.
- Thay đổi cấp độ luôn tạo lịch sử và nhật ký; không sửa/xóa trực tiếp bản ghi lịch sử đã áp dụng.
- Điều kiện lên cấp được đánh giá từ điểm, tỷ lệ chuyên cần và đánh giá giáo viên theo cấu hình đang hiệu lực.
- Đăng ký lớp khác cấp độ hiện tại là ngoại lệ, chỉ hiển thị/cho phép khi có dấu vết phê duyệt theo BR-02.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Lộ trình cấp độ JLPT                                  [Cấu hình tiêu chí] |
+----------------------------------------------------------------------------+
| [Mã/Họ tên] [Cấp độ hiện tại ▼] [Trạng thái xét cấp ▼] [Lớp ▼] [Tìm kiếm] |
+----------------------------------------------------------------------------+
| Mã HS | Họ tên | Cấp độ | Điểm | Chuyên cần | Đánh giá | Trạng thái | [⋮] |
| HS001 | ...    | N5     | ...  | ...        | Đạt      | Sắp đạt    | [⋮] |
|                                                                      ...   |
|                                              [<] Trang 1 / N [>]           |
+----------------------------------------------------------------------------+

| Chi tiết học sinh: [Tổng quan] [Lịch sử cấp độ] [Ngoại lệ lớp]            |
+----------------------------------------------------------------------------+
```

Trên màn hình nhỏ, bộ lọc xếp theo cột; bảng có thể cuộn ngang. Hành động mỗi dòng gồm `Cập nhật cấp độ` và `Xem lịch sử`; chỉ hiện khi người dùng có quyền tương ứng.

## 4. Danh sách đánh giá lộ trình

| Mã | Thành phần | Hiển thị / quy tắc |
| --- | --- | --- |
| LVL-LST-01 | Mã và họ tên học sinh | Định danh học sinh; chọn để mở chi tiết. |
| LVL-LST-02 | Cấp độ hiện tại | Một trong N5–N1. |
| LVL-LST-03 | Điểm | Giá trị hoặc kết quả tổng hợp dùng để xét theo tiêu chí hiệu lực. |
| LVL-LST-04 | Tỷ lệ chuyên cần | Tỷ lệ trong phạm vi học vụ đã chọn. |
| LVL-LST-05 | Đánh giá giáo viên | Trạng thái/đánh giá mới nhất phù hợp tiêu chí. |
| LVL-LST-06 | Trạng thái xét cấp | `Đạt`, `Sắp đạt`, hoặc `Chưa đạt`. |
| LVL-FLT-01 | Mã/họ tên | Tìm gần đúng theo mã hoặc họ tên. |
| LVL-FLT-02 | Cấp độ/trạng thái xét cấp | Chọn một giá trị hoặc `Tất cả`. |
| LVL-FLT-03 | Lớp, niên khóa, kỳ học | Chỉ hiển thị dữ liệu trong phạm vi được cấp quyền; kỳ học thuộc niên khóa đã chọn. |

Ý nghĩa trạng thái: `Đạt` thỏa toàn bộ tiêu chí; `Sắp đạt` chưa đạt nhưng có tối thiểu một chỉ số đạt ngưỡng cảnh báo cấu hình; `Chưa đạt` là các trường hợp còn lại. Ngưỡng cảnh báo phải được hiển thị hoặc giải thích trong chi tiết để tránh suy diễn.

## 5. Cập nhật cấp độ

| Mã | Trường | Quy tắc |
| --- | --- | --- |
| LVL-FRM-01 | Học sinh | Bắt buộc, lấy từ dòng đã chọn; không được thay đổi trong hộp thoại. |
| LVL-FRM-02 | Cấp độ hiện tại | Chỉ đọc. |
| LVL-FRM-03 | Cấp độ mới | Bắt buộc, chọn N5–N1 và khác cấp độ hiện tại. |
| LVL-FRM-04 | Ngày áp dụng | Bắt buộc, là ngày hợp lệ. |
| LVL-FRM-05 | Lý do | Bắt buộc; mô tả cơ sở thay đổi cấp độ. |
| LVL-FRM-06 | Ghi chú | Không bắt buộc. |
| LVL-FRM-07 | Lưu / Hủy | Lưu sau khi xác nhận dữ liệu; Hủy không ghi nhận thay đổi. |

## 6. Lịch sử và ngoại lệ đăng ký lớp

| Khu vực | Nội dung |
| --- | --- |
| Lịch sử cấp độ | Cấp độ cũ/mới, ngày áp dụng, lý do, người thực hiện và thời gian thao tác; sắp xếp mới nhất trước. |
| Ngoại lệ lớp | Các đăng ký lớp có cấp độ không trùng cấp độ hiện tại/lịch sử tương ứng; hiển thị quyết định phê duyệt, người duyệt, thời điểm, lý do và trạng thái. |

Khi không có dữ liệu lịch sử/ngoại lệ, hiển thị trạng thái rỗng thay vì suy diễn rằng học sinh chưa từng thay đổi cấp độ.

## 7. Cấu hình tiêu chí xét cấp độ

| Nhóm tiêu chí | Nội dung cấu hình |
| --- | --- |
| Điểm | Ngưỡng điểm tối thiểu theo cấp độ đích hoặc lộ trình chuyển cấp. |
| Chuyên cần | Tỷ lệ chuyên cần tối thiểu. |
| Đánh giá giáo viên | Giá trị/trạng thái đánh giá cần có. |
| Trạng thái hiệu lực | Cấu hình đang dùng, ngày bắt đầu hiệu lực và lịch sử thay đổi. |

Chỉ người dùng có quyền cấu hình mới thấy nút và được phép thay đổi tiêu chí. Thay đổi tiêu chí không tự động sửa lịch sử cấp độ đã ghi nhận; danh sách được đánh giá lại theo cấu hình hiệu lực.

## 8. Trạng thái và tiêu chí nghiệm thu

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ riêng cho danh sách, chi tiết, lịch sử và cấu hình. |
| Không có dữ liệu | `Không tìm thấy học sinh phù hợp.` |
| Không có quyền | Ẩn hành động/tab không có quyền; API từ chối độc lập. |
| Lỗi kiểm tra | Hiển thị lỗi ngay dưới trường; giữ dữ liệu đã nhập. |
| Thành công | Thông báo xác nhận và tải lại dữ liệu liên quan. |

- Danh sách và trạng thái xét cấp phải phản ánh đúng cấu hình tiêu chí hiệu lực.
- Khi đổi cấp độ, cấp độ hiện tại, lịch sử và nhật ký phải được cập nhật đồng nhất.
- Không thể tạo cấp độ ngoài N5–N1 hoặc hai cấp độ hiện tại cho cùng học sinh.
- Ngoại lệ lớp khác cấp độ phải truy vết được phê duyệt theo BR-02.
