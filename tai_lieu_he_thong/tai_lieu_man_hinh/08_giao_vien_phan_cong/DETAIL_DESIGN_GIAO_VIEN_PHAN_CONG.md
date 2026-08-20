# Detail Design — MH-08 Giáo viên và phân công

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-08 |
| Mã chức năng | TEACHER-AND-ASSIGNMENT-MANAGEMENT |
| Điều kiện vào | Người dùng đã xác thực và có quyền xem/quản lý giáo viên hoặc phân công. |
| Đầu vào | Điều kiện lọc; dữ liệu hồ sơ giáo viên; dữ liệu phân công. |
| Đầu ra | Danh sách, chi tiết giáo viên/phân công và phạm vi quyền giảng dạy hiệu lực. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `GiaoVien` | `id`, `ma_giao_vien`, `ho_ten`, `dien_thoai`, `email`, `trang_thai` | `ma_giao_vien` duy nhất. |
| `ChuyenMonGiaoVien` | `giao_vien_id`, `chuyen_mon_id` | Liên kết nhiều-nhiều chuyên môn. |
| `CapDoGiangDay` | `giao_vien_id`, `cap_do` | Giá trị N5–N1. |
| `PhanCong` | `id`, `giao_vien_id`, `lop_hoc_id`, `mon_hoc_id`, `vai_tro`, `tu_ngay`, `den_ngay`, `trang_thai`, `ghi_chu` | Nguồn ủy quyền học vụ. |
| `LopHoc`, `MonHoc` | Cấp độ, trạng thái, kỳ học | Xác thực dữ liệu phân công. |
| `BuoiHoc`, `DiemDanh`, `Diem`, `BaiTap`, `TaiLieu` | Khóa lớp/môn/giáo viên | Dữ liệu phải được kiểm soát bởi phân công. |

Ràng buộc đề xuất: unique `GiaoVien.ma_giao_vien`; chỉ mục theo `PhanCong(giao_vien_id, lop_hoc_id, mon_hoc_id, tu_ngay, den_ngay)`; `den_ngay >= tu_ngay` khi có ngày kết thúc.

## 3. Hợp đồng API đề xuất

### 3.1. Quy ước dùng chung

- Base URL: `/api/v1`; dữ liệu request/response dùng JSON UTF-8, trừ khi có thông báo khác.
- API yêu cầu `Authorization: Bearer <access_token>`. Máy chủ lấy người dùng, vai trò và `giao_vien_id` liên kết từ token/phiên.
- Giá trị enum: `trang_thai_giao_vien` = `DANG_HOAT_DONG`, `KHONG_HOAT_DONG`; `trang_thai_phan_cong` = `HIEU_LUC`, `HET_HIEU_LUC`, `DA_HUY`; `vai_tro` = `GIAO_VIEN_CHINH`, `TRO_GIANG` (có thể mở rộng qua danh mục cấu hình).
- Định dạng ngày là `YYYY-MM-DD`; ngày kết thúc `null` nghĩa là còn hiệu lực đến khi được kết thúc/hủy.
- Mọi danh sách phân trang trả `meta = { page, page_size, total, total_pages }`. `page` mặc định 1, `page_size` mặc định 20 và tối đa 100.
- Lỗi theo cấu trúc thống nhất:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ.",
    "fields": {
      "den_ngay": ["Ngày kết thúc không được trước ngày bắt đầu."]
    }
  }
}
```

| HTTP | Mã lỗi điển hình | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật thành công. |
| 400 | `INVALID_QUERY` | Tham số truy vấn sai định dạng. |
| 401 | `UNAUTHENTICATED` | Không có hoặc hết hạn phiên. |
| 403 | `FORBIDDEN` / `ASSIGNMENT_NOT_EFFECTIVE` | Không có quyền hoặc giáo viên không có phân công hiệu lực. |
| 404 | `TEACHER_NOT_FOUND` / `ASSIGNMENT_NOT_FOUND` | Bản ghi không tồn tại hoặc không thuộc phạm vi được phép công bố. |
| 409 | `DUPLICATE_TEACHER_CODE` / `ASSIGNMENT_OVERLAP` | Trùng mã hoặc xung đột dữ liệu/hiệu lực. |
| 422 | `VALIDATION_ERROR` / `LEVEL_NOT_QUALIFIED` | Vi phạm quy tắc dữ liệu/nghiệp vụ. |

### 3.2. `GET /api/v1/giao-vien` — Danh sách giáo viên

**Quyền:** `TEACHER_READ` hoặc `TEACHER_WRITE`.

| Query parameter | Kiểu | Bắt buộc | Diễn giải |
| --- | --- | --- | --- |
| `q` | chuỗi | Không | Tìm gần đúng, không phân biệt hoa/thường theo `ma_giao_vien` hoặc `ho_ten`. |
| `chuyen_mon_id` | số nguyên | Không | Lọc giáo viên có chuyên môn đã chọn. |
| `cap_do` | enum | Không | N5–N1; lọc giáo viên có thể giảng dạy cấp độ này. |
| `trang_thai` | enum | Không | `DANG_HOAT_DONG` hoặc `KHONG_HOAT_DONG`. |
| `page`, `page_size` | số nguyên | Không | Quy ước phân trang chung. |
| `sort` | chuỗi | Không | Một trong `ma_giao_vien`, `ho_ten`, `updated_at`; tiền tố `-` là giảm dần. |

**Phản hồi HTTP 200**

```json
{
  "data": [
    {
      "id": 8,
      "ma_giao_vien": "GV008",
      "ho_ten": "Nguyễn Văn A",
      "dien_thoai": "0900000000",
      "email": "gv.a@example.com",
      "chuyen_mon": [{ "id": 1, "ten": "Tiếng Nhật" }],
      "cap_do_giang_day": ["N5", "N4"],
      "trang_thai": "DANG_HOAT_DONG",
      "updated_at": "2026-08-20T10:15:00+07:00"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 1, "total_pages": 1 }
}
```

### 3.3. `POST /api/v1/giao-vien` — Tạo giáo viên

**Quyền:** `TEACHER_WRITE`.

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `ma_giao_vien` | chuỗi | Có | Duy nhất, được cắt khoảng trắng và chuẩn hóa trước khi kiểm tra trùng. |
| `ho_ten` | chuỗi | Có | Không rỗng sau khi chuẩn hóa. |
| `dien_thoai` | chuỗi | Không | Đúng định dạng số điện thoại theo cấu hình. |
| `email` | chuỗi | Không | Đúng định dạng email. |
| `chuyen_mon_ids` | mảng số nguyên | Có | Không rỗng; các chuyên môn tồn tại và đang áp dụng. |
| `cap_do_giang_day` | mảng enum | Có | Không rỗng; phần tử chỉ N5–N1, không lặp. |
| `trang_thai` | enum | Có | Mặc định `DANG_HOAT_DONG` nếu hệ thống cho phép. |

```json
{
  "ma_giao_vien": "GV008",
  "ho_ten": "Nguyễn Văn A",
  "dien_thoai": "0900000000",
  "email": "gv.a@example.com",
  "chuyen_mon_ids": [1, 2],
  "cap_do_giang_day": ["N5", "N4"],
  "trang_thai": "DANG_HOAT_DONG"
}
```

**Phản hồi HTTP 201:** trả đối tượng giáo viên đầy đủ như một phần tử danh sách, kèm `created_at`, `updated_at`; ghi nhật ký `TAO_GIAO_VIEN`.

### 3.4. `GET /api/v1/giao-vien/{id}` — Chi tiết giáo viên

**Quyền:** `TEACHER_READ` hoặc `TEACHER_WRITE`.

`id` là số nguyên dương. API trả thông tin liên hệ, chuyên môn, cấp độ dạy và số lượng phân công hiệu lực; không trả dữ liệu tài khoản/mật khẩu nếu giáo viên có tài khoản liên kết.

```json
{
  "data": {
    "id": 8,
    "ma_giao_vien": "GV008",
    "ho_ten": "Nguyễn Văn A",
    "dien_thoai": "0900000000",
    "email": "gv.a@example.com",
    "chuyen_mon": [{ "id": 1, "ten": "Tiếng Nhật" }],
    "cap_do_giang_day": ["N5", "N4"],
    "trang_thai": "DANG_HOAT_DONG",
    "tong_phan_cong_hieu_luc": 2,
    "created_at": "2026-08-01T09:00:00+07:00",
    "updated_at": "2026-08-20T10:15:00+07:00"
  }
}
```

### 3.5. `PATCH /api/v1/giao-vien/{id}` — Cập nhật giáo viên

**Quyền:** `TEACHER_WRITE`. Chỉ gửi các trường cần đổi; quy tắc từng trường như API tạo.

```json
{
  "dien_thoai": "0911111111",
  "chuyen_mon_ids": [1, 3],
  "cap_do_giang_day": ["N5", "N4", "N3"],
  "trang_thai": "DANG_HOAT_DONG"
}
```

- Khi chuyển sang `KHONG_HOAT_DONG`, máy chủ cảnh báo/từ chối nếu còn phân công hiệu lực, theo chính sách nghiệp vụ; không tự xóa phân công.
- Việc bỏ cấp độ đang được lớp có phân công sử dụng phải kiểm tra ảnh hưởng; trả `422 LEVEL_CAPABILITY_IN_USE` nếu không được phép.
- Thành công HTTP 200 trả hồ sơ mới nhất và ghi nhật ký `CAP_NHAT_GIAO_VIEN`.

### 3.6. `GET /api/v1/giao-vien/{id}/phan-cong` — Phân công theo giáo viên

**Quyền:** `TEACHER_READ` hoặc `ASSIGNMENT_READ`. Người gọi là giáo viên chỉ được gọi với `{id}` là hồ sơ liên kết của chính mình.

| Query parameter | Kiểu | Bắt buộc | Diễn giải |
| --- | --- | --- | --- |
| `trang_thai` | enum | Không | Lọc `HIEU_LUC`, `HET_HIEU_LUC`, `DA_HUY`. |
| `tu_ngay`, `den_ngay` | ngày | Không | Lọc phân công giao với khoảng ngày yêu cầu; `tu_ngay` không sau `den_ngay`. |
| `lop_hoc_id`, `mon_hoc_id` | số nguyên | Không | Lọc theo lớp/môn. |
| `page`, `page_size` | số nguyên | Không | Quy ước phân trang chung. |

Mỗi dòng trả `id`, lớp (mã/tên/cấp độ), môn, vai trò, `tu_ngay`, `den_ngay`, trạng thái, ghi chú và cờ `hieu_luc_hom_nay`. HTTP 200 trả cấu trúc danh sách chuẩn.

### 3.7. `GET /api/v1/phan-cong` — Danh sách phân công

**Quyền:** `ASSIGNMENT_READ` hoặc `ASSIGNMENT_WRITE`.

| Query parameter | Kiểu | Bắt buộc | Diễn giải |
| --- | --- | --- | --- |
| `giao_vien_id`, `lop_hoc_id`, `mon_hoc_id` | số nguyên | Không | Lọc theo đối tượng phân công. |
| `vai_tro`, `trang_thai` | enum | Không | Lọc vai trò/trạng thái. |
| `ngay_hieu_luc` | ngày | Không | Chỉ các phân công hiệu lực tại ngày này. |
| `tu_ngay`, `den_ngay` | ngày | Không | Lọc các khoảng hiệu lực giao nhau. |
| `page`, `page_size`, `sort` | chuỗi/số | Không | Phân trang; hỗ trợ `-tu_ngay`, `-updated_at`. |

**Phản hồi HTTP 200** gồm mảng `data`; mỗi phần tử có `id`, `giao_vien`, `lop_hoc`, `mon_hoc`, `vai_tro`, `tu_ngay`, `den_ngay`, `trang_thai`, `ghi_chu`, `created_at`, `updated_at` cùng `meta` phân trang.

### 3.8. `POST /api/v1/phan-cong` — Tạo phân công

**Quyền:** `ASSIGNMENT_WRITE`.

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `giao_vien_id`, `lop_hoc_id`, `mon_hoc_id` | số nguyên | Có | Tồn tại, thuộc dữ liệu áp dụng và phạm vi thao tác của người dùng. |
| `vai_tro` | enum | Có | Vai trò phân công hợp lệ. |
| `tu_ngay` | ngày | Có | Ngày bắt đầu hiệu lực. |
| `den_ngay` | ngày/null | Không | Không trước `tu_ngay`; `null` là không xác định ngày kết thúc. |
| `ghi_chu` | chuỗi/null | Không | Tối đa độ dài cấu hình. |

```json
{
  "giao_vien_id": 8,
  "lop_hoc_id": 5,
  "mon_hoc_id": 3,
  "vai_tro": "GIAO_VIEN_CHINH",
  "tu_ngay": "2026-09-01",
  "den_ngay": "2026-12-31",
  "ghi_chu": null
}
```

Máy chủ kiểm tra năng lực dạy cấp độ lớp, trạng thái giáo viên/lớp/môn, hiệu lực kỳ học và xung đột khoảng thời gian trước khi tạo. Thành công HTTP 201, trả phân công và ghi nhật ký `TAO_PHAN_CONG`.

### 3.9. `GET /api/v1/phan-cong/{id}` — Chi tiết phân công

**Quyền:** `ASSIGNMENT_READ`; giáo viên chỉ truy cập bản ghi của chính mình.

Phản hồi HTTP 200 trả toàn bộ trường của phân công, các đối tượng rút gọn giáo viên/lớp/môn, cấp độ lớp, thông tin kỳ học và `hieu_luc_tai_ngay` (mặc định ngày hiện tại). Không trả dữ liệu học sinh hay thông tin bảo mật không cần thiết.

### 3.10. `PATCH /api/v1/phan-cong/{id}` — Cập nhật phân công

**Quyền:** `ASSIGNMENT_WRITE`. Có thể cập nhật `vai_tro`, `tu_ngay`, `den_ngay`, `ghi_chu`, `trang_thai` theo chính sách; không đổi giáo viên/lớp/môn của bản ghi đã phát sinh dữ liệu học vụ. Trường hợp cần thay đổi tổ hợp này, tạo phân công mới và kết thúc/hủy bản ghi cũ.

```json
{
  "den_ngay": "2026-12-15",
  "ghi_chu": "Điều chỉnh theo kế hoạch học kỳ"
}
```

Máy chủ kiểm tra lại khoảng hiệu lực, xung đột, năng lực giảng dạy và dữ liệu phụ thuộc. Thành công HTTP 200 và ghi nhật ký `CAP_NHAT_PHAN_CONG`.

### 3.11. `POST /api/v1/phan-cong/{id}/huy` — Hủy phân công

**Quyền:** `ASSIGNMENT_WRITE`.

```json
{
  "ngay_huy": "2026-10-01",
  "ly_do": "Giáo viên nghỉ công tác",
  "ghi_chu": null
}
```

| Trường | Bắt buộc | Quy tắc |
| --- | --- | --- |
| `ngay_huy` | Có | Ngày hợp lệ, không trước `tu_ngay`; không được làm mâu thuẫn dữ liệu học vụ đã chốt theo chính sách. |
| `ly_do` | Có | Không rỗng. |
| `ghi_chu` | Không | Thông tin bổ sung. |

API đặt `trang_thai = DA_HUY`, lưu ngày/lý do hủy, giữ nguyên lịch sử và thu hồi quyền thao tác tương lai từ `ngay_huy`. Thành công HTTP 200 trả phân công sau hủy và ghi nhật ký `HUY_PHAN_CONG`; không xóa vật lý dữ liệu.

### 3.12. `GET /api/v1/me/phan-cong-hieu-luc` — Phạm vi của giáo viên đăng nhập

**Quyền:** người dùng có vai trò Giáo viên và có hồ sơ giáo viên liên kết. Không nhận `giao_vien_id` từ client.

| Query parameter | Kiểu | Bắt buộc | Diễn giải |
| --- | --- | --- | --- |
| `ngay_hieu_luc` | ngày | Không | Mặc định ngày hiện tại; chỉ trả phân công hiệu lực tại ngày này. |
| `lop_hoc_id` | số nguyên | Không | Thu hẹp kết quả; không làm mở rộng phạm vi. |

```json
{
  "data": {
    "giao_vien": { "id": 8, "ma": "GV008", "ho_ten": "Nguyễn Văn A" },
    "ngay_hieu_luc": "2026-09-15",
    "phan_cong": [
      {
        "id": 25,
        "lop_hoc": { "id": 5, "ma": "N5-2026-01", "ten": "N5 Kỳ 1", "cap_do": "N5" },
        "mon_hoc": { "id": 3, "ma": "NGHE", "ten": "Nghe" },
        "vai_tro": "GIAO_VIEN_CHINH",
        "tu_ngay": "2026-09-01",
        "den_ngay": "2026-12-31",
        "quyen_thao_tac": ["TAO_BUOI_HOC", "DIEM_DANH", "NHAP_DIEM", "QUAN_LY_BAI_TAP", "QUAN_LY_TAI_LIEU"]
      }
    ]
  }
}
```

API này phục vụ hiển thị và thu hẹp lựa chọn trên giao diện. Các API nghiệp vụ đích vẫn phải gọi kiểm tra phân công hiệu lực phía máy chủ, không tin cậy danh sách quyền từ phản hồi này.

## 4. Quy tắc nghiệp vụ và kiểm soát quyền

| Mã | Quy tắc |
| --- | --- |
| TCH-ACL-01 | Quản trị viên/Nhân viên có quyền ghi mới tạo/sửa giáo viên và phân công. |
| TCH-ACL-02 | Giáo viên chỉ được truy vấn/thao tác dữ liệu lớp/môn có `PhanCong` hiệu lực tại ngày nghiệp vụ. |
| TCH-BR-01 | Mã và họ tên giáo viên bắt buộc; mã duy nhất. |
| TCH-BR-02 | Cấp độ giảng dạy chỉ thuộc N5–N1; danh mục chuyên môn phải tồn tại và áp dụng. |
| ASN-BR-01 | Giáo viên, lớp, môn học, vai trò, từ ngày là bắt buộc; đến ngày không trước từ ngày. |
| ASN-BR-02 | Giáo viên, lớp, môn học phải đang áp dụng/được phép tại thời điểm tạo phân công. |
| ASN-BR-03 | Cấp độ lớp phải nằm trong tập cấp độ giáo viên có thể dạy, trừ khi có cơ chế ngoại lệ được phê duyệt. |
| ASN-BR-04 | Không tạo phân công có khoảng hiệu lực chồng lấn không hợp lệ cho cùng tổ hợp giáo viên/lớp/môn/vai trò theo chính sách. |
| ASN-BR-05 | Hủy/kết thúc phân công giữ lịch sử; kể từ thời điểm hết hiệu lực, giáo viên không còn quyền thao tác học vụ mới. |
| ASN-ACL-01 | API buổi học, điểm danh, điểm, bài tập, tài liệu phải kiểm tra `giao_vien_id`, `lop_hoc_id`, `mon_hoc_id` và ngày nghiệp vụ với phân công hiệu lực. |

## 5. Pseudocode xác thực phân công

```text
require_teaching_assignment(session_user, class_id, subject_id, effective_date):
    teacher_id = session_user.giao_vien_id
    assignment = find_active_assignment(teacher_id, class_id, subject_id, effective_date)
    if assignment is null:
        deny_access()
    return assignment

create_assignment(actor, request):
    require_permission(actor, "TEACHER_ASSIGNMENT_WRITE")
    validate_teacher_class_subject(request)
    validate_date_range(request.tu_ngay, request.den_ngay)
    validate_teacher_can_teach_level(request.giao_vien_id, request.lop_hoc_id)
    validate_no_invalid_overlap(request)
    save_assignment_and_audit(actor, request)
```

`require_teaching_assignment` là kiểm tra dùng chung tại các chức năng học vụ; không chỉ thực hiện khi mở màn hình phân công.

## 6. Hành vi giao diện, hiệu năng và nhật ký

| Sự kiện | Xử lý |
| --- | --- |
| Chọn giáo viên | Tải chuyên môn/cấp độ và phân công hiện có để hỗ trợ kiểm tra. |
| Chọn lớp | Hiển thị cấp độ lớp, lọc môn học theo danh mục/lớp nếu có. |
| Nhập thời gian hiệu lực | Kiểm tra sơ bộ khoảng ngày và các phân công xung đột. |
| Hủy phân công | Hiển thị xác nhận, yêu cầu lý do nếu chính sách yêu cầu; không xóa bản ghi. |
| Lưu | Khóa nút chống gửi lặp; hiển thị lỗi tại trường và tải lại danh sách sau thành công. |

- Danh sách phân trang/lọc phía máy chủ; mặc định sắp xếp phân công hiệu lực gần nhất trước.
- Kiểm tra khóa ngoại/ràng buộc khoảng thời gian trong giao dịch để tránh tạo phân công chồng lấn do thao tác đồng thời.
- Ghi nhật ký tạo/sửa/hủy giáo viên, chuyên môn/cấp độ và phân công; ghi người thực hiện, thời điểm, đối tượng, thay đổi an toàn.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-TCH-01 | Tạo giáo viên có mã đã tồn tại. | Bị từ chối, không tạo bản ghi. |
| TC-TCH-02 | Lọc theo chuyên môn và cấp độ giảng dạy. | Trả đúng giáo viên thỏa cả điều kiện. |
| TC-ASN-01 | Tạo phân công thiếu giáo viên/lớp/môn/vai trò/từ ngày. | Hiển thị lỗi dữ liệu bắt buộc. |
| TC-ASN-02 | Tạo phân công có đến ngày trước từ ngày. | Bị từ chối, không lưu. |
| TC-ASN-03 | Phân công giáo viên dạy lớp có cấp độ ngoài năng lực. | Bị cảnh báo/từ chối theo chính sách ngoại lệ. |
| TC-ASN-04 | Giáo viên tạo điểm danh cho lớp/môn không được phân công. | API từ chối HTTP 403, không tạo dữ liệu. |
| TC-ASN-05 | Giáo viên tạo bài tập trong khoảng hiệu lực phân công. | Thao tác được chấp nhận khi các quyền khác hợp lệ. |
| TC-ASN-06 | Hủy phân công. | Lịch sử còn nguyên; giáo viên không còn quyền thao tác từ thời điểm hủy. |
| TC-ASN-07 | Hai yêu cầu tạo phân công xung đột đồng thời. | Không sinh dữ liệu chồng lấn không hợp lệ. |
