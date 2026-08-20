# Basic Design — MH-15 Tài liệu học tập

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-15 |
| Tên màn hình | Tài liệu học tập |
| Tài liệu nguồn | `../15_tai_lieu_hoc_tap.md` |
| Yêu cầu liên quan | FR-MAT-01 đến FR-MAT-05, NFR-03, BR-08 |
| Người dùng | Giáo viên, Quản trị viên, Học sinh theo phạm vi cấp quyền |
| Mục đích | Quản lý, phân phối, tìm kiếm và truy cập an toàn tài liệu học tập theo lớp, môn, cấp độ và kỹ năng. |

## 2. Phân quyền và nguyên tắc

| Vai trò | Xem/tải | Tạo/cập nhật | Ẩn/xóa |
| --- | --- | --- | --- |
| Quản trị viên | Toàn bộ theo quyền. | Toàn bộ theo quyền. | Toàn bộ theo quyền. |
| Giáo viên | Tài liệu trong phạm vi được cấp/phân công. | Tài liệu do mình quản lý, trong lớp/môn được phân công. | Chỉ tài liệu do mình quản lý. |
| Học sinh | Chỉ tài liệu Hiển thị của lớp đang học hoặc được cấp theo cấp độ. | Không có quyền. | Không có quyền. |

- Tài liệu được truy cập theo quy tắc cấp lớp/môn hoặc cấp độ; không dựa vào ID do client gửi để mở rộng phạm vi.
- Tệp và liên kết ngoài đều phải kiểm tra an toàn, loại/dung lượng (tệp), tính hợp lệ/quyền truy cập (liên kết) theo NFR-03.
- `Đã xóa` là xóa mềm; không hiển thị cho học sinh và vẫn giữ dấu vết dữ liệu.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Tài liệu học tập                                             [+ Thêm tài liệu]|
+----------------------------------------------------------------------------+
| [Tên] [Chủ đề] [Kỹ năng ▼] [Cấp độ ▼] [Lớp ▼] [Môn ▼] [Trạng thái ▼] [Tìm]|
+----------------------------------------------------------------------------+
| Tiêu đề | Loại | Lớp/Môn | Cấp độ | Chủ đề/Kỹ năng | Người tạo | TT | [⋮]|
| ...                                                                        |
|                                              [<] Trang 1 / N [>]           |
+----------------------------------------------------------------------------+
```

Học sinh thấy danh sách rút gọn chỉ gồm tài liệu được phép và nút `Xem/Tải`. Giáo viên/quản trị viên có thêm hành động sửa, ẩn, xóa mềm và thống kê lượt xem/tải nếu bật.

## 4. Danh sách, tìm kiếm và lọc

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| MAT-LST-01 | Tiêu đề/loại | Hiển thị tên và loại: tệp hoặc liên kết ngoài. |
| MAT-LST-02 | Lớp, môn, cấp độ | Phạm vi phân phối; có thể cấp theo lớp/môn và/hoặc cấp độ. |
| MAT-LST-03 | Chủ đề, bài học, kỹ năng | Nhãn phân loại phục vụ tìm kiếm. |
| MAT-LST-04 | Người tạo/trạng thái | Trạng thái Hiển thị, Ẩn, Đã xóa; học sinh chỉ thấy Hiển thị. |
| MAT-LST-05 | Lượt xem/tải | Hiển thị khi cấu hình bật và khi người dùng có quyền. |
| MAT-FLT-01 | Tên/chủ đề | Tìm gần đúng. |
| MAT-FLT-02 | Kỹ năng/cấp độ/lớp/môn/trạng thái | Chỉ hiển thị/lọc giá trị thuộc phạm vi quyền. |

## 5. Biểu mẫu tạo/cập nhật

| Mã | Trường | Quy tắc |
| --- | --- | --- |
| MAT-FRM-01 | Tiêu đề | Bắt buộc. |
| MAT-FRM-02 | Loại nguồn | Bắt buộc: Tệp hoặc Liên kết ngoài. |
| MAT-FRM-03 | Tệp/liên kết | Bắt buộc theo loại nguồn; chỉ nhận một nguồn chính. |
| MAT-FRM-04 | Lớp, môn | Có điều kiện; giáo viên chỉ chọn lớp/môn phân công. |
| MAT-FRM-05 | Cấp độ | Có điều kiện, N5–N1; dùng phân phối theo cấp độ. |
| MAT-FRM-06 | Chủ đề, bài học, kỹ năng | Phân loại tài liệu; kỹ năng chọn từ danh mục hợp lệ. |
| MAT-FRM-07 | Trạng thái | Hiển thị, Ẩn; Đã xóa chỉ qua thao tác xóa mềm. |

Ít nhất một phạm vi phân phối (lớp/môn hoặc cấp độ) phải được chọn trước khi Hiển thị, trừ tài liệu hệ thống theo chính sách riêng.

## 6. Xem/tải và trạng thái

| Trạng thái | Cách hiển thị / xử lý |
| --- | --- |
| Hiển thị | Phân phối tới người học thuộc phạm vi. |
| Ẩn | Không hiển thị cho học sinh; người quản lý vẫn xem được. |
| Đã xóa | Không phân phối/tải được; giữ lịch sử/audit. |
| Đang tải | Khung chờ danh sách, chi tiết hoặc tệp. |
| Tệp/liên kết lỗi | Thông báo an toàn, không lộ đường dẫn lưu trữ nội bộ. |

Tải tệp luôn đi qua endpoint kiểm tra quyền hoặc URL ký ngắn hạn. Liên kết ngoài mở sau khi kiểm tra/sanitize URL; không có quyền truy cập liên kết không đồng nghĩa máy chủ được phép tải nội dung đó thay người dùng.

## 7. Tiêu chí nghiệm thu

- Tìm kiếm/lọc đúng theo tiêu đề, chủ đề, kỹ năng, cấp độ, lớp, môn và trạng thái trong phạm vi quyền.
- Giáo viên chỉ quản lý tài liệu của mình và trong lớp/môn được phân công; quản trị viên quản lý toàn bộ.
- Học sinh chỉ thấy/tải tài liệu Hiển thị thuộc lớp đang học hoặc cấp độ được cấp.
- Tệp/liên kết không hợp lệ hoặc không an toàn không được lưu/tải.
- Ẩn/xóa mềm giữ lịch sử và không làm lộ tài liệu cho người học.
