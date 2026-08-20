# Detail Design — MH-13 Nghĩa vụ học phí và giao dịch

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-13 |
| Mã chức năng | FEE-OBLIGATION-AND-PAYMENT |
| Điều kiện vào | Người dùng đã xác thực, có quyền tài chính tương ứng hoặc là học sinh có hồ sơ liên kết. |
| Đầu vào | Khoản thu, nghĩa vụ, giao dịch, bộ lọc công nợ. |
| Đầu ra | Số phải thu/đã thu/còn nợ, trạng thái, giao dịch, phiếu thu và lịch sử audit. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `KhoanThu` | `id`, `ma`, `ten`, `so_tien_mac_dinh`, `lop_hoc_id/cap_do/ky_hoc_id`, `trang_thai` | Phạm vi áp dụng theo ít nhất một điều kiện. |
| `NghiaVuHocPhi` | `id`, `hoc_sinh_id`, `khoan_thu_id`, `so_phai_thu`, `so_mien_giam`, `han_thu`, `trang_thai`, `created_by`, thời gian | Giá trị phải thu của một học sinh. |
| `GiaoDichHocPhi` | `id`, `nghia_vu_id`, `ngay_thu`, `so_tien`, `phuong_thuc`, `nguoi_thu_id`, `ma_phieu_thu`, `trang_thai`, thời gian | Giao dịch đã xác nhận. |
| `PhieuThu` | `id`, `giao_dich_id`, `so_phieu`, dữ liệu in, thời gian phát hành | Phiếu thu bất biến/phiên bản theo chính sách. |
| `DangKyLop` | học sinh, lớp, hiệu lực | Kiểm tra học sinh hợp lệ khi tạo nghĩa vụ. |
| `NhatKyHeThong` | người thực hiện, hành động, đối tượng, thay đổi an toàn, thời gian | Vết kiểm toán theo BR-10. |

Số tiền dùng `DECIMAL(18,2)` hoặc đơn vị tiền tệ nhỏ nhất theo cấu hình. Chỉ mục đề xuất: `NghiaVuHocPhi(hoc_sinh_id, han_thu, trang_thai)`, `GiaoDichHocPhi(nghia_vu_id, ngay_thu)`; mã phiếu thu duy nhất.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET/POST /api/v1/khoan-thu` | Danh sách và tạo khoản thu. |
| `GET/PATCH /api/v1/khoan-thu/{id}` | Chi tiết/cập nhật khoản thu. |
| `GET/POST /api/v1/nghia-vu-hoc-phi` | Danh sách và tạo nghĩa vụ. |
| `GET/PATCH /api/v1/nghia-vu-hoc-phi/{id}` | Chi tiết/cập nhật phần được phép của nghĩa vụ. |
| `GET/POST /api/v1/giao-dich-hoc-phi` | Danh sách và ghi nhận giao dịch. |
| `GET /api/v1/giao-dich-hoc-phi/{id}/phieu-thu` | Xem/in phiếu thu đã ủy quyền. |
| `GET /api/v1/bao-cao/cong-no` | Tổng hợp công nợ theo bộ lọc. |
| `GET /api/v1/me/hoc-phi` | Nghĩa vụ/giao dịch của học sinh đang đăng nhập. |

### 3.1. Khoản thu và nghĩa vụ

`POST /api/v1/khoan-thu` yêu cầu quyền `FEE_CATALOG_WRITE`.

```json
{
  "ma": "HP-N5-K1",
  "ten": "Học phí N5 kỳ 1",
  "so_tien_mac_dinh": 5000000.00,
  "lop_hoc_id": null,
  "cap_do": "N5",
  "ky_hoc_id": 2,
  "trang_thai": "DANG_AP_DUNG"
}
```

Mã/tên/số tiền/trạng thái hợp lệ, ít nhất một phạm vi áp dụng. Khoản thu không áp dụng không dùng để tạo nghĩa vụ mới.

`POST /api/v1/nghia-vu-hoc-phi` yêu cầu `FEE_OBLIGATION_WRITE`.

```json
{
  "hoc_sinh_id": 21,
  "khoan_thu_id": 7,
  "so_phai_thu": 5000000.00,
  "so_mien_giam": 500000.00,
  "ly_do_mien_giam": "Học bổng",
  "han_thu": "2026-09-30"
}
```

Máy chủ kiểm tra học sinh có đăng ký lớp hợp lệ và khoản thu đúng phạm vi; `0 <= so_mien_giam <= so_phai_thu`. Phản hồi HTTP 201 trả `so_can_thu`, `so_da_thu = 0`, `so_con_no`, trạng thái ban đầu và audit.

### 3.2. Danh sách/chi tiết nghĩa vụ

`GET /api/v1/nghia-vu-hoc-phi` hỗ trợ `q`, `hoc_sinh_id`, `lop_hoc_id`, `ky_hoc_id`, `trang_thai`, `tu_han`, `den_han`, `page`, `page_size`. Dòng danh sách trả học sinh, khoản thu, số phải thu/miễn giảm/đã thu/còn nợ, hạn thu, trạng thái.

`PATCH /api/v1/nghia-vu-hoc-phi/{id}` chỉ sửa phần chưa bị chốt theo chính sách (ví dụ hạn thu, miễn/giảm kèm lý do). Khi đã có giao dịch, sửa số phải thu/miễn giảm phải kiểm tra `so_can_thu >= so_da_thu`; mọi thay đổi được ghi vết. Không dùng API xóa cứng nghĩa vụ đã có giao dịch.

### 3.3. Ghi nhận giao dịch

`POST /api/v1/giao-dich-hoc-phi` yêu cầu `FEE_PAYMENT_WRITE`.

```json
{
  "nghia_vu_id": 44,
  "ngay_thu": "2026-09-10",
  "so_tien": 1000000.00,
  "phuong_thuc": "CHUYEN_KHOAN",
  "nguoi_thu_id": null,
  "ghi_chu": "Đợt 1"
}
```

| Trường | Bắt buộc | Quy tắc |
| --- | --- | --- |
| `nghia_vu_id` | Có | Nghĩa vụ tồn tại và thuộc phạm vi quyền. |
| `ngay_thu` | Có | Ngày hợp lệ. |
| `so_tien` | Có | Decimal lớn hơn 0. |
| `phuong_thuc` | Có | Giá trị thuộc danh mục phương thức thu. |
| `nguoi_thu_id` | Không | Mặc định người dùng phiên; chỉ cho đổi khi có quyền đặc biệt. |
| `ghi_chu` | Không | Giới hạn độ dài cấu hình. |

Trong một giao dịch CSDL, máy chủ khóa nghĩa vụ, tính `so_can_thu = so_phai_thu - so_mien_giam`, kiểm tra `so_da_thu + so_tien <= so_can_thu`, tạo giao dịch/phiếu thu, tính lại số dư-trạng thái và ghi audit. Nếu có chức năng thanh toán thừa, nó dùng API/loại giao dịch riêng, không đi qua luồng này. Thành công HTTP 201 trả giao dịch, mã phiếu và số dư sau thu; vượt số dư trả HTTP 409 `PAYMENT_EXCEEDS_BALANCE`.

### 3.4. Phiếu thu, công nợ và dữ liệu cá nhân

`GET /api/v1/giao-dich-hoc-phi/{id}/phieu-thu` kiểm tra quyền giao dịch; trả PDF/HTML in được hoặc URL ký ngắn hạn. Không công khai kho tệp nội bộ; học sinh chỉ tải phiếu của giao dịch thuộc chính mình.

`GET /api/v1/bao-cao/cong-no` yêu cầu `FEE_DEBT_REPORT_READ`, nhận lọc lớp, cấp độ, kỳ học, trạng thái, hạn thu và thời điểm báo cáo. Trả tổng phải thu/đã thu/còn nợ và danh sách chi tiết có phân trang trong phạm vi quyền.

`GET /api/v1/me/hoc-phi` cố định học sinh theo phiên, trả nghĩa vụ, giao dịch, số dư và phiếu thu đã được phép xem; không nhận `hoc_sinh_id` để mở rộng dữ liệu.

### 3.5. Quy ước chung, quyền và mã lỗi

- Base URL: `/api/v1`; quyền tách biệt: `FEE_CATALOG_READ/WRITE`, `FEE_OBLIGATION_READ/WRITE`, `FEE_PAYMENT_READ/WRITE`, `FEE_RECEIPT_READ`, `FEE_DEBT_REPORT_READ`. Máy chủ luôn xác định phạm vi tài chính từ phiên.
- Số tiền truyền/nhận JSON là số decimal chính xác hoặc chuỗi decimal theo chuẩn API thống nhất; không dùng float phía máy chủ. Ngày `YYYY-MM-DD`, list page 1/20 tối đa 100.
- Enum: trạng thái nghĩa vụ `CHUA_THANH_TOAN`, `THANH_TOAN_MOT_PHAN`, `DA_THANH_TOAN`, `QUA_HAN`; phương thức thu theo danh mục như `TIEN_MAT`, `CHUYEN_KHOAN`.

| HTTP | Mã lỗi | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật thành công. |
| 400 | `INVALID_QUERY` | Lọc/tham số sai. |
| 401/403 | `UNAUTHENTICATED`, `FEE_FORBIDDEN` | Không có phiên/quyền/phạm vi. |
| 404 | `FEE_ITEM_NOT_FOUND`, `OBLIGATION_NOT_FOUND`, `PAYMENT_NOT_FOUND` | Đối tượng không tồn tại. |
| 409 | `PAYMENT_EXCEEDS_BALANCE`, `OBLIGATION_AMOUNT_CONFLICT` | Vượt số dư/xung đột giao dịch. |
| 422 | `VALIDATION_ERROR`, `INVALID_MONEY_AMOUNT` | Số tiền/dữ liệu không hợp lệ. |

### 3.6. Chi tiết API khoản thu và nghĩa vụ

#### `GET /api/v1/khoan-thu`

**Quyền:** `FEE_CATALOG_READ`. Query `q`, `lop_hoc_id`, `cap_do`, `ky_hoc_id`, `trang_thai`, `page`, `page_size`, `sort`. Response trả mã/tên, số tiền mặc định, phạm vi, trạng thái và thời gian cập nhật; không trả dữ liệu nghĩa vụ học sinh.

#### `GET/PATCH /api/v1/khoan-thu/{id}`

`GET` trả chi tiết khoản thu. `PATCH` cần `FEE_CATALOG_WRITE`, chỉ nhận trường thay đổi: `ma`, `ten`, `so_tien_mac_dinh`, phạm vi, trạng thái. Khi khoản thu đã dùng, thay đổi phạm vi/trạng thái phải kiểm tra dữ liệu phụ thuộc, không sửa hồi tố nghĩa vụ đã tạo; HTTP 200 kèm audit.

#### `GET /api/v1/nghia-vu-hoc-phi` và `GET /api/v1/nghia-vu-hoc-phi/{id}`

**Quyền:** `FEE_OBLIGATION_READ` và scope. API list nhận các bộ lọc 3.2, thêm `khoan_thu_id`, `qua_han_tai_ngay`, `include_transactions`; response mỗi nghĩa vụ gồm học sinh/khoản thu rút gọn, số phải thu-miễn giảm-cần thu-đã thu-còn nợ, hạn thu, trạng thái và hành động được phép. Chi tiết trả giao dịch/phiếu theo quyền, không trả dữ liệu thanh toán của học sinh khác.

#### `PATCH /api/v1/nghia-vu-hoc-phi/{id}`

**Quyền:** `FEE_OBLIGATION_WRITE`. Body chỉ gồm trường được phép, ví dụ:

```json
{ "so_mien_giam": 500000.00, "ly_do_mien_giam": "Học bổng", "han_thu": "2026-10-15" }
```

Server khóa nghĩa vụ, kiểm tra `so_can_thu >= so_da_thu` nếu đã có giao dịch, tính lại dư nợ/trạng thái và audit. Không cho client tự gán `so_da_thu`, `so_con_no`, trạng thái.

### 3.7. Chi tiết API giao dịch và phiếu thu

#### `GET /api/v1/giao-dich-hoc-phi`

**Quyền:** `FEE_PAYMENT_READ` và scope. Query `nghia_vu_id`, `hoc_sinh_id`, `phuong_thuc`, `tu_ngay`, `den_ngay`, `nguoi_thu_id`, `page`, `page_size`, `sort=-ngay_thu`. Response trả giao dịch, nghĩa vụ/học sinh rút gọn, số tiền, phương thức, người thu, trạng thái và mã phiếu theo quyền.

#### `POST /api/v1/giao-dich-hoc-phi`

**Quyền:** `FEE_PAYMENT_WRITE`. Payload và kiểm tra ở 3.3. Hỗ trợ header `Idempotency-Key` cho giao dịch tiền để tránh tạo trùng khi người dùng gửi lại request. HTTP 201 trả giao dịch, phiếu thu và số dư/trạng thái nghĩa vụ sau thu; không trả thông tin tài khoản thanh toán nhạy cảm.

#### `GET /api/v1/giao-dich-hoc-phi/{id}/phieu-thu`

**Quyền:** `FEE_RECEIPT_READ` và scope. Query tùy chọn `format=PDF|HTML`; trả stream hoặc URL ký ngắn hạn sau kiểm tra quyền. Phiếu có mã duy nhất, dữ liệu tại thời điểm phát hành; không dùng URL kho tệp trực tiếp. Học sinh chỉ xem phiếu thuộc giao dịch của bản thân.

### 3.8. Chi tiết báo cáo công nợ và API cá nhân

#### `GET /api/v1/bao-cao/cong-no`

**Quyền:** `FEE_DEBT_REPORT_READ`. Query `lop_hoc_id`, `cap_do`, `ky_hoc_id`, `trang_thai`, `tu_han`, `den_han`, `tai_ngay`, `include_details`, `page`, `page_size`. Response trả tổng phải thu/miễn giảm/đã thu/còn nợ/quá hạn và chi tiết phân trang trong scope; mọi tổng tính bằng decimal phía máy chủ.

#### `GET /api/v1/me/hoc-phi`

**Quyền:** tài khoản Học sinh liên kết. Không nhận `hoc_sinh_id`; query `ky_hoc_id`, `trang_thai`, `include_transactions`, `page`, `page_size`. Response chỉ gồm nghĩa vụ/giao dịch/phiếu bản thân được phép xem.

### 3.9. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET/POST /khoan-thu` | Đọc/ghi khoản thu | Danh sách/tạo khoản thu. | 200/201 |
| `GET/PATCH /khoan-thu/{id}` | Đọc/ghi khoản thu | Chi tiết/cập nhật khoản thu. | 200 |
| `GET/POST /nghia-vu-hoc-phi` | Đọc/ghi nghĩa vụ | Danh sách/tạo nghĩa vụ. | 200/201 |
| `GET/PATCH /nghia-vu-hoc-phi/{id}` | Đọc/ghi + scope | Chi tiết/cập nhật nghĩa vụ. | 200 |
| `GET/POST /giao-dich-hoc-phi` | Đọc/ghi giao dịch | Danh sách/ghi nhận thu. | 200/201 |
| `GET /giao-dich-hoc-phi/{id}/phieu-thu` | Đọc phiếu + scope | Xem/in phiếu thu. | 200 |
| `GET /bao-cao/cong-no` | Quyền báo cáo | Tổng hợp công nợ. | 200 |
| `GET /me/hoc-phi` | Học sinh phiên | Dữ liệu học phí cá nhân. | 200 |

## 4. Quy tắc nghiệp vụ và trạng thái

| Mã | Quy tắc |
| --- | --- |
| FEE-ACL-01 | API tài chính kiểm tra riêng quyền xem, thiết lập, tạo nghĩa vụ, ghi thu, báo cáo và in phiếu. |
| FEE-ACL-02 | Học sinh bị cố định theo hồ sơ liên kết, chỉ đọc nghĩa vụ/giao dịch/phiếu của chính mình. |
| FEE-BR-01 | Nghĩa vụ chỉ tạo cho học sinh có đăng ký lớp hợp lệ và khoản thu đúng phạm vi. |
| FEE-BR-02 | `so_phai_thu >= 0`, `0 <= so_mien_giam <= so_phai_thu`, giao dịch có `so_tien > 0`. |
| FEE-BR-03 | Tổng giao dịch xác nhận không vượt `so_phai_thu - so_mien_giam`, trừ luồng thanh toán thừa được phê duyệt. |
| FEE-BR-04 | Trạng thái nghĩa vụ tính từ số dư/hạn thu, không cho client tự gán. |
| FEE-BR-05 | Giao dịch đã xác nhận và phiếu thu không xóa cứng; điều chỉnh dùng quy trình hoàn/hủy có audit. |
| FEE-BR-06 | Mọi giao dịch, điều chỉnh trạng thái và phát hành phiếu lưu người thực hiện/thời gian. |

## 5. Công thức và pseudocode ghi thu

```text
so_can_thu = so_phai_thu - so_mien_giam
so_da_thu = SUM(giao_dich da_xac_nhan)
so_con_no = so_can_thu - so_da_thu

status(nghia_vu):
    if so_con_no == 0: DA_THANH_TOAN
    if today > han_thu and so_con_no > 0: QUA_HAN
    if so_da_thu > 0: THANH_TOAN_MOT_PHAN
    return CHUA_THANH_TOAN

record_payment(actor, request):
    require_fee_payment_permission(actor)
    begin_transaction()
    obligation = lock_obligation(request.nghia_vu_id)
    validate(request.amount <= remaining_balance(obligation))
    payment = create_payment(request, collector=actor)
    issue_receipt(payment)
    recalculate_obligation(obligation)
    write_audit(actor, "GHI_NHAN_GIAO_DICH", payment)
    commit_transaction()
```

## 6. Hành vi giao diện, an toàn và hiệu năng

| Sự kiện | Xử lý |
| --- | --- |
| Chọn học sinh/khoản thu | Lọc theo phạm vi và hiển thị số tiền mặc định có thể điều chỉnh theo quyền. |
| Nhập miễn/giảm | Tính trước số cần thu; yêu cầu lý do khi giá trị lớn hơn 0. |
| Nhập giao dịch | Hiển thị số dư hiện tại; API là nguồn kiểm tra cuối cùng. |
| Lưu thu | Khóa nút chống gửi lặp; sau thành công cập nhật số dư/trạng thái và mở phiếu thu. |
| In phiếu | Gọi endpoint đã ủy quyền, không dùng đường dẫn tệp trực tiếp. |

- Khóa bản ghi nghĩa vụ khi ghi thu và dùng transaction để tránh thu vượt do yêu cầu đồng thời.
- Không ghi số tài khoản, dữ liệu thanh toán nhạy cảm hay URL ký vào log phía trình duyệt.
- Báo cáo dùng tổng hợp/phân trang phía máy chủ; cache nếu có phải khóa theo quyền và bộ lọc.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-FEE-01 | Tạo nghĩa vụ cho học sinh không có đăng ký lớp hợp lệ. | Bị từ chối, không tạo nghĩa vụ. |
| TC-FEE-02 | Nhập miễn/giảm lớn hơn số phải thu. | Lỗi dữ liệu, không lưu. |
| TC-FEE-03 | Ghi giao dịch số tiền bằng 0 hoặc âm. | HTTP 422, không tạo giao dịch. |
| TC-FEE-04 | Ghi giao dịch vượt số dư. | HTTP 409, không sinh phiếu thu. |
| TC-FEE-05 | Ghi giao dịch hợp lệ một phần. | Tính đúng đã thu/còn nợ và trạng thái Thanh toán một phần. |
| TC-FEE-06 | Ghi giao dịch thanh toán hết. | Trạng thái Đã thanh toán và sinh phiếu thu duy nhất. |
| TC-FEE-07 | Hai yêu cầu thu đồng thời vượt tổng còn nợ. | Chỉ yêu cầu hợp lệ thành công; không có thu vượt. |
| TC-FEE-08 | Học sinh mở nghĩa vụ/phiếu thu của học sinh khác. | Bị từ chối, không rò rỉ dữ liệu tài chính. |
