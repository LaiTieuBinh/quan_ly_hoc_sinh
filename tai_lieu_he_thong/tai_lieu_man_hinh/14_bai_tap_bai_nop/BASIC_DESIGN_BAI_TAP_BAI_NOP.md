# Basic Design — MH-14 Bài tập và bài nộp

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-14 |
| Tên màn hình | Bài tập và bài nộp |
| Tài liệu nguồn | `../14_bai_tap_bai_nop.md` |
| Yêu cầu liên quan | FR-HWK-01 đến FR-HWK-05, BR-07, BR-08 |
| Người dùng | Giáo viên được phân công, Học sinh thuộc lớp được giao, Quản trị viên theo quyền |
| Mục đích | Giao bài tập, nộp bài, chấm/trả bài và theo dõi tiến độ hoàn thành theo lớp-môn. |

## 2. Phân quyền và nguyên tắc

| Vai trò | Bài tập | Bài nộp | Chấm/trả |
| --- | --- | --- | --- |
| Quản trị viên | Theo quyền được cấp. | Theo quyền được cấp. | Theo quyền được cấp. |
| Giáo viên | Chỉ lớp/môn có phân công hiệu lực. | Xem bài nộp thuộc bài tập quản lý. | Nhập điểm, nhận xét, trả bài. |
| Học sinh | Chỉ bài đã giao cho lớp có đăng ký hiệu lực. | Chỉ tạo/cập nhật bài nộp của chính mình. | Chỉ xem điểm/nhận xét của chính mình. |

- Bài tập chỉ được giao đến học sinh thuộc lớp đang học tại thời điểm giao/theo quy tắc hiệu lực triển khai.
- Mỗi học sinh tối đa một bài nộp trên một bài tập; cập nhật là thay thế phiên bản theo chính sách, không tạo bản ghi song song.
- Hệ thống tự xác định đúng/trễ hạn từ thời điểm máy chủ và hạn nộp; không tin cậy thời gian do client gửi.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Bài tập và bài nộp                                            [+ Tạo bài] |
+----------------------------------------------------------------------------+
| [Bài tập] [Bài nộp] [Chấm bài]                                             |
| [Lớp ▼] [Môn ▼] [Cấp độ ▼] [Trạng thái ▼] [Hạn nộp từ-đến] [Tìm]          |
| Tên bài | Lớp | Môn | Cấp độ | Hạn nộp | TT | Hoàn thành | [⋮]            |
| ...                                                                        |
+----------------------------------------------------------------------------+
```

Học sinh thấy `Bài được giao` và `Bài đã nộp`; giáo viên thấy danh sách quản lý/chấm bài. Trên màn hình nhỏ, bảng dùng thẻ/cuộn ngang; nút nộp bài hoặc lưu chấm bài luôn dễ truy cập.

## 4. Giáo viên: bài tập

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| HWK-LST-01 | Lớp, môn, cấp độ | Hiển thị phạm vi bài tập; giáo viên chỉ thấy phân công hợp lệ. |
| HWK-LST-02 | Hạn nộp/trạng thái | `Nháp`, `Đã giao`, `Đóng nộp`; thời gian hiển thị theo múi giờ hệ thống. |
| HWK-LST-03 | Tỷ lệ hoàn thành | Số học sinh đã nộp / số học sinh nhận bài theo quy tắc phân phối. |
| HWK-FRM-01 | Lớp, môn | Bắt buộc, khớp phân công hiệu lực. |
| HWK-FRM-02 | Tiêu đề, mô tả | Bắt buộc; mô tả hỗ trợ nội dung học tập. |
| HWK-FRM-03 | Tệp/liên kết đính kèm | Không bắt buộc; kiểm tra định dạng, dung lượng và quyền truy cập. |
| HWK-FRM-04 | Hạn nộp | Bắt buộc khi giao; ngày giờ hợp lệ. |
| HWK-FRM-05 | Trạng thái | Nháp, Đã giao, Đóng nộp. |

## 5. Học sinh: bài nộp

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| SUB-LST-01 | Bài được giao | Chỉ các bài `Đã giao` của lớp học sinh được nhận. |
| SUB-FRM-01 | Nội dung nộp | Có thể nhập văn bản; bắt buộc có nội dung hoặc ít nhất một tệp. |
| SUB-FRM-02 | Tệp đính kèm | Tệp hợp lệ theo cấu hình; hiển thị metadata, không lộ đường dẫn nội bộ. |
| SUB-FRM-03 | Trạng thái hạn | `Đúng hạn`/`Trễ hạn`, máy chủ tự tính. |
| SUB-FRM-04 | Nộp/Cập nhật | Chỉ khi bài chưa đóng; cho phép cập nhật trước khi đóng theo chính sách. |

Nếu bài đóng nộp, hệ thống từ chối nộp/cập nhật trừ khi giáo viên mở lại bằng thao tác được ghi vết.

## 6. Giáo viên: chấm bài

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| GRD-HWK-01 | Danh sách bài nộp | Học sinh, thời điểm nộp, đúng/trễ hạn, trạng thái chấm. |
| GRD-HWK-02 | Điểm | Nhập theo thang điểm bài tập/cấu hình. |
| GRD-HWK-03 | Nhận xét | Không bắt buộc; hiển thị cho đúng học sinh sau trả bài. |
| GRD-HWK-04 | Trả bài | Đổi trạng thái đã chấm/trả, cho phép học sinh xem điểm/nhận xét. |
| GRD-HWK-05 | Tệp phản hồi | Tùy chọn; áp dụng kiểm tra tệp và quyền tải như tệp bài tập. |

## 7. Trạng thái và tiêu chí nghiệm thu

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ riêng cho danh sách, chi tiết, tệp, chấm bài. |
| Không có dữ liệu | Thông báo phù hợp tab/bộ lọc. |
| Chưa đến hạn/Đúng hạn/Trễ hạn/Đóng nộp | Nhãn rõ theo thời điểm máy chủ và hạn nộp. |
| Lỗi tệp/dữ liệu | Hiển thị tại trường; không làm mất bài nộp hiện có. |
| Không có quyền | Ẩn thao tác; API/tệp kiểm tra độc lập. |

- Chỉ học sinh thuộc lớp được giao mới thấy/nộp bài.
- Không thể nộp sau khi đóng nếu chưa được mở lại.
- Không có hai bài nộp của cùng học sinh trên cùng bài tập.
- Học sinh chỉ xem điểm/nhận xét/tệp phản hồi của chính mình.
