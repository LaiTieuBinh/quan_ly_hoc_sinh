# Detail Design — MH-05 Lộ trình cấp độ JLPT

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-05 |
| Mã chức năng | JLPT-LEVEL-PATHWAY |
| Điều kiện vào | Phiên hợp lệ và có quyền xem/quản lý lộ trình cấp độ. |
| Đầu vào | Điều kiện lọc; thay đổi cấp độ; cấu hình tiêu chí; định danh học sinh. |
| Đầu ra | Danh sách đánh giá, lịch sử cấp độ, kết quả cập nhật và thông tin ngoại lệ lớp. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `HocSinh` | `id`, `ma_hoc_sinh`, `ho_ten`, `cap_do_hien_tai`, `trang_thai` | Nguồn cấp độ hiện tại; bị ràng buộc BR-01. |
| `LichSuCapDo` | `id`, `hoc_sinh_id`, `cap_do_cu`, `cap_do_moi`, `ngay_ap_dung`, `ly_do`, `ghi_chu`, `nguoi_thuc_hien_id`, `created_at` | Nhật ký nghiệp vụ bất biến sau áp dụng. |
| `TieuChiCapDo` | `id`, `cap_do_tu`, `cap_do_den`, `diem_toi_thieu`, `ty_le_chuyen_can_toi_thieu`, `danh_gia_yeu_cau`, `hieu_luc_tu`, `hieu_luc_den`, `trang_thai` | Cấu hình có hiệu lực theo thời gian. |
| `DanhGiaGiaoVien` | `hoc_sinh_id`, `lop_hoc_id`, `gia_tri`, `ngay_danh_gia` | Dữ liệu đầu vào đánh giá cấp độ. |
| `DiemDanh`, `Diem` | Khóa học sinh/lớp/kỳ, giá trị kết quả | Nguồn tính chuyên cần và điểm. |
| `DangKyLop`, `NgoaiLeCapDo` | `hoc_sinh_id`, `lop_hoc_id`, cấp độ, `trang_thai_phe_duyet`, `nguoi_duyet_id`, `ly_do`, thời điểm | Dấu vết ngoại lệ đăng ký lớp theo BR-02. |
| `NhatKyHeThong` | Người thực hiện, hành động, đối tượng, dữ liệu an toàn, thời gian | Ghi vết thay đổi cấp độ/cấu hình. |

Ràng buộc đề xuất: `HocSinh.cap_do_hien_tai` thuộc N5–N1 hoặc rỗng khi chính sách trạng thái cho phép; mỗi bản ghi lịch sử có cấp độ mới hợp lệ; tại một thời điểm chỉ một cấu hình tiêu chí hiệu lực cho cùng cặp chuyển cấp.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET /api/v1/lo-trinh-cap-do/hoc-sinh` | Danh sách học sinh kèm trạng thái xét cấp. |
| `GET /api/v1/lo-trinh-cap-do/hoc-sinh/{id}` | Tổng quan lộ trình của một học sinh. |
| `POST /api/v1/lo-trinh-cap-do/hoc-sinh/{id}/cap-do` | Cập nhật cấp độ và tạo lịch sử. |
| `GET /api/v1/lo-trinh-cap-do/hoc-sinh/{id}/lich-su` | Lịch sử cấp độ. |
| `GET /api/v1/lo-trinh-cap-do/hoc-sinh/{id}/ngoai-le-lop` | Ngoại lệ đăng ký lớp theo BR-02. |
| `GET /api/v1/lo-trinh-cap-do/tieu-chi` | Danh sách cấu hình tiêu chí. |
| `POST /api/v1/lo-trinh-cap-do/tieu-chi` | Tạo cấu hình tiêu chí. |
| `PATCH /api/v1/lo-trinh-cap-do/tieu-chi/{id}` | Cập nhật cấu hình chưa hết hiệu lực/theo chính sách phiên bản. |

### 3.1. API danh sách đánh giá

`GET /api/v1/lo-trinh-cap-do/hoc-sinh`

| Query parameter | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `q` | chuỗi | Không | Tìm theo mã hoặc họ tên. |
| `cap_do_hien_tai` | enum | Không | N5–N1. |
| `trang_thai_xet` | enum | Không | `DAT`, `SAP_DAT`, `CHUA_DAT`. |
| `lop_hoc_id`, `nien_khoa_id`, `ky_hoc_id` | số nguyên | Không | Phải nằm trong phạm vi quyền; kỳ học thuộc niên khóa khi cùng truyền. |
| `page`, `page_size` | số nguyên | Không | Mặc định 1/20; tối đa 100. |

```json
{
  "data": [
    {
      "hoc_sinh": { "id": 21, "ma": "HS001", "ho_ten": "Trần Minh Anh" },
      "cap_do_hien_tai": "N5",
      "chi_so_xet": {
        "diem": 82,
        "ty_le_chuyen_can": 92.5,
        "danh_gia_giao_vien": "DAT"
      },
      "trang_thai_xet": "SAP_DAT",
      "tieu_chi_ap_dung_id": 6
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 1 }
}
```

### 3.2. Cập nhật cấp độ

`POST /api/v1/lo-trinh-cap-do/hoc-sinh/{id}/cap-do`

```json
{
  "cap_do_moi": "N4",
  "ngay_ap_dung": "2026-09-01",
  "ly_do": "Đủ điều kiện hoàn thành cấp độ N5",
  "ghi_chu": "Đã đối chiếu kết quả và chuyên cần"
}
```

Phản hồi thành công (HTTP 200): trả cấp độ hiện tại sau cập nhật và `lich_su_cap_do_id`. Lỗi kiểm tra trả HTTP 422; không có quyền HTTP 403; không tìm thấy HTTP 404; xung đột cập nhật đồng thời HTTP 409.

### 3.3. Cấu hình tiêu chí

```json
{
  "cap_do_tu": "N5",
  "cap_do_den": "N4",
  "diem_toi_thieu": 75,
  "ty_le_chuyen_can_toi_thieu": 80,
  "danh_gia_yeu_cau": "DAT",
  "hieu_luc_tu": "2026-09-01"
}
```

### 3.4. Quy ước chung, xác thực và mã lỗi

- Base URL: `/api/v1/lo-trinh-cap-do`. Mọi API yêu cầu phiên hợp lệ; server lấy vai trò và phạm vi học sinh từ phiên, không nhận dữ liệu đó từ client.
- Quyền: `LEVEL_PATHWAY_READ` để đọc danh sách/chi tiết/lịch sử/ngoại lệ; `LEVEL_PATHWAY_WRITE` để đổi cấp độ; `LEVEL_CRITERIA_READ` và `LEVEL_CRITERIA_WRITE` để quản lý tiêu chí.
- Enum: cấp độ `N5`, `N4`, `N3`, `N2`, `N1`; trạng thái xét `DAT`, `SAP_DAT`, `CHUA_DAT`, `CHUA_DU_DU_LIEU`; trạng thái tiêu chí `DANG_HIEU_LUC`, `KHONG_HIEU_LUC`.
- Ngày dùng `YYYY-MM-DD`; danh sách mặc định `page=1`, `page_size=20`, tối đa 100. Response phân trang có `page`, `page_size`, `total`, `total_pages`.

```json
{
  "error": {
    "code": "CRITERIA_EFFECTIVE_RANGE_OVERLAP",
    "message": "Khoảng hiệu lực của tiêu chí bị chồng lấn.",
    "fields": { "hieu_luc_tu": ["Trùng với tiêu chí đang có hiệu lực."] }
  }
}
```

| HTTP | Mã lỗi điển hình | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật thành công. |
| 400 | `INVALID_FILTER` | Bộ lọc/kỳ-niên khóa/định dạng không hợp lệ. |
| 401 | `UNAUTHENTICATED` | Phiên không hợp lệ. |
| 403 | `LEVEL_PATHWAY_FORBIDDEN`, `STUDENT_OUT_OF_SCOPE` | Không có quyền hoặc học sinh ngoài scope. |
| 404 | `STUDENT_NOT_FOUND`, `CRITERIA_NOT_FOUND` | Bản ghi không tồn tại. |
| 409 | `LEVEL_UPDATE_CONFLICT`, `CRITERIA_EFFECTIVE_RANGE_OVERLAP` | Xung đột đồng thời hoặc hiệu lực. |
| 422 | `VALIDATION_ERROR`, `INVALID_LEVEL_TRANSITION` | Vi phạm quy tắc dữ liệu/nghiệp vụ. |

### 3.5. Chi tiết `GET /api/v1/lo-trinh-cap-do/hoc-sinh`

**Quyền:** `LEVEL_PATHWAY_READ`. Ngoài các tham số ở mục 3.1, API hỗ trợ:

| Query parameter | Kiểu | Bắt buộc | Diễn giải |
| --- | --- | --- | --- |
| `ngay_danh_gia` | ngày | Không | Chọn tiêu chí hiệu lực; mặc định ngày hiện tại. |
| `include_metrics` | boolean | Không | Mặc định `true`; `false` chỉ trả cấp độ/trạng thái để tối ưu bảng lớn. |
| `sort` | chuỗi | Không | `ma_hoc_sinh`, `ho_ten`, `cap_do_hien_tai`, `trang_thai_xet`; tiền tố `-` là giảm dần. |

`trang_thai_xet = CHUA_DU_DU_LIEU` phải kèm `du_lieu_thieu` (ví dụ `CHUYEN_CAN`, `DANH_GIA_GIAO_VIEN`) để không hiển thị nhầm là `CHUA_DAT`. Response `meta` gồm `filters_applied` và `generated_at`.

### 3.6. `GET /api/v1/lo-trinh-cap-do/hoc-sinh/{id}` — Tổng quan lộ trình

**Quyền:** `LEVEL_PATHWAY_READ` và học sinh thuộc scope. Query hỗ trợ `ngay_danh_gia`, `lop_hoc_id`, `nien_khoa_id`, `ky_hoc_id` để tính chỉ số theo đúng ngữ cảnh.

```json
{
  "data": {
    "hoc_sinh": { "id": 21, "ma": "HS001", "ho_ten": "Trần Minh Anh" },
    "cap_do_hien_tai": "N5",
    "tieu_chi_ap_dung": { "id": 6, "cap_do_tu": "N5", "cap_do_den": "N4", "hieu_luc_tu": "2026-09-01" },
    "chi_so_xet": { "diem": 82, "ty_le_chuyen_can": 92.5, "danh_gia_giao_vien": "DAT" },
    "trang_thai_xet": "SAP_DAT",
    "du_lieu_thieu": [],
    "hanh_dong_duoc_phep": ["CAP_NHAT_CAP_DO", "XEM_LICH_SU", "XEM_NGOAI_LE_LOP"]
  }
}
```

API đọc không tự động đổi cấp độ, kể cả khi học sinh đạt toàn bộ điều kiện.

### 3.7. Chi tiết `POST /api/v1/lo-trinh-cap-do/hoc-sinh/{id}/cap-do`

**Quyền:** `LEVEL_PATHWAY_WRITE` và scope học sinh.

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `cap_do_moi` | enum | Có | N5–N1, khác cấp độ hiện tại. |
| `ngay_ap_dung` | ngày | Có | Ngày hợp lệ. |
| `ly_do` | chuỗi | Có | Không rỗng, giới hạn độ dài cấu hình. |
| `ghi_chu` | chuỗi/null | Không | Thông tin bổ sung. |
| `version` | số nguyên/string | Không | Dùng kiểm soát xung đột lạc quan nếu triển khai. |

Máy chủ khóa hồ sơ, tạo `LichSuCapDo`, cập nhật cấp độ hiện tại và ghi audit trong một transaction. Phản hồi HTTP 200:

```json
{
  "data": {
    "hoc_sinh_id": 21,
    "cap_do_cu": "N5",
    "cap_do_hien_tai": "N4",
    "lich_su_cap_do_id": 103,
    "ngay_ap_dung": "2026-09-01"
  }
}
```

### 3.8. Lịch sử và ngoại lệ lớp

#### `GET /api/v1/lo-trinh-cap-do/hoc-sinh/{id}/lich-su`

**Quyền:** `LEVEL_PATHWAY_READ` và scope học sinh. Query `tu_ngay`, `den_ngay`, `page`, `page_size`, `sort` (mặc định `-ngay_ap_dung`). Mỗi dòng trả cấp độ cũ/mới, ngày áp dụng, lý do, ghi chú, người thực hiện và thời điểm thao tác theo quyền. Lịch sử chỉ đọc; điều chỉnh luôn là một thay đổi mới có audit.

#### `GET /api/v1/lo-trinh-cap-do/hoc-sinh/{id}/ngoai-le-lop`

**Quyền:** `LEVEL_PATHWAY_READ` và scope học sinh. Query `lop_hoc_id`, `trang_thai_phe_duyet`, `tu_ngay`, `den_ngay`, `page`, `page_size`. Response trả lớp, cấp độ lớp/cấp độ học sinh tại thời điểm xét, trạng thái duyệt, lý do, người duyệt, ngày duyệt và khoảng hiệu lực. API chỉ đối chiếu BR-02; tạo/phê duyệt ngoại lệ thuộc quy trình đăng ký lớp riêng.

### 3.9. Chi tiết API tiêu chí cấp độ

#### `GET /api/v1/lo-trinh-cap-do/tieu-chi`

**Quyền:** `LEVEL_CRITERIA_READ`. Query `cap_do_tu`, `cap_do_den`, `trang_thai`, `ngay_hieu_luc`, `page`, `page_size`, `sort`. Khi có `ngay_hieu_luc`, chỉ trả tiêu chí áp dụng tại ngày đó; nếu không, trả lịch sử cấu hình. Mỗi dòng gồm ngưỡng điểm/chuyên cần, đánh giá yêu cầu, ngày hiệu lực, trạng thái, phiên bản và thời gian tạo/cập nhật.

#### `POST /api/v1/lo-trinh-cap-do/tieu-chi`

**Quyền:** `LEVEL_CRITERIA_WRITE`.

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `cap_do_tu`, `cap_do_den` | enum | Có | N5–N1, cặp chuyển cấp hợp lệ. |
| `diem_toi_thieu` | decimal | Có | Trong miền thang điểm cấu hình. |
| `ty_le_chuyen_can_toi_thieu` | decimal | Có | Từ 0 đến 100. |
| `danh_gia_yeu_cau` | enum | Có | Giá trị danh mục đánh giá giáo viên. |
| `hieu_luc_tu` | ngày | Có | Ngày hợp lệ. |
| `hieu_luc_den` | ngày/null | Không | Không trước ngày bắt đầu. |
| `nguong_canh_bao` | object/null | Không | Ngưỡng phục vụ trạng thái `SAP_DAT`. |

Máy chủ kiểm tra không chồng lấn hiệu lực cùng cặp chuyển cấp, tạo phiên bản/audit và trả HTTP 201.

#### `PATCH /api/v1/lo-trinh-cap-do/tieu-chi/{id}`

**Quyền:** `LEVEL_CRITERIA_WRITE`. Chỉ gửi trường cần thay đổi. Tiêu chí đã dùng để đánh giá/lưu lịch sử không được sửa phá vỡ truy vết; khuyến nghị kết thúc hiệu lực bản cũ và tạo phiên bản mới. Thành công HTTP 200; xung đột hiệu lực/cập nhật trả 409.

### 3.10. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET /lo-trinh-cap-do/hoc-sinh` | `LEVEL_PATHWAY_READ` | Danh sách trạng thái xét cấp. | 200 |
| `GET /lo-trinh-cap-do/hoc-sinh/{id}` | Đọc + scope | Tổng quan lộ trình. | 200 |
| `POST /lo-trinh-cap-do/hoc-sinh/{id}/cap-do` | Ghi + scope | Đổi cấp độ có lịch sử/audit. | 200 |
| `GET /.../{id}/lich-su` | Đọc + scope | Lịch sử cấp độ. | 200 |
| `GET /.../{id}/ngoai-le-lop` | Đọc + scope | Ngoại lệ đăng ký lớp. | 200 |
| `GET/POST /lo-trinh-cap-do/tieu-chi` | Đọc/ghi tiêu chí | Danh sách/tạo tiêu chí. | 200/201 |
| `PATCH /lo-trinh-cap-do/tieu-chi/{id}` | Ghi tiêu chí | Cập nhật/phiên bản tiêu chí. | 200 |

## 4. Quy tắc nghiệp vụ

| Mã | Quy tắc |
| --- | --- |
| LVL-ACL-01 | API đọc yêu cầu quyền xem lộ trình; API cập nhật cấp độ/cấu hình yêu cầu quyền ghi tương ứng. |
| LVL-BR-01 | Một học sinh chỉ có một `cap_do_hien_tai` tại một thời điểm; giá trị hợp lệ N5–N1. |
| LVL-BR-02 | Cập nhật cấp độ phải có cấp độ mới khác cấp độ hiện tại, ngày áp dụng hợp lệ và lý do không rỗng. |
| LVL-BR-03 | Cập nhật cấp độ thực hiện nguyên tử: tạo `LichSuCapDo`, cập nhật `HocSinh`, tạo nhật ký hoặc không thay đổi gì. |
| LVL-BR-04 | Trạng thái `DAT` phải thỏa tất cả ngưỡng của tiêu chí hiệu lực; `SAP_DAT` và `CHUA_DAT` theo ngưỡng cảnh báo cấu hình. |
| LVL-BR-05 | Cấu hình tiêu chí phải có ngưỡng hợp lệ: điểm trong miền cấu hình, chuyên cần từ 0–100, ngày hiệu lực hợp lệ. |
| LVL-BR-06 | Không được chồng lấn hiệu lực của hai tiêu chí cùng cặp `cap_do_tu`/`cap_do_den`, trừ khi hệ thống có quy tắc ưu tiên rõ ràng. |
| LVL-BR-07 | Đăng ký lớp khác cấp độ phải có `NgoaiLeCapDo` được phê duyệt theo BR-02; nếu không, từ chối đăng ký. |
| LVL-BR-08 | Lịch sử cấp độ và hồ sơ phê duyệt ngoại lệ không bị xóa cứng; mọi điều chỉnh phải tạo dấu vết mới. |

## 5. Pseudocode xử lý cập nhật cấp độ

```text
change_level(actor, student_id, request):
    require_permission(actor, "LEVEL_PATHWAY_WRITE")
    validate(request.cap_do_moi in [N5, N4, N3, N2, N1])
    validate(request.ngay_ap_dung is valid_date)
    validate(not_empty(request.ly_do))

    begin_transaction()
    student = lock_student_for_update(student_id)
    validate(student.cap_do_hien_tai != request.cap_do_moi)
    old_level = student.cap_do_hien_tai
    history = insert_level_history(student.id, old_level, request, actor.id)
    update_student_current_level(student.id, request.cap_do_moi)
    write_audit(actor, "CAP_NHAT_CAP_DO", student.id, safe_change(old_level, request))
    commit_transaction()
    return { cap_do_hien_tai: request.cap_do_moi, lich_su_cap_do_id: history.id }
```

Việc khóa bản ghi học sinh và chạy giao dịch ngăn hai thao tác đồng thời tạo ra nhiều cấp độ hiện tại hoặc lịch sử không nhất quán.

## 6. Tính trạng thái xét cấp

```text
evaluate_level(student, filters, effective_criteria):
    metrics = load_metrics_within_authorized_scope(student, filters)
    if meets_all(metrics, effective_criteria): return DAT
    if meets_warning_threshold(metrics, effective_criteria): return SAP_DAT
    return CHUA_DAT
```

Màn hình phải kèm `tieu_chi_ap_dung_id` hoặc phiên bản/ngày hiệu lực để người dùng đối chiếu. Khi thiếu dữ liệu đầu vào, trả trạng thái `CHUA_DU_DU_LIEU` nội bộ và giao diện hiển thị giải thích thay vì gộp sai thành `CHUA_DAT`.

## 7. An toàn, hiệu năng và nhật ký

- Tất cả truy vấn theo lớp/niên khóa/kỳ học phải giới hạn bằng phạm vi quyền của phiên trước khi tổng hợp điểm/chuyên cần.
- Danh sách dùng phân trang phía máy chủ; chỉ tải lịch sử, ngoại lệ và cấu hình khi người dùng mở khu vực tương ứng.
- Ghi nhật ký tạo/sửa tiêu chí, đổi cấp độ và phê duyệt ngoại lệ: người thực hiện, thời điểm, đối tượng và dữ liệu thay đổi an toàn.
- Không cho API giao diện tự động thay cấp độ chỉ từ trạng thái `Đạt`; thay đổi là thao tác có chủ đích của người có quyền.

## 8. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-LVL-01 | Người có quyền lọc danh sách theo N5 và trạng thái Sắp đạt. | Chỉ các học sinh thỏa điều kiện và phạm vi quyền được trả về. |
| TC-LVL-02 | Cập nhật N5 thành N4 với dữ liệu hợp lệ. | Cấp độ hiện tại đổi N4; tạo đúng một lịch sử và nhật ký. |
| TC-LVL-03 | Cập nhật sang cấp độ hiện tại hoặc giá trị ngoài N5–N1. | Bị từ chối, không thay đổi dữ liệu. |
| TC-LVL-04 | Hai yêu cầu đổi cấp độ đồng thời cho cùng học sinh. | Không tạo trạng thái/hồ sơ lịch sử mâu thuẫn; một yêu cầu bị xung đột hoặc xử lý tuần tự. |
| TC-LVL-05 | Học sinh đủ cả điểm, chuyên cần và đánh giá theo tiêu chí hiệu lực. | Trạng thái xét là `DAT` và nêu đúng tiêu chí áp dụng. |
| TC-LVL-06 | Thiếu dữ liệu chuyên cần hoặc đánh giá. | Hiển thị chưa đủ dữ liệu/giải thích đúng, không kết luận sai. |
| TC-LVL-07 | Tạo hai cấu hình trùng khoảng hiệu lực cùng lộ trình. | Bị từ chối theo quy tắc chống chồng lấn. |
| TC-LVL-08 | Đăng ký lớp khác cấp độ không có phê duyệt. | Bị từ chối; khi có ngoại lệ hợp lệ thì có thể truy vết người duyệt và lý do. |
| TC-LVL-09 | Người không có quyền gọi API cập nhật cấp độ. | HTTP 403, không trả hoặc thay đổi dữ liệu. |
