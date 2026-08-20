# Basic Design — MH-10 Điểm danh

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-10 |
| Tên màn hình | Điểm danh |
| Tài liệu nguồn | `../10_diem_danh.md` |
| Yêu cầu liên quan | FR-ATT-01 đến FR-ATT-03, BR-04 đến BR-06, BR-10 |
| Người dùng | Giáo viên được phân công, Quản trị viên, Nhân viên theo quyền, Học sinh |
| Mục đích | Ghi nhận chuyên cần theo buổi học, quản lý lịch sử điều chỉnh và cung cấp thống kê theo phạm vi quyền. |

## 2. Phân quyền

| Vai trò | Xem | Ghi/sửa |
| --- | --- | --- |
| Quản trị viên | Toàn bộ theo bộ lọc hợp lệ. | Theo quyền được cấp. |
| Nhân viên | Theo quyền được cấp. | Theo quyền được cấp. |
| Giáo viên | Chỉ buổi/lớp/môn có phân công hiệu lực. | Điểm danh và sửa trong phạm vi trên. |
| Học sinh | Chỉ bản ghi và thống kê của chính mình. | Không có quyền. |

Máy chủ luôn đối chiếu phân công hiệu lực của giáo viên và đăng ký lớp hiệu lực của học sinh tại ngày diễn ra buổi học. Không chấp nhận danh sách học sinh tùy ý từ trình duyệt.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Điểm danh                                                                   |
+----------------------------------------------------------------------------+
| [Điểm danh buổi học] [Thống kê chuyên cần]                                 |
+----------------------------------------------------------------------------+
| [Buổi học ▼] [Lớp/Môn] [Ngày giờ]                         [Tải danh sách] |
| Mã HS | Họ tên | Trạng thái ▼ | Ghi chú                       [Lưu tất cả] |
| HS001 | ...    | [Có mặt ▼]  | ...                                           |
| HS002 | ...    | [Đi muộn ▼] | ...                                           |
+----------------------------------------------------------------------------+
```

Tab **Thống kê chuyên cần** có bộ lọc học sinh, lớp, cấp độ, niên khóa, kỳ học và khoảng thời gian. Trên màn hình nhỏ, danh sách điểm danh hiển thị dạng thẻ hoặc bảng cuộn ngang; nút lưu vẫn cố định, dễ truy cập.

## 4. Điểm danh theo buổi học

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| ATT-SES-01 | Chọn buổi học | Chỉ hiện buổi trong phạm vi quyền; tải học sinh đăng ký hợp lệ tại ngày diễn ra. |
| ATT-SES-02 | Mã/họ tên học sinh | Chỉ đọc; không có thao tác thêm học sinh ngoài danh sách. |
| ATT-SES-03 | Trạng thái | `Có mặt`, `Đi muộn`, `Vắng có phép`, `Vắng không phép`, `Về sớm`. |
| ATT-SES-04 | Ghi chú | Không bắt buộc; dùng bổ sung thông tin điểm danh. |
| ATT-SES-05 | Lưu từng dòng | Lưu một học sinh; báo lỗi tại dòng nếu có. |
| ATT-SES-06 | Lưu tất cả | Lưu hàng loạt các dòng thay đổi trong một thao tác. |
| ATT-SES-07 | Lịch sử thay đổi | Hiển thị người thực hiện, thời điểm và thay đổi khi có quyền. |

Mỗi học sinh có tối đa một bản ghi điểm danh cho một buổi học. Giá trị mặc định khi tải danh sách do cấu hình quy định; hệ thống phải thể hiện rõ bản ghi chưa lưu và không tự suy diễn `Có mặt` nếu chưa có dữ liệu.

## 5. Thống kê chuyên cần

| Mã | Bộ lọc/chỉ số | Quy tắc |
| --- | --- | --- |
| ATT-REP-01 | Học sinh | Theo phạm vi quyền; học sinh chỉ cố định chính mình. |
| ATT-REP-02 | Lớp, cấp độ | Chỉ dữ liệu hợp lệ trong phạm vi được cấp. |
| ATT-REP-03 | Niên khóa/kỳ học | Kỳ học phải thuộc niên khóa được chọn. |
| ATT-REP-04 | Khoảng thời gian | Từ ngày không sau đến ngày. |
| ATT-REP-05 | Chỉ số | Tổng buổi, Có mặt/Đi muộn/Về sớm, Vắng có phép/không phép, tỷ lệ chuyên cần. |

Tỷ lệ chuyên cần được tính theo cấu hình BR-06. Chi tiết báo cáo phải cho biết phạm vi, số buổi được tính và phiên bản/quy tắc áp dụng để người dùng đối chiếu.

## 6. Trạng thái và tiêu chí nghiệm thu

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ riêng cho danh sách buổi, học sinh, thống kê. |
| Chưa chọn buổi | Hướng dẫn chọn buổi để bắt đầu điểm danh. |
| Không có học sinh hợp lệ | Thông báo rõ, không hiển thị dòng trống để tự nhập. |
| Lỗi kiểm tra | Lỗi tại dòng/trường; giữ thay đổi chưa lưu. |
| Thành công | Thông báo kết quả số dòng lưu thành công/thất bại và cập nhật lịch sử. |

- Danh sách điểm danh chỉ gồm học sinh có đăng ký lớp hợp lệ tại ngày diễn ra.
- Không có hai bản ghi cho cùng học sinh và buổi học.
- Mọi sửa điểm danh đều có người thực hiện và thời điểm thay đổi.
- Giáo viên/học sinh không thể truy cập dữ liệu chuyên cần ngoài phạm vi của mình.
