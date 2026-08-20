# Detail Design — MH-10 Điểm danh

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-10 |
| Mã chức năng | ATTENDANCE-MANAGEMENT |
| Điều kiện vào | Người dùng đã xác thực; có quyền điểm danh hoặc xem chuyên cần trong phạm vi hợp lệ. |
| Đầu vào | Buổi học, dòng điểm danh, bộ lọc thống kê. |
| Đầu ra | Danh sách điểm danh, bản ghi đã lưu, lịch sử điều chỉnh và báo cáo chuyên cần. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `DiemDanh` | `id`, `buoi_hoc_id`, `hoc_sinh_id`, `trang_thai`, `ghi_chu`, `created_by`, `updated_by`, `created_at`, `updated_at` | Unique `(buoi_hoc_id, hoc_sinh_id)`. |
| `BuoiHoc` | `id`, `lop_hoc_id`, `mon_hoc_id`, `bat_dau`, `ket_thuc`, trạng thái | Xác định ngày học và phạm vi phân công. |
| `DangKyLop` | `hoc_sinh_id`, `lop_hoc_id`, trạng thái, ngày hiệu lực | Xác định danh sách học sinh hợp lệ. |
| `PhanCong` | `giao_vien_id`, lớp, môn, hiệu lực | Kiểm tra quyền giáo viên. |
| `LichSuDiemDanh` | `diem_danh_id`, giá trị cũ/mới, người thực hiện, thời điểm, lý do | Lưu vết điều chỉnh. |
| `CauHinhChuyenCan` | quy tắc quy đổi trạng thái, phiên bản/hiệu lực | Nguồn tính BR-06. |

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET /api/v1/buoi-hoc-co-the-diem-danh` | Danh sách buổi học người dùng có thể điểm danh. |
| `GET /api/v1/buoi-hoc/{id}/diem-danh` | Danh sách học sinh hợp lệ và điểm danh hiện có. |
| `PUT /api/v1/buoi-hoc/{id}/diem-danh` | Lưu hàng loạt điểm danh cho một buổi. |
| `PUT /api/v1/buoi-hoc/{id}/diem-danh/{hoc_sinh_id}` | Lưu một dòng điểm danh. |
| `GET /api/v1/diem-danh/{id}/lich-su` | Lịch sử điều chỉnh một bản ghi. |
| `GET /api/v1/bao-cao/chuyen-can` | Thống kê chuyên cần theo bộ lọc và quyền. |

### 3.1. Danh sách và tải điểm danh buổi học

`GET /api/v1/buoi-hoc-co-the-diem-danh` nhận `tu_ngay`, `den_ngay`, `lop_hoc_id`, `trang_thai`; giáo viên chỉ nhận buổi thuộc phân công hiệu lực. `GET /api/v1/buoi-hoc/{id}/diem-danh` kiểm tra quyền trên buổi học rồi trả danh sách học sinh có đăng ký `Đang học` hiệu lực tại ngày `BuoiHoc.bat_dau`.

```json
{
  "data": {
    "buoi_hoc": { "id": 19, "lop": "N5-01", "mon": "Nghe", "bat_dau": "2026-09-15T08:00:00+07:00" },
    "hoc_sinh": [
      {
        "hoc_sinh_id": 21,
        "ma_hoc_sinh": "HS001",
        "ho_ten": "Trần Minh Anh",
        "diem_danh": { "id": 101, "trang_thai": "CO_MAT", "ghi_chu": null, "updated_at": "2026-09-15T08:05:00+07:00" }
      }
    ]
  }
}
```

Khi chưa có bản ghi, trường `diem_danh` là `null`; client không được tự tạo dòng cho học sinh ngoài phản hồi này.

### 3.2. Lưu hàng loạt và từng dòng

`PUT /api/v1/buoi-hoc/{id}/diem-danh`

```json
{
  "ban_ghi": [
    { "hoc_sinh_id": 21, "trang_thai": "CO_MAT", "ghi_chu": null },
    { "hoc_sinh_id": 22, "trang_thai": "VANG_CO_PHEP", "ghi_chu": "Có xác nhận phụ huynh" }
  ]
}
```

`PUT /api/v1/buoi-hoc/{id}/diem-danh/{hoc_sinh_id}` nhận một đối tượng `trang_thai`, `ghi_chu` và dùng cho lưu từng dòng. Enum trạng thái: `CO_MAT`, `DI_MUON`, `VANG_CO_PHEP`, `VANG_KHONG_PHEP`, `VE_SOM`.

Máy chủ kiểm tra mọi `hoc_sinh_id` thuộc danh sách đăng ký hợp lệ, thực hiện upsert theo unique `(buoi_hoc_id, hoc_sinh_id)` trong giao dịch, và ghi `LichSuDiemDanh` khi thay đổi bản ghi đã có. Phản hồi HTTP 200 bao gồm số dòng thành công/lỗi; nếu chính sách toàn vẹn nguyên tử được chọn, một lỗi sẽ hoàn tác toàn bộ request và trả HTTP 422.

### 3.3. Lịch sử và thống kê

`GET /api/v1/diem-danh/{id}/lich-su` yêu cầu quyền xem bản ghi, trả giá trị cũ/mới, người thực hiện, thời điểm và lý do (nếu có), phân trang theo thời gian giảm dần.

`GET /api/v1/bao-cao/chuyen-can` nhận `hoc_sinh_id`, `lop_hoc_id`, `cap_do`, `nien_khoa_id`, `ky_hoc_id`, `tu_ngay`, `den_ngay`. Kỳ học phải thuộc niên khóa, thời gian hợp lệ và mọi bộ lọc bị giới hạn bằng phạm vi quyền.

```json
{
  "data": {
    "pham_vi": { "tu_ngay": "2026-09-01", "den_ngay": "2026-09-30", "lop_hoc_id": 5 },
    "quy_tac_chuyen_can": { "phien_ban": "BR-06-v1", "mo_ta": "Theo cấu hình hiện hành" },
    "tong_hop": [
      { "hoc_sinh_id": 21, "tong_buoi": 10, "co_mat": 8, "di_muon": 1, "ve_som": 0, "vang_co_phep": 1, "vang_khong_phep": 0, "ty_le_chuyen_can": 90.0 }
    ]
  }
}
```

### 3.4. Quy ước chung, quyền và mã lỗi

- Base URL: `/api/v1`. `ATTENDANCE_READ` dùng xem buổi/bản ghi; `ATTENDANCE_WRITE` lưu điểm danh; `ATTENDANCE_HISTORY_READ` xem lịch sử; `ATTENDANCE_REPORT_READ` xem thống kê. Giáo viên phải có `PhanCong` hiệu lực tại ngày buổi học.
- Enum trạng thái: `CO_MAT`, `DI_MUON`, `VANG_CO_PHEP`, `VANG_KHONG_PHEP`, `VE_SOM`. Ngày là `YYYY-MM-DD`, datetime ISO-8601; list dùng page 1, 20 dòng/trang, tối đa 100.
- Học sinh bị cố định theo hồ sơ phiên trong API thống kê/chi tiết; API không nhận ID người khác để mở rộng quyền.

| HTTP | Mã lỗi điển hình | Ý nghĩa |
| --- | --- | --- |
| 200 | — | Đọc/lưu thành công. |
| 400 | `INVALID_FILTER`, `INVALID_TIME_RANGE` | Tham số lọc/thời gian sai. |
| 401/403 | `UNAUTHENTICATED`, `ATTENDANCE_FORBIDDEN` | Không có phiên/quyền hoặc ngoài phân công. |
| 404 | `SESSION_NOT_FOUND`, `ATTENDANCE_NOT_FOUND` | Buổi/bản ghi không tồn tại. |
| 409 | `ATTENDANCE_VERSION_CONFLICT` | Xung đột cập nhật đồng thời. |
| 422 | `STUDENT_NOT_ELIGIBLE`, `INVALID_ATTENDANCE_STATUS` | Học sinh không hợp lệ/dữ liệu sai. |

### 3.5. Chi tiết API buổi học và danh sách điểm danh

#### `GET /api/v1/buoi-hoc-co-the-diem-danh`

**Quyền:** `ATTENDANCE_READ` hoặc `ATTENDANCE_WRITE`. Query: `tu_ngay`, `den_ngay`, `lop_hoc_id`, `mon_hoc_id`, `trang_thai`, `chi_chua_hoan_tat`, `page`, `page_size`, `sort`.

Response mỗi dòng có buổi học, lớp/môn, thời gian, số học sinh hợp lệ, số bản ghi đã có, cờ `co_the_diem_danh` và hành động được phép. Giáo viên chỉ nhận buổi thuộc phân công hiệu lực; học sinh không dùng endpoint này để xem danh sách lớp.

#### `GET /api/v1/buoi-hoc/{id}/diem-danh`

**Quyền:** đọc điểm danh + scope buổi học. Query: `include_history_summary` (mặc định false), `page`, `page_size`. Mỗi dòng trả học sinh rút gọn, đăng ký hợp lệ, bản ghi điểm danh/null, `updated_by`/`updated_at` theo quyền. Khi chưa có bản ghi, `diem_danh: null`; client không tự tạo hàng ngoài response.

### 3.6. Chi tiết API lưu điểm danh

#### `PUT /api/v1/buoi-hoc/{id}/diem-danh`

**Quyền:** `ATTENDANCE_WRITE` và phân công hiệu lực. Body `ban_ghi` như mục 3.2; hỗ trợ `atomic` (mặc định `true`) và `version` tùy chọn để kiểm soát cập nhật đồng thời.

**Phản hồi HTTP 200**

```json
{
  "data": {
    "buoi_hoc_id": 19,
    "so_luu_thanh_cong": 2,
    "so_thay_doi": 1,
    "ban_ghi": [
      { "hoc_sinh_id": 21, "diem_danh_id": 101, "trang_thai": "CO_MAT", "updated_at": "2026-09-15T08:05:00+07:00" }
    ]
  }
}
```

Với `atomic=true`, một dòng sai trả HTTP 422 và hoàn tác toàn bộ. Với `atomic=false`, response 200 có `loi_tung_dong` nhưng chỉ dùng khi chính sách nghiệp vụ cho phép; không tạo bản ghi một phần ngoài ý muốn của UI.

#### `PUT /api/v1/buoi-hoc/{id}/diem-danh/{hoc_sinh_id}`

**Quyền:** như lưu hàng loạt. Body gồm `trang_thai`, `ghi_chu` và `version` tùy chọn. Máy chủ xác thực học sinh thuộc danh sách hợp lệ tại ngày buổi, upsert theo unique `(buoi_hoc_id, hoc_sinh_id)`, tạo lịch sử khi sửa và trả HTTP 200 bản ghi mới nhất.

### 3.7. Chi tiết lịch sử và báo cáo chuyên cần

#### `GET /api/v1/diem-danh/{id}/lich-su`

**Quyền:** `ATTENDANCE_HISTORY_READ` và scope bản ghi. Query `page`, `page_size`, `sort=-created_at`. Response trả trạng thái/ghi chú cũ-mới, người thực hiện, thời điểm, lý do theo quyền; không trả lịch sử bản ghi ngoài phạm vi học sinh/buổi được phép.

#### `GET /api/v1/bao-cao/chuyen-can`

**Quyền:** `ATTENDANCE_REPORT_READ`. Ngoài bộ lọc mục 3.3, hỗ trợ `include_details`, `trang_thai_diem_danh`, `page`, `page_size`. `ky_hoc_id` phải thuộc `nien_khoa_id`; `tu_ngay <= den_ngay`; mọi ID học sinh/lớp giới hạn scope. Response nêu `pham_vi`, cấu hình BR-06/phiên bản, tổng hợp và chi tiết phân trang. Tỷ lệ luôn tính phía server, không nhận công thức/giá trị từ client.

### 3.8. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET /buoi-hoc-co-the-diem-danh` | Đọc điểm danh | Chọn buổi trong scope. | 200 |
| `GET /buoi-hoc/{id}/diem-danh` | Đọc + scope | Danh sách học sinh/bản ghi. | 200 |
| `PUT /buoi-hoc/{id}/diem-danh` | Ghi + phân công | Lưu hàng loạt. | 200 |
| `PUT /buoi-hoc/{id}/diem-danh/{hoc_sinh_id}` | Ghi + phân công | Lưu một dòng. | 200 |
| `GET /diem-danh/{id}/lich-su` | Lịch sử + scope | Vết điều chỉnh. | 200 |
| `GET /bao-cao/chuyen-can` | Báo cáo + scope | Tổng hợp/chi tiết chuyên cần. | 200 |

## 4. Quy tắc nghiệp vụ và phân quyền

| Mã | Quy tắc |
| --- | --- |
| ATT-ACL-01 | Giáo viên chỉ ghi/sửa khi có phân công hiệu lực cho lớp/môn/buổi học. |
| ATT-ACL-02 | Học sinh chỉ xem bản ghi/thống kê có `hoc_sinh_id` liên kết với tài khoản phiên. |
| ATT-BR-01 | Mỗi học sinh tối đa một bản ghi cho mỗi buổi học. |
| ATT-BR-02 | Chỉ học sinh có đăng ký lớp hợp lệ tại ngày buổi học mới được điểm danh. |
| ATT-BR-03 | Trạng thái thuộc năm giá trị quy định; ghi chú theo giới hạn độ dài cấu hình. |
| ATT-BR-04 | Mọi cập nhật điểm danh phải lưu `updated_by`, `updated_at` và lịch sử giá trị cũ/mới. |
| ATT-BR-05 | Tỷ lệ chuyên cần tính theo cấu hình BR-06; không dùng công thức cố định ở client. |
| ATT-BR-06 | Không cho phép thêm dòng/học sinh trực tiếp ngoài danh sách API của buổi. |

## 5. Pseudocode lưu hàng loạt

```text
save_attendance(actor, session_id, records):
    require_attendance_permission(actor, session_id)
    eligible_students = get_enrolled_students_on_session_date(session_id)
    validate_all_records_are_eligible(records, eligible_students)
    begin_transaction()
    for record in records:
        current = find_attendance_for_update(session_id, record.student_id)
        upsert_attendance(session_id, record)
        if current changed: write_attendance_history(current, record, actor)
    commit_transaction()
```

## 6. Hành vi giao diện, hiệu năng và an toàn

| Sự kiện | Xử lý |
| --- | --- |
| Chọn buổi học | Xóa dữ liệu cũ, tải danh sách hợp lệ và bản ghi hiện có. |
| Đổi trạng thái dòng | Đánh dấu dòng chưa lưu; không ghi tự động nếu người dùng chưa chọn lưu. |
| Lưu tất cả | Chỉ gửi dòng thay đổi; báo tổng kết thành công/thất bại theo API. |
| Mở lịch sử | Tải theo trang, chỉ hiển thị khi người dùng có quyền. |
| Lọc thống kê | Kiểm tra sơ bộ khoảng ngày/kỳ-niên khóa, sau đó gọi API tổng hợp. |

- Áp dụng unique constraint tại cơ sở dữ liệu ngoài kiểm tra API để bảo đảm một bản ghi/buổi/học sinh khi có thao tác đồng thời.
- Không trả thông tin chuyên cần của học sinh khác cho học sinh đang đăng nhập; đường dẫn trực tiếp bị từ chối.
- Ghi nhật ký thao tác hàng loạt, đồng thời lưu lịch sử chi tiết của từng dòng bị sửa.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-ATT-01 | Giáo viên tải điểm danh buổi được phân công. | Chỉ danh sách học sinh đăng ký hợp lệ được trả về. |
| TC-ATT-02 | Gửi học sinh ngoài danh sách hợp lệ. | Bị từ chối, không tạo bản ghi ngoài phạm vi. |
| TC-ATT-03 | Lưu hai lần cùng học sinh/buổi. | Chỉ có một bản ghi, lần sau là cập nhật hợp lệ. |
| TC-ATT-04 | Sửa trạng thái điểm danh đã lưu. | Cập nhật người/thời gian và có lịch sử giá trị cũ/mới. |
| TC-ATT-05 | Giáo viên điểm danh buổi không thuộc phân công. | HTTP 403, không thay đổi dữ liệu. |
| TC-ATT-06 | Học sinh gọi báo cáo với `hoc_sinh_id` khác. | Bị từ chối hoặc bị cố định về hồ sơ chính mình, không lộ dữ liệu. |
| TC-ATT-07 | Lọc thống kê với kỳ học không thuộc niên khóa. | Lỗi kiểm tra, không trả tổng hợp sai. |
| TC-ATT-08 | Lưu hàng loạt đồng thời. | Không tạo bản ghi trùng, lịch sử đúng theo thay đổi. |
