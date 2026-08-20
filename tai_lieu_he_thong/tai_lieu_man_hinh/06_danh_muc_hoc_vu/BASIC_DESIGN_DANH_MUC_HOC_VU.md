# Basic Design — MH-06 Niên khóa, kỳ học và môn học

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-06 |
| Tên màn hình | Niên khóa, kỳ học và môn học |
| Tài liệu nguồn | `../06_danh_muc_hoc_vu.md` |
| Yêu cầu liên quan | FR-CLS-01, FR-SUB-01 |
| Người dùng | Quản trị viên, Nhân viên |
| Mục đích | Quản lý danh mục nền tảng phục vụ lớp học, phân công, buổi học, đánh giá, bài tập và tài liệu. |

## 2. Phạm vi và nguyên tắc truy cập

- Chỉ Quản trị viên và Nhân viên được cấp quyền danh mục học vụ được truy cập màn hình/API.
- Màn hình gồm ba khu vực độc lập: Niên khóa, Kỳ học và Môn học.
- Kỳ học luôn thuộc đúng một niên khóa; ngày kỳ học phải nằm trong phạm vi niên khóa theo chính sách dữ liệu.
- Không cho xóa danh mục đang được dữ liệu nghiệp vụ tham chiếu. Người dùng có thể chuyển trạng thái sang không áp dụng để giữ lịch sử.
- Các danh mục không áp dụng không được dùng để tạo dữ liệu mới, nhưng vẫn hiển thị trong dữ liệu lịch sử và bộ lọc có tùy chọn xem.

## 3. Bố cục giao diện

```text
+------------------------------------------------------------------------+
| Niên khóa, kỳ học và môn học                                           |
+------------------------------------------------------------------------+
| [Niên khóa] [Kỳ học] [Môn học]                                        |
+------------------------------------------------------------------------+
| Tìm kiếm / bộ lọc trạng thái                         [+ Thêm mới]     |
| Mã/Tên | Ngày bắt đầu | Ngày kết thúc | Trạng thái | Cập nhật | [⋮]  |
| ...                                                                    |
|                                          [<] Trang 1 / N [>]           |
+------------------------------------------------------------------------+
```

Khi mở tab **Kỳ học**, bộ lọc Niên khóa đặt trước bảng. Trên màn hình nhỏ, bộ lọc và nút thao tác xếp theo cột; bảng cho phép cuộn ngang.

## 4. Khu vực niên khóa

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| ACY-LST-01 | Tên niên khóa | Bắt buộc, không trùng theo chính sách dữ liệu. |
| ACY-LST-02 | Ngày bắt đầu/kết thúc | Hiển thị thời gian hiệu lực. |
| ACY-LST-03 | Trạng thái | `Đang áp dụng` hoặc `Không áp dụng`. |
| ACY-FRM-01 | Tên | Bắt buộc. |
| ACY-FRM-02 | Ngày bắt đầu | Bắt buộc, là ngày hợp lệ. |
| ACY-FRM-03 | Ngày kết thúc | Bắt buộc, không trước ngày bắt đầu. |
| ACY-FRM-04 | Trạng thái | Bắt buộc; mặc định `Đang áp dụng` khi tạo. |

## 5. Khu vực kỳ học

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| SEM-LST-01 | Tên kỳ học | Hiển thị cùng niên khóa cha. |
| SEM-LST-02 | Niên khóa | Bắt buộc; chỉ chọn niên khóa hợp lệ. |
| SEM-LST-03 | Ngày bắt đầu/kết thúc | Bắt buộc; kết thúc không trước bắt đầu. |
| SEM-LST-04 | Trạng thái | `Đang áp dụng` hoặc `Không áp dụng`. |
| SEM-FLT-01 | Niên khóa | Lọc kỳ học theo niên khóa; mặc định `Tất cả`. |
| SEM-FRM-01 | Tên, niên khóa, ngày bắt đầu/kết thúc, trạng thái | Nhập/sửa theo quy tắc; ngày kỳ học thuộc phạm vi niên khóa. |

## 6. Khu vực môn học

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| SUB-LST-01 | Mã môn học | Bắt buộc, duy nhất. |
| SUB-LST-02 | Tên môn học | Bắt buộc. |
| SUB-LST-03 | Mô tả | Không bắt buộc. |
| SUB-LST-04 | Trạng thái | `Đang áp dụng` hoặc `Không áp dụng`. |
| SUB-FRM-01 | Mã, tên, mô tả, trạng thái | Biểu mẫu tạo/cập nhật môn học. |
| SUB-INIT-01 | Danh mục khởi tạo | Từ vựng, Ngữ pháp, Nghe, Nói, Đọc, Viết, Kanji. |

Các môn/kỹ năng khởi tạo là dữ liệu mặc định. Nếu đã được sử dụng thì chỉ được ngừng áp dụng, không xóa cứng.

## 7. Thao tác và trạng thái

| Thao tác | Kết quả |
| --- | --- |
| Thêm mới | Mở biểu mẫu theo tab hiện tại và tạo danh mục khi dữ liệu hợp lệ. |
| Chỉnh sửa | Cập nhật các trường cho phép, bảo toàn các tham chiếu lịch sử. |
| Ngừng áp dụng/Kích hoạt | Đổi trạng thái sau xác nhận; chỉ danh mục áp dụng được dùng mới. |
| Xóa | Chỉ cho phép khi không có tham chiếu; nếu có tham chiếu, hiển thị lý do và đề xuất ngừng áp dụng. |
| Tìm kiếm/lọc | Áp dụng điều kiện và tải lại bảng từ trang đầu. |

| Trạng thái giao diện | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ cho bảng/tab đang nạp. |
| Không có dữ liệu | Thông báo phù hợp với loại danh mục và bộ lọc. |
| Lỗi kiểm tra | Hiển thị dưới trường nhập; giữ dữ liệu đã nhập. |
| Thành công | Thông báo ngắn, đóng biểu mẫu/xác nhận và tải lại danh sách. |

## 8. Tiêu chí nghiệm thu

- Người dùng có quyền tạo, sửa, lọc và đổi trạng thái được ba loại danh mục.
- Niên khóa/kỳ học có khoảng ngày hợp lệ; mỗi kỳ học thuộc một niên khóa.
- Môn học có mã duy nhất và có thể khởi tạo đủ bảy môn/kỹ năng yêu cầu.
- Danh mục đang được lớp, phân công, buổi học, điểm, bài tập hoặc tài liệu sử dụng không thể xóa.
- Người không có quyền không thể truy cập giao diện hoặc API danh mục học vụ.
