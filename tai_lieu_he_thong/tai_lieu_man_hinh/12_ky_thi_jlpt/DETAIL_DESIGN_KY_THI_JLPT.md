# Detail Design — MH-12 Kỳ thi JLPT

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-12 |
| Mã chức năng | JLPT-EXAM-RESULT-MANAGEMENT |
| Điều kiện vào | Người dùng đã xác thực và có quyền xem/quản lý kết quả thi trong phạm vi học sinh hợp lệ. |
| Đầu vào | Bộ lọc; dữ liệu kết quả; tệp hoặc liên kết chứng chỉ. |
| Đầu ra | Danh sách/chi tiết kết quả, lịch sử theo học sinh và liên kết tải chứng chỉ được ủy quyền. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `KyThi` | `id`, `hoc_sinh_id`, `loai_ky_thi`, `cap_do`, `ngay_thi`, `ket_qua`, `ghi_chu`, `created_by`, `updated_by`, thời gian | Một lần thi/kết quả. |
| `ChungChiKyThi` | `id`, `ky_thi_id`, `ten_hien_thi`, `storage_key`, `mime_type`, `size_bytes`, `checksum`, `uploaded_by`, thời gian | Lưu metadata, không công khai `storage_key`. |
| `HocSinh` | id, mã, họ tên, trạng thái | Đối tượng kết quả và phạm vi quyền. |
| `DangKyLop`, `PhanCong` | khóa học sinh/lớp/giáo viên, hiệu lực | Xác định phạm vi xem của giáo viên khi áp dụng. |
| `NhatKyHeThong` | người thực hiện, hành động, đối tượng, thay đổi an toàn, thời gian | Ghi vết tạo/sửa/tải tệp. |

Chỉ mục đề xuất: `KyThi(hoc_sinh_id, ngay_thi DESC)`, `KyThi(cap_do, ngay_thi)`; khóa ngoại chứng chỉ đến kết quả thi. `cap_do` chỉ thuộc N5–N1.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET /api/v1/ky-thi-jlpt` | Danh sách kết quả có lọc/phân trang. |
| `POST /api/v1/ky-thi-jlpt` | Tạo kết quả thi. |
| `GET/PATCH /api/v1/ky-thi-jlpt/{id}` | Chi tiết/cập nhật kết quả. |
| `POST /api/v1/ky-thi-jlpt/{id}/chung-chi` | Tải tệp chứng chỉ. |
| `GET /api/v1/ky-thi-jlpt/{id}/chung-chi/{file_id}/tai-xuong` | Tải chứng chỉ đã ủy quyền. |
| `GET /api/v1/hoc-sinh/{id}/lich-su-ky-thi-jlpt` | Lịch sử thi của học sinh. |
| `GET /api/v1/me/ky-thi-jlpt` | Kết quả của học sinh đang đăng nhập. |

### 3.1. Danh sách kết quả

`GET /api/v1/ky-thi-jlpt` yêu cầu quyền `EXAM_RESULT_READ`. Query: `q`, `hoc_sinh_id`, `loai_ky_thi` (`NOI_BO`, `THI_THU`, `JLPT_CHINH_THUC`), `cap_do` (N5–N1), `ket_qua`, `tu_ngay`, `den_ngay`, `page`, `page_size`, `sort`.

Tất cả bộ lọc được giới hạn bằng phạm vi quyền. Giáo viên chỉ nhận học sinh liên quan theo chính sách; học sinh dùng API `me` thay vì API danh sách chung.

```json
{
  "data": [
    {
      "id": 36,
      "hoc_sinh": { "id": 21, "ma": "HS001", "ho_ten": "Trần Minh Anh" },
      "loai_ky_thi": "THI_THU",
      "cap_do": "N5",
      "ngay_thi": "2026-09-01",
      "ket_qua": "DAT",
      "co_chung_chi": true,
      "updated_at": "2026-09-02T10:00:00+07:00"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 1, "total_pages": 1 }
}
```

### 3.2. Tạo/cập nhật kết quả

`POST /api/v1/ky-thi-jlpt` yêu cầu `EXAM_RESULT_WRITE`.

```json
{
  "hoc_sinh_id": 21,
  "loai_ky_thi": "THI_THU",
  "cap_do": "N5",
  "ngay_thi": "2026-09-01",
  "ket_qua": "DAT",
  "ghi_chu": "Đạt yêu cầu đầu ra"
}
```

| Trường | Bắt buộc | Quy tắc |
| --- | --- | --- |
| `hoc_sinh_id` | Có | Học sinh tồn tại và thuộc phạm vi quyền ghi. |
| `loai_ky_thi` | Có | Một trong ba loại kỳ thi được hỗ trợ. |
| `cap_do` | Có | N5–N1. |
| `ngay_thi` | Có | Ngày hợp lệ; không ở tương lai nếu chính sách không cho phép. |
| `ket_qua` | Có | Giá trị thuộc danh mục kết quả. |
| `ghi_chu` | Không | Giới hạn độ dài cấu hình. |

`PATCH /api/v1/ky-thi-jlpt/{id}` chỉ nhận trường cần đổi, trả HTTP 200 cùng đối tượng sau cập nhật. Cả hai API ghi `created_by`/`updated_by` và nhật ký. HTTP 422 khi sai dữ liệu, 403 ngoài quyền, 404 không tồn tại và 409 khi vi phạm quy tắc trùng/xung đột do chính sách bổ sung.

### 3.3. Tệp chứng chỉ

`POST /api/v1/ky-thi-jlpt/{id}/chung-chi` dùng `multipart/form-data`, trường tệp `file`; tùy chọn `ten_hien_thi`. API yêu cầu quyền sửa kết quả.

Máy chủ kiểm tra MIME thực tế, phần mở rộng cho phép, kích thước tối đa, nội dung độc hại/quét virus theo NFR-03 và quyền của người tải. Sau khi thành công (HTTP 201), trả metadata an toàn:

```json
{
  "data": {
    "id": 9,
    "ten_hien_thi": "chung-chi-jlpt-n5.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 245312,
    "uploaded_at": "2026-09-02T10:30:00+07:00"
  }
}
```

`GET /api/v1/ky-thi-jlpt/{id}/chung-chi/{file_id}/tai-xuong` kiểm tra quyền từng yêu cầu, sau đó trả luồng tệp hoặc URL ký ngắn hạn. Không công khai đường dẫn lưu trữ; dùng `Content-Disposition: attachment` với tên tệp đã làm sạch. Lỗi tệp không hợp lệ trả 422; không quyền trả 403/404 theo chính sách.

### 3.4. Lịch sử và kết quả cá nhân

`GET /api/v1/hoc-sinh/{id}/lich-su-ky-thi-jlpt` nhận `cap_do`, `loai_ky_thi`, `tu_ngay`, `den_ngay`, `page`, `page_size`; trả kết quả của học sinh theo ngày thi giảm dần. Quyền được kiểm tra cho học sinh đích.

`GET /api/v1/me/ky-thi-jlpt` cố định `hoc_sinh_id` theo phiên học sinh, hỗ trợ lọc `cap_do`, `loai_ky_thi`, khoảng ngày và phân trang. Chỉ trả các trường học sinh được phép xem cùng cờ/tài nguyên chứng chỉ đã ủy quyền.

### 3.5. Quy ước chung, quyền và mã lỗi

- Base URL: `/api/v1`; `EXAM_RESULT_READ`, `EXAM_RESULT_WRITE`, `EXAM_CERTIFICATE_DOWNLOAD` được kiểm tra độc lập cùng phạm vi học sinh. Giáo viên chỉ đọc/ghi trong phạm vi được cấp; học sinh bị cố định theo hồ sơ phiên.
- Enum `loai_ky_thi`: `NOI_BO`, `THI_THU`, `JLPT_CHINH_THUC`; `cap_do`: N5–N1. Ngày dùng `YYYY-MM-DD`; list mặc định page 1, 20 dòng/trang, tối đa 100.
- Mọi response tệp/metadata không có `storage_key`, URL lưu trữ nội bộ hoặc URL ký dài hạn.

| HTTP | Mã lỗi | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật/upload thành công. |
| 400 | `INVALID_QUERY` | Query/bộ lọc sai định dạng. |
| 401/403 | `UNAUTHENTICATED`, `EXAM_RESULT_FORBIDDEN` | Không có phiên/quyền/phạm vi. |
| 404 | `EXAM_NOT_FOUND`, `CERTIFICATE_NOT_FOUND` | Bản ghi/tệp không tồn tại hoặc không công bố. |
| 409 | `EXAM_RESULT_CONFLICT` | Trùng/xung đột nghiệp vụ theo chính sách. |
| 422 | `VALIDATION_ERROR`, `INVALID_CERTIFICATE_FILE` | Dữ liệu/tệp không hợp lệ. |

### 3.6. Chi tiết API danh sách, tạo và cập nhật

#### `GET /api/v1/ky-thi-jlpt`

**Quyền:** `EXAM_RESULT_READ`. Query đầy đủ: `q`, `hoc_sinh_id`, `loai_ky_thi`, `cap_do`, `ket_qua`, `tu_ngay`, `den_ngay`, `co_chung_chi`, `page`, `page_size`, `sort`. `tu_ngay <= den_ngay`; mọi ID học sinh giới hạn theo scope. Response meta thêm `filters_applied`, `total_pages`, `generated_at`.

#### `POST /api/v1/ky-thi-jlpt`

**Quyền:** `EXAM_RESULT_WRITE`. Payload theo mục 3.2. Server kiểm tra học sinh tồn tại/trong scope, enum, ngày thi và danh mục kết quả, lưu `created_by`/audit; trả HTTP 201 đối tượng kết quả an toàn.

#### `GET /api/v1/ky-thi-jlpt/{id}`

**Quyền:** `EXAM_RESULT_READ` và scope kết quả. Response gồm kết quả, học sinh rút gọn, ghi chú, danh sách metadata chứng chỉ, `created_at`, `updated_at`, cùng `hanh_dong_duoc_phep`; không trả metadata ngoài quyền.

#### `PATCH /api/v1/ky-thi-jlpt/{id}`

**Quyền:** `EXAM_RESULT_WRITE` và scope. Chỉ nhận trường thay đổi (`loai_ky_thi`, `cap_do`, `ngay_thi`, `ket_qua`, `ghi_chu`); không chuyển `hoc_sinh_id` sang học sinh khác nếu bản ghi đã có chứng chỉ/audit. Thành công HTTP 200, ghi `updated_by`/audit; xung đột trả 409.

### 3.7. Chi tiết API chứng chỉ

#### `POST /api/v1/ky-thi-jlpt/{id}/chung-chi`

**Quyền:** `EXAM_RESULT_WRITE` và scope kết quả. `multipart/form-data`: `file` bắt buộc, `ten_hien_thi` tùy chọn. Kiểm tra MIME thực tế, extension, kích thước, tên tệp, quét an toàn theo NFR-03; thành công HTTP 201 trả metadata ở mục 3.3. Nếu thay tệp, metadata/tệp cũ được lưu/thu hồi theo chính sách và có audit.

#### `GET /api/v1/ky-thi-jlpt/{id}/chung-chi/{file_id}/tai-xuong`

**Quyền:** `EXAM_CERTIFICATE_DOWNLOAD` và scope. Xác minh `file_id` thuộc kết quả `{id}`, sau đó trả stream với `Content-Disposition: attachment` hoặc URL ký ngắn hạn. Không chấp nhận `storage_key` từ client; ghi audit tải tệp theo cấu hình.

### 3.8. Chi tiết lịch sử và API kết quả cá nhân

#### `GET /api/v1/hoc-sinh/{id}/lich-su-ky-thi-jlpt`

**Quyền:** `EXAM_RESULT_READ` và scope học sinh. Query `cap_do`, `loai_ky_thi`, `ket_qua`, `tu_ngay`, `den_ngay`, `page`, `page_size`, `sort=-ngay_thi`. Mỗi dòng trả loại/cấp độ/ngày/kết quả/ghi chú và cờ chứng chỉ; danh tính/tệp tuân thủ quyền.

#### `GET /api/v1/me/ky-thi-jlpt`

**Quyền:** người dùng có hồ sơ Học sinh liên kết. Không nhận `hoc_sinh_id`. Query `cap_do`, `loai_ky_thi`, `ket_qua`, `tu_ngay`, `den_ngay`, `page`, `page_size`. Response cùng định dạng lịch sử nhưng chỉ có kết quả bản thân và liên kết chứng chỉ đã ủy quyền.

### 3.9. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET/POST /ky-thi-jlpt` | Đọc/ghi kết quả | Danh sách/tạo kết quả. | 200/201 |
| `GET/PATCH /ky-thi-jlpt/{id}` | Đọc/ghi + scope | Chi tiết/cập nhật. | 200 |
| `POST /ky-thi-jlpt/{id}/chung-chi` | Ghi + scope | Upload chứng chỉ. | 201 |
| `GET /.../{id}/chung-chi/{file_id}/tai-xuong` | Tải + scope | Tải chứng chỉ an toàn. | 200/redirect ký |
| `GET /hoc-sinh/{id}/lich-su-ky-thi-jlpt` | Đọc + scope | Lịch sử dự thi. | 200 |
| `GET /me/ky-thi-jlpt` | Học sinh phiên | Kết quả cá nhân. | 200 |

## 4. Quy tắc nghiệp vụ và phân quyền

| Mã | Quy tắc |
| --- | --- |
| EXM-ACL-01 | Quyền xem/ghi/tải chứng chỉ kiểm tra theo vai trò và phạm vi học sinh cho từng API. |
| EXM-ACL-02 | Học sinh luôn cố định theo hồ sơ liên kết; không nhận `hoc_sinh_id` để xem dữ liệu người khác. |
| EXM-BR-01 | Kết quả bắt buộc có học sinh, loại thi, cấp độ, ngày thi, kết quả; cấp độ N5–N1. |
| EXM-BR-02 | Tệp chứng chỉ chỉ được lưu sau kiểm tra loại, kích thước, nội dung và quyền theo NFR-03. |
| EXM-BR-03 | Liên kết chứng chỉ chỉ dùng URL hợp lệ theo danh sách giao thức/domain được cấu hình; không tự tải nội dung URL tùy ý ở máy chủ. |
| EXM-BR-04 | Mọi tạo/sửa kết quả và tải/thay tệp có người thực hiện, thời điểm và nhật ký. |
| EXM-BR-05 | Lịch sử thi không bị xóa cứng khi đã phát sinh; áp dụng trạng thái/ghi vết điều chỉnh theo chính sách. |

## 5. Pseudocode tải chứng chỉ

```text
upload_certificate(actor, exam_id, file):
    require_exam_write_permission(actor, exam_id)
    validate_file_metadata_and_content(file)
    scan_file(file)
    begin_transaction()
    stored = store_in_private_bucket(file)
    certificate = save_safe_metadata(exam_id, stored, actor)
    write_audit(actor, "TAI_CHUNG_CHI", exam_id, certificate.safe_metadata)
    commit_transaction()
    return certificate
```

## 6. Hành vi giao diện, hiệu năng và an toàn

| Sự kiện | Xử lý |
| --- | --- |
| Lọc danh sách | Tải lại trang 1 theo phạm vi quyền. |
| Chọn học sinh | Mở chi tiết/lịch sử nếu có quyền. |
| Chọn tệp | Kiểm tra sơ bộ loại/kích thước, sau đó máy chủ kiểm tra toàn diện. |
| Tải chứng chỉ | Gọi endpoint được ủy quyền; không dùng URL lưu trữ trực tiếp. |
| Lưu kết quả | Khóa nút chống gửi lặp, hiển thị lỗi tại trường và tải lại dữ liệu sau thành công. |

- Danh sách/lịch sử dùng phân trang phía máy chủ, chỉ trả metadata tệp cần hiển thị.
- Tệp đặt trong kho riêng, chống truy cập bằng đoán URL; URL ký nếu dùng phải ngắn hạn và chỉ cấp sau kiểm tra quyền.
- Ghi nhật ký thao tác tệp mà không ghi nội dung tệp hoặc URL ký vào log ứng dụng.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-EXM-01 | Tạo kết quả cấp độ ngoài N5–N1. | Bị từ chối, không tạo bản ghi. |
| TC-EXM-02 | Tạo kết quả cho học sinh ngoài phạm vi quyền. | HTTP 403, không thay đổi dữ liệu. |
| TC-EXM-03 | Tải tệp sai MIME/vượt dung lượng. | HTTP 422, không thay tệp hiện có. |
| TC-EXM-04 | Tải chứng chỉ hợp lệ. | Lưu metadata an toàn, có nhật ký và không lộ storage key. |
| TC-EXM-05 | Học sinh gọi URL chứng chỉ của học sinh khác. | Bị từ chối, không trả tệp hay metadata nhạy cảm. |
| TC-EXM-06 | Xem lịch sử một học sinh theo cấp độ. | Kết quả đúng thứ tự ngày/cấp độ, giới hạn theo quyền. |
| TC-EXM-07 | Gọi API kết quả cá nhân với tham số học sinh khác. | API bỏ qua/từ chối, luôn chỉ trả dữ liệu hồ sơ phiên. |
| TC-EXM-08 | Truy cập URL tệp trực tiếp không có chữ ký/quyền. | Không tải được tệp. |
