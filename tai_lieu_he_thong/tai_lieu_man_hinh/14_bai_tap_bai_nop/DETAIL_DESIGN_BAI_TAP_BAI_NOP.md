# Detail Design — MH-14 Bài tập và bài nộp

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-14 |
| Mã chức năng | HOMEWORK-AND-SUBMISSION |
| Điều kiện vào | Người dùng đã xác thực, có phân công giảng dạy hoặc đăng ký lớp hợp lệ/phân quyền tương ứng. |
| Đầu vào | Dữ liệu bài tập, nội dung/tệp bài nộp, điểm/nhận xét, bộ lọc. |
| Đầu ra | Bài tập, bài nộp, trạng thái đúng/trễ hạn, kết quả chấm và tài nguyên tệp được ủy quyền. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `BaiTap` | `id`, `lop_hoc_id`, `mon_hoc_id`, `phan_cong_id`, `tieu_de`, `mo_ta`, `han_nop`, `trang_thai`, `thang_diem`, `created_by`, thời gian | Bài tập theo lớp/môn. |
| `TepBaiTap` | `bai_tap_id`, metadata tệp an toàn | Tệp đính kèm đề bài. |
| `BaiNop` | `id`, `bai_tap_id`, `hoc_sinh_id`, `noi_dung`, `thoi_diem_nop`, `trang_thai_han`, `trang_thai_cham`, `diem`, `nhan_xet`, thời gian | Unique `(bai_tap_id, hoc_sinh_id)`. |
| `TepBaiNop`, `TepPhanHoi` | Khóa bài nộp, metadata tệp | Tệp nộp/phản hồi được bảo vệ quyền. |
| `DangKyLop`, `PhanCong` | học sinh/lớp và giáo viên/lớp/môn, hiệu lực | Kiểm tra phạm vi quyền/phân phối bài. |

Chỉ mục đề xuất: `BaiTap(lop_hoc_id, mon_hoc_id, trang_thai, han_nop)`, `BaiNop(bai_tap_id, hoc_sinh_id)` unique, `BaiNop(hoc_sinh_id, thoi_diem_nop)`.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET/POST /api/v1/bai-tap` | Danh sách và tạo bài tập. |
| `GET/PATCH /api/v1/bai-tap/{id}` | Chi tiết/cập nhật bài tập. |
| `POST /api/v1/bai-tap/{id}/giao` | Chuyển bài từ Nháp sang Đã giao. |
| `POST /api/v1/bai-tap/{id}/dong-nop` | Đóng nộp/mở lại theo quyền. |
| `GET /api/v1/bai-tap/{id}/bai-nop` | Danh sách bài nộp phục vụ giáo viên. |
| `GET/PUT /api/v1/bai-tap/{id}/bai-nop/me` | Xem/nộp/cập nhật bài nộp của học sinh hiện tại. |
| `PATCH /api/v1/bai-nop/{id}/cham` | Chấm và trả bài. |
| `POST /api/v1/bai-tap/{id}/tep` | Tải tệp đề bài. |
| `POST /api/v1/bai-nop/{id}/tep` | Tải tệp bài nộp/phản hồi theo luồng được phép. |
| `GET /api/v1/tep-bai-tap/{file_id}/tai-xuong` | Tải tệp sau kiểm tra quyền. |

### 3.1. Bài tập và trạng thái giao/đóng

`POST /api/v1/bai-tap` yêu cầu `HOMEWORK_WRITE`; giáo viên phải có phân công hiệu lực lớp/môn.

```json
{
  "lop_hoc_id": 5,
  "mon_hoc_id": 3,
  "tieu_de": "Bài nghe tuần 2",
  "mo_ta": "Hoàn thành câu 1 đến câu 10.",
  "han_nop": "2026-09-20T23:59:00+07:00",
  "thang_diem": 10,
  "trang_thai": "NHAP"
}
```

`PATCH /api/v1/bai-tap/{id}` chỉ cho phép thay đổi trường theo trạng thái/chính sách. `POST .../{id}/giao` kiểm tra có lớp/môn/phân công, hạn nộp và chuyển `NHAP` sang `DA_GIAO`; từ thời điểm này chỉ học sinh thuộc lớp hợp lệ mới nhìn thấy bài. `POST .../{id}/dong-nop` nhận `{ "hanh_dong": "DONG" | "MO_LAI", "ly_do": "..." }`; đóng/mở lại được ghi audit, mở lại cần quyền phù hợp.

### 3.2. Nộp bài của học sinh

`GET /api/v1/bai-tap/{id}/bai-nop/me` cố định học sinh theo phiên, chỉ trả bài được giao cho lớp có đăng ký hiệu lực và bài nộp của chính mình.

`PUT /api/v1/bai-tap/{id}/bai-nop/me` nhận nội dung/tệp đã tải trước đó:

```json
{
  "noi_dung": "Bài làm của em...",
  "tep_ids": [88, 89]
}
```

Máy chủ kiểm tra bài đang `DA_GIAO`, học sinh thuộc đối tượng nhận bài và chưa `DONG_NOP`; yêu cầu có nội dung hoặc ít nhất một tệp. Server đóng dấu `thoi_diem_nop`, tự tính `DUNG_HAN` khi `thoi_diem_nop <= han_nop`, ngược lại `TRE_HAN`; upsert một `BaiNop` duy nhất. Nếu chính sách cho phép cập nhật, chỉ cập nhật bản ghi này trước khi đóng và lưu lịch sử phiên bản/audit.

### 3.3. Danh sách và chấm bài

`GET /api/v1/bai-tap/{id}/bai-nop` yêu cầu `HOMEWORK_GRADE`; trả bài nộp của các học sinh nhận bài, có phân trang/lọc theo hạn/chấm bài.

`PATCH /api/v1/bai-nop/{id}/cham` yêu cầu giáo viên quản lý bài tập.

```json
{
  "diem": 8.5,
  "nhan_xet": "Làm tốt phần nghe.",
  "tra_bai": true,
  "tep_phan_hoi_ids": [95]
}
```

Máy chủ kiểm tra điểm nằm trong `[0, thang_diem]`, bài nộp thuộc bài tập người dùng có quyền chấm, cập nhật trạng thái chấm/trả và ghi người/thời gian. Học sinh chỉ thấy điểm, nhận xét, tệp phản hồi khi `tra_bai = true` hoặc theo chính sách công bố.

### 3.4. Tệp đính kèm

API tải tệp dùng `multipart/form-data`, kiểm tra MIME thực tế, kích thước, tên tệp đã làm sạch và quét an toàn. Tệp được lưu kho riêng, trả metadata `id`, tên hiển thị, loại, kích thước; tuyệt đối không trả `storage_key`.

Endpoint tải tệp kiểm tra liên kết tệp với bài tập/bài nộp và quyền người gọi trước khi trả stream/URL ký ngắn hạn. Giáo viên chỉ truy cập bài trong phân công; học sinh chỉ truy cập đề bài được giao, tệp bài nộp/phản hồi của mình.

### 3.5. Quy ước chung, quyền và mã lỗi

- Base URL: `/api/v1`; quyền `HOMEWORK_READ/WRITE/GRADE`, kiểm tra `PhanCong` hiệu lực cho giáo viên và đăng ký lớp hiệu lực cho học sinh. Thời hạn/đúng-trễ luôn dùng đồng hồ máy chủ.
- Enum bài tập: `NHAP`, `DA_GIAO`, `DONG_NOP`; hạn nộp: `DUNG_HAN`, `TRE_HAN`; trạng thái chấm theo cấu hình. Phân trang mặc định 1/20, tối đa 100.

| HTTP | Mã lỗi | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật/upload thành công. |
| 401/403 | `UNAUTHENTICATED`, `HOMEWORK_FORBIDDEN` | Không có phiên/quyền/phạm vi. |
| 404 | `HOMEWORK_NOT_FOUND`, `SUBMISSION_NOT_FOUND`, `FILE_NOT_FOUND` | Đối tượng không tồn tại. |
| 409 | `HOMEWORK_CLOSED`, `SUBMISSION_VERSION_CONFLICT` | Đóng nộp/xung đột cập nhật. |
| 422 | `VALIDATION_ERROR`, `INVALID_FILE`, `SCORE_OUT_OF_RANGE` | Dữ liệu/tệp/điểm sai. |

### 3.6. Chi tiết API bài tập

#### `GET /api/v1/bai-tap`

**Quyền:** `HOMEWORK_READ` và scope. Query `q`, `lop_hoc_id`, `mon_hoc_id`, `cap_do`, `trang_thai`, `tu_han`, `den_han`, `page`, `page_size`, `sort`; response có lớp/môn, hạn, trạng thái, tỷ lệ hoàn thành và hành động được phép. Học sinh chỉ nhận bài `DA_GIAO` thuộc lớp đang học.

#### `GET/POST/PATCH /api/v1/bai-tap/{id}`

`GET` trả chi tiết, metadata tệp an toàn và phạm vi. `POST /bai-tap` cần `HOMEWORK_WRITE`, payload mục 3.1; server kiểm tra phân công và hạn nộp. `PATCH` chỉ nhận trường được đổi theo trạng thái, ghi audit; không tự phân phối bài Nháp.

#### `POST /api/v1/bai-tap/{id}/giao` và `/dong-nop`

`giao` cần quyền ghi, xác minh lớp/môn/phân công, nguồn tệp/hạn nộp và chuyển `NHAP` sang `DA_GIAO`; HTTP 200 trả trạng thái mới. `dong-nop` nhận `{ "hanh_dong":"DONG"|"MO_LAI", "ly_do":"..." }`, kiểm tra quyền, ghi thời điểm/audit; mở lại không xóa bài nộp cũ.

### 3.7. Chi tiết API bài nộp và chấm

#### `GET /api/v1/bai-tap/{id}/bai-nop`

**Quyền:** `HOMEWORK_GRADE` và scope bài tập. Query `trang_thai_han`, `trang_thai_cham`, `q`, `page`, `page_size`, `sort`; trả bài nộp của học sinh được giao cùng metadata/tình trạng chấm, không trả tệp ngoài phạm vi.

#### `GET/PUT /api/v1/bai-tap/{id}/bai-nop/me`

**Quyền:** học sinh phiên. `GET` chỉ trả bài tập được giao và bài nộp của bản thân. `PUT` nhận `noi_dung`, `tep_ids`, `version` tùy chọn; server kiểm tra bài chưa đóng, học sinh thuộc lớp, có nội dung/tệp, rồi upsert một bản ghi duy nhất, tự tính `DUNG_HAN`/`TRE_HAN`, HTTP 200.

#### `PATCH /api/v1/bai-nop/{id}/cham`

**Quyền:** `HOMEWORK_GRADE` và bài tập thuộc phân công. Nhận `diem`, `nhan_xet`, `tra_bai`, `tep_phan_hoi_ids`; điểm phải trong `[0, thang_diem]`. HTTP 200 trả trạng thái chấm/trả mới, người/thời gian; học sinh chỉ thấy nhận xét/tệp khi `tra_bai=true`.

### 3.8. Chi tiết API tệp

`POST /api/v1/bai-tap/{id}/tep` tải đề bài; `POST /api/v1/bai-nop/{id}/tep` tải tệp bài nộp hoặc phản hồi, tùy quyền/ngữ cảnh. Dùng `multipart/form-data`, field `file`, kiểm tra MIME thực tế, dung lượng, tên tệp, quét an toàn; trả metadata `id`, tên hiển thị, MIME, kích thước, không trả `storage_key`.

`GET /api/v1/tep-bai-tap/{file_id}/tai-xuong` xác minh liên kết tệp và scope rồi stream/URL ký ngắn hạn. Các tệp nộp/phản hồi dùng endpoint tải tương tự hoặc `file_id` cùng kiểm tra quyền; học sinh không được dùng ID tệp để truy cập bài của người khác.

### 3.9. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET/POST /bai-tap` | Đọc/ghi + scope | Danh sách/tạo bài tập. | 200/201 |
| `GET/PATCH /bai-tap/{id}` | Đọc/ghi + scope | Chi tiết/cập nhật bài. | 200 |
| `POST /.../{id}/giao`, `/dong-nop` | Ghi + scope | Giao/đóng-mở bài. | 200 |
| `GET /bai-tap/{id}/bai-nop` | Chấm + scope | Danh sách bài nộp. | 200 |
| `GET/PUT /.../{id}/bai-nop/me` | Học sinh phiên | Xem/nộp bài bản thân. | 200 |
| `PATCH /bai-nop/{id}/cham` | Chấm + scope | Chấm/trả bài. | 200 |
| `POST/GET` API tệp | Quyền tệp + scope | Upload/tải tệp an toàn. | 201/200 |

## 4. Quy tắc nghiệp vụ và phân quyền

| Mã | Quy tắc |
| --- | --- |
| HWK-ACL-01 | Giáo viên chỉ tạo/sửa/giao/chấm bài cho lớp-môn thuộc phân công hiệu lực. |
| HWK-ACL-02 | Học sinh chỉ xem/nộp bài được giao cho lớp có đăng ký hiệu lực và chỉ thấy bài nộp của chính mình. |
| HWK-BR-01 | Bài tập có lớp, môn, tiêu đề, mô tả, hạn nộp, trạng thái; chỉ `DA_GIAO` mới phân phối cho học sinh. |
| HWK-BR-02 | Mỗi học sinh tối đa một bài nộp/bài tập; cập nhật trước khi đóng theo chính sách. |
| HWK-BR-03 | Thời điểm nộp và đúng/trễ hạn dùng đồng hồ máy chủ; không nhận trạng thái hạn từ client. |
| HWK-BR-04 | Từ chối nộp/cập nhật khi bài `DONG_NOP`, trừ thao tác mở lại có dấu vết giáo viên. |
| HWK-BR-05 | Điểm chấm nằm trong thang điểm bài tập; trả bài là cổng hiển thị điểm/nhận xét cho học sinh. |
| HWK-BR-06 | Tệp phải được kiểm tra an toàn/định dạng/dung lượng và tải qua kiểm tra quyền. |

## 5. Pseudocode nộp bài

```text
submit_homework(session_user, homework_id, payload):
    student = require_current_student(session_user)
    homework = load_visible_assigned_homework(student, homework_id)
    validate(homework.status == DA_GIAO)
    validate(not_homework_closed(homework))
    validate(payload.content or payload.files)
    begin_transaction()
    submission = upsert_submission(homework, student, server_now())
    submission.deadline_status = on_time_if(server_now() <= homework.due_at)
    attach_authorized_files(submission, payload.files)
    write_audit(session_user, "NOP_BAI", submission)
    commit_transaction()
```

## 6. Hành vi giao diện, hiệu năng và an toàn

| Sự kiện | Xử lý |
| --- | --- |
| Tạo bài nháp | Lưu bài chưa hiển thị cho học sinh. |
| Giao bài | Hiển thị xác nhận phạm vi/hạn nộp; tải lại tỷ lệ hoàn thành sau thành công. |
| Nộp/cập nhật | Kiểm tra sơ bộ tệp/nội dung; API là nguồn quyết định trạng thái/hạn. |
| Chấm/trả | Hiển thị điểm theo thang, xác nhận trước trả bài. |
| Tải tệp | Dùng endpoint được ủy quyền, không dùng URL lưu trữ trực tiếp. |

- Danh sách và tỷ lệ hoàn thành tổng hợp phía máy chủ; không tải bài nộp của học sinh khác cho client học sinh.
- Dùng unique constraint và giao dịch khi upsert bài nộp để chống bản ghi trùng do gửi đồng thời.
- Ghi audit giao, đóng/mở, nộp/cập nhật, chấm/trả và thao tác tệp an toàn.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-HWK-01 | Giáo viên tạo bài ngoài phân công lớp/môn. | HTTP 403, không tạo bài. |
| TC-HWK-02 | Bài Nháp được học sinh truy cập. | Không hiển thị/không truy cập được. |
| TC-HWK-03 | Học sinh ngoài lớp được giao gọi API nộp bài. | Bị từ chối, không tạo bài nộp. |
| TC-HWK-04 | Nộp bài trước và sau hạn. | Được tự gắn Đúng hạn/Trễ hạn chính xác theo giờ máy chủ. |
| TC-HWK-05 | Nộp bài khi bài Đóng nộp. | Bị từ chối; mở lại hợp lệ mới nộp được. |
| TC-HWK-06 | Gửi hai yêu cầu nộp đồng thời. | Chỉ một bài nộp cho học sinh/bài tập, không trùng. |
| TC-HWK-07 | Chấm điểm ngoài thang điểm. | Lỗi kiểm tra, không trả bài. |
| TC-HWK-08 | Học sinh mở tệp/nhận xét của bài nộp khác. | Bị từ chối, không rò rỉ dữ liệu/tệp. |
