# Detail Design — MH-02 Tổng quan

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-02 |
| Mã chức năng | DASHBOARD-OVERVIEW |
| Điều kiện vào | Người dùng đã xác thực và có phiên hợp lệ. |
| Đầu vào | Vai trò và định danh người dùng từ phiên; bộ lọc niên khóa, kỳ học, lớp, khoảng thời gian. |
| Đầu ra | Các thẻ chỉ số, danh sách công việc, biểu đồ/tổng hợp và liên kết chi tiết theo vai trò. |

Màn hình không được coi là nguồn dữ liệu gốc. Mọi phép tính cần truy vết được tới dữ liệu học vụ, điểm danh, điểm, học phí, bài tập và tài liệu.

## 2. Hợp đồng API đề xuất

### 2.1. Quy ước chung

- Base URL: `/api/v1`; mọi endpoint yêu cầu phiên hợp lệ. Vai trò, `giao_vien_id`, `hoc_sinh_id` và quyền lấy từ phiên/token, không nhận từ request.
- Dữ liệu JSON UTF-8; ngày dùng `YYYY-MM-DD`, ngày giờ dùng ISO-8601 có offset. Tất cả phản hồi tổng quan có `Cache-Control: private, no-store` hoặc cache theo scope người dùng/bộ lọc.
- Phạm vi lọc hợp lệ được máy chủ xác định trước khi truy vấn. Giáo viên không dùng `lop_hoc_id` để xem lớp ngoài phân công; học sinh không truyền `hoc_sinh_id`.
- Lỗi chuẩn:

```json
{
  "error": {
    "code": "FILTER_OUT_OF_SCOPE",
    "message": "Điều kiện lọc không thuộc phạm vi truy cập.",
    "fields": { "lop_hoc_id": ["Bạn không có quyền xem lớp này."] }
  }
}
```

| HTTP | Mã lỗi điển hình | Ý nghĩa |
| --- | --- | --- |
| 200 | — | Đọc dữ liệu thành công. |
| 400 | `INVALID_FILTER` | Sai định dạng tham số hoặc tổ hợp lọc không hợp lệ. |
| 401 | `UNAUTHENTICATED` | Không có hoặc hết hạn phiên. |
| 403 | `FILTER_OUT_OF_SCOPE`, `WIDGET_FORBIDDEN` | Bộ lọc/khối không thuộc quyền. |
| 404 | `WIDGET_NOT_FOUND` | Mã widget không tồn tại/không được cấu hình. |
| 429 | `DASHBOARD_RATE_LIMITED` | Vượt giới hạn làm mới dữ liệu. |
| 500 | `DASHBOARD_SERVICE_ERROR` | Lỗi khối tổng quan; phản hồi không lộ dữ liệu nhạy cảm. |

### 2.2. `GET /api/v1/dashboard/filter-options` — Dữ liệu bộ lọc theo quyền

**Quyền:** người dùng đã đăng nhập. Endpoint giúp giao diện chỉ hiển thị lựa chọn hợp lệ, nhưng các API đọc dữ liệu vẫn kiểm tra lại tham số.

| Query parameter | Kiểu | Bắt buộc | Diễn giải |
| --- | --- | --- | --- |
| `nien_khoa_id` | số nguyên | Không | Thu hẹp danh sách kỳ học/lớp theo niên khóa. |
| `ky_hoc_id` | số nguyên | Không | Thu hẹp danh sách lớp theo kỳ học; phải thuộc niên khóa nếu cùng truyền. |
| `include` | chuỗi | Không | Danh sách `nien_khoa,ky_hoc,lop_hoc`; mặc định trả tất cả. |

**Phản hồi HTTP 200**

```json
{
  "data": {
    "nien_khoa": [{ "id": 1, "ten": "Niên khóa 2026" }],
    "ky_hoc": [{ "id": 2, "nien_khoa_id": 1, "ten": "Kỳ 1 năm 2026" }],
    "lop_hoc": [{ "id": 5, "ma": "N5-01", "ten": "N5 Kỳ 1", "cap_do": "N5" }],
    "gioi_han": {
      "co_the_chon_lop": true,
      "hoc_sinh_id_bi_co_dinh": null
    }
  }
}
```

Với học sinh, `lop_hoc` chỉ gồm lớp có đăng ký liên quan và `co_the_chon_lop` có thể là `false` theo UX; với giáo viên, chỉ gồm lớp có phân công hiệu lực/phù hợp bộ lọc.

### 2.3. `GET /api/v1/dashboard/overview` — Tổng quan theo vai trò

**Quyền:** người dùng đã đăng nhập; các widget được trả theo vai trò và quyền thực tế.

| Query parameter | Kiểu | Bắt buộc | Diễn giải |
| --- | --- | --- | --- |
| `nien_khoa_id` | số nguyên | Không | Niên khóa cần tổng hợp; nếu rỗng, máy chủ chọn mặc định hợp lệ. |
| `ky_hoc_id` | số nguyên | Không | Kỳ học cần tổng hợp; phải thuộc niên khóa nếu cùng truyền. |
| `lop_hoc_id` | số nguyên | Không | Lớp cần lọc; phải thuộc scope và bộ lọc học vụ. |
| `tu_ngay` | ngày | Không | Mốc đầu khoảng thời gian; mặc định do hệ thống xác định. |
| `den_ngay` | ngày | Không | Mốc cuối, không trước `tu_ngay`. |
| `widgets` | chuỗi CSV | Không | Yêu cầu tập widget cụ thể; các widget không có quyền bị bỏ qua hoặc trả lỗi theo chính sách. |
| `include_lists` | boolean | Không | Mặc định `true`; `false` chỉ trả thẻ chỉ số, tối ưu cho làm mới nhanh. |

Máy chủ không nhận `vai_tro`, `hoc_sinh_id`, `giao_vien_id`. Bộ lọc bị ngoài phạm vi trả 403; bộ lọc sai quan hệ (kỳ không thuộc niên khóa, ngày sai) trả 400.

**Phản hồi HTTP 200 (ví dụ giáo viên)**

```json
{
  "data": {
    "vai_tro": "GIAO_VIEN",
    "bo_loc_ap_dung": {
      "nien_khoa_id": 1,
      "ky_hoc_id": 2,
      "lop_hoc_id": null,
      "tu_ngay": "2026-08-01",
      "den_ngay": "2026-08-31"
    },
    "the_chi_so": [
      {
        "ma": "BUOI_HOC_SAP_TOI",
        "nhan": "Buổi học sắp tới",
        "gia_tri": 3,
        "don_vi": "buổi",
        "trang_thai": "SUCCESS",
        "dieu_huong": { "man_hinh": "MH-09", "tham_so": { "tu_ngay": "2026-08-20" } }
      },
      {
        "ma": "DIEM_DANH_CAN_XU_LY",
        "nhan": "Điểm danh cần xử lý",
        "gia_tri": 1,
        "don_vi": "buổi",
        "trang_thai": "SUCCESS",
        "dieu_huong": { "man_hinh": "MH-10", "tham_so": {} }
      },
      {
        "ma": "BAI_TAP_CAN_XU_LY",
        "nhan": "Bài tập cần xử lý",
        "gia_tri": 5,
        "don_vi": "bài",
        "trang_thai": "SUCCESS",
        "dieu_huong": { "man_hinh": "MH-14", "tham_so": { "trang_thai": "CAN_XU_LY" } }
      }
    ],
    "danh_sach": {
      "buoi_hoc_sap_toi": [
        { "buoi_hoc_id": 19, "lop": "N5-01", "mon": "Nghe", "bat_dau": "2026-08-21T08:00:00+07:00" }
      ],
      "cong_viec_uu_tien": []
    },
    "meta": { "generated_at": "2026-08-20T10:00:00+07:00", "partial": false }
  }
}
```

`trang_thai` của widget có thể là `SUCCESS`, `EMPTY`, `ERROR`, `FORBIDDEN`. Khi một dịch vụ widget lỗi, API nên trả dữ liệu các widget khác và mô tả lỗi an toàn ở widget lỗi thay vì làm hỏng toàn trang. API chỉ trả trường cần hiển thị; không trả số tiền/giao dịch/hồ sơ chi tiết vượt nhu cầu dashboard.

### 2.4. `GET /api/v1/dashboard/widgets/{widget_code}` — Làm mới một widget

**Quyền:** người dùng có quyền xem widget. Dùng khi giao diện thực hiện `Thử lại` một khối lỗi hoặc làm mới độc lập mà không tải lại toàn trang.

`widget_code` là một mã được cấu hình, ví dụ `SI_SO`, `CONG_NO`, `DOANH_THU`, `HOC_SINH_NGUY_CO`, `BUOI_HOC_SAP_TOI`, `DIEM_DANH_CAN_XU_LY`, `BAI_TAP_CAN_XU_LY`, `TY_LE_CHUYEN_CAN`, `TAI_LIEU_MOI`.

Query filter giống `/dashboard/overview`. Phản hồi HTTP 200:

```json
{
  "data": {
    "ma": "DIEM_DANH_CAN_XU_LY",
    "gia_tri": 1,
    "don_vi": "buổi",
    "trang_thai": "SUCCESS",
    "danh_sach": [{ "buoi_hoc_id": 19, "lop": "N5-01", "bat_dau": "2026-08-21T08:00:00+07:00" }],
    "dieu_huong": { "man_hinh": "MH-10", "tham_so": { "buoi_hoc_id": 19 } },
    "generated_at": "2026-08-20T10:00:00+07:00"
  }
}
```

Nếu widget không áp dụng cho vai trò hiện tại, trả HTTP 403 `WIDGET_FORBIDDEN` hoặc `trang_thai: FORBIDDEN` theo quy ước triển khai; không trả dữ liệu thay thế.

### 2.5. `POST /api/v1/dashboard/detail-context` — Tạo ngữ cảnh điều hướng chi tiết (tùy chọn)

Endpoint này dùng khi bộ lọc/phạm vi phức tạp hoặc có thông tin nhạy cảm, nhằm tránh đưa toàn bộ điều kiện vào URL. Nếu ứng dụng dùng query string trực tiếp, endpoint này có thể không cần triển khai.

**Quyền:** quyền xem widget/đích điều hướng liên quan.

```json
{
  "widget_code": "CONG_NO",
  "bo_loc": {
    "nien_khoa_id": 1,
    "ky_hoc_id": 2,
    "lop_hoc_id": 5,
    "tu_ngay": "2026-08-01",
    "den_ngay": "2026-08-31"
  }
}
```

Máy chủ xác thực widget và phạm vi, sau đó trả token ngữ cảnh ngắn hạn, một lần dùng hoặc có TTL cấu hình:

```json
{
  "data": {
    "dich": "MH-13",
    "context_token": "<opaque-short-lived-token>",
    "het_han_luc": "2026-08-20T10:05:00+07:00"
  }
}
```

Trang đích đổi token lấy bộ lọc đã kiểm tra nhưng vẫn phải xây dựng `scope` lại từ phiên người dùng. Token không được chứa dữ liệu nhạy cảm dạng rõ, không thay thế cơ chế phân quyền và không ghi vào log.

### 2.6. Bảng tổng hợp API

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET /dashboard/filter-options` | Phiên hợp lệ | Danh mục lọc theo scope. | 200 |
| `GET /dashboard/overview` | Phiên hợp lệ | Toàn bộ dashboard theo vai trò. | 200 |
| `GET /dashboard/widgets/{widget_code}` | Quyền widget | Làm mới một khối. | 200 |
| `POST /dashboard/detail-context` | Quyền widget/đích | Tạo context điều hướng tùy chọn. | 200 |

## 3. Quy tắc bộ lọc và phân quyền

| Mã | Quy tắc |
| --- | --- |
| DSH-ACL-01 | Quản trị viên được đọc toàn bộ dữ liệu trong phạm vi bộ lọc hợp lệ. |
| DSH-ACL-02 | Nhân viên chỉ xem chức năng/dữ liệu được cấp quyền; không được suy ra dữ liệu ngoài quyền qua tổng số. |
| DSH-ACL-03 | Giáo viên chỉ xem lớp, môn, buổi học, điểm danh và bài tập từ `PhanCong` hợp lệ. |
| DSH-ACL-04 | Học sinh luôn bị cố định theo `hoc_sinh_id` liên kết với tài khoản; không chấp nhận `hoc_sinh_id` do client truyền lên. |
| DSH-FLT-01 | `ky_hoc_id` phải thuộc `nien_khoa_id` nếu cả hai bộ lọc tồn tại. |
| DSH-FLT-02 | `lop_hoc_id` phải thuộc phạm vi niên khóa/kỳ học và quyền người dùng; nếu không, trả HTTP 403 hoặc 400 theo chính sách API. |
| DSH-FLT-03 | `tu_ngay` không được sau `den_ngay`; khoảng mặc định do hệ thống xác định. |

## 4. Nguồn dữ liệu và công thức chỉ số

| Khối | Nguồn dữ liệu | Công thức/điều kiện |
| --- | --- | --- |
| Sĩ số | `HocSinh`, `DangKyLop`, `LopHoc` | Đếm học sinh có đăng ký lớp phù hợp, trạng thái `Đang học`, trong bộ lọc. |
| Lớp hoạt động | `LopHoc`, niên khóa, kỳ học | Đếm lớp đang hoạt động trong bộ lọc. |
| Công nợ | `NghiaVuHocPhi`, `GiaoDichHocPhi` | Tổng `(phải thu - miễn giảm - đã thu)` dương của nghĩa vụ trong phạm vi. |
| Doanh thu | `GiaoDichHocPhi` | Tổng `so_tien` với `ngay_thu` trong khoảng thời gian. |
| Học sinh nguy cơ | Điểm danh, `Diem`, `BaiNop`, lịch sử/tiêu chí cấp độ | Hợp các điều kiện: chuyên cần thấp, điểm thấp, chưa nộp bài hoặc chưa đạt điều kiện; ngưỡng do cấu hình. |
| Buổi học sắp tới | `BuoiHoc`, `PhanCong` | Buổi có thời gian bắt đầu lớn hơn hoặc bằng hiện tại, thuộc phân công của giáo viên. |
| Điểm danh cần xử lý | `BuoiHoc`, `DiemDanh` | Buổi được phép điểm danh mà chưa đủ bản ghi cho học sinh đăng ký hợp lệ. |
| Bài tập cần xử lý | `BaiTap`, `BaiNop` | Giáo viên: bài cần giao/chấm/trả; học sinh: bài đang mở chưa nộp/cần nộp lại. |
| Chuyên cần cá nhân | `DiemDanh`, `BuoiHoc` | Theo BR-06: số buổi có mặt hợp lệ / tổng buổi được tính chuyên cần × 100%. |
| Tài liệu mới | `TaiLieu`, `DangKyLop` | Tài liệu hiển thị mới, thuộc lớp đang học hoặc được cấp theo cấp độ. |

## 5. Pseudocode truy vấn tổng quan

```text
get_overview(session_user, filters):
    validate_filters(filters)
    scope = build_authorized_scope(session_user, filters)

    response = { vai_tro: session_user.vai_tro, bo_loc_ap_dung: scope.filters }

    switch session_user.vai_tro:
        case QUAN_TRI_VIEN, NHAN_VIEN:
            response = build_administrative_widgets(scope)
        case GIAO_VIEN:
            response = build_teacher_widgets(scope, session_user.giao_vien_id)
        case HOC_SINH:
            response = build_student_widgets(scope, session_user.hoc_sinh_id)

    return response
```

Các hàm `build_*_widgets` phải giới hạn truy vấn ngay tại tầng dữ liệu bằng `scope`, không được tải dữ liệu rộng rồi lọc tại giao diện.

## 6. Điều hướng chi tiết

| Mã thẻ/khối | Đích | Tham số cần mang theo |
| --- | --- | --- |
| `SI_SO` | Danh sách học sinh/lớp | niên khóa, kỳ học, lớp, trạng thái đăng ký. |
| `CONG_NO`, `DOANH_THU` | Học phí/báo cáo học phí | phạm vi thời gian và lớp/cấp độ nếu có. |
| `HOC_SINH_NGUY_CO` | Báo cáo nguy cơ | loại nguy cơ, bộ lọc hiện tại. |
| `BUOI_HOC_SAP_TOI` | Thời khóa biểu | lớp và khoảng thời gian hiện tại. |
| `DIEM_DANH_CAN_XU_LY` | Điểm danh | `buoi_hoc_id` nếu người dùng chọn một dòng. |
| `BAI_TAP_CAN_XU_LY` | Bài tập/bài nộp | lớp, môn, trạng thái xử lý. |
| `TY_LE_CHUYEN_CAN` | Điểm danh cá nhân | khoảng thời gian đã áp dụng. |

## 7. Trạng thái, hiệu năng và an toàn

- Tải song song các khối độc lập; mỗi khối có trạng thái `loading`, `success`, `empty`, `error` riêng.
- Dùng tải chậm hoặc giới hạn số dòng cho danh sách trên dashboard; trang chi tiết mới dùng phân trang đầy đủ.
- Cache số liệu tổng hợp chỉ được khóa theo phạm vi quyền và bộ lọc; tuyệt đối không dùng cache chung làm lộ số liệu người dùng khác.
- Không ghi dữ liệu chi tiết học sinh hoặc giao dịch học phí nhạy cảm vào log phía trình duyệt.

## 8. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-DSH-01 | Quản trị viên mở dashboard | Nhìn thấy toàn bộ khối quản trị với số liệu đúng bộ lọc. |
| TC-DSH-02 | Giáo viên chọn lớp không được phân công bằng URL/API | Yêu cầu bị từ chối, không trả chỉ số hoặc danh sách của lớp đó. |
| TC-DSH-03 | Học sinh mở dashboard | Chỉ thấy dữ liệu của chính mình; không có bộ lọc học sinh/lớp ngoài phạm vi. |
| TC-DSH-04 | Chọn kỳ học không thuộc niên khóa | Hiện lỗi kiểm tra hoặc không cho chọn. |
| TC-DSH-05 | Không có dữ liệu trong khoảng thời gian | Các khối liên quan hiển thị trạng thái rỗng, không lỗi trang. |
| TC-DSH-06 | Một dịch vụ khối chỉ số lỗi | Chỉ khối đó hiện nút thử lại; các khối còn lại vẫn dùng được. |
| TC-DSH-07 | Chọn thẻ công nợ | Điều hướng đến học phí với đúng bộ lọc thời gian/lớp và vẫn kiểm tra quyền. |
