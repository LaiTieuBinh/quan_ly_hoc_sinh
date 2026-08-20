# Basic Design — MH-12 Kỳ thi JLPT

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-12 |
| Tên màn hình | Kỳ thi JLPT |
| Tài liệu nguồn | `../12_ky_thi_jlpt.md` |
| Yêu cầu liên quan | FR-EXM-01 đến FR-EXM-03, BR-08, NFR-03 |
| Người dùng | Quản trị viên, Nhân viên, Giáo viên theo quyền, Học sinh |
| Mục đích | Quản lý kết quả các kỳ thi nội bộ, thi thử và JLPT chính thức; lưu chứng chỉ và theo dõi lịch sử dự thi của học sinh. |

## 2. Phân quyền và nguyên tắc

| Vai trò | Danh sách/kết quả | Tạo/sửa | Tệp chứng chỉ |
| --- | --- | --- | --- |
| Quản trị viên | Xem toàn bộ trong phạm vi quyền. | Có quyền quản lý. | Xem/tải theo quyền. |
| Nhân viên | Theo quyền được cấp. | Theo quyền được cấp. | Theo quyền được cấp. |
| Giáo viên | Theo quyền được cấp và phạm vi học sinh/lớp liên quan. | Theo quyền được cấp. | Theo quyền được cấp. |
| Học sinh | Chỉ kết quả của chính mình. | Không có quyền. | Chỉ tệp chứng chỉ của chính mình khi được phép. |

- Cấp độ thi chỉ nhận N5, N4, N3, N2 hoặc N1.
- Học sinh không thể truy cập kết quả/tệp chứng chỉ của người khác qua URL hoặc API.
- Tệp chứng chỉ phải được kiểm tra loại, dung lượng và quyền truy cập trước khi lưu/cấp liên kết tải.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Kỳ thi JLPT                                                   [+ Thêm KQ] |
+----------------------------------------------------------------------------+
| [Mã/Họ tên] [Loại kỳ thi ▼] [Cấp độ ▼] [Kết quả ▼] [Ngày từ-đến] [Tìm]   |
+----------------------------------------------------------------------------+
| Học sinh | Loại thi | Cấp độ | Ngày thi | Kết quả | Chứng chỉ | [⋮]      |
| ...                                                                        |
|                                               [<] Trang 1 / N [>]          |
+----------------------------------------------------------------------------+
```

Chọn một dòng mở chi tiết kết quả. Trong chi tiết, tab `Lịch sử dự thi` hiển thị các lần thi của học sinh theo ngày, cấp độ và kết quả. Trên màn hình nhỏ, bảng cuộn ngang và tệp được biểu diễn bằng nút tải an toàn.

## 4. Danh sách và bộ lọc

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| EXM-LST-01 | Học sinh | Mã/họ tên; chọn để mở chi tiết khi có quyền. |
| EXM-LST-02 | Loại kỳ thi | Nội bộ, Thi thử, JLPT chính thức. |
| EXM-LST-03 | Cấp độ | N5–N1. |
| EXM-LST-04 | Ngày thi | Ngày hợp lệ, có thể lọc theo khoảng. |
| EXM-LST-05 | Kết quả | Giá trị/kết luận theo cấu hình, ví dụ Đạt/Không đạt. |
| EXM-LST-06 | Chứng chỉ | Nhãn có/không; không công khai URL tệp trực tiếp. |
| EXM-FLT-01 | Mã/họ tên | Tìm gần đúng theo mã hoặc họ tên học sinh. |
| EXM-FLT-02 | Loại/cấp độ/kết quả | Chọn một hoặc `Tất cả`. |
| EXM-FLT-03 | Khoảng ngày | Từ ngày không sau đến ngày. |

## 5. Biểu mẫu kết quả thi

| Mã | Trường | Quy tắc |
| --- | --- | --- |
| EXM-FRM-01 | Học sinh | Bắt buộc; chỉ chọn học sinh trong phạm vi quyền. |
| EXM-FRM-02 | Loại kỳ thi | Bắt buộc: nội bộ, thi thử hoặc JLPT chính thức. |
| EXM-FRM-03 | Cấp độ | Bắt buộc, N5–N1. |
| EXM-FRM-04 | Ngày thi | Bắt buộc, là ngày hợp lệ và không ở tương lai theo chính sách. |
| EXM-FRM-05 | Kết quả | Bắt buộc; chọn/nhập theo danh mục cấu hình. |
| EXM-FRM-06 | Ghi chú | Không bắt buộc. |
| EXM-FRM-07 | Tệp/liên kết chứng chỉ | Không bắt buộc; tệp hợp lệ hoặc liên kết URL hợp lệ theo chính sách. |

Khi thay tệp, hệ thống giữ/ghi vết tệp cũ theo chính sách lưu trữ; không trả tên đường dẫn lưu trữ nội bộ cho trình duyệt.

## 6. Lịch sử theo học sinh

| Nội dung | Quy tắc |
| --- | --- |
| Sắp xếp | Ngày thi giảm dần, sau đó thời gian tạo giảm dần. |
| Dữ liệu | Loại thi, cấp độ, ngày thi, kết quả, ghi chú, chứng chỉ nếu có quyền. |
| So sánh | Có thể lọc/nhóm theo cấp độ hoặc loại thi để đối chiếu tiến trình. |
| Phạm vi | Chỉ hiển thị dữ liệu học sinh mà người dùng có quyền xem. |

## 7. Trạng thái và tiêu chí nghiệm thu

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ riêng cho danh sách, chi tiết, lịch sử và tệp. |
| Không có dữ liệu | `Không tìm thấy kết quả thi phù hợp.` |
| Lỗi kiểm tra | Hiển thị lỗi dưới trường; giữ dữ liệu đã nhập. |
| Tệp không hợp lệ | Nêu rõ lỗi loại/kích thước/quyền, không thay đổi tệp hiện có. |
| Không có quyền | Ẩn thao tác; API/tải tệp từ chối độc lập. |

- Kết quả thi có học sinh, loại thi, cấp độ, ngày và kết quả hợp lệ.
- Cấp độ ngoài N5–N1 và tệp không an toàn/không hợp lệ không được lưu.
- Lịch sử hiển thị chính xác theo học sinh, ngày, cấp độ, kết quả.
- Học sinh chỉ xem được kết quả và chứng chỉ của chính mình.
