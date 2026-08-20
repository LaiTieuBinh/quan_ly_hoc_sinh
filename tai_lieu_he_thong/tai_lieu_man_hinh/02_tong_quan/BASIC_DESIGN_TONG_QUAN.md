# Basic Design — MH-02 Tổng quan

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-02 |
| Tên màn hình | Tổng quan |
| Tài liệu nguồn | `../02_tong_quan.md` |
| Yêu cầu liên quan | FR-RPT-01 đến FR-RPT-04, FR-AUTH-02 |
| Người dùng | Quản trị viên, nhân viên, giáo viên, học sinh |
| Mục đích | Cung cấp các chỉ số và công việc quan trọng theo vai trò, trong phạm vi dữ liệu được phân quyền. |

## 2. Nguyên tắc hiển thị

- Sau khi đăng nhập thành công, đây là màn hình mặc định của người dùng.
- Mọi chỉ số, danh sách và liên kết chi tiết chỉ lấy dữ liệu người dùng được quyền xem.
- Khi không có dữ liệu trong bộ lọc đang chọn, hiển thị trạng thái rỗng thay vì giá trị suy diễn.
- Các khối thông tin có thể tải độc lập; lỗi một khối không làm hỏng toàn bộ trang.

## 3. Bố cục giao diện

```text
+------------------------------------------------------------------+
| Tổng quan                                      [Người dùng ▼]     |
| [Niên khóa ▼] [Kỳ học ▼] [Khoảng thời gian] [Lớp ▼] [Áp dụng]    |
+------------------------------------------------------------------+
| [Chỉ số 1]  [Chỉ số 2]  [Chỉ số 3]  [Chỉ số 4]                  |
+------------------------------------------------------------------+
| Khối tác vụ / danh sách ưu tiên          | Biểu đồ/tổng hợp      |
| - Dữ liệu phụ thuộc vai trò              | phụ thuộc vai trò     |
| - [Xem tất cả]                            |                      |
+------------------------------------------------------------------+
```

Trên màn hình nhỏ, bộ lọc xếp dọc, các thẻ chỉ số hiển thị dạng lưới một hoặc hai cột và phần nội dung xếp theo chiều dọc.

## 4. Bộ lọc chung

| Mã | Bộ lọc | Áp dụng | Quy tắc quyền |
| --- | --- | --- | --- |
| DASH-01 | Niên khóa | Quản trị viên, nhân viên, giáo viên | Chỉ niên khóa có dữ liệu thuộc phạm vi quyền. |
| DASH-02 | Kỳ học | Quản trị viên, nhân viên, giáo viên | Chỉ hiển thị kỳ thuộc niên khóa đã chọn. |
| DASH-03 | Khoảng thời gian | Tất cả vai trò | Mặc định là kỳ học hiện tại hoặc khoảng gần nhất phù hợp. |
| DASH-04 | Lớp học | Quản trị viên, nhân viên, giáo viên | Giáo viên chỉ chọn lớp được phân công; học sinh không chọn lớp khác. |
| DASH-05 | Áp dụng | Tất cả vai trò có bộ lọc | Tải lại toàn bộ khối theo bộ lọc hợp lệ. |

## 5. Nội dung theo vai trò

### 5.1. Quản trị viên và nhân viên

| Khối | Nội dung | Hành động khi chọn |
| --- | --- | --- |
| Sĩ số | Số học sinh theo bộ lọc | Mở danh sách học sinh/lớp đã lọc. |
| Lớp đang hoạt động | Số lớp có trạng thái hoạt động | Mở danh sách lớp học. |
| Công nợ | Tổng còn phải thu, số nghĩa vụ quá hạn | Mở màn hình học phí. |
| Doanh thu | Tổng tiền giao dịch thu trong khoảng thời gian | Mở báo cáo học phí. |
| Học sinh có nguy cơ | Số/danh sách học sinh có chuyên cần thấp, điểm thấp, chưa nộp bài hoặc chưa đủ điều kiện lên cấp | Mở báo cáo học sinh có nguy cơ. |

### 5.2. Giáo viên

| Khối | Nội dung | Hành động khi chọn |
| --- | --- | --- |
| Buổi học sắp tới | Lớp, môn, phòng, thời gian của các buổi được phân công | Mở thời khóa biểu/buổi học. |
| Lớp và môn được phân công | Danh sách phân công còn hiệu lực | Mở chi tiết lớp hoặc phân công. |
| Điểm danh cần xử lý | Buổi học đã/đang diễn ra chưa hoàn tất điểm danh | Mở màn hình điểm danh theo buổi. |
| Bài tập cần xử lý | Bài tập cần giao, chấm hoặc trả bài | Mở bài tập và bài nộp. |

### 5.3. Học sinh

| Khối | Nội dung | Hành động khi chọn |
| --- | --- | --- |
| Lịch học gần nhất | Buổi học kế tiếp và các buổi gần đây của lớp đang học | Mở thời khóa biểu cá nhân. |
| Tỷ lệ chuyên cần | Tỷ lệ theo bộ lọc thời gian | Mở chi tiết điểm danh cá nhân. |
| Bài tập cần nộp | Bài tập đang mở, chưa nộp hoặc cần nộp lại | Mở chi tiết bài tập. |
| Điểm gần nhất | Kết quả đánh giá/bài tập gần nhất đã công bố | Mở kết quả cá nhân. |
| Tài liệu mới | Tài liệu mới được quyền xem | Mở danh sách hoặc chi tiết tài liệu. |

## 6. Trạng thái giao diện

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ cho từng thẻ/khối. |
| Không có dữ liệu | `Chưa có dữ liệu phù hợp với điều kiện đã chọn.` |
| Lỗi tải khối | Thông báo ngắn trong khối và nút thử lại. |
| Không có quyền | Không hiển thị khối; không trả dữ liệu thay thế. |

## 7. Tiêu chí nghiệm thu

- Người dùng nhìn thấy đúng tập khối thông tin theo vai trò.
- Bộ lọc chỉ cho phép chọn dữ liệu thuộc quyền truy cập và ảnh hưởng đến mọi khối liên quan.
- Khi chọn một chỉ số hoặc tác vụ, hệ thống mở trang chi tiết với ngữ cảnh lọc phù hợp.
- Học sinh không thể nhìn thấy chỉ số, danh sách hoặc đường dẫn chi tiết của học sinh khác.
