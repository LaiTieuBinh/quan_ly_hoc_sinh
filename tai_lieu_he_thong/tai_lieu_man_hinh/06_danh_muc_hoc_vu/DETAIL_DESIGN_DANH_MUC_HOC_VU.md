# Detail Design — MH-06 Niên khóa, kỳ học và môn học

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-06 |
| Mã chức năng | ACADEMIC-CATALOG-MANAGEMENT |
| Điều kiện vào | Người dùng đã xác thực và có quyền quản lý danh mục học vụ. |
| Đầu vào | Điều kiện tìm kiếm/lọc; dữ liệu niên khóa, kỳ học, môn học. |
| Đầu ra | Danh sách danh mục, dữ liệu tạo/cập nhật, trạng thái hiệu lực và thông tin chặn xóa. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `NienKhoa` | `id`, `ten`, `ngay_bat_dau`, `ngay_ket_thuc`, `trang_thai`, `created_at`, `updated_at` | Niên khóa có khoảng hiệu lực. |
| `KyHoc` | `id`, `nien_khoa_id`, `ten`, `ngay_bat_dau`, `ngay_ket_thuc`, `trang_thai` | Khóa ngoại bắt buộc đến `NienKhoa`. |
| `MonHoc` | `id`, `ma`, `ten`, `mo_ta`, `trang_thai`, `created_at`, `updated_at` | `ma` duy nhất. |
| `LopHoc`, `PhanCong`, `BuoiHoc`, `Diem`, `BaiTap`, `TaiLieu` | Khóa ngoại danh mục phù hợp | Các nguồn tham chiếu chặn xóa. |
| `NhatKyHeThong` | Người thực hiện, hành động, đối tượng, thay đổi an toàn, thời gian | Ghi vết thao tác danh mục. |

Ràng buộc đề xuất: unique `NienKhoa.ten`, unique `MonHoc.ma`; `KyHoc.nien_khoa_id` không rỗng; `ngay_ket_thuc >= ngay_bat_dau` với cả niên khóa và kỳ học.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET/POST /api/v1/nien-khoa` | Danh sách và tạo niên khóa. |
| `GET/PATCH/DELETE /api/v1/nien-khoa/{id}` | Chi tiết, cập nhật, xóa có kiểm tra tham chiếu. |
| `GET/POST /api/v1/ky-hoc` | Danh sách và tạo kỳ học. |
| `GET/PATCH/DELETE /api/v1/ky-hoc/{id}` | Chi tiết, cập nhật, xóa có kiểm tra tham chiếu. |
| `GET/POST /api/v1/mon-hoc` | Danh sách và tạo môn học. |
| `GET/PATCH/DELETE /api/v1/mon-hoc/{id}` | Chi tiết, cập nhật, xóa có kiểm tra tham chiếu. |
| `POST /api/v1/mon-hoc/khoi-tao-mac-dinh` | Khởi tạo các môn/kỹ năng mặc định, an toàn khi gọi lặp. |

### 3.1. Danh sách chung

Các API danh sách hỗ trợ `q`, `trang_thai`, `page`, `page_size`; API kỳ học hỗ trợ thêm `nien_khoa_id`. `page` mặc định 1, `page_size` mặc định 20 và tối đa 100.

```json
{
  "data": [
    {
      "id": 2,
      "ten": "Kỳ 1 năm 2026",
      "nien_khoa": { "id": 1, "ten": "Niên khóa 2026" },
      "ngay_bat_dau": "2026-01-01",
      "ngay_ket_thuc": "2026-05-31",
      "trang_thai": "DANG_AP_DUNG"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 1 }
}
```

### 3.2. Payload tạo/cập nhật

```json
// POST /api/v1/nien-khoa
{
  "ten": "Niên khóa 2026",
  "ngay_bat_dau": "2026-01-01",
  "ngay_ket_thuc": "2026-12-31",
  "trang_thai": "DANG_AP_DUNG"
}
```

```json
// POST /api/v1/ky-hoc
{
  "nien_khoa_id": 1,
  "ten": "Kỳ 1 năm 2026",
  "ngay_bat_dau": "2026-01-01",
  "ngay_ket_thuc": "2026-05-31",
  "trang_thai": "DANG_AP_DUNG"
}
```

```json
// POST /api/v1/mon-hoc
{
  "ma": "NGHE",
  "ten": "Nghe",
  "mo_ta": "Kỹ năng nghe hiểu tiếng Nhật",
  "trang_thai": "DANG_AP_DUNG"
}
```

Phản hồi thành công là HTTP 200/201. Lỗi dữ liệu trả HTTP 422; trùng dữ liệu HTTP 409; không có quyền HTTP 403; xóa khi có tham chiếu HTTP 409 kèm thông điệp không tiết lộ dữ liệu không cần thiết.

### 3.3. Quy ước chung, quyền và lỗi

- Base URL: `/api/v1`. `ACADEMIC_CATALOG_READ`, `ACADEMIC_CATALOG_WRITE`, `ACADEMIC_CATALOG_DELETE` được kiểm tra độc lập theo endpoint; máy chủ lấy quyền từ phiên.
- Enum trạng thái: `DANG_AP_DUNG`, `KHONG_AP_DUNG`. Ngày dùng `YYYY-MM-DD`; list mặc định `page=1`, `page_size=20`, tối đa 100; `sort` hỗ trợ tiền tố `-` giảm dần.
- Tất cả endpoint danh sách nhận `q`, `trang_thai`, `page`, `page_size`, `sort`; kỳ học nhận thêm `nien_khoa_id`. Response phân trang gồm `total_pages` và `filters_applied`.

| HTTP | Mã lỗi | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật thành công. |
| 400 | `INVALID_QUERY` | Tham số lọc không hợp lệ. |
| 401/403 | `UNAUTHENTICATED` / `CATALOG_FORBIDDEN` | Không có phiên/quyền. |
| 404 | `ACADEMIC_YEAR_NOT_FOUND`, `SEMESTER_NOT_FOUND`, `SUBJECT_NOT_FOUND` | Bản ghi không tồn tại. |
| 409 | `DUPLICATE_NAME`, `DUPLICATE_SUBJECT_CODE`, `CATALOG_IN_USE` | Trùng hoặc đang có tham chiếu. |
| 422 | `VALIDATION_ERROR`, `SEMESTER_OUTSIDE_YEAR` | Vi phạm dữ liệu/ràng buộc thời gian. |

### 3.4. API niên khóa

#### `GET /api/v1/nien-khoa`

**Quyền:** `ACADEMIC_CATALOG_READ`. Trả danh sách `id`, tên, ngày bắt đầu/kết thúc, trạng thái, số kỳ học (nếu `include=semester_count`) và thời gian cập nhật. `q` tìm theo tên; `sort` nhận `ten`, `ngay_bat_dau`, `updated_at`.

#### `POST /api/v1/nien-khoa`

**Quyền:** `ACADEMIC_CATALOG_WRITE`. Nhận payload mục 3.2. `ten` duy nhất theo chính sách, cả hai ngày bắt buộc và `ngay_ket_thuc >= ngay_bat_dau`. Thành công HTTP 201 trả bản ghi mới và audit `TAO_NIEN_KHOA`.

#### `GET /api/v1/nien-khoa/{id}` và `PATCH /api/v1/nien-khoa/{id}`

**Quyền:** đọc/ghi danh mục. `GET` trả chi tiết và số kỳ học/tham chiếu an toàn. `PATCH` chỉ gửi trường thay đổi:

```json
{ "ngay_ket_thuc": "2026-12-31", "trang_thai": "DANG_AP_DUNG" }
```

Khi rút khoảng ngày/đổi trạng thái, máy chủ kiểm tra kỳ học/lớp phụ thuộc; vi phạm trả 409/422, không tự làm hỏng dữ liệu lịch sử.

#### `DELETE /api/v1/nien-khoa/{id}`

**Quyền:** `ACADEMIC_CATALOG_DELETE`. Thực hiện trong transaction, khóa bản ghi và kiểm tra mọi kỳ học/lớp/tham chiếu. Nếu đang dùng, trả HTTP 409 `CATALOG_IN_USE` kèm thông điệp đề xuất chuyển `KHONG_AP_DUNG`; nếu xóa được, trả HTTP 204 và audit.

### 3.5. API kỳ học

#### `GET /api/v1/ky-hoc`

**Quyền:** `ACADEMIC_CATALOG_READ`. Ngoài bộ lọc chung, `nien_khoa_id` thu hẹp theo niên khóa. Mỗi dòng trả kỳ học và đối tượng niên khóa rút gọn, ngày/trạng thái; phản hồi HTTP 200 dùng phân trang chuẩn.

#### `POST /api/v1/ky-hoc`

**Quyền:** `ACADEMIC_CATALOG_WRITE`. Nhận payload mục 3.2. Máy chủ kiểm tra `nien_khoa_id` tồn tại, khoảng ngày hợp lệ và nằm trong khoảng niên khóa; thành công HTTP 201 và audit `TAO_KY_HOC`.

#### `GET/PATCH/DELETE /api/v1/ky-hoc/{id}`

`GET` trả chi tiết cùng niên khóa cha. `PATCH` chỉ cập nhật trường được gửi nhưng luôn kiểm tra lại quan hệ niên khóa/khoảng ngày; không cho đổi dữ liệu khiến lớp/buổi học phụ thuộc mất toàn vẹn. `DELETE` kiểm tra lớp, phân công, buổi học, điểm, bài tập, tài liệu; nếu có tham chiếu trả 409, nếu xóa được trả 204. Các endpoint lần lượt cần quyền đọc/ghi/xóa danh mục.

### 3.6. API môn học

#### `GET /api/v1/mon-hoc`

**Quyền:** `ACADEMIC_CATALOG_READ`. `q` tìm theo mã/tên; `include=usage_summary` chỉ trả tổng tham chiếu cho người có quyền. Response gồm `id`, `ma`, `ten`, `mo_ta`, trạng thái và thời gian cập nhật.

#### `POST /api/v1/mon-hoc`

**Quyền:** `ACADEMIC_CATALOG_WRITE`. Mã được trim/chuẩn hóa, duy nhất; tên bắt buộc. Thành công HTTP 201 trả môn học mới và audit `TAO_MON_HOC`.

#### `GET/PATCH/DELETE /api/v1/mon-hoc/{id}`

`GET` trả chi tiết. `PATCH` nhận `ma`, `ten`, `mo_ta`, `trang_thai`; mã trùng trả 409. Trạng thái `KHONG_AP_DUNG` ngăn môn được chọn trong tạo mới nhưng không làm mất lịch sử. `DELETE` chỉ thành công khi không còn lớp, phân công, buổi học, điểm, bài tập, tài liệu tham chiếu; nếu thành công HTTP 204, nếu không 409 `CATALOG_IN_USE`.

### 3.7. `POST /api/v1/mon-hoc/khoi-tao-mac-dinh` — Khởi tạo môn/kỹ năng

**Quyền:** `ACADEMIC_CATALOG_WRITE`. Không cần body; có thể nhận `{ "overwrite": false }` nhưng mặc định không cập nhật bản ghi đã tồn tại.

Máy chủ tạo idempotent bảy môn mặc định: Từ vựng, Ngữ pháp, Nghe, Nói, Đọc, Viết, Kanji, dựa trên mã chuẩn. Thành công HTTP 200 trả số bản ghi tạo/bỏ qua:

```json
{
  "data": {
    "da_tao": [{ "ma": "NGHE", "ten": "Nghe" }],
    "da_bo_qua": [{ "ma": "DOC", "ly_do": "DA_TON_TAI" }]
  }
}
```

Thao tác gọi lặp không tạo trùng và được ghi audit `KHOI_TAO_MON_HOC_MAC_DINH`.

### 3.8. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET/POST /nien-khoa` | Đọc/ghi danh mục | Danh sách/tạo niên khóa. | 200/201 |
| `GET/PATCH/DELETE /nien-khoa/{id}` | Đọc/ghi/xóa | Chi tiết/cập nhật/xóa kiểm tra tham chiếu. | 200/204 |
| `GET/POST /ky-hoc` | Đọc/ghi danh mục | Danh sách/tạo kỳ học. | 200/201 |
| `GET/PATCH/DELETE /ky-hoc/{id}` | Đọc/ghi/xóa | Chi tiết/cập nhật/xóa kiểm tra tham chiếu. | 200/204 |
| `GET/POST /mon-hoc` | Đọc/ghi danh mục | Danh sách/tạo môn học. | 200/201 |
| `GET/PATCH/DELETE /mon-hoc/{id}` | Đọc/ghi/xóa | Chi tiết/cập nhật/xóa kiểm tra tham chiếu. | 200/204 |
| `POST /mon-hoc/khoi-tao-mac-dinh` | Ghi danh mục | Khởi tạo idempotent môn mặc định. | 200 |

## 4. Quy tắc nghiệp vụ

| Mã | Quy tắc |
| --- | --- |
| CAT-ACL-01 | Mọi API yêu cầu quyền xem hoặc quản lý danh mục học vụ; quyền ghi/xóa kiểm tra độc lập. |
| CAT-ACY-01 | Tên, ngày bắt đầu, ngày kết thúc, trạng thái niên khóa là bắt buộc; ngày kết thúc không trước ngày bắt đầu. |
| CAT-SEM-01 | Kỳ học phải thuộc một niên khóa tồn tại; ngày kết thúc không trước ngày bắt đầu. |
| CAT-SEM-02 | Khoảng ngày của kỳ học phải nằm trong khoảng ngày của niên khóa cha, trừ khi có chính sách ngoại lệ được phê duyệt. |
| CAT-SUB-01 | Mã và tên môn học là bắt buộc; mã duy nhất, được chuẩn hóa trước khi kiểm tra trùng. |
| CAT-STS-01 | Danh mục `KHONG_AP_DUNG` không được dùng để tạo lớp, phân công, buổi học, điểm, bài tập hay tài liệu mới. |
| CAT-DEL-01 | Không xóa niên khóa/kỳ học/môn học khi tồn tại tham chiếu từ lớp, phân công, buổi học, điểm, bài tập hoặc tài liệu. |
| CAT-DEL-02 | Khi danh mục đã được dùng, thao tác thay thế là đổi trạng thái; dữ liệu lịch sử tiếp tục hiển thị tên danh mục. |
| CAT-INIT-01 | Khởi tạo mặc định tạo đủ: Từ vựng, Ngữ pháp, Nghe, Nói, Đọc, Viết, Kanji; gọi lặp không tạo trùng. |

## 5. Pseudocode tạo/cập nhật kỳ học và xóa danh mục

```text
save_semester(actor, payload, semester_id = null):
    require_permission(actor, "ACADEMIC_CATALOG_WRITE")
    validate_date_range(payload.ngay_bat_dau, payload.ngay_ket_thuc)
    academic_year = get_active_or_existing_year(payload.nien_khoa_id)
    validate_within_range(payload, academic_year)
    save_semester(payload, semester_id)
    write_audit(actor, "LUU_KY_HOC", semester_id, safe_payload(payload))

delete_catalog_item(actor, type, id):
    require_permission(actor, "ACADEMIC_CATALOG_DELETE")
    item = lock_catalog_item(type, id)
    if has_references(type, id):
        return conflict("Danh mục đang được sử dụng; hãy chuyển sang không áp dụng.")
    delete_item(item)
    write_audit(actor, "XOA_DANH_MUC", id, {loai: type})
```

Kiểm tra tham chiếu và xóa phải thực hiện trong giao dịch để tránh dữ liệu mới được tạo giữa hai bước.

## 6. Hành vi giao diện

| Sự kiện | Xử lý |
| --- | --- |
| Chuyển tab | Nạp danh sách tab tương ứng, giữ hoặc khôi phục bộ lọc riêng của tab. |
| Chọn niên khóa trong tab Kỳ học | Tải lại danh sách kỳ học, phân trang về trang 1. |
| Chọn ngày bắt đầu/kết thúc | Kiểm tra ngay tại giao diện; máy chủ kiểm tra lại khi lưu. |
| Chọn niên khóa cha | Giới hạn ngày kỳ học theo phạm vi niên khóa và làm mới khi đổi niên khóa. |
| Xóa bản ghi | Hiển thị xác nhận; nếu API trả 409, hiển thị hướng dẫn chuyển trạng thái. |
| Khởi tạo môn mặc định | Hiển thị xác nhận, gọi API idempotent và tải lại danh sách. |

## 7. An toàn, hiệu năng và nhật ký

- Phân trang, lọc và sắp xếp thực hiện tại máy chủ; mặc định sắp xếp dữ liệu cập nhật gần nhất trước.
- Kiểm tra toàn vẹn khóa ngoại ở cơ sở dữ liệu bổ sung cho kiểm tra nghiệp vụ của API.
- Ghi nhật ký tạo, sửa, đổi trạng thái, xóa và khởi tạo mặc định với người thực hiện, thời điểm, đối tượng và thay đổi an toàn.
- Không cho giao diện tự suy ra có thể xóa từ trạng thái hiển thị: quyết định cuối cùng luôn tại API/cơ sở dữ liệu.

## 8. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-CAT-01 | Tạo niên khóa có ngày kết thúc trước ngày bắt đầu. | Bị từ chối, không tạo bản ghi. |
| TC-CAT-02 | Tạo kỳ học không có niên khóa hoặc ngoài khoảng ngày niên khóa. | Bị từ chối với lỗi đúng trường dữ liệu. |
| TC-CAT-03 | Tạo môn học có mã đã tồn tại. | HTTP 409/lỗi trùng, không tạo bản ghi. |
| TC-CAT-04 | Khởi tạo danh mục mặc định hai lần. | Mỗi môn/kỹ năng chỉ tồn tại một bản ghi; thao tác an toàn khi lặp. |
| TC-CAT-05 | Đổi môn học đã sử dụng sang không áp dụng. | Thành công; không thể chọn môn đó khi tạo dữ liệu mới. |
| TC-CAT-06 | Xóa môn học/lớp danh mục đang được bài tập hoặc điểm tham chiếu. | Bị từ chối HTTP 409, không mất dữ liệu. |
| TC-CAT-07 | Nhân viên không có quyền xóa gọi API xóa. | HTTP 403, không thay đổi dữ liệu. |
| TC-CAT-08 | Người dùng lọc kỳ học theo niên khóa. | Chỉ kỳ học thuộc niên khóa đã chọn được hiển thị. |
