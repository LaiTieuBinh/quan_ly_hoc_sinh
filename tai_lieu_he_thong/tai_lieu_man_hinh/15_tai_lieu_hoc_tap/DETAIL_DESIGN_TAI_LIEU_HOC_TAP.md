# Detail Design — MH-15 Tài liệu học tập

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-15 |
| Mã chức năng | LEARNING-MATERIAL-MANAGEMENT |
| Điều kiện vào | Người dùng đã xác thực; phạm vi tài liệu được xác định từ vai trò, phân công, đăng ký lớp và cấp độ. |
| Đầu vào | Bộ lọc; metadata tài liệu; tệp hoặc liên kết ngoài; phạm vi phân phối. |
| Đầu ra | Danh sách/chi tiết tài liệu, kết quả tạo/cập nhật, tài nguyên tải được ủy quyền và thống kê tùy chọn. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `TaiLieu` | `id`, `tieu_de`, `loai_nguon`, `external_url`, `chu_de`, `bai_hoc_id`, `ky_nang`, `trang_thai`, `nguoi_tao_id`, thời gian | `loai_nguon`: FILE/EXTERNAL_LINK. |
| `TepTaiLieu` | `id`, `tai_lieu_id`, `ten_hien_thi`, `storage_key`, `mime_type`, `size_bytes`, `checksum` | Không trả `storage_key` cho client. |
| `TaiLieuLopMon` | `tai_lieu_id`, `lop_hoc_id`, `mon_hoc_id` | Phạm vi phân phối theo lớp/môn. |
| `TaiLieuCapDo` | `tai_lieu_id`, `cap_do` | Phạm vi phân phối theo N5–N1. |
| `LuotTruyCapTaiLieu` | tài liệu, người dùng, loại xem/tải, thời điểm | Chỉ ghi khi bật thống kê. |
| `PhanCong`, `DangKyLop`, `HocSinh` | phạm vi lớp/môn/cấp độ/hiệu lực | Nguồn kiểm tra quyền. |

Ràng buộc đề xuất: mỗi tài liệu có đúng một nguồn chính (tệp hoặc external URL); với `FILE` phải có tệp hợp lệ, với `EXTERNAL_LINK` phải có URL hợp lệ; ít nhất một phạm vi phân phối trước trạng thái Hiển thị.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET/POST /api/v1/tai-lieu` | Danh sách và tạo metadata tài liệu. |
| `GET/PATCH /api/v1/tai-lieu/{id}` | Chi tiết/cập nhật tài liệu. |
| `POST /api/v1/tai-lieu/{id}/tep` | Tải tệp nguồn. |
| `POST /api/v1/tai-lieu/{id}/an` | Ẩn/hiển thị tài liệu. |
| `DELETE /api/v1/tai-lieu/{id}` | Xóa mềm tài liệu. |
| `GET /api/v1/tai-lieu/{id}/truy-cap` | Mở/tải tài liệu sau kiểm tra quyền. |
| `GET /api/v1/tai-lieu/{id}/thong-ke` | Lượt xem/tải, khi cấu hình bật. |
| `GET /api/v1/me/tai-lieu` | Tài liệu học sinh hiện tại được phép xem. |

### 3.1. Danh sách và tạo tài liệu

`GET /api/v1/tai-lieu` nhận `q`, `chu_de`, `ky_nang`, `cap_do`, `lop_hoc_id`, `mon_hoc_id`, `trang_thai`, `page`, `page_size`, `sort`. Máy chủ xây dựng phạm vi trước rồi mới áp dụng bộ lọc; học sinh dùng API `me` hoặc cùng API với phạm vi bị cố định theo chính sách.

`POST /api/v1/tai-lieu` yêu cầu `MATERIAL_WRITE`.

```json
{
  "tieu_de": "Từ vựng N5 bài 1",
  "loai_nguon": "FILE",
  "chu_de": "Chào hỏi",
  "bai_hoc_id": 12,
  "ky_nang": "TU_VUNG",
  "lop_mon": [{ "lop_hoc_id": 5, "mon_hoc_id": 3 }],
  "cap_do": ["N5"],
  "trang_thai": "AN"
}
```

`tieu_de`, `loai_nguon`, trạng thái là bắt buộc. Với `EXTERNAL_LINK`, body có thêm `external_url`; với `FILE`, tệp được tải qua endpoint riêng trước khi cho chuyển Hiển thị. Giáo viên chỉ được gán lớp/môn từ phân công của mình. Thành công HTTP 201 trả metadata và audit.

### 3.2. Chi tiết/cập nhật và trạng thái

`GET /api/v1/tai-lieu/{id}` trả metadata, phạm vi cấp, thông tin nguồn an toàn và hành động được phép; không trả URL lưu trữ hoặc URL ký lâu dài.

`PATCH /api/v1/tai-lieu/{id}` yêu cầu người tạo/quản lý tài liệu hoặc quản trị viên. Chỉ cập nhật các trường được gửi; đổi nguồn tuân thủ quy tắc một nguồn chính. Việc chuyển `AN` sang `HIEN_THI` kiểm tra có phạm vi phân phối và nguồn hợp lệ.

`POST /api/v1/tai-lieu/{id}/an` nhận `{ "trang_thai": "AN" | "HIEN_THI" }`, ghi audit. `DELETE /api/v1/tai-lieu/{id}` thực hiện xóa mềm, đặt trạng thái `DA_XOA`, vô hiệu hóa truy cập/tải nhưng giữ metadata và lịch sử.

### 3.3. Tệp và truy cập tài liệu

`POST /api/v1/tai-lieu/{id}/tep` dùng `multipart/form-data`, trường `file`; yêu cầu quyền cập nhật tài liệu. Máy chủ kiểm tra MIME thực tế, phần mở rộng, kích thước, tên tệp, quét an toàn và lưu trong kho riêng. Thành công HTTP 201 trả `id`, tên hiển thị, MIME, kích thước; không trả `storage_key`.

`GET /api/v1/tai-lieu/{id}/truy-cap` xác minh: trạng thái Hiển thị (hoặc quyền quản lý), phạm vi lớp/môn/cấp độ và quyền người gọi. Với FILE, trả stream hoặc URL ký ngắn hạn; với EXTERNAL_LINK, trả URL đã được kiểm tra giao thức/domain. Nếu bật thống kê, ghi một lượt xem/tải sau khi xác thực.

`GET /api/v1/me/tai-lieu` cố định học sinh theo tài khoản phiên, chỉ trả tài liệu Hiển thị của lớp đăng ký hiệu lực hoặc được cấp theo cấp độ hiện tại; hỗ trợ lọc/tìm kiếm trong phạm vi này.

### 3.4. Thống kê

`GET /api/v1/tai-lieu/{id}/thong-ke` yêu cầu `MATERIAL_ANALYTICS_READ` và quyền quản lý tài liệu; trả tổng lượt xem/tải, khoảng thời gian và dữ liệu tổng hợp. Không trả danh tính người học nếu không có quyền/pháp lý cho phép.

### 3.5. Quy ước chung, quyền và mã lỗi

- Base URL: `/api/v1`; quyền `MATERIAL_READ`, `MATERIAL_WRITE`, `MATERIAL_DELETE`, `MATERIAL_DOWNLOAD`, `MATERIAL_ANALYTICS_READ` kiểm tra độc lập cùng scope lớp/môn/cấp độ.
- Enum nguồn: `FILE`, `EXTERNAL_LINK`; trạng thái `HIEN_THI`, `AN`, `DA_XOA`. List mặc định page 1/20, tối đa 100; mọi tệp dùng kho riêng/URL ký ngắn hạn, không trả `storage_key`.

| HTTP | Mã lỗi | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật/upload thành công. |
| 401/403 | `UNAUTHENTICATED`, `MATERIAL_FORBIDDEN` | Không có phiên/quyền/phạm vi. |
| 404 | `MATERIAL_NOT_FOUND`, `MATERIAL_FILE_NOT_FOUND` | Tài liệu/tệp không tồn tại. |
| 409 | `MATERIAL_NOT_READY_TO_PUBLISH` | Chưa có nguồn/phạm vi hợp lệ để hiển thị. |
| 422 | `VALIDATION_ERROR`, `INVALID_MATERIAL_FILE`, `INVALID_EXTERNAL_URL` | Dữ liệu/tệp/liên kết sai. |

### 3.6. Chi tiết API danh sách, metadata và trạng thái

#### `GET /api/v1/tai-lieu`

**Quyền:** `MATERIAL_READ` và scope. Query đầy đủ ở 3.1, hỗ trợ thêm `loai_nguon`, `nguoi_tao_id`, `bai_hoc_id`, `include=access_count`. Response trả metadata an toàn, phạm vi phân phối rút gọn, trạng thái, người tạo và hành động được phép; học sinh chỉ nhận Hiển thị trong scope.

#### `POST /api/v1/tai-lieu`, `GET/PATCH /api/v1/tai-lieu/{id}`

`POST` cần `MATERIAL_WRITE`, tạo metadata Nháp/Ẩn theo payload 3.1. `GET` kiểm tra quyền tài liệu. `PATCH` chỉ nhận trường thay đổi (tiêu đề, nguồn, phạm vi, phân loại, trạng thái), kiểm tra một nguồn chính và phạm vi trước khi Hiển thị; giáo viên chỉ sửa tài liệu do mình quản lý. Thành công 201/200 có audit.

#### `POST /api/v1/tai-lieu/{id}/an` và `DELETE /api/v1/tai-lieu/{id}`

`/an` cần quyền ghi, body `{ "trang_thai":"AN"|"HIEN_THI" }`; chuyển Hiển thị kiểm tra nguồn/phạm vi. `DELETE` cần `MATERIAL_DELETE`, xóa mềm thành `DA_XOA`, vô hiệu truy cập/tải nhưng giữ audit; trả HTTP 204.

### 3.7. Chi tiết API tệp, truy cập và thống kê

#### `POST /api/v1/tai-lieu/{id}/tep`

**Quyền:** `MATERIAL_WRITE`. `multipart/form-data`, field `file` bắt buộc; metadata tùy chọn `ten_hien_thi`. Server kiểm tra MIME thực tế, extension, kích thước, tên tệp, quét an toàn NFR-03 và trả HTTP 201 metadata `{id, ten_hien_thi, mime_type, size_bytes}`.

#### `GET /api/v1/tai-lieu/{id}/truy-cap`

**Quyền:** `MATERIAL_DOWNLOAD` và scope. Query `action=VIEW|DOWNLOAD` tùy chọn. Server kiểm tra trạng thái/matches scope rồi trả stream hoặc URL ký ngắn hạn (FILE), hoặc URL ngoài đã allowlist/sanitize (EXTERNAL_LINK). Nếu bật thống kê, ghi lượt xem/tải sau khi xác thực.

#### `GET /api/v1/tai-lieu/{id}/thong-ke`

**Quyền:** `MATERIAL_ANALYTICS_READ` + quyền quản lý tài liệu. Query `tu_ngay`, `den_ngay`, `group_by=DAY|TYPE`; trả tổng lượt xem/tải, không trả danh tính người học trừ quyền/chính sách rõ ràng.

#### `GET /api/v1/me/tai-lieu`

**Quyền:** học sinh phiên; không nhận `hoc_sinh_id`. Query `q`, `chu_de`, `ky_nang`, `cap_do`, `lop_hoc_id`, `mon_hoc_id`, `page`, `page_size`; scope cố định lớp đăng ký hiệu lực/cấp độ hiện tại và trạng thái Hiển thị.

### 3.8. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET/POST /tai-lieu` | Đọc/ghi + scope | Danh sách/tạo metadata. | 200/201 |
| `GET/PATCH /tai-lieu/{id}` | Đọc/ghi + scope | Chi tiết/cập nhật. | 200 |
| `POST /.../{id}/tep` | Ghi + scope | Upload tệp nguồn. | 201 |
| `POST /.../{id}/an`, `DELETE /.../{id}` | Ghi/xóa + scope | Ẩn-hiển thị/xóa mềm. | 200/204 |
| `GET /.../{id}/truy-cap` | Tải + scope | Mở/tải tài liệu an toàn. | 200/redirect ký |
| `GET /.../{id}/thong-ke` | Phân tích + quản lý | Thống kê lượt truy cập. | 200 |
| `GET /me/tai-lieu` | Học sinh phiên | Danh sách tài liệu cá nhân. | 200 |

## 4. Quy tắc nghiệp vụ và phân quyền

| Mã | Quy tắc |
| --- | --- |
| MAT-ACL-01 | Giáo viên chỉ tạo/cập nhật/ẩn/xóa tài liệu do mình quản lý, trong lớp/môn phân công; quản trị viên có toàn quyền. |
| MAT-ACL-02 | Học sinh chỉ xem/tải tài liệu Hiển thị cấp cho lớp có đăng ký hiệu lực hoặc cấp độ phù hợp. |
| MAT-BR-01 | Tài liệu có một nguồn chính: FILE hoặc EXTERNAL_LINK; không nhận cả hai nguồn chính đồng thời. |
| MAT-BR-02 | Trước khi Hiển thị phải có nguồn hợp lệ và ít nhất một phạm vi phân phối, trừ tài liệu hệ thống được cấu hình riêng. |
| MAT-BR-03 | Tệp kiểm tra an toàn, MIME, kích thước và quyền theo NFR-03; metadata an toàn mới được trả về. |
| MAT-BR-04 | URL ngoài chỉ dùng giao thức/domain hợp lệ; máy chủ không tự tải URL tùy ý. |
| MAT-BR-05 | `AN` và `DA_XOA` không phân phối cho học sinh; xóa là xóa mềm, bảo toàn audit. |
| MAT-BR-06 | Thống kê lượt xem/tải chỉ ghi sau khi kiểm tra quyền; không làm rò rỉ lịch sử người học. |

## 5. Pseudocode kiểm tra truy cập

```text
access_material(session_user, material_id):
    material = get_material(material_id)
    if manager_can_access(session_user, material): return material
    require(material.status == HIEN_THI)
    if session_user.role == HOC_SINH:
        scope = student_active_classes_and_level(session_user.hoc_sinh_id)
        require(material_matches_scope(material, scope))
    else:
        require(material_in_authorized_scope(session_user, material))
    log_view_or_download_if_enabled(session_user, material)
    return safe_delivery(material)
```

## 6. Hành vi giao diện, hiệu năng và an toàn

| Sự kiện | Xử lý |
| --- | --- |
| Chọn loại nguồn | Hiển thị trường tệp hoặc URL, xóa/khóa lựa chọn nguồn không tương thích. |
| Chọn lớp/môn | Giáo viên chỉ nhận tổ hợp phân công hiệu lực. |
| Chuyển Hiển thị | Kiểm tra nguồn/phạm vi trước khi gọi API. |
| Tải tệp | Kiểm tra sơ bộ phía client, sau đó chờ phản hồi kiểm tra phía máy chủ. |
| Xem/tải | Luôn gọi endpoint truy cập được ủy quyền. |

- Danh sách tìm kiếm/phân trang phía máy chủ; không gửi toàn bộ tài liệu để lọc trên client.
- Tệp đặt kho riêng, URL ký nếu dùng phải ngắn hạn; không log nội dung tệp, storage key hoặc URL ký.
- Ghi audit tạo/sửa/ẩn/xóa/tải tệp và thay đổi phạm vi phân phối.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-MAT-01 | Giáo viên tạo tài liệu cho lớp/môn ngoài phân công. | HTTP 403, không tạo tài liệu. |
| TC-MAT-02 | Tạo tài liệu FILE không có tệp hoặc EXTERNAL_LINK có URL sai. | Bị từ chối trước khi Hiển thị. |
| TC-MAT-03 | Chuyển Hiển thị khi không có phạm vi phân phối. | Lỗi nghiệp vụ, không phân phối tài liệu. |
| TC-MAT-04 | Tải tệp sai MIME/vượt giới hạn. | HTTP 422, không lưu tệp. |
| TC-MAT-05 | Học sinh thấy tài liệu Ẩn/Đã xóa hoặc ngoài lớp/cấp độ. | Không nhận dữ liệu/tệp. |
| TC-MAT-06 | Học sinh truy cập ID tài liệu ngoài phạm vi. | Bị từ chối, không rò rỉ metadata/URL. |
| TC-MAT-07 | Giáo viên cố sửa/xóa tài liệu của giáo viên khác. | HTTP 403, không thay đổi dữ liệu. |
| TC-MAT-08 | Bật thống kê và xem/tải hợp lệ. | Tăng số liệu đúng, không lộ danh tính ngoài quyền. |
