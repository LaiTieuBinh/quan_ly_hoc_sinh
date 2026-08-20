# Basic Design — MH-16 Báo cáo

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-16 |
| Tên màn hình | Báo cáo |
| Tài liệu nguồn | `../16_bao_cao.md` |
| Yêu cầu liên quan | FR-RPT-01 đến FR-RPT-04, FR-ATT-03, FR-HWK-05 |
| Người dùng | Quản trị viên, Nhân viên được cấp quyền, Giáo viên |
| Mục đích | Cung cấp báo cáo tổng hợp/chi tiết về học vụ, chuyên cần, kết quả, bài tập, học phí và học sinh có nguy cơ trong phạm vi quyền. |

## 2. Phân quyền và nguyên tắc dữ liệu

| Vai trò | Phạm vi báo cáo |
| --- | --- |
| Quản trị viên | Toàn bộ dữ liệu theo bộ lọc hợp lệ và quyền báo cáo cụ thể. |
| Nhân viên | Các loại báo cáo/phạm vi được cấp quyền; không suy diễn dữ liệu ngoài quyền qua chỉ số tổng. |
| Giáo viên | Chỉ lớp, môn, học sinh và khoảng thời gian thuộc phân công hiệu lực. Không xem báo cáo học phí trừ khi được cấp riêng. |

- Phạm vi truy vấn được xây dựng tại máy chủ từ phiên người dùng trước khi tổng hợp.
- Bộ lọc chỉ hiển thị/lựa chọn giá trị trong phạm vi quyền; thao tác URL/API vẫn kiểm tra độc lập.
- Dữ liệu tổng hợp, chi tiết, xuất báo cáo và cache đều phải khóa theo quyền và điều kiện lọc.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Báo cáo                                                                     |
+----------------------------------------------------------------------------+
| [Niên khóa ▼] [Kỳ học ▼] [Khoảng thời gian] [Cấp độ ▼] [Lớp ▼] [Môn ▼]   |
| [Trạng thái ▼] [Áp dụng] [Đặt lại]                                        |
+----------------------------------------------------------------------------+
| [Sĩ số] [Chuyên cần] [Kết quả] [Bài tập] [Học phí] [Học sinh nguy cơ]    |
+----------------------------------------------------------------------------+
| Chỉ số tổng hợp / Biểu đồ                  | Bảng chi tiết / [Xuất báo cáo] |
| ...                                        | ...                             |
+----------------------------------------------------------------------------+
```

Trên màn hình nhỏ, bộ lọc xếp dọc; các thẻ chỉ số nằm dạng lưới một/hai cột và bảng chi tiết cuộn ngang. Tab không có quyền không hiển thị.

## 4. Bộ lọc chung

| Mã | Bộ lọc | Quy tắc |
| --- | --- | --- |
| RPT-FLT-01 | Niên khóa | Chỉ niên khóa trong phạm vi; có thể bắt buộc theo báo cáo. |
| RPT-FLT-02 | Kỳ học | Chỉ kỳ thuộc niên khóa đã chọn. |
| RPT-FLT-03 | Khoảng thời gian | Từ ngày không sau đến ngày; mặc định do từng báo cáo xác định. |
| RPT-FLT-04 | Cấp độ | N5–N1 hoặc tất cả. |
| RPT-FLT-05 | Lớp | Chỉ lớp thuộc quyền; giáo viên chỉ lớp được phân công. |
| RPT-FLT-06 | Môn | Chỉ môn trong phạm vi/phân công. |
| RPT-FLT-07 | Trạng thái | Tùy loại báo cáo: đăng ký, điểm danh, nghĩa vụ, bài nộp... |
| RPT-FLT-08 | Áp dụng/Đặt lại | Áp dụng lọc đồng nhất; đặt lại về mặc định hợp lệ và tải trang đầu. |

## 5. Các báo cáo

| Mã | Báo cáo | Chỉ số/kết quả | Điều hướng chi tiết |
| --- | --- | --- | --- |
| RPT-01 | Sĩ số | Số học sinh theo cấp độ, lớp, niên khóa, kỳ học. | Danh sách học sinh/đăng ký lớp đã lọc. |
| RPT-02 | Chuyên cần | Tỷ lệ và chi tiết điểm danh theo học sinh/lớp/cấp độ/kỳ/khoảng thời gian. | Chi tiết điểm danh/chuyên cần. |
| RPT-03 | Kết quả học tập | Điểm trung bình, xếp loại, nhận xét theo đợt đánh giá. | Đợt đánh giá/kết quả đã lọc. |
| RPT-04 | Bài tập | Tỷ lệ hoàn thành, danh sách chưa nộp theo học sinh/lớp. | Bài tập/bài nộp cần xử lý. |
| RPT-05 | Học phí | Phải thu, đã thu, còn nợ, quá hạn, doanh thu. | Nghĩa vụ/giao dịch học phí. |
| RPT-06 | Học sinh có nguy cơ | Chuyên cần thấp, điểm thấp, chưa nộp bài hoặc chưa đủ điều kiện lên cấp. | Hồ sơ/báo cáo nguy cơ theo lý do. |

Mọi đường dẫn chi tiết mang theo bộ lọc phù hợp nhưng trang đích phải kiểm tra quyền một lần nữa.

## 6. Xuất báo cáo và trạng thái

- Nút `Xuất báo cáo` chỉ hiện khi tính năng được triển khai và người dùng có quyền xuất loại báo cáo đang mở.
- Xuất dùng đúng phạm vi/bộ lọc hiện tại; có thể chọn định dạng CSV/XLSX/PDF theo cấu hình.
- Báo cáo lớn tạo nền; hiển thị trạng thái `Đang tạo`, `Sẵn sàng`, `Thất bại` và liên kết tải có thời hạn.

| Trạng thái giao diện | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ cho từng chỉ số/bảng; lỗi một khối không làm hỏng toàn trang. |
| Không có dữ liệu | `Chưa có dữ liệu phù hợp với điều kiện đã chọn.` |
| Không có quyền | Ẩn tab/chỉ số; không thay bằng số liệu giả. |
| Lỗi tải/xuất | Thông báo ngắn, nút thử lại; không lộ dữ liệu ngoài quyền. |

## 7. Tiêu chí nghiệm thu

- Mỗi loại báo cáo trả đúng chỉ số và danh sách chi tiết theo cùng bộ lọc/phạm vi quyền.
- Giáo viên không xem được dữ liệu lớp/môn/học sinh ngoài phân công; nhân viên không suy ra dữ liệu ngoài quyền qua số tổng.
- Báo cáo học phí chỉ trả cho người có quyền tài chính.
- Học sinh nguy cơ nêu được lý do và nguồn chỉ số, không kết luận từ dữ liệu thiếu.
- Tệp xuất (nếu bật) chứa đúng phạm vi, có kiểm tra quyền và liên kết tải an toàn.
