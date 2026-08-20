# Basic Design — MH-07 Lớp học và đăng ký lớp

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-07 |
| Tên màn hình | Lớp học và đăng ký lớp |
| Tài liệu nguồn | `../07_lop_hoc_dang_ky.md` |
| Yêu cầu liên quan | FR-CLS-01 đến FR-CLS-03, BR-02, BR-03 |
| Người dùng | Quản trị viên, Nhân viên, Giáo viên, Học sinh |
| Mục đích | Quản lý lớp học, đăng ký học sinh và lịch sử chuyển/kết thúc/hủy đăng ký. |

## 2. Phân quyền

| Vai trò | Lớp học | Đăng ký lớp |
| --- | --- | --- |
| Quản trị viên | Xem toàn bộ, tạo/sửa lớp và quản lý đăng ký. | Xem, tạo và cập nhật trạng thái. |
| Nhân viên | Theo quyền được cấp. | Theo quyền được cấp. |
| Giáo viên | Chỉ xem lớp/phân công liên quan. | Chỉ xem học sinh và đăng ký thuộc lớp được phân công. |
| Học sinh | Chỉ xem lớp/đăng ký của chính mình. | Không tạo/sửa. |

Máy chủ xác định phạm vi từ phiên đăng nhập. Giáo viên/học sinh không thể mở rộng phạm vi bằng ID lớp hoặc học sinh trong URL/API.

## 3. Bố cục giao diện

```text
+------------------------------------------------------------------------+
| Lớp học và đăng ký lớp                                                 |
+------------------------------------------------------------------------+
| [Lớp học] [Đăng ký lớp]                                                |
+------------------------------------------------------------------------+
| [Mã/Tên lớp] [Cấp độ ▼] [Niên khóa ▼] [Kỳ học ▼] [Trạng thái ▼] [+ Thêm]|
| Mã lớp | Tên | Cấp độ | Niên khóa | Kỳ học | Phòng | Sĩ số | TT | [⋮] |
| ...                                                                    |
+------------------------------------------------------------------------+
```

Trong tab **Đăng ký lớp**, bộ lọc là học sinh, lớp, niên khóa/kỳ học và trạng thái; nút `Đăng ký học sinh` chỉ hiển thị khi có quyền ghi. Trên màn hình nhỏ, bộ lọc xếp dọc và bảng cuộn ngang.

## 4. Danh sách lớp học và biểu mẫu

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| CLS-LST-01 | Mã/tên lớp | Hiển thị định danh lớp; mã là duy nhất theo chính sách. |
| CLS-LST-02 | Cấp độ | Bắt buộc, N5–N1. |
| CLS-LST-03 | Niên khóa/kỳ học | Mỗi lớp có đúng một niên khóa và một kỳ học; kỳ học thuộc niên khóa. |
| CLS-LST-04 | Phòng học | Thông tin phòng được gán cho lớp. |
| CLS-LST-05 | Sĩ số | Số học sinh có đăng ký `Đang học` hiệu lực. |
| CLS-LST-06 | Trạng thái | Trạng thái hoạt động theo danh mục lớp. |
| CLS-FRM-01 | Mã, tên, cấp độ | Bắt buộc khi tạo/sửa. |
| CLS-FRM-02 | Niên khóa, kỳ học | Bắt buộc; chọn niên khóa trước, sau đó chỉ hiện kỳ học thuộc niên khóa. |
| CLS-FRM-03 | Phòng học, trạng thái | Nhập/chọn theo cấu hình hệ thống. |

## 5. Danh sách và biểu mẫu đăng ký lớp

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| ENR-LST-01 | Học sinh/lớp | Hiển thị mã, tên học sinh và lớp đăng ký. |
| ENR-LST-02 | Ngày đăng ký | Bắt buộc; là mốc bắt đầu hiệu lực. |
| ENR-LST-03 | Trạng thái | `Đang học`, `Đã chuyển lớp`, `Đã kết thúc`, `Hủy`. |
| ENR-FRM-01 | Học sinh | Bắt buộc; chỉ chọn học sinh hợp lệ theo phạm vi và trạng thái. |
| ENR-FRM-02 | Lớp | Bắt buộc; chỉ chọn lớp hợp lệ/đang áp dụng. |
| ENR-FRM-03 | Ngày đăng ký | Bắt buộc, ngày hợp lệ. |
| ENR-FRM-04 | Trạng thái | Mặc định `Đang học` khi tạo. |
| ENR-FRM-05 | Lý do/ghi chú | Bắt buộc khi chuyển, kết thúc hoặc hủy theo chính sách. |

Không xóa lịch sử đăng ký. Khi chuyển/kết thúc/hủy, hệ thống cập nhật trạng thái bản ghi hiện có hoặc tạo bản ghi liên quan theo mô hình dữ liệu, đồng thời ghi nhật ký.

## 6. Kiểm tra cấp độ và ngoại lệ

- Khi chọn lớp, hệ thống so sánh cấp độ lớp với cấp độ hiện tại của học sinh.
- Nếu khác cấp độ, hiển thị cảnh báo và chỉ cho lưu khi tồn tại ngoại lệ đã phê duyệt theo BR-02.
- Không được tạo hai đăng ký `Đang học` chồng lấn của cùng một học sinh trong cùng một lớp (BR-03).
- Sĩ số được tính từ đăng ký `Đang học` hiệu lực, không tính bản ghi chuyển/kết thúc/hủy.

## 7. Trạng thái và tiêu chí nghiệm thu

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ riêng cho từng tab/bảng. |
| Không có dữ liệu | Thông báo theo bộ lọc đang chọn. |
| Lỗi kiểm tra | Hiển thị tại trường và giữ dữ liệu đã nhập. |
| Không có quyền | Ẩn thao tác; API từ chối độc lập. |
| Thành công | Thông báo xác nhận và tải lại dữ liệu liên quan. |

- Lớp chỉ được lưu khi niên khóa, kỳ học và cấp độ hợp lệ.
- Đăng ký có đủ học sinh, lớp, ngày và trạng thái; lịch sử luôn được bảo toàn.
- Cảnh báo/lý do ngoại lệ cấp độ phải truy vết được.
- Giáo viên và học sinh chỉ xem dữ liệu có liên quan đến mình.
