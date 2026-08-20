# Detail Design — MH-09 Thời khóa biểu và buổi học

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-09 |
| Mã chức năng | SCHEDULE-AND-CLASS-SESSION |
| Điều kiện vào | Người dùng đã xác thực; phạm vi lịch được xác định theo vai trò, phân công hoặc đăng ký lớp. |
| Đầu vào | Bộ lọc thời gian/lớp/môn/giáo viên/phòng; dữ liệu tạo/cập nhật buổi học. |
| Đầu ra | Sự kiện lịch, danh sách buổi học, chi tiết buổi học và kết quả kiểm tra xung đột. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `BuoiHoc` | `id`, `lop_hoc_id`, `mon_hoc_id`, `giao_vien_id`, `phan_cong_id`, `phong_hoc_id`, `bat_dau`, `ket_thuc`, `trang_thai`, `ghi_chu` | Bản ghi lịch chính. |
| `PhanCong` | Giáo viên, lớp, môn, từ/đến ngày, trạng thái | Kiểm tra ủy quyền và hiệu lực. |
| `DangKyLop` | Học sinh, lớp, trạng thái, khoảng hiệu lực | Phạm vi xem của học sinh. |
| `LopHoc`, `MonHoc`, `PhongHoc` | Định danh, trạng thái | Xác thực dữ liệu và phát hiện xung đột. |

Chỉ mục đề xuất: `BuoiHoc(lop_hoc_id, bat_dau, ket_thuc)`, `BuoiHoc(giao_vien_id, bat_dau, ket_thuc)`, `BuoiHoc(phong_hoc_id, bat_dau, ket_thuc)`; các chỉ mục này phục vụ truy vấn lịch và kiểm tra xung đột.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET /api/v1/buoi-hoc` | Danh sách/sự kiện lịch theo bộ lọc và phạm vi quyền. |
| `POST /api/v1/buoi-hoc` | Tạo buổi học, kiểm tra phân công và xung đột. |
| `GET /api/v1/buoi-hoc/{id}` | Chi tiết buổi học. |
| `PATCH /api/v1/buoi-hoc/{id}` | Cập nhật buổi học và kiểm tra lại xung đột. |
| `POST /api/v1/buoi-hoc/kiem-tra-xung-dot` | Kiểm tra trước khi lưu, không ghi dữ liệu. |
| `GET /api/v1/phan-cong-hieu-luc` | Danh sách phân công phù hợp để lập buổi học. |

### 3.1. `GET /api/v1/buoi-hoc`

**Quyền:** quyền xem lịch; dữ liệu tự giới hạn theo vai trò.

| Query parameter | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `tu_thoi_diem`, `den_thoi_diem` | datetime ISO-8601 | Có | Khoảng xem, `den` sau `tu`; giới hạn tối đa theo cấu hình để bảo vệ hiệu năng. |
| `lop_hoc_id`, `mon_hoc_id`, `giao_vien_id`, `phong_hoc_id` | số nguyên | Không | Chỉ được thu hẹp trong phạm vi quyền. |
| `trang_thai` | enum | Không | Lọc trạng thái buổi học. |
| `view` | enum | Không | `DAY`, `WEEK`, `MONTH`, `LIST`; dùng tối ưu dữ liệu trả về, không thay đổi phạm vi quyền. |
| `page`, `page_size` | số nguyên | Không | Dùng cho `LIST`; mặc định 1/20. |

Mỗi sự kiện trả `id`, lớp, môn, giáo viên, phòng, `bat_dau`, `ket_thuc`, trạng thái và quyền thao tác rút gọn. Học sinh không nhận dữ liệu buổi không thuộc lớp đăng ký hiệu lực.

### 3.2. `POST /api/v1/buoi-hoc`

**Quyền:** `SESSION_WRITE`; giáo viên phải có phân công hiệu lực.

```json
{
  "phan_cong_id": 25,
  "phong_hoc_id": 3,
  "bat_dau": "2026-09-15T08:00:00+07:00",
  "ket_thuc": "2026-09-15T10:00:00+07:00",
  "trang_thai": "DA_LEN_LICH",
  "ghi_chu": null
}
```

Khi không truyền `phan_cong_id`, body phải có `lop_hoc_id`, `mon_hoc_id`, `giao_vien_id`; máy chủ tìm và xác thực một phân công hiệu lực khớp tổ hợp đó. `ket_thuc` bắt buộc sau `bat_dau`. Thành công HTTP 201 trả buổi học mới; xung đột trả HTTP 409 kèm danh sách đối tượng xung đột an toàn.

### 3.3. `GET /api/v1/buoi-hoc/{id}`

**Quyền:** quyền xem đối với buổi học cụ thể. Trả chi tiết lớp, môn, giáo viên, phòng, thời gian, trạng thái, ghi chú, phân công nguồn và các hành động được phép. Buổi ngoài phạm vi trả HTTP 403/404 theo chính sách.

### 3.4. `PATCH /api/v1/buoi-hoc/{id}`

**Quyền:** `SESSION_WRITE` trên phân công/lớp-môn tương ứng. Chỉ nhận trường cần sửa: `phan_cong_id` hoặc tổ hợp lớp/môn/giáo viên, `phong_hoc_id`, `bat_dau`, `ket_thuc`, `trang_thai`, `ghi_chu`.

Máy chủ loại trừ chính `{id}` khỏi truy vấn xung đột, sau đó kiểm tra lại phân công hiệu lực và mọi đối tượng xung đột. Thành công HTTP 200; nếu buổi đã phát sinh điểm danh/điểm theo chính sách, chỉ cho phép cập nhật giới hạn hoặc yêu cầu xử lý hậu quả riêng.

### 3.5. `POST /api/v1/buoi-hoc/kiem-tra-xung-dot`

**Quyền:** cùng quyền tạo/sửa buổi học. Nhận payload giống tạo/cập nhật, hỗ trợ `bo_qua_buoi_hoc_id` khi chỉnh sửa.

```json
{
  "lop_hoc_id": 5,
  "giao_vien_id": 8,
  "phong_hoc_id": 3,
  "bat_dau": "2026-09-15T08:00:00+07:00",
  "ket_thuc": "2026-09-15T10:00:00+07:00",
  "bo_qua_buoi_hoc_id": null
}
```

Phản hồi HTTP 200:

```json
{
  "data": {
    "hop_le": false,
    "xung_dot": [
      {
        "loai": "GIAO_VIEN",
        "doi_tuong": { "id": 8, "ten": "Nguyễn Văn A" },
        "buoi_hoc": { "id": 19, "bat_dau": "2026-09-15T09:00:00+07:00", "ket_thuc": "2026-09-15T11:00:00+07:00" }
      }
    ]
  }
}
```

API này chỉ hỗ trợ phản hồi sớm. API tạo/cập nhật vẫn luôn kiểm tra lại trong giao dịch trước khi ghi.

### 3.6. `GET /api/v1/phan-cong-hieu-luc`

**Quyền:** `SESSION_WRITE`; giáo viên chỉ nhận phân công của mình.

Nhận `ngay_hieu_luc` (mặc định ngày hiện tại), `lop_hoc_id`, `mon_hoc_id`. Trả các phân công hiệu lực với lớp, môn, giáo viên và khoảng thời gian, giúp giao diện điền tự động trường tạo buổi học.

### 3.7. Quy ước chung, xác thực và mã lỗi

- Base URL: `/api/v1`; `SCHEDULE_READ` dùng xem lịch, `SESSION_WRITE` dùng tạo/sửa, và server kiểm tra `PhanCong` hiệu lực cho giáo viên ở tất cả API ghi.
- `bat_dau`, `ket_thuc` là ISO-8601 có offset; `trang_thai` thuộc danh mục buổi học (ví dụ `DA_LEN_LICH`, `DA_HOAN_THANH`, `DA_HUY`). Query list mặc định `page=1`, `page_size=20`, tối đa 100.
- Máy chủ xác định giáo viên/học sinh từ phiên; không nhận vai trò hay định danh để mở rộng phạm vi. Buổi ngoài scope trả 403/404 theo chính sách thống nhất.

| HTTP | Mã lỗi điển hình | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật thành công. |
| 400 | `INVALID_TIME_RANGE`, `INVALID_QUERY` | Ngày giờ/tham số không hợp lệ. |
| 401/403 | `UNAUTHENTICATED`, `ASSIGNMENT_NOT_EFFECTIVE` | Không có phiên hoặc phân công/quyền không hợp lệ. |
| 404 | `SESSION_NOT_FOUND`, `ASSIGNMENT_NOT_FOUND` | Bản ghi không tồn tại. |
| 409 | `SCHEDULE_CONFLICT` | Xung đột lớp, giáo viên hoặc phòng. |
| 422 | `VALIDATION_ERROR` | Dữ liệu/phòng/trạng thái không hợp lệ. |

### 3.8. Chi tiết response API lịch và buổi học

`GET /api/v1/buoi-hoc` trả response phân trang/danh sách chuẩn. Mỗi event có `id`, lớp/môn/giáo viên/phòng rút gọn, thời gian, trạng thái, `phan_cong_id` và `hanh_dong_duoc_phep`; không trả danh sách học sinh hoặc dữ liệu điểm danh.

```json
{
  "data": [{
    "id": 19,
    "lop_hoc": { "id": 5, "ma": "N5-01", "ten": "N5 Kỳ 1" },
    "mon_hoc": { "id": 3, "ma": "NGHE", "ten": "Nghe" },
    "giao_vien": { "id": 8, "ho_ten": "Nguyễn Văn A" },
    "phong_hoc": { "id": 3, "ten": "P101" },
    "bat_dau": "2026-09-15T08:00:00+07:00",
    "ket_thuc": "2026-09-15T10:00:00+07:00",
    "trang_thai": "DA_LEN_LICH",
    "hanh_dong_duoc_phep": ["XEM", "CAP_NHAT"]
  }],
  "meta": { "page": 1, "page_size": 20, "total": 1, "total_pages": 1 }
}
```

`GET /api/v1/buoi-hoc/{id}` dùng cùng cấu trúc chi tiết, có thêm `ghi_chu`, phân công nguồn và `created_at`/`updated_at` theo quyền. `POST` tạo buổi trả HTTP 201, `PATCH` trả HTTP 200 cùng đối tượng sau cập nhật và audit; cả hai không bao giờ bỏ qua kiểm tra xung đột chỉ vì client đã gọi API kiểm tra trước.

### 3.9. Payload và xử lý tạo/cập nhật

| Trường | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `phan_cong_id` | số nguyên | Có điều kiện | Nếu có, nguồn lớp/môn/giáo viên là phân công này. |
| `lop_hoc_id`, `mon_hoc_id`, `giao_vien_id` | số nguyên | Có điều kiện | Bắt buộc khi không có `phan_cong_id`; phải khớp phân công hiệu lực. |
| `phong_hoc_id` | số nguyên | Có | Phòng tồn tại/đang áp dụng. |
| `bat_dau`, `ket_thuc` | datetime | Có | Kết thúc sau bắt đầu; trong phạm vi thời gian hợp lệ của phân công/lớp theo chính sách. |
| `trang_thai` | enum | Không | Mặc định `DA_LEN_LICH` khi tạo. |
| `ghi_chu` | chuỗi/null | Không | Giới hạn độ dài cấu hình. |

Với `PATCH`, body chỉ chứa trường thay đổi; `{id}` hiện tại bị loại khỏi truy vấn xung đột. Nếu buổi đã có điểm danh/điểm, API chỉ cho phép trường thay đổi theo chính sách hoặc trả `409 SESSION_HAS_DEPENDENT_DATA`.

### 3.10. Chi tiết API kiểm tra xung đột

`POST /api/v1/buoi-hoc/kiem-tra-xung-dot` nhận đủ lớp, giáo viên, phòng, bắt đầu/kết thúc; tùy chọn `bo_qua_buoi_hoc_id` khi sửa. API kiểm tra quyền trước, sau đó trả HTTP 200 cả khi có xung đột để phục vụ giao diện.

Mỗi phần tử `xung_dot` gồm `loai` (`LOP_HOC`, `GIAO_VIEN`, `PHONG_HOC`), đối tượng, buổi xung đột và khoảng giao nhau. Thông tin nêu ra bị rút gọn theo quyền người gọi; endpoint không ghi dữ liệu và không giữ chỗ tài nguyên.

### 3.11. Chi tiết `GET /api/v1/phan-cong-hieu-luc`

**Quyền:** `SESSION_WRITE`; giáo viên chỉ nhận phân công của bản thân. Query: `ngay_hieu_luc` (mặc định ngày hiện tại), `lop_hoc_id`, `mon_hoc_id`, `page`, `page_size`.

```json
{
  "data": [{
    "id": 25,
    "lop_hoc": { "id": 5, "ma": "N5-01", "cap_do": "N5" },
    "mon_hoc": { "id": 3, "ma": "NGHE", "ten": "Nghe" },
    "giao_vien": { "id": 8, "ho_ten": "Nguyễn Văn A" },
    "tu_ngay": "2026-09-01",
    "den_ngay": "2026-12-31"
  }],
  "meta": { "page": 1, "page_size": 20, "total": 1, "total_pages": 1 }
}
```

### 3.12. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET /buoi-hoc` | `SCHEDULE_READ` + scope | Lịch/danh sách buổi học. | 200 |
| `POST /buoi-hoc` | `SESSION_WRITE` + phân công | Tạo buổi và kiểm tra xung đột. | 201 |
| `GET/PATCH /buoi-hoc/{id}` | Đọc/ghi + scope | Chi tiết/cập nhật buổi học. | 200 |
| `POST /buoi-hoc/kiem-tra-xung-dot` | Quyền tạo/sửa | Kiểm tra trước khi lưu. | 200 |
| `GET /phan-cong-hieu-luc` | `SESSION_WRITE` | Lựa chọn phân công tạo buổi. | 200 |

## 4. Quy tắc nghiệp vụ và kiểm tra xung đột

| Mã | Quy tắc |
| --- | --- |
| SCH-ACL-01 | Giáo viên chỉ xem/tạo/sửa buổi thuộc phân công hiệu lực của mình; học sinh chỉ xem buổi của lớp đăng ký hiệu lực. |
| SCH-BR-01 | Buổi học có lớp, môn, giáo viên, phòng, bắt đầu, kết thúc; kết thúc phải sau bắt đầu. |
| SCH-BR-02 | Tổ hợp lớp-môn-giáo viên phải khớp một `PhanCong` hiệu lực tại thời điểm buổi học. |
| SCH-BR-03 | Không có xung đột thời gian với cùng lớp, giáo viên hoặc phòng. Hai khoảng xung đột khi `new_start < existing_end` và `new_end > existing_start`. |
| SCH-BR-04 | Buổi có trạng thái hủy không được tính vào xung đột; lịch sử vẫn được lưu. |
| SCH-BR-05 | Kiểm tra xung đột ở máy chủ phải thực hiện trong giao dịch/khóa phù hợp để tránh hai yêu cầu đồng thời cùng giữ một phòng/giáo viên/lớp. |

## 5. Pseudocode tạo/cập nhật buổi học

```text
save_session(actor, request, session_id = null):
    assignment = resolve_and_authorize_assignment(actor, request)
    validate(request.ket_thuc > request.bat_dau)
    begin_transaction()
    conflicts = find_conflicts(request, exclude_id=session_id)
    if conflicts: return conflict(conflicts)
    save_session_with_assignment(request, assignment, session_id)
    write_audit(actor, "LUU_BUOI_HOC", safe_change(request))
    commit_transaction()
```

## 6. Hành vi giao diện, hiệu năng và nhật ký

| Sự kiện | Xử lý |
| --- | --- |
| Đổi chế độ xem/khoảng thời gian | Tải lại lịch theo khoảng cần thiết, hủy yêu cầu cũ nếu người dùng đổi nhanh. |
| Chọn phân công | Tự điền lớp, môn, giáo viên; chỉ còn chọn phòng/thời gian. |
| Nhập thời gian/phòng | Gọi kiểm tra xung đột có trì hoãn; hiển thị kết quả nhưng chưa coi là kết quả cuối cùng. |
| Lưu | Khóa nút chống gửi lặp; xử lý HTTP 409 bằng hộp xung đột chi tiết. |
| Chọn sự kiện | Mở chi tiết và chỉ hiển thị hành động người dùng được phép. |

- Dùng chỉ mục thời gian và chỉ tải khoảng cần xem; API lịch không trả chi tiết học sinh không cần thiết.
- Ghi nhật ký tạo/sửa/hủy buổi học, gồm người thực hiện, thời điểm, đối tượng và thay đổi an toàn.
- Không dựa vào kiểm tra xung đột tại giao diện để cấp quyền hoặc bảo đảm toàn vẹn dữ liệu.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-SCH-01 | Tạo buổi có kết thúc không sau bắt đầu. | Bị từ chối với lỗi thời gian. |
| TC-SCH-02 | Tạo buổi trùng thời gian cùng lớp. | HTTP 409, nêu xung đột lớp và không lưu. |
| TC-SCH-03 | Tạo buổi trùng giáo viên hoặc phòng khác lớp. | HTTP 409, nêu đúng đối tượng xung đột được phép công bố. |
| TC-SCH-04 | Chỉnh sửa buổi, kiểm tra xung đột loại trừ chính buổi đó. | Không báo xung đột giả với bản ghi đang sửa. |
| TC-SCH-05 | Giáo viên tạo buổi ngoài lớp/môn phân công. | HTTP 403, không tạo dữ liệu. |
| TC-SCH-06 | Học sinh mở lịch. | Chỉ thấy buổi của lớp có đăng ký liên quan; không có thao tác ghi. |
| TC-SCH-07 | Hai yêu cầu cùng đặt một phòng trong cùng thời gian. | Chỉ một yêu cầu thành công; yêu cầu còn lại nhận xung đột. |
| TC-SCH-08 | Buổi đã hủy trùng thời gian với buổi mới. | Không bị coi là xung đột; lịch sử buổi hủy vẫn xem được. |
