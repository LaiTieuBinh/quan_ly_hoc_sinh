# Basic Design — MH-13 Nghĩa vụ học phí và giao dịch

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-13 |
| Tên màn hình | Nghĩa vụ học phí và giao dịch |
| Tài liệu nguồn | `../13_hoc_phi.md` |
| Yêu cầu liên quan | FR-FEE-01 đến FR-FEE-04, BR-08, BR-09, BR-10 |
| Người dùng | Quản trị viên, Nhân viên, Học sinh |
| Mục đích | Thiết lập khoản thu, quản lý nghĩa vụ học phí, ghi nhận giao dịch và cung cấp lịch sử thanh toán theo quyền. |

## 2. Phân quyền và nguyên tắc

| Vai trò | Nghĩa vụ/giao dịch | Thiết lập/ghi thu | Phiếu thu |
| --- | --- | --- | --- |
| Quản trị viên | Xem toàn bộ trong phạm vi quyền. | Theo quyền quản lý/tài chính. | Xem/in theo quyền. |
| Nhân viên | Theo quyền được cấp. | Theo quyền được cấp. | Xem/in theo quyền. |
| Học sinh | Chỉ nghĩa vụ và giao dịch của chính mình. | Không có quyền. | Chỉ phiếu thu của chính mình khi được cấp. |

- Mọi số tiền sử dụng kiểu thập phân chính xác; không dùng số thực nhị phân cho tính toán tài chính.
- Mọi giao dịch và đổi trạng thái phải lưu người thực hiện, thời gian theo BR-10.
- Không cho tổng số tiền đã thu vượt số phải thu sau miễn/giảm, trừ khi hệ thống có luồng thanh toán thừa được phê duyệt.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Nghĩa vụ học phí và giao dịch                                              |
+----------------------------------------------------------------------------+
| [Khoản thu] [Nghĩa vụ học phí] [Giao dịch] [Công nợ]                      |
+----------------------------------------------------------------------------+
| [Mã/Họ tên] [Lớp ▼] [Kỳ học ▼] [Trạng thái ▼] [Hạn thu từ-đến] [+ Thêm]  |
| Học sinh | Khoản thu | Phải thu | Đã thu | Còn nợ | Hạn thu | TT | [⋮]  |
| ...                                                                        |
+----------------------------------------------------------------------------+
```

Chọn nghĩa vụ để mở chi tiết và tab giao dịch/phiếu thu. Học sinh chỉ thấy giao diện danh sách cá nhân, không thấy nút thiết lập hay ghi nhận thu.

## 4. Thiết lập khoản thu

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| FEE-ITEM-01 | Mã/tên khoản thu | Bắt buộc; mã duy nhất theo chính sách. |
| FEE-ITEM-02 | Phạm vi áp dụng | Chọn lớp, cấp độ hoặc kỳ học; phải có ít nhất một phạm vi. |
| FEE-ITEM-03 | Số tiền mặc định | Không âm; dùng làm dữ liệu khởi tạo nghĩa vụ. |
| FEE-ITEM-04 | Trạng thái | Đang áp dụng/Không áp dụng; khoản không áp dụng không dùng để tạo nghĩa vụ mới. |

## 5. Nghĩa vụ học phí

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| FEE-OBL-01 | Học sinh | Bắt buộc; chỉ chọn học sinh có đăng ký lớp hợp lệ. |
| FEE-OBL-02 | Khoản thu | Bắt buộc; khoản thu/phạm vi áp dụng hợp lệ. |
| FEE-OBL-03 | Số phải thu | Bắt buộc, lớn hơn hoặc bằng 0. |
| FEE-OBL-04 | Miễn/giảm | Không âm, không vượt số phải thu; ghi lý do khi có giảm. |
| FEE-OBL-05 | Hạn thu | Bắt buộc, ngày hợp lệ. |
| FEE-OBL-06 | Đã thu/còn nợ | Tính tự động từ giao dịch hợp lệ. |
| FEE-OBL-07 | Trạng thái | Chưa thanh toán, Thanh toán một phần, Đã thanh toán, Quá hạn. |

## 6. Giao dịch và phiếu thu

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| FEE-TXN-01 | Nghĩa vụ học phí | Bắt buộc; nghĩa vụ phải thuộc phạm vi quyền. |
| FEE-TXN-02 | Ngày thu | Bắt buộc, ngày hợp lệ. |
| FEE-TXN-03 | Số tiền | Bắt buộc, lớn hơn 0; kiểm tra số dư nghĩa vụ. |
| FEE-TXN-04 | Phương thức | Bắt buộc; tiền mặt/chuyển khoản hoặc danh mục cấu hình. |
| FEE-TXN-05 | Người thu | Bắt buộc; lấy mặc định từ phiên, chỉ thay theo quyền đặc biệt. |
| FEE-TXN-06 | Phiếu thu | Sinh sau khi lưu; có thể xem/in khi có quyền. |

Giao dịch đã xác nhận không xóa/sửa trực tiếp; mọi điều chỉnh dùng luồng hủy/hoàn tiền riêng theo chính sách để bảo toàn sổ vết.

## 7. Công nợ, trạng thái và tiêu chí nghiệm thu

| Trạng thái nghĩa vụ | Điều kiện |
| --- | --- |
| Chưa thanh toán | `Đã thu = 0` và chưa quá hạn. |
| Thanh toán một phần | `0 < Đã thu < (Phải thu - Miễn/giảm)`. |
| Đã thanh toán | `Đã thu = Phải thu - Miễn/giảm`. |
| Quá hạn | Còn nợ và ngày hiện tại sau hạn thu. |

| Trạng thái giao diện | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ cho từng tab/danh sách/chi tiết. |
| Không có dữ liệu | Thông báo phù hợp bộ lọc. |
| Lỗi tài chính | Nêu lỗi tại trường, không tạo giao dịch một phần ngoài ý muốn. |
| Thành công | Cập nhật nghĩa vụ, giao dịch, phiếu thu và thông báo. |

- Học sinh chỉ xem dữ liệu của mình; không thể xem/in phiếu thu của người khác.
- Số đã thu/còn nợ/trạng thái được tính đúng từ giao dịch và miễn/giảm.
- Không thể ghi giao dịch có số tiền không hợp lệ hoặc vượt nghĩa vụ khi không có xử lý thừa.
- Toàn bộ thao tác tài chính truy vết được người thực hiện và thời gian.
