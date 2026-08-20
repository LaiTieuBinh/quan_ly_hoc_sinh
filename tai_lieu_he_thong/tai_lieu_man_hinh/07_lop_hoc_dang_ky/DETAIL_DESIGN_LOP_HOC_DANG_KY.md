# Detail Design — MH-07 Lớp học và đăng ký lớp

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-07 |
| Mã chức năng | CLASS-AND-ENROLLMENT-MANAGEMENT |
| Điều kiện vào | Người dùng đã xác thực; quyền được kiểm tra theo vai trò và phạm vi lớp/học sinh. |
| Đầu vào | Bộ lọc; dữ liệu lớp; dữ liệu đăng ký/chuyển/kết thúc/hủy. |
| Đầu ra | Danh sách lớp, sĩ số, danh sách/lịch sử đăng ký và kết quả thao tác. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `LopHoc` | `id`, `ma_lop`, `ten_lop`, `cap_do`, `nien_khoa_id`, `ky_hoc_id`, `phong_hoc_id`, `trang_thai` | Một niên khóa, một kỳ học và một cấp độ. |
| `DangKyLop` | `id`, `hoc_sinh_id`, `lop_hoc_id`, `ngay_dang_ky`, `ngay_ket_thuc`, `trang_thai`, `ly_do`, `ghi_chu` | Bảo toàn lịch sử đăng ký. |
| `HocSinh` | `id`, `ma_hoc_sinh`, `ho_ten`, `cap_do_hien_tai`, `trang_thai` | Xác thực học sinh hợp lệ/cấp độ. |
| `KyHoc`, `NienKhoa` | Định danh và khoảng ngày | Kiểm tra quan hệ kỳ học-niên khóa. |
| `PhanCong` | `giao_vien_id`, `lop_hoc_id`, hiệu lực | Phạm vi xem của giáo viên. |
| `NgoaiLeCapDo` | `hoc_sinh_id`, `lop_hoc_id`, trạng thái duyệt, lý do, người duyệt | Bằng chứng theo BR-02. |

Ràng buộc đề xuất: unique `LopHoc.ma_lop`; khóa ngoại kỳ học/niên khóa; unique có điều kiện để ngăn hai đăng ký `DANG_HOC` chồng lấn cho cùng `hoc_sinh_id`/`lop_hoc_id`.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET/POST /api/v1/lop-hoc` | Danh sách và tạo lớp học. |
| `GET/PATCH /api/v1/lop-hoc/{id}` | Chi tiết/cập nhật lớp. |
| `GET /api/v1/lop-hoc/{id}/si-so` | Sĩ số hiện tại. |
| `GET/POST /api/v1/dang-ky-lop` | Danh sách và tạo đăng ký. |
| `GET/PATCH /api/v1/dang-ky-lop/{id}` | Chi tiết/cập nhật thông tin cho phép. |
| `POST /api/v1/dang-ky-lop/{id}/chuyen-lop` | Chuyển lớp có lưu lịch sử. |
| `POST /api/v1/dang-ky-lop/{id}/ket-thuc` | Kết thúc đăng ký. |
| `POST /api/v1/dang-ky-lop/{id}/huy` | Hủy đăng ký. |

### 3.1. Tạo lớp

```json
{
  "ma_lop": "N5-2026-01",
  "ten_lop": "N5 Kỳ 1 - 2026",
  "cap_do": "N5",
  "nien_khoa_id": 1,
  "ky_hoc_id": 2,
  "phong_hoc_id": 3,
  "trang_thai": "DANG_HOAT_DONG"
}
```

### 3.2. Tạo/chuyển đăng ký

```json
// POST /api/v1/dang-ky-lop
{
  "hoc_sinh_id": 21,
  "lop_hoc_id": 5,
  "ngay_dang_ky": "2026-09-01",
  "trang_thai": "DANG_HOC",
  "ghi_chu": null
}
```

```json
// POST /api/v1/dang-ky-lop/{id}/chuyen-lop
{
  "lop_hoc_moi_id": 6,
  "ngay_chuyen": "2026-10-01",
  "ly_do": "Chuyển sang lịch học phù hợp",
  "ngoai_le_cap_do_id": null
}
```

API trả HTTP 201/200 khi thành công; HTTP 422 khi sai dữ liệu; HTTP 403 khi ngoài quyền; HTTP 409 khi trùng/chồng lấn đăng ký hoặc xung đột cấp độ không có ngoại lệ.

### 3.3. Quy ước chung, quyền và mã lỗi

- Base URL: `/api/v1`. Quyền đọc/ghi lớp là `CLASS_READ`/`CLASS_WRITE`; đăng ký là `ENROLLMENT_READ`/`ENROLLMENT_WRITE`. Giáo viên chỉ đọc lớp có `PhanCong` hiệu lực, học sinh chỉ đọc đăng ký của `hoc_sinh_id` liên kết phiên.
- Enum: cấp độ N5–N1; trạng thái lớp theo danh mục; trạng thái đăng ký `DANG_HOC`, `DA_CHUYEN_LOP`, `DA_KET_THUC`, `HUY`. Ngày dùng `YYYY-MM-DD`; list mặc định 20 dòng/trang, tối đa 100.
- Lỗi chuẩn: 400 `INVALID_QUERY`; 401 `UNAUTHENTICATED`; 403 `CLASS_OUT_OF_SCOPE`; 404 `CLASS_NOT_FOUND`/`ENROLLMENT_NOT_FOUND`; 409 `CLASS_CODE_EXISTS`, `ACTIVE_ENROLLMENT_OVERLAP`, `LEVEL_EXCEPTION_REQUIRED`; 422 `VALIDATION_ERROR`.

### 3.4. API lớp học

#### `GET /api/v1/lop-hoc`

**Quyền:** `CLASS_READ`. Query `q`, `cap_do`, `nien_khoa_id`, `ky_hoc_id`, `trang_thai`, `phong_hoc_id`, `page`, `page_size`, `sort`. `ky_hoc_id` phải thuộc niên khóa; bộ lọc tự giới hạn scope. Response gồm lớp, niên khóa/kỳ học rút gọn, phòng, cấp độ, trạng thái, `si_so_hien_tai` và meta phân trang.

#### `POST /api/v1/lop-hoc`

**Quyền:** `CLASS_WRITE`. Nhận payload 3.1; tất cả mã/tên/cấp độ/niên khóa/kỳ học bắt buộc. Máy chủ kiểm tra mã duy nhất, kỳ thuộc niên khóa, danh mục/phòng áp dụng rồi tạo audit. Thành công HTTP 201 trả lớp mới.

#### `GET/PATCH /api/v1/lop-hoc/{id}`

`GET` cần `CLASS_READ` và scope; trả chi tiết lớp cùng sĩ số/tổ hợp học vụ. `PATCH` cần `CLASS_WRITE`, chỉ nhận trường đổi (mã, tên, cấp độ, niên khóa, kỳ học, phòng, trạng thái). Nếu lớp đã có đăng ký/buổi học, đổi dữ liệu ảnh hưởng phải kiểm tra lịch sử và trả 409/422 khi không hợp lệ. Thành công HTTP 200 kèm audit.

#### `GET /api/v1/lop-hoc/{id}/si-so`

**Quyền:** `CLASS_READ` và scope. Query tùy chọn `tai_ngay` (mặc định ngày hiện tại) và `include_students=false`. Trả số đăng ký `DANG_HOC` hiệu lực; khi có quyền và `include_students=true`, trả danh sách học sinh phân trang. Không tính lịch sử đã chuyển/kết thúc/hủy.

### 3.5. API đăng ký lớp

#### `GET /api/v1/dang-ky-lop`

**Quyền:** `ENROLLMENT_READ`, scope theo vai trò. Query `hoc_sinh_id`, `lop_hoc_id`, `nien_khoa_id`, `ky_hoc_id`, `trang_thai`, `tu_ngay`, `den_ngay`, `page`, `page_size`, `sort`. Response trả học sinh/lớp rút gọn, ngày hiệu lực, trạng thái, lý do/ghi chú theo quyền và meta phân trang.

#### `POST /api/v1/dang-ky-lop`

**Quyền:** `ENROLLMENT_WRITE`. Body như 3.2, có thêm `ngoai_le_cap_do_id` tùy chọn. Máy chủ xác thực học sinh/lớp hoạt động, kiểm tra ngày, đăng ký chồng lấn và ngoại lệ cấp độ đã duyệt nếu cần; tạo bản ghi/audit trong transaction. Thành công HTTP 201 trả đăng ký và sĩ số mới (nếu có).

#### `GET/PATCH /api/v1/dang-ky-lop/{id}`

`GET` cần `ENROLLMENT_READ` và scope. `PATCH` cần `ENROLLMENT_WRITE`; chỉ sửa ghi chú hoặc trường không làm thay đổi lịch sử theo chính sách. Không được dùng `PATCH` để chuyển/kết thúc/hủy; các hành động này dùng endpoint riêng. Thành công HTTP 200 và audit.

### 3.6. Chuyển, kết thúc và hủy đăng ký

#### `POST /api/v1/dang-ky-lop/{id}/chuyen-lop`

**Quyền:** `ENROLLMENT_WRITE`.

```json
{
  "lop_hoc_moi_id": 6,
  "ngay_chuyen": "2026-10-01",
  "ly_do": "Chuyển sang lịch học phù hợp",
  "ngoai_le_cap_do_id": null
}
```

Máy chủ khóa đăng ký hiện tại, chuyển nó sang `DA_CHUYEN_LOP`, tạo đăng ký `DANG_HOC` mới, kiểm tra scope/cấp độ/chồng lấn trong cùng transaction. HTTP 200 trả cả bản ghi cũ/mới và audit.

#### `POST /api/v1/dang-ky-lop/{id}/ket-thuc`

**Quyền:** `ENROLLMENT_WRITE`. Body `{ "ngay_ket_thuc": "2026-12-31", "ly_do": "Hoàn thành khóa học" }`. Ngày phải hợp lệ và không trước ngày đăng ký. API đặt trạng thái `DA_KET_THUC`, giữ lịch sử, cập nhật sĩ số; trả HTTP 200.

#### `POST /api/v1/dang-ky-lop/{id}/huy`

**Quyền:** `ENROLLMENT_WRITE`. Body `{ "ngay_huy": "2026-09-02", "ly_do": "Đăng ký nhầm" }`. Máy chủ kiểm tra chính sách hủy/dữ liệu phát sinh, đặt `HUY` không xóa bản ghi; trả HTTP 200 cùng audit. Nếu đã có dữ liệu học vụ không cho hủy, trả 409 với hướng dẫn dùng luồng kết thúc/điều chỉnh phù hợp.

### 3.7. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET/POST /lop-hoc` | Đọc/ghi lớp | Danh sách/tạo lớp. | 200/201 |
| `GET/PATCH /lop-hoc/{id}` | Đọc/ghi + scope | Chi tiết/cập nhật lớp. | 200 |
| `GET /lop-hoc/{id}/si-so` | Đọc + scope | Sĩ số hiệu lực. | 200 |
| `GET/POST /dang-ky-lop` | Đọc/ghi đăng ký | Danh sách/tạo đăng ký. | 200/201 |
| `GET/PATCH /dang-ky-lop/{id}` | Đọc/ghi + scope | Chi tiết/cập nhật hạn chế. | 200 |
| `POST /.../{id}/chuyen-lop` | Ghi đăng ký | Chuyển lớp có lịch sử. | 200 |
| `POST /.../{id}/ket-thuc` | Ghi đăng ký | Kết thúc đăng ký. | 200 |
| `POST /.../{id}/huy` | Ghi đăng ký | Hủy không xóa lịch sử. | 200 |

## 4. Quy tắc nghiệp vụ và phân quyền

| Mã | Quy tắc |
| --- | --- |
| CLS-ACL-01 | Quản trị viên/Nhân viên có quyền ghi mới tạo/sửa lớp và đăng ký. |
| CLS-ACL-02 | Giáo viên chỉ đọc lớp có phân công hiệu lực và đăng ký liên quan; học sinh chỉ đọc lớp/đăng ký của chính mình. |
| CLS-BR-01 | Lớp có mã, tên, cấp độ, niên khóa, kỳ học bắt buộc; cấp độ N5–N1. |
| CLS-BR-02 | `ky_hoc_id` phải thuộc `nien_khoa_id`; chỉ danh mục áp dụng được chọn để tạo lớp mới. |
| ENR-BR-01 | Học sinh, lớp, ngày đăng ký và trạng thái là bắt buộc khi tạo đăng ký. |
| ENR-BR-02 | Trạng thái hợp lệ: `DANG_HOC`, `DA_CHUYEN_LOP`, `DA_KET_THUC`, `HUY`. |
| ENR-BR-03 | Không có hai đăng ký `DANG_HOC` chồng lấn của cùng học sinh trong cùng lớp. |
| ENR-BR-04 | Nếu cấp độ lớp khác cấp độ hiện tại, phải có ngoại lệ cấp độ đã phê duyệt khớp học sinh/lớp và còn hiệu lực. |
| ENR-BR-05 | Chuyển/kết thúc/hủy không xóa bản ghi lịch sử; phải lưu thời điểm, trạng thái và lý do theo chính sách. |
| ENR-BR-06 | Sĩ số là số đăng ký `DANG_HOC` hiệu lực trong lớp tại thời điểm truy vấn. |

## 5. Pseudocode tạo đăng ký và chuyển lớp

```text
create_enrollment(actor, request):
    require_permission(actor, "CLASS_ENROLLMENT_WRITE")
    validate_student_and_class_in_scope(request)
    validate_active_catalogs(request.lop_hoc_id)
    validate_no_overlapping_active_enrollment(request)
    if student.level != class.level:
        require_approved_level_exception(student, class, request.exception_id)
    insert_enrollment(request, status=DANG_HOC)
    write_audit(actor, "DANG_KY_LOP", request)

transfer_enrollment(actor, enrollment_id, request):
    begin_transaction()
    current = lock_active_enrollment(enrollment_id)
    validate_transfer(request)
    mark(current, DA_CHUYEN_LOP, request.ngay_chuyen, request.ly_do)
    create_enrollment_for_new_class(current.student, request)
    write_audit(actor, "CHUYEN_LOP", safe_change(current, request))
    commit_transaction()
```

Các kiểm tra chồng lấn và thay đổi trạng thái phải chạy trong giao dịch/khóa phù hợp để tránh tạo hai đăng ký đang học do thao tác đồng thời.

## 6. Hành vi giao diện, an toàn và hiệu năng

| Sự kiện | Xử lý |
| --- | --- |
| Chọn niên khóa | Làm mới danh sách kỳ học, xóa lựa chọn kỳ học không thuộc niên khóa. |
| Chọn lớp khi đăng ký | Nạp cấp độ lớp, kiểm tra sơ bộ với học sinh và hiện cảnh báo ngoại lệ. |
| Chuyển lớp | Hiển thị thông tin đăng ký hiện tại và yêu cầu lớp mới/ngày/lý do. |
| Kết thúc/hủy | Yêu cầu xác nhận và lý do khi chính sách bắt buộc; không xóa dòng. |
| Mở chi tiết | Nạp tab/danh sách trong phạm vi quyền, có loading/empty/error độc lập. |

- Danh sách phân trang phía máy chủ; số sĩ số được tổng hợp theo điều kiện hiệu lực, không suy ra từ tổng lịch sử.
- Quyền kiểm tra ở mọi API chi tiết/chuyển trạng thái; URL trực tiếp ngoài phạm vi trả 403/404 theo chính sách.
- Ghi nhật ký tạo/sửa lớp, tạo/chuyển/kết thúc/hủy đăng ký và việc dùng ngoại lệ cấp độ.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-CLS-01 | Tạo lớp với kỳ học không thuộc niên khóa đã chọn. | Bị từ chối, không lưu lớp. |
| TC-CLS-02 | Tạo đăng ký thiếu học sinh/lớp/ngày. | Lỗi kiểm tra tại trường bắt buộc. |
| TC-CLS-03 | Tạo hai đăng ký Đang học chồng lấn cùng học sinh/cùng lớp. | Bị từ chối HTTP 409, không tạo bản ghi trùng. |
| TC-CLS-04 | Đăng ký lớp khác cấp độ không có ngoại lệ duyệt. | Cảnh báo và từ chối lưu. |
| TC-CLS-05 | Đăng ký khác cấp độ có ngoại lệ hợp lệ. | Lưu thành công, truy vết được ngoại lệ. |
| TC-CLS-06 | Chuyển lớp học sinh đang học. | Đăng ký cũ chuyển trạng thái, đăng ký mới được tạo; lịch sử còn nguyên. |
| TC-CLS-07 | Giáo viên truy cập đăng ký ngoài lớp phân công. | Bị từ chối, không trả dữ liệu. |
| TC-CLS-08 | Học sinh xem màn hình đăng ký. | Chỉ thấy đăng ký của chính mình và không có hành động ghi. |
