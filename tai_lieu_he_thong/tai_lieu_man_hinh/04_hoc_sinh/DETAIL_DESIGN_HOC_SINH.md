# Detail Design — MH-04 Quản lý học sinh

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-04 |
| Mã chức năng | STUDENT-MANAGEMENT |
| Điều kiện vào | Người dùng đã xác thực; quyền xem/ghi được kiểm tra theo vai trò và phạm vi dữ liệu. |
| Đầu vào | Bộ lọc danh sách; dữ liệu hồ sơ; tệp ảnh; mã hồ sơ cần xem. |
| Đầu ra | Danh sách học sinh, chi tiết hồ sơ, trạng thái cập nhật và dữ liệu các tab theo quyền. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `HocSinh` | `id`, `ma_hoc_sinh`, `ho_ten`, `ngay_sinh`, `gioi_tinh`, `anh_url`, `dien_thoai`, `email`, `dia_chi`, `nguoi_giam_ho`, `trang_thai`, `cap_do_hien_tai`, `created_at`, `updated_at` | `ma_hoc_sinh` duy nhất. |
| `LichSuCapDo` | `id`, `hoc_sinh_id`, `cap_do`, `tu_ngay`, `den_ngay`, `ghi_chu` | Theo dõi thay đổi cấp độ. |
| `DangKyLop` | `id`, `hoc_sinh_id`, `lop_hoc_id`, `trang_thai`, `tu_ngay`, `den_ngay` | Nguồn lớp đang học/lịch sử lớp. |
| `PhanCong` | `giao_vien_id`, `lop_hoc_id`, `trang_thai`, khoảng hiệu lực | Xác định phạm vi học sinh của giáo viên. |
| `TaiKhoan` | `id`, `hoc_sinh_id`, `vai_tro` | Xác định học sinh được phép xem hồ sơ của chính mình. |

## 3. Hợp đồng API đề xuất

### 3.1. Quy ước chung

- Base URL: `/api/v1`; tất cả endpoint yêu cầu phiên hợp lệ. Máy chủ xây dựng `scope` từ vai trò: Quản trị viên/Nhân viên theo quyền, Giáo viên từ `PhanCong` hiệu lực, Học sinh từ `hoc_sinh_id` liên kết tài khoản.
- Giáo viên chỉ có quyền đọc hồ sơ thuộc scope; quyền tạo/sửa là `STUDENT_WRITE` và không mặc định cấp cho giáo viên/học sinh. Mỗi API tab kiểm tra quyền độc lập.
- Request/response JSON UTF-8, trừ upload ảnh dùng `multipart/form-data`. Ngày `YYYY-MM-DD`, ngày giờ ISO-8601 có offset. Danh sách mặc định `page=1`, `page_size=20`, tối đa 100.
- Không có API xóa cứng học sinh. Các điều chỉnh trạng thái/cấp độ cần audit; mọi dữ liệu liên hệ/ảnh trả về theo quyền tối thiểu.
- Lỗi chuẩn:

```json
{
  "error": {
    "code": "STUDENT_OUT_OF_SCOPE",
    "message": "Bạn không có quyền truy cập hồ sơ học sinh này.",
    "fields": {}
  }
}
```

| HTTP | Mã lỗi điển hình | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật thành công. |
| 400 | `INVALID_QUERY` | Tham số lọc sai định dạng/quan hệ. |
| 401 | `UNAUTHENTICATED` | Phiên không hợp lệ. |
| 403 | `STUDENT_OUT_OF_SCOPE`, `TAB_FORBIDDEN` | Ngoài phạm vi hồ sơ hoặc không có quyền tab. |
| 404 | `STUDENT_NOT_FOUND` | Hồ sơ không tồn tại/không công bố. |
| 409 | `STUDENT_CODE_ALREADY_EXISTS` | Mã học sinh trùng hoặc xung đột đồng thời. |
| 422 | `VALIDATION_ERROR`, `INVALID_AVATAR_FILE` | Dữ liệu biểu mẫu/ảnh không hợp lệ. |

### 3.2. `GET /api/v1/hoc-sinh` — Danh sách học sinh

**Quyền:** `STUDENT_READ`; máy chủ tự áp dụng scope.

| Query parameter | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `q` | chuỗi | Không | Mã hoặc họ tên, tìm gần đúng. |
| `trang_thai` | enum | Không | `DANG_HOC`, `BAO_LUU`, `NGHI_HOC`. |
| `cap_do` | enum | Không | `N5`, `N4`, `N3`, `N2`, `N1`. |
| `lop_hoc_id` | số nguyên | Không | Phải thuộc phạm vi có quyền. |
| `nien_khoa_id` / `ky_hoc_id` | số nguyên | Không | Kỳ học phải thuộc niên khóa nếu cùng truyền. |
| `page` / `page_size` | số nguyên | Không | Mặc định 1/20; `page_size` tối đa 100. |
| `sort` | chuỗi | Không | `ma_hoc_sinh`, `ho_ten`, `created_at`, `updated_at`; tiền tố `-` là giảm dần. |
| `include` | chuỗi CSV | Không | Tùy chọn `lop_dang_hoc`, `lien_he`; trường nhạy cảm chỉ trả khi có quyền. |

**Phản hồi HTTP 200**

```json
{
  "data": [
    {
      "id": 21,
      "ma_hoc_sinh": "HS001",
      "ho_ten": "Trần Minh Anh",
      "ngay_sinh": "2008-05-12",
      "lien_he": { "dien_thoai": "0900000000", "email": "minhanh@example.com" },
      "trang_thai": "DANG_HOC",
      "cap_do_hien_tai": "N5",
      "lop_dang_hoc": [{ "id": 5, "ma": "N5-01", "ten": "N5 Kỳ 1" }]
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 1, "total_pages": 1 }
}
```

Học sinh không gọi danh sách chung để tra cứu người khác; hệ thống có thể chuyển hướng dùng `/api/v1/me/hoc-sinh` hoặc cố định scope chỉ còn bản thân theo chính sách.

### 3.3. `POST /api/v1/hoc-sinh` — Tạo hồ sơ học sinh

**Quyền:** `STUDENT_WRITE`.

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `ma_hoc_sinh` | chuỗi | Có | Duy nhất, trim/chuẩn hóa trước kiểm tra. |
| `ho_ten` | chuỗi | Có | Không rỗng sau chuẩn hóa. |
| `ngay_sinh` | ngày | Có | Ngày hợp lệ, không ở tương lai. |
| `gioi_tinh` | enum | Không | Giá trị danh mục cấu hình. |
| `dien_thoai`, `email` | chuỗi | Không | Kiểm tra định dạng nếu có. |
| `dia_chi`, `nguoi_giam_ho` | chuỗi | Không | Giới hạn độ dài cấu hình. |
| `trang_thai` | enum | Có | `DANG_HOC`, `BAO_LUU`, `NGHI_HOC`. |
| `cap_do_hien_tai` | enum/null | Có điều kiện | Bắt buộc N5–N1 khi `DANG_HOC`. |

```json
{
  "ma_hoc_sinh": "HS001",
  "ho_ten": "Trần Minh Anh",
  "ngay_sinh": "2008-05-12",
  "gioi_tinh": "NU",
  "dien_thoai": "0900000000",
  "email": "minhanh@example.com",
  "dia_chi": "...",
  "nguoi_giam_ho": "...",
  "trang_thai": "DANG_HOC",
  "cap_do_hien_tai": "N5"
}
```

Máy chủ tạo hồ sơ/audit trong giao dịch. Thành công HTTP 201 trả hồ sơ an toàn, không trả dữ liệu người dùng khác hoặc liên kết tài khoản nhạy cảm.

### 3.4. `GET /api/v1/hoc-sinh/{id}` — Chi tiết thông tin chung

**Quyền:** `STUDENT_READ` và hồ sơ nằm trong scope. Trả các trường thông tin chung được phép hiển thị, ảnh đại diện qua URL truy cập có kiểm tra quyền hoặc metadata an toàn, trạng thái/cấp độ và danh sách tab người dùng được mở.

```json
{
  "data": {
    "id": 21,
    "ma_hoc_sinh": "HS001",
    "ho_ten": "Trần Minh Anh",
    "ngay_sinh": "2008-05-12",
    "gioi_tinh": "NU",
    "anh": { "co_anh": true, "url_truy_cap": "/api/v1/hoc-sinh/21/anh" },
    "lien_he": { "dien_thoai": "0900000000", "email": "minhanh@example.com", "dia_chi": "..." },
    "trang_thai": "DANG_HOC",
    "cap_do_hien_tai": "N5",
    "tabs_duoc_phep": ["LICH_SU_CAP_DO", "DANG_KY_LOP", "CHUYEN_CAN", "DIEM", "BAI_TAP"]
  }
}
```

### 3.5. `PATCH /api/v1/hoc-sinh/{id}` — Cập nhật hồ sơ

**Quyền:** `STUDENT_WRITE` và scope ghi phù hợp. Chỉ gửi các trường cần sửa; không có trường xóa cứng.

```json
{
  "dien_thoai": "0911111111",
  "trang_thai": "BAO_LUU",
  "cap_do_hien_tai": null
}
```

Máy chủ kiểm tra lại ngày sinh, mã duy nhất, trạng thái/cấp độ và ảnh hưởng dữ liệu phát sinh. Nếu đổi trạng thái/cấp độ, tạo dấu vết lịch sử/audit. Thành công HTTP 200 trả hồ sơ mới nhất; mã trùng trả 409; học sinh đang học thiếu cấp độ trả 422.

### 3.6. `POST /api/v1/hoc-sinh/{id}/anh` và `GET /api/v1/hoc-sinh/{id}/anh` — Ảnh đại diện

**Quyền upload:** `STUDENT_WRITE`; **quyền xem:** `STUDENT_READ` trong scope. Upload dùng `multipart/form-data`, trường `anh`.

Máy chủ kiểm tra MIME thực tế, phần mở rộng cho phép, kích thước tối đa, tên tệp đã làm sạch và quét an toàn trước khi lưu kho riêng. Thành công HTTP 201 trả metadata:

```json
{
  "data": {
    "ten_hien_thi": "hs001.jpg",
    "mime_type": "image/jpeg",
    "size_bytes": 142031,
    "url_truy_cap": "/api/v1/hoc-sinh/21/anh"
  }
}
```

`GET` kiểm tra quyền trước khi stream ảnh hoặc phát URL ký ngắn hạn; không trả `storage_key`. Upload thay ảnh giữ/xóa phiên bản cũ theo chính sách lưu trữ và luôn ghi audit.

### 3.7. `GET /api/v1/hoc-sinh/{id}/lich-su-cap-do` — Tab lịch sử cấp độ

**Quyền:** `STUDENT_LEVEL_HISTORY_READ` và scope hồ sơ. Query: `tu_ngay`, `den_ngay`, `page`, `page_size`; trả cấp độ cũ/mới hoặc cấp độ, ngày áp dụng, lý do/ghi chú, người thực hiện và thời gian thao tác theo quyền hiển thị.

Phản hồi HTTP 200 dùng cấu trúc `{ data: [], meta: { page, page_size, total } }`, sắp xếp `ngay_ap_dung` giảm dần. Học sinh chỉ xem dữ liệu lịch sử của chính mình và chỉ các trường chính sách cho phép.

### 3.8. `GET /api/v1/hoc-sinh/{id}/dang-ky-lop` — Tab đăng ký lớp

**Quyền:** `STUDENT_ENROLLMENT_READ` và scope hồ sơ.

| Query parameter | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `nien_khoa_id`, `ky_hoc_id`, `lop_hoc_id` | số nguyên | Không | Thu hẹp danh sách, kỳ học phải thuộc niên khóa. |
| `trang_thai` | enum | Không | Trạng thái đăng ký lớp. |
| `tu_ngay`, `den_ngay`, `page`, `page_size` | ngày/số | Không | Lọc hiệu lực và phân trang. |

Mỗi dòng trả lớp, cấp độ, niên khóa/kỳ học, trạng thái, từ/đến ngày và ghi chú theo quyền. Không trả danh sách học sinh khác trong lớp qua endpoint này.

### 3.9. `GET /api/v1/hoc-sinh/{id}/chuyen-can` — Tab chuyên cần

**Quyền:** `STUDENT_ATTENDANCE_READ` và scope hồ sơ. Query: `lop_hoc_id`, `nien_khoa_id`, `ky_hoc_id`, `tu_ngay`, `den_ngay`, `include_details`, `page`, `page_size`.

Phản hồi trả tổng số buổi, số buổi theo trạng thái, tỷ lệ chuyên cần, phiên bản cấu hình BR-06 và danh sách điểm danh nếu `include_details=true`:

```json
{
  "data": {
    "tong_hop": { "tong_buoi": 10, "co_mat": 8, "di_muon": 1, "vang_co_phep": 1, "ty_le_chuyen_can": 90.0 },
    "quy_tac": { "phien_ban": "BR-06-v1" },
    "chi_tiet": []
  }
}
```

Tỷ lệ được tính tại máy chủ theo cấu hình, không nhận giá trị/công thức từ client.

### 3.10. `GET /api/v1/hoc-sinh/{id}/diem` — Tab điểm

**Quyền:** `STUDENT_GRADE_READ` và scope hồ sơ. Query: `lop_hoc_id`, `mon_hoc_id`, `ky_hoc_id`, `ky_nang`, `dot_danh_gia_id`, `tu_ngay`, `den_ngay`, `page`, `page_size`.

Trả đợt đánh giá, lớp/môn/kỹ năng, ngày, điểm, xếp loại, nhận xét và trạng thái công bố theo quyền. Với học sinh, chỉ trả kết quả `DA_CONG_BO`; giáo viên/nhân viên vẫn bị giới hạn quyền xem điểm.

### 3.11. `GET /api/v1/hoc-sinh/{id}/hoc-phi` — Tab học phí

**Quyền:** `STUDENT_FEE_READ` và scope hồ sơ; đây là quyền tách biệt, không suy ra từ quyền xem hồ sơ.

Query: `ky_hoc_id`, `trang_thai`, `tu_han`, `den_han`, `include_transactions`, `page`, `page_size`. Phản hồi trả nghĩa vụ, số phải thu/miễn giảm/đã thu/còn nợ, hạn thu/trạng thái và giao dịch/phiếu thu khi được phép. Dùng decimal chính xác; học sinh chỉ xem nghĩa vụ của mình, không xem báo cáo lớp/tổng doanh thu.

### 3.12. `GET /api/v1/hoc-sinh/{id}/bai-tap` — Tab bài tập

**Quyền:** `STUDENT_HOMEWORK_READ` và scope hồ sơ. Query: `lop_hoc_id`, `mon_hoc_id`, `trang_thai_bai_tap`, `trang_thai_nop`, `tu_ngay`, `den_ngay`, `page`, `page_size`.

Trả bài tập thuộc lớp, hạn nộp/trạng thái, trạng thái bài nộp, đúng/trễ hạn, điểm/nhận xét chỉ khi được trả bài. Học sinh chỉ nhận bài tập/bài nộp của bản thân; tệp luôn qua endpoint quyền riêng của MH-14.

### 3.13. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET /hoc-sinh` | `STUDENT_READ` | Danh sách đã scope/lọc. | 200 |
| `POST /hoc-sinh` | `STUDENT_WRITE` | Tạo hồ sơ. | 201 |
| `GET/PATCH /hoc-sinh/{id}` | Quyền đọc/ghi + scope | Chi tiết/cập nhật. | 200 |
| `POST/GET /hoc-sinh/{id}/anh` | Quyền ghi/đọc + scope | Upload/xem ảnh. | 201/200 |
| `GET /hoc-sinh/{id}/lich-su-cap-do` | Quyền tab + scope | Lịch sử cấp độ. | 200 |
| `GET /hoc-sinh/{id}/dang-ky-lop` | Quyền tab + scope | Lịch sử đăng ký lớp. | 200 |
| `GET /hoc-sinh/{id}/chuyen-can` | Quyền tab + scope | Tổng hợp/chi tiết chuyên cần. | 200 |
| `GET /hoc-sinh/{id}/diem` | Quyền tab + scope | Điểm/kết quả. | 200 |
| `GET /hoc-sinh/{id}/hoc-phi` | Quyền tài chính + scope | Nghĩa vụ/giao dịch. | 200 |
| `GET /hoc-sinh/{id}/bai-tap` | Quyền tab + scope | Bài tập/bài nộp. | 200 |

## 4. Phạm vi dữ liệu và quy tắc nghiệp vụ

| Mã | Quy tắc |
| --- | --- |
| STU-ACL-01 | Quản trị viên xem/ghi toàn bộ hồ sơ; Nhân viên theo quyền được cấp. |
| STU-ACL-02 | Giáo viên chỉ được đọc học sinh có đăng ký lớp hiệu lực thuộc phân công hiệu lực của mình. |
| STU-ACL-03 | Học sinh chỉ được đọc hồ sơ có `id` trùng `hoc_sinh_id` liên kết với tài khoản phiên. |
| STU-ACL-04 | Quyền của từng tab được kiểm tra độc lập, không suy diễn từ việc được xem thông tin chung. |
| STU-BR-01 | `ma_hoc_sinh`, `ho_ten`, `ngay_sinh`, `trang_thai` là bắt buộc; mã học sinh duy nhất. |
| STU-BR-02 | `ngay_sinh` phải là ngày hợp lệ, không lớn hơn ngày hiện tại. |
| STU-BR-03 | Khi `trang_thai = DANG_HOC`, `cap_do_hien_tai` bắt buộc thuộc N5, N4, N3, N2, N1. |
| STU-BR-04 | Ảnh phải thuộc loại ảnh được cấu hình, kiểm tra MIME thực tế, kích thước và quét an toàn trước khi công bố. |
| STU-BR-05 | Không có API xóa cứng. Nếu cần ngừng sử dụng hồ sơ, chuyển trạng thái sang `BAO_LUU` hoặc `NGHI_HOC`. |
| STU-BR-06 | Thay đổi trạng thái/cấp độ phải được ghi vết; không được làm mất dữ liệu đăng ký lớp, điểm danh, điểm, học phí hay bài tập. |
| STU-FLT-01 | `ky_hoc_id` phải thuộc `nien_khoa_id`; `lop_hoc_id` phải thỏa phạm vi quyền và bộ lọc học vụ. |

## 5. Pseudocode kiểm tra phạm vi

```text
build_student_scope(session_user):
    if session_user.role in [QUAN_TRI_VIEN, NHAN_VIEN]:
        return scope_from_granted_permissions(session_user)
    if session_user.role == GIAO_VIEN:
        return students_in_active_assigned_classes(session_user.giao_vien_id)
    if session_user.role == HOC_SINH:
        return only_student(session_user.hoc_sinh_id)
    deny_access()

get_student(session_user, student_id, tab):
    scope = build_student_scope(session_user)
    require_student_in_scope(student_id, scope)
    require_tab_permission(session_user, tab)
    return query_tab_data(student_id, tab, scope)
```

Điều kiện phạm vi phải được đưa trực tiếp vào truy vấn dữ liệu, không tải toàn bộ hồ sơ rồi lọc tại giao diện.

## 6. Xử lý biểu mẫu và ảnh

| Sự kiện | Xử lý |
| --- | --- |
| Nhập mã học sinh | Chuẩn hóa khoảng trắng; kiểm tra trùng phía máy chủ khi lưu. |
| Chọn trạng thái Đang học | Bắt buộc hiển thị và kiểm tra cấp độ hiện tại. |
| Chọn trạng thái Bảo lưu/Nghỉ học | Cho phép cấp độ rỗng theo chính sách; dữ liệu lịch sử không bị xóa. |
| Chọn ảnh | Kiểm tra loại/kích thước phía trình duyệt để phản hồi sớm, sau đó kiểm tra lại tại máy chủ. |
| Lưu biểu mẫu | Khóa nút chống gửi lặp; hiển thị lỗi tại trường; tải lại chi tiết sau thành công. |
| Mở tab | Tải độc lập, có trạng thái loading/empty/error riêng. |

## 7. An toàn, hiệu năng và nhật ký

- Dữ liệu liên hệ và ảnh được bảo vệ bằng kiểm tra quyền ở cả API danh sách, chi tiết và URL tải tệp.
- Không dùng ID từ client để mở rộng quyền của Giáo viên/Học sinh; đường dẫn trực tiếp tới hồ sơ ngoài phạm vi trả HTTP 403 hoặc 404 theo chính sách thống nhất.
- Dùng phân trang phía máy chủ, truy vấn theo phạm vi quyền và chỉ nạp tab khi người dùng mở tab.
- Ghi nhật ký tạo/sửa/đổi trạng thái và tải ảnh với người thực hiện, thời điểm, đối tượng và trường thay đổi an toàn.

## 8. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-STU-01 | Quản trị viên lọc theo trạng thái, cấp độ, lớp và kỳ học hợp lệ. | Danh sách đúng điều kiện, phân trang chính xác. |
| TC-STU-02 | Tạo hồ sơ với mã học sinh trùng. | Bị từ chối; không tạo bản ghi. |
| TC-STU-03 | Tạo/sửa học sinh Đang học không có cấp độ. | Hiển thị lỗi kiểm tra và không lưu. |
| TC-STU-04 | Nhập ngày sinh không hợp lệ hoặc ở tương lai. | Hiển thị lỗi tại trường ngày sinh. |
| TC-STU-05 | Giáo viên truy cập hồ sơ học sinh ngoài lớp được phân công qua URL/API. | Bị từ chối, không trả dữ liệu. |
| TC-STU-06 | Học sinh truy cập hồ sơ của học sinh khác. | Bị từ chối, không trả dữ liệu. |
| TC-STU-07 | Tải tệp không phải ảnh hoặc vượt giới hạn. | Bị từ chối, không thay đổi ảnh hiện tại. |
| TC-STU-08 | Chuyển học sinh có dữ liệu phát sinh sang Nghỉ học. | Thành công, dữ liệu lịch sử và các tab vẫn truy vết được. |
| TC-STU-09 | Người không có quyền học phí mở tab Học phí. | Tab/API bị ẩn hoặc từ chối theo quyền, không lộ dữ liệu. |
