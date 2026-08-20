# Basic Design — MH-11 Đánh giá và điểm

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-11 |
| Tên màn hình | Đánh giá và điểm |
| Tài liệu nguồn | `../11_danh_gia_diem.md` |
| Yêu cầu liên quan | FR-GRD-01 đến FR-GRD-03, BR-08, BR-10 |
| Người dùng | Giáo viên được phân công, Quản trị viên theo quyền, Học sinh |
| Mục đích | Tạo đợt đánh giá, nhập/quản lý điểm theo lớp-môn-kỹ năng và công bố kết quả trong phạm vi quyền. |

## 2. Phân quyền và nguyên tắc

| Vai trò | Đợt đánh giá | Nhập/sửa điểm | Xem kết quả |
| --- | --- | --- | --- |
| Quản trị viên | Theo quyền được cấp. | Theo quyền được cấp. | Theo quyền được cấp. |
| Giáo viên | Chỉ lớp/môn thuộc phân công hiệu lực. | Chỉ đợt đánh giá trong phạm vi trên. | Theo lớp/môn được phân công. |
| Học sinh | Không tạo/sửa. | Không có quyền. | Chỉ điểm của chính mình đã được phép công bố. |

- Lớp, môn và giáo viên của đợt đánh giá phải khớp phân công hiệu lực; quyền kiểm tra tại máy chủ.
- Mỗi học sinh tối đa một điểm trong một đợt đánh giá.
- Điểm, trung bình/xếp loại và lịch sử thay đổi phải truy vết được người thực hiện, thời điểm theo BR-10.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Đánh giá và điểm                                                            |
+----------------------------------------------------------------------------+
| [Đợt đánh giá] [Nhập điểm] [Kết quả]                         [+ Tạo đợt]  |
+----------------------------------------------------------------------------+
| [Lớp ▼] [Môn ▼] [Loại ▼] [Kỹ năng ▼] [Ngày từ-đến] [Trạng thái ▼]         |
| Tên đợt | Lớp | Môn | Loại/Kỹ năng | Ngày | Thang điểm | TT | [⋮]        |
| ...                                                                        |
+----------------------------------------------------------------------------+
```

Khi chọn một đợt, tab **Nhập điểm** tải danh sách học sinh thuộc lớp. Trên màn hình nhỏ, bảng nhập điểm cuộn ngang hoặc hiển thị dạng thẻ; thanh lưu luôn dễ truy cập.

## 4. Đợt đánh giá

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| GRD-EVT-01 | Tên đợt | Bắt buộc, nhận diện đợt đánh giá trong lớp/môn. |
| GRD-EVT-02 | Lớp, môn học | Bắt buộc, phải thuộc phân công hợp lệ của người tạo. |
| GRD-EVT-03 | Loại đánh giá | Bắt buộc; chọn theo danh mục cấu hình. |
| GRD-EVT-04 | Kỹ năng | Từ vựng/Ngữ pháp, Đọc hiểu, Nghe hiểu; có thể chọn Nói/Viết khi danh mục hỗ trợ. |
| GRD-EVT-05 | Ngày đánh giá | Bắt buộc, là ngày hợp lệ. |
| GRD-EVT-06 | Thang điểm | Bắt buộc; điểm tối thiểu/tối đa hợp lệ. |
| GRD-EVT-07 | Cấu hình xếp loại | Bắt buộc/chọn theo cấu hình; dùng tính kết quả sau lưu. |
| GRD-EVT-08 | Trạng thái | Nháp, Đang nhập, Đã công bố hoặc trạng thái cấu hình tương đương. |

## 5. Nhập điểm và kết quả

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| GRD-SCR-01 | Học sinh | Chỉ học sinh có đăng ký lớp hợp lệ của đợt; mã/họ tên chỉ đọc. |
| GRD-SCR-02 | Điểm | Số nằm trong thang điểm cấu hình; có thể để trống khi chưa nhập. |
| GRD-SCR-03 | Nhận xét | Không bắt buộc; giới hạn độ dài cấu hình. |
| GRD-SCR-04 | Trung bình/xếp loại | Hệ thống tính theo cấu hình sau lưu, không cho nhập tay nếu không có quyền đặc biệt. |
| GRD-SCR-05 | Lưu từng dòng/tất cả | Hỗ trợ lưu theo dòng hoặc hàng loạt; báo lỗi từng dòng. |
| GRD-SCR-06 | Công bố | Chỉ người có quyền; sau công bố học sinh được xem kết quả của mình. |

## 6. Trạng thái và tiêu chí nghiệm thu

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ riêng cho danh sách đợt, danh sách điểm, kết quả. |
| Chưa chọn đợt | Hướng dẫn chọn/tạo đợt đánh giá. |
| Không có học sinh | Thông báo không có học sinh hợp lệ; không cho thêm dòng tự do. |
| Lỗi điểm | Lỗi hiển thị ngay tại dòng điểm/nhận xét, giữ dữ liệu chưa lưu. |
| Đã công bố | Gắn nhãn rõ; cảnh báo trước chỉnh sửa lại theo chính sách. |

- Đợt đánh giá chỉ được tạo cho lớp/môn thuộc phân công hiệu lực.
- Không thể nhập điểm ngoài thang điểm hoặc tạo điểm trùng trong cùng đợt.
- Kết quả tính theo đúng cấu hình xếp loại, có truy vết thay đổi.
- Học sinh chỉ xem điểm của chính mình và chỉ khi đợt đã công bố.
