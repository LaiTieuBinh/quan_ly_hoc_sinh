# Detail Design — MH-16 Báo cáo

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-16 |
| Mã chức năng | REPORTING-AND-ANALYTICS |
| Điều kiện vào | Người dùng đã xác thực và có quyền xem loại báo cáo trong phạm vi dữ liệu hợp lệ. |
| Đầu vào | Loại báo cáo, bộ lọc niên khóa/kỳ/thời gian/cấp độ/lớp/môn/trạng thái. |
| Đầu ra | Chỉ số tổng hợp, bảng chi tiết, biểu đồ, liên kết điều hướng và tệp xuất được ủy quyền. |

## 2. Nguồn dữ liệu và phạm vi

| Báo cáo | Nguồn dữ liệu chính | Phạm vi/điều kiện |
| --- | --- | --- |
| Sĩ số | `HocSinh`, `DangKyLop`, `LopHoc` | Đăng ký hiệu lực theo bộ lọc. |
| Chuyên cần | `DiemDanh`, `BuoiHoc`, `DangKyLop` | Theo BR-06/cấu hình chuyên cần và thời gian. |
| Kết quả | `DotDanhGia`, `Diem`, `CauHinhXepLoai` | Điểm/đợt đánh giá người dùng được xem. |
| Bài tập | `BaiTap`, `BaiNop`, `DangKyLop` | Bài phân phối và bài nộp trong phạm vi. |
| Học phí | `NghiaVuHocPhi`, `GiaoDichHocPhi`, `KhoanThu` | Chỉ quyền tài chính; tổng hợp tiền chính xác. |
| Nguy cơ | Chuyên cần, điểm, bài nộp, lộ trình cấp độ | Hợp các tiêu chí cấu hình; nêu lý do từng học sinh. |

`scope` được xây dựng từ vai trò/phiên: quản trị viên toàn phạm vi được cấp, nhân viên theo quyền, giáo viên từ `PhanCong` hiệu lực. Tất cả truy vấn tổng hợp phải áp dụng `scope` tại tầng dữ liệu.

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET /api/v1/bao-cao/si-so` | Chỉ số và chi tiết sĩ số. |
| `GET /api/v1/bao-cao/chuyen-can` | Tổng hợp/chi tiết chuyên cần. |
| `GET /api/v1/bao-cao/ket-qua-hoc-tap` | Điểm trung bình, xếp loại, nhận xét. |
| `GET /api/v1/bao-cao/bai-tap` | Tỷ lệ hoàn thành và danh sách chưa nộp. |
| `GET /api/v1/bao-cao/hoc-phi` | Phải thu/đã thu/còn nợ/quá hạn/doanh thu. |
| `GET /api/v1/bao-cao/hoc-sinh-nguy-co` | Học sinh nguy cơ và các lý do. |
| `POST /api/v1/bao-cao/xuat` | Tạo yêu cầu xuất báo cáo nền. |
| `GET /api/v1/bao-cao/xuat/{job_id}` | Trạng thái/tải kết quả xuất. |

### 3.1. Quy ước chung và bộ lọc

Mọi API GET báo cáo nhận các query chung sau, tùy loại có thể bắt buộc/không áp dụng: `nien_khoa_id`, `ky_hoc_id`, `tu_ngay`, `den_ngay`, `cap_do`, `lop_hoc_id`, `mon_hoc_id`, `trang_thai`, `page`, `page_size`.

- `ky_hoc_id` phải thuộc `nien_khoa_id` nếu cùng được truyền.
- `tu_ngay` không sau `den_ngay`; khoảng thời gian tối đa bị giới hạn theo cấu hình.
- `lop_hoc_id`, `mon_hoc_id`, cấp độ phải nằm trong `scope`; bộ lọc trái phép bị từ chối HTTP 403/400 theo chính sách, không trả tập rỗng để che lỗi quyền.
- Phản hồi có `data`, `meta.filters_applied`, `meta.scope_summary` ở mức không làm lộ dữ liệu, và `meta.generated_at`.

```json
{
  "data": { "tong_hop": {}, "chi_tiet": [] },
  "meta": {
    "filters_applied": { "nien_khoa_id": 1, "ky_hoc_id": 2, "lop_hoc_id": 5 },
    "generated_at": "2026-08-20T10:00:00+07:00"
  }
}
```

### 3.2. Sĩ số và chuyên cần

`GET /api/v1/bao-cao/si-so` yêu cầu `REPORT_ENROLLMENT_READ`, trả tổng số học sinh, số theo cấp độ/lớp và danh sách học sinh/đăng ký chi tiết khi có `include_details=true`.

`GET /api/v1/bao-cao/chuyen-can` yêu cầu `REPORT_ATTENDANCE_READ`, hỗ trợ thêm `hoc_sinh_id`, `include_details`. Tỷ lệ chuyên cần được máy chủ tính theo cấu hình BR-06; phản hồi nêu số buổi được tính, số buổi theo trạng thái và `quy_tac_chuyen_can.phien_ban`.

```json
{
  "data": {
    "tong_hop": { "tong_buoi": 100, "ty_le_chuyen_can": 91.5 },
    "chi_tiet": [{ "hoc_sinh_id": 21, "ho_ten": "Trần Minh Anh", "tong_buoi": 10, "ty_le": 90.0 }],
    "quy_tac_chuyen_can": { "phien_ban": "BR-06-v1" }
  }
}
```

### 3.3. Kết quả học tập và bài tập

`GET /api/v1/bao-cao/ket-qua-hoc-tap` yêu cầu `REPORT_GRADE_READ`, hỗ trợ `dot_danh_gia_id`, `ky_nang`, `xep_loai`, `hoc_sinh_id`, `include_details`. Trả điểm trung bình, phân bố xếp loại, nhận xét theo phạm vi và cấu hình xếp loại áp dụng.

`GET /api/v1/bao-cao/bai-tap` yêu cầu `REPORT_HOMEWORK_READ`, hỗ trợ `bai_tap_id`, `trang_thai_nop`, `include_missing`. Trả số bài được giao, đã nộp, đúng/trễ hạn, tỷ lệ hoàn thành và danh sách chưa nộp có phân trang.

### 3.4. Học phí và học sinh nguy cơ

`GET /api/v1/bao-cao/hoc-phi` yêu cầu `REPORT_FEE_READ`; không được cấp cho giáo viên trừ quyền riêng. Trả tổng `phai_thu`, `mien_giam`, `da_thu`, `con_no`, `qua_han`, `doanh_thu` và chi tiết nghĩa vụ/giao dịch trong phạm vi. Dùng decimal chính xác, không tính ở client.

`GET /api/v1/bao-cao/hoc-sinh-nguy-co` yêu cầu `REPORT_RISK_READ`, nhận tùy chọn `loai_nguy_co` (`CHUYEN_CAN_THAP`, `DIEM_THAP`, `CHUA_NOP_BAI`, `CHUA_DU_DIEU_KIEN_LEN_CAP`) và các ngưỡng cấu hình nếu người có quyền được phép mô phỏng. Mỗi dòng phải có `hoc_sinh`, `loai_nguy_co`, `gia_tri_thuc_te`, `nguong_ap_dung`, `nguon_du_lieu`, không gộp thiếu dữ liệu thành nguy cơ.

### 3.5. Xuất báo cáo

`POST /api/v1/bao-cao/xuat` yêu cầu `REPORT_EXPORT` cùng quyền đọc loại báo cáo.

```json
{
  "loai_bao_cao": "CHUYEN_CAN",
  "dinh_dang": "XLSX",
  "bo_loc": {
    "nien_khoa_id": 1,
    "ky_hoc_id": 2,
    "lop_hoc_id": 5,
    "tu_ngay": "2026-09-01",
    "den_ngay": "2026-09-30"
  }
}
```

Máy chủ xác thực lại toàn bộ bộ lọc và chụp `scope` tại thời điểm tạo job. Thành công HTTP 202 trả `job_id`, trạng thái `QUEUED`. `GET /api/v1/bao-cao/xuat/{job_id}` chỉ cho người tạo/quản trị viên có quyền, trả `QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`; khi hoàn tất có URL ký ngắn hạn. Tệp xuất không dùng cache/URL chung giữa người dùng.

### 3.6. Quy ước quyền, phản hồi và mã lỗi

- Base URL: `/api/v1/bao-cao`; mỗi API yêu cầu quyền riêng: `REPORT_ENROLLMENT_READ`, `REPORT_ATTENDANCE_READ`, `REPORT_GRADE_READ`, `REPORT_HOMEWORK_READ`, `REPORT_FEE_READ`, `REPORT_RISK_READ`, `REPORT_EXPORT`.
- Server xây dựng scope trước khi tổng hợp; ID lớp/môn/học sinh ngoài scope bị từ chối, không trả số tổng rỗng. List mặc định page 1/20, tối đa 100; số tiền dùng decimal chính xác.

| HTTP | Mã lỗi | Ý nghĩa |
| --- | --- | --- |
| 200/202 | — | Đọc báo cáo/tạo job xuất thành công. |
| 400 | `INVALID_FILTER` | Kỳ-niên khóa/khoảng thời gian/bộ lọc sai. |
| 401/403 | `UNAUTHENTICATED`, `REPORT_FORBIDDEN` | Không có phiên/quyền/scope. |
| 404 | `EXPORT_JOB_NOT_FOUND` | Job không tồn tại/không được công bố. |
| 409 | `EXPORT_ALREADY_RUNNING` | Job tương đương đang chạy theo chính sách. |
| 422 | `EXPORT_FORMAT_NOT_SUPPORTED` | Định dạng/loại báo cáo không hợp lệ. |

### 3.7. Chi tiết từng API báo cáo

#### `GET /api/v1/bao-cao/si-so`

**Quyền:** `REPORT_ENROLLMENT_READ`. Query chung + `include_details`, `group_by=CAP_DO|LOP|KY_HOC`, `trang_thai_dang_ky`. Response gồm tổng sĩ số, phân bố theo nhóm và danh sách học sinh/đăng ký phân trang khi `include_details=true`.

#### `GET /api/v1/bao-cao/chuyen-can`

**Quyền:** `REPORT_ATTENDANCE_READ`. Query chung + `hoc_sinh_id`, `include_details`, `trang_thai_diem_danh`. Response phải có tổng số buổi, số theo trạng thái, tỷ lệ, chi tiết phân trang và `quy_tac_chuyen_can.phien_ban`; công thức BR-06 chỉ chạy phía server.

#### `GET /api/v1/bao-cao/ket-qua-hoc-tap`

**Quyền:** `REPORT_GRADE_READ`. Query chung + `dot_danh_gia_id`, `ky_nang`, `xep_loai`, `hoc_sinh_id`, `include_details`. Response gồm điểm trung bình, phân bố xếp loại, điểm/nhận xét chi tiết và `cau_hinh_xep_loai_id` áp dụng.

#### `GET /api/v1/bao-cao/bai-tap`

**Quyền:** `REPORT_HOMEWORK_READ`. Query chung + `bai_tap_id`, `trang_thai_nop`, `include_missing`. Response gồm số nhận bài/đã nộp/đúng-trễ hạn/tỷ lệ hoàn thành và danh sách chưa nộp phân trang. Mẫu số 0 trả trạng thái `KHONG_CO_DU_LIEU`, không tính tỷ lệ 0 giả.

#### `GET /api/v1/bao-cao/hoc-phi`

**Quyền:** `REPORT_FEE_READ`. Query chung + `khoan_thu_id`, `tu_han`, `den_han`, `tai_ngay`, `include_transactions`. Response gồm `phai_thu`, `mien_giam`, `da_thu`, `con_no`, `qua_han`, `doanh_thu` và chi tiết trong scope; giáo viên bị từ chối nếu không có quyền tài chính riêng.

#### `GET /api/v1/bao-cao/hoc-sinh-nguy-co`

**Quyền:** `REPORT_RISK_READ`. Query chung + `loai_nguy_co`, `hoc_sinh_id`, `include_details`. Mỗi dòng trả học sinh, loại nguy cơ, giá trị thực tế, ngưỡng/phiên bản cấu hình, nguồn dữ liệu và `du_lieu_thieu`; không kết luận nguy cơ khi thiếu dữ liệu đầu vào.

### 3.8. Chi tiết API xuất báo cáo

`POST /api/v1/bao-cao/xuat` body như 3.5, `loai_bao_cao` thuộc `SI_SO`, `CHUYEN_CAN`, `KET_QUA_HOC_TAP`, `BAI_TAP`, `HOC_PHI`, `HOC_SINH_NGUY_CO`; `dinh_dang` thuộc CSV/XLSX/PDF theo cấu hình. Server xác thực lại quyền đọc, filters và chụp scope snapshot. Response HTTP 202:

```json
{ "data": { "job_id": "exp_01HXYZ", "trang_thai": "QUEUED", "created_at": "2026-08-20T10:00:00+07:00" } }
```

`GET /api/v1/bao-cao/xuat/{job_id}` chỉ người tạo/quản trị viên được phép, trả trạng thái, tiến trình, thông báo lỗi an toàn hoặc `download_url` ký ngắn hạn khi `COMPLETED`; không dùng URL/cache chung.

### 3.9. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET /bao-cao/si-so` | Báo cáo sĩ số | Sĩ số/tập chi tiết. | 200 |
| `GET /bao-cao/chuyen-can` | Báo cáo chuyên cần | Tỷ lệ/chi tiết theo BR-06. | 200 |
| `GET /bao-cao/ket-qua-hoc-tap` | Báo cáo điểm | Điểm/xếp loại/nhận xét. | 200 |
| `GET /bao-cao/bai-tap` | Báo cáo bài tập | Hoàn thành/chưa nộp. | 200 |
| `GET /bao-cao/hoc-phi` | Báo cáo tài chính | Chỉ số học phí/công nợ. | 200 |
| `GET /bao-cao/hoc-sinh-nguy-co` | Báo cáo nguy cơ | Nguy cơ và lý do. | 200 |
| `POST/GET /bao-cao/xuat` | Xuất + quyền đọc | Tạo/theo dõi/tải job xuất. | 202/200 |

## 4. Công thức chỉ số và quy tắc nghiệp vụ

| Mã | Quy tắc |
| --- | --- |
| RPT-ACL-01 | Mỗi endpoint báo cáo và dữ liệu chi tiết/điều hướng/xuất kiểm tra quyền độc lập. |
| RPT-FLT-01 | Bộ lọc kỳ học-niên khóa, thời gian và phạm vi lớp/môn phải hợp lệ trước truy vấn. |
| RPT-ENR-01 | Sĩ số là số học sinh có đăng ký thỏa điều kiện hiệu lực và bộ lọc. |
| RPT-ATT-01 | Chuyên cần dùng công thức/cấu hình BR-06; phải hiển thị phiên bản quy tắc áp dụng. |
| RPT-GRD-01 | Điểm trung bình/xếp loại dùng điểm và cấu hình đánh giá hợp lệ trong phạm vi. |
| RPT-HWK-01 | Hoàn thành = số học sinh có bài nộp hợp lệ / số học sinh nhận bài × 100%; xử lý mẫu số 0 bằng trạng thái không có dữ liệu. |
| RPT-FEE-01 | Phải thu, đã thu, còn nợ/doanh thu tính từ nghĩa vụ/giao dịch xác nhận bằng decimal chính xác. |
| RPT-RSK-01 | Nguy cơ xuất hiện khi thỏa tiêu chí cấu hình và có đủ dữ liệu; ghi rõ lý do/ngưỡng. |
| RPT-EXP-01 | File xuất dùng đúng bộ lọc, thời điểm và scope khi tạo job; truy cập có thời hạn và kiểm tra quyền. |

## 5. Pseudocode xử lý báo cáo

```text
get_report(session_user, report_type, filters):
    require_report_permission(session_user, report_type)
    validate_common_filters(filters)
    scope = build_authorized_scope(session_user, filters)
    query = build_report_query(report_type, scope, filters)
    return aggregate_and_paginate(query, report_type)

export_report(session_user, request):
    require_export_and_report_permission(session_user, request.report_type)
    scope = build_authorized_scope(session_user, request.filters)
    job = create_export_job(request, scope_snapshot=scope)
    enqueue(job)
    return job
```

## 6. Hành vi giao diện, hiệu năng và an toàn

| Sự kiện | Xử lý |
| --- | --- |
| Đổi niên khóa | Tải lại/kích hoạt lại danh sách kỳ học phù hợp, xóa lựa chọn không hợp lệ. |
| Áp dụng bộ lọc | Tải song song chỉ số/bảng của báo cáo đang mở; mỗi khối có loading/error riêng. |
| Chọn chỉ số/dòng | Điều hướng đến danh sách chi tiết cùng ngữ cảnh lọc, sau đó trang đích kiểm tra quyền. |
| Xuất | Khởi tạo job nền, hiển thị tiến trình và chỉ cho tải sau khi hoàn tất. |
| Không dữ liệu | Hiển thị trạng thái rỗng thay vì tỷ lệ 0 hoặc kết luận suy diễn. |

- Truy vấn tổng hợp dùng chỉ mục, phân vùng/caching hợp lý; cache khóa theo report type, scope, bộ lọc và phiên bản dữ liệu.
- Báo cáo lớn xuất nền; giới hạn khoảng thời gian/dòng xuất và chống tạo job trùng theo chính sách.
- Không ghi chi tiết học sinh/giao dịch tài chính nhạy cảm vào log trình duyệt; URL tệp xuất ký ngắn hạn và không chia sẻ.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-RPT-01 | Giáo viên lọc lớp ngoài phân công bằng API. | HTTP 403/400, không trả chỉ số/dữ liệu lớp đó. |
| TC-RPT-02 | Kỳ học không thuộc niên khóa được chọn. | Lỗi kiểm tra, không sinh báo cáo. |
| TC-RPT-03 | Báo cáo chuyên cần. | Tỷ lệ khớp BR-06 và nêu phiên bản quy tắc. |
| TC-RPT-04 | Báo cáo bài tập không có học sinh nhận bài. | Hiển thị không có dữ liệu, không chia cho 0. |
| TC-RPT-05 | Nhân viên không có quyền tài chính gọi báo cáo học phí. | HTTP 403, không lộ tổng tiền. |
| TC-RPT-06 | Báo cáo nguy cơ với dữ liệu thiếu. | Nêu thiếu dữ liệu/không kết luận nguy cơ sai. |
| TC-RPT-07 | Xuất báo cáo với bộ lọc hợp lệ. | Job dùng đúng scope/filter, tệp chỉ tải được bởi người có quyền. |
| TC-RPT-08 | Người khác truy cập `job_id`/URL xuất. | Bị từ chối; URL hết hạn không tải được. |
