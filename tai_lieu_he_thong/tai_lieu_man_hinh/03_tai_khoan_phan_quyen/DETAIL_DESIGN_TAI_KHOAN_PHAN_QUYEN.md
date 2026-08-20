# Detail Design — MH-03 Tài khoản và phân quyền

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-03 |
| Mã chức năng | ACCOUNT-ROLE-MANAGEMENT |
| Điều kiện vào | Người dùng đã xác thực, phiên hợp lệ và có vai trò Quản trị viên. |
| Đầu vào | Điều kiện tìm kiếm; dữ liệu tài khoản, vai trò, trạng thái và hồ sơ liên kết. |
| Đầu ra | Danh sách tài khoản; bản ghi được tạo/cập nhật; trạng thái khóa/mở khóa; mật khẩu mới được lưu dạng mã hóa. |

Mọi API của chức năng phải xác định người thực hiện từ phiên đăng nhập và kiểm tra vai trò Quản trị viên ở phía máy chủ. Không tin cậy cờ quyền hoặc vai trò do trình duyệt gửi lên.

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `TaiKhoan` | `id`, `ten_dang_nhap`, `mat_khau_hash`, `vai_tro`, `trang_thai`, `giao_vien_id`, `hoc_sinh_id`, `created_at`, `updated_at` | `ten_dang_nhap` duy nhất; chỉ một trong hai khóa hồ sơ có thể có giá trị. |
| `GiaoVien` | `id`, `ma_giao_vien`, `ho_ten`, `trang_thai` | Nguồn chọn hồ sơ khi vai trò là Giáo viên. |
| `HocSinh` | `id`, `ma_hoc_sinh`, `ho_ten`, `trang_thai` | Nguồn chọn hồ sơ khi vai trò là Học sinh. |
| `NhatKyHeThong` | `id`, `nguoi_thuc_hien_id`, `hanh_dong`, `doi_tuong`, `doi_tuong_id`, `thoi_gian`, `du_lieu_an_toan` | Ghi vết thao tác nhạy cảm, tuyệt đối không chứa mật khẩu. |

Ràng buộc dữ liệu đề xuất: unique `TaiKhoan.ten_dang_nhap`; unique không rỗng cho `giao_vien_id` và `hoc_sinh_id`; kiểm tra `vai_tro = GIAO_VIEN` chỉ dùng `giao_vien_id`, `vai_tro = HOC_SINH` chỉ dùng `hoc_sinh_id`.

## 3. Hợp đồng API đề xuất

### 3.1. Quy ước chung

- Base URL: `/api/v1`; mọi endpoint trong mục này yêu cầu phiên hợp lệ và vai trò `QUAN_TRI_VIEN`. Máy chủ lấy người thực hiện từ phiên, không nhận vai trò/quyền do client gửi.
- Request/response dùng JSON UTF-8. Mật khẩu chỉ nhận trong `POST` tạo tài khoản hoặc API đặt lại, không bao giờ xuất hiện trong response, query string, nhật ký hoặc dữ liệu audit.
- Các giá trị enum: `vai_tro` = `QUAN_TRI_VIEN`, `NHAN_VIEN`, `GIAO_VIEN`, `HOC_SINH`; `trang_thai` = `HOAT_DONG`, `KHOA`.
- `id`, `giao_vien_id`, `hoc_sinh_id` là số nguyên dương; ngày giờ dùng ISO-8601. Danh sách dùng `page` mặc định 1, `page_size` mặc định 20/tối đa 100, `sort` mặc định `-updated_at`.
- Lỗi chuẩn:

```json
{
  "error": {
    "code": "PROFILE_ALREADY_LINKED",
    "message": "Hồ sơ đã được liên kết với một tài khoản khác.",
    "fields": { "giao_vien_id": ["Hồ sơ không khả dụng."] }
  }
}
```

| HTTP | Mã lỗi điển hình | Ý nghĩa |
| --- | --- | --- |
| 200/201 | — | Đọc/tạo/cập nhật thành công. |
| 400 | `INVALID_QUERY` | Tham số truy vấn không hợp lệ. |
| 401 | `UNAUTHENTICATED` | Phiên không có/hết hạn. |
| 403 | `ADMIN_REQUIRED` | Không phải quản trị viên. |
| 404 | `ACCOUNT_NOT_FOUND`, `PROFILE_NOT_FOUND` | Đối tượng không tồn tại. |
| 409 | `USERNAME_ALREADY_EXISTS`, `PROFILE_ALREADY_LINKED`, `LAST_ACTIVE_ADMIN` | Trùng/xung đột/ràng buộc quản trị viên cuối cùng. |
| 422 | `VALIDATION_ERROR`, `INVALID_ROLE_PROFILE` | Dữ liệu hoặc quy tắc nghiệp vụ không hợp lệ. |
| 429 | `PASSWORD_RESET_RATE_LIMITED` | Vượt giới hạn đặt lại mật khẩu. |

### 3.2. `GET /api/v1/tai-khoan` — Danh sách tài khoản

**Quyền:** Quản trị viên.

| Query parameter | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `q` | chuỗi | Không | Tìm gần đúng theo tên đăng nhập đã chuẩn hóa, không phân biệt hoa/thường theo chính sách dữ liệu. |
| `vai_tro` | enum | Không | `QUAN_TRI_VIEN`, `NHAN_VIEN`, `GIAO_VIEN`, `HOC_SINH`. |
| `trang_thai` | enum | Không | `HOAT_DONG`, `KHOA`. |
| `page` | số nguyên | Không | Mặc định 1, tối thiểu 1. |
| `page_size` | số nguyên | Không | Mặc định 20, tối đa 100. |
| `sort` | chuỗi | Không | `ten_dang_nhap`, `created_at`, `updated_at`; tiền tố `-` là giảm dần. |

**Phản hồi HTTP 200**

```json
{
  "data": [
    {
      "id": 12,
      "ten_dang_nhap": "gv.nguyen",
      "vai_tro": "GIAO_VIEN",
      "trang_thai": "KHOA",
      "ho_so_lien_ket": { "loai": "GIAO_VIEN", "id": 8, "ma": "GV008", "ten": "Nguyễn Văn A" },
      "created_at": "2026-08-20T09:00:00+07:00",
      "updated_at": "2026-08-20T10:15:00+07:00"
    }
  ],
  "meta": { "page": 1, "page_size": 20, "total": 1, "total_pages": 1 }
}
```

Danh sách không trả mật khẩu/hash, token, lịch sử mật khẩu hoặc dữ liệu hồ sơ vượt nhu cầu hiển thị.

### 3.3. `POST /api/v1/tai-khoan` — Tạo tài khoản

**Quyền:** Quản trị viên.

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `ten_dang_nhap` | chuỗi | Có | Trim, không rỗng, duy nhất. |
| `mat_khau` | chuỗi bí mật | Có | Không rỗng; áp dụng chính sách độ dài/độ mạnh cấu hình; không log. |
| `vai_tro` | enum | Có | Một trong bốn vai trò được hỗ trợ. |
| `trang_thai` | enum | Không | Mặc định `HOAT_DONG`. |
| `giao_vien_id` | số nguyên/null | Có điều kiện | Bắt buộc khi vai trò `GIAO_VIEN`; rỗng cho vai trò khác. |
| `hoc_sinh_id` | số nguyên/null | Có điều kiện | Bắt buộc khi vai trò `HOC_SINH`; rỗng cho vai trò khác. |

```json
{
  "ten_dang_nhap": "gv.nguyen",
  "mat_khau": "MatKhauMoi!2026",
  "vai_tro": "GIAO_VIEN",
  "trang_thai": "HOAT_DONG",
  "giao_vien_id": 8,
  "hoc_sinh_id": null
}
```

Máy chủ kiểm tra tên đăng nhập/hồ sơ liên kết trong giao dịch, băm mật khẩu bằng Argon2id/bcrypt với salt, tạo audit `TAO_TAI_KHOAN` không chứa mật khẩu. Thành công HTTP 201 trả đối tượng tài khoản an toàn:

```json
{
  "data": {
    "id": 12,
    "ten_dang_nhap": "gv.nguyen",
    "vai_tro": "GIAO_VIEN",
    "trang_thai": "HOAT_DONG",
    "ho_so_lien_ket": { "loai": "GIAO_VIEN", "id": 8, "ma": "GV008", "ten": "Nguyễn Văn A" },
    "created_at": "2026-08-20T09:00:00+07:00"
  }
}
```

### 3.4. `GET /api/v1/tai-khoan/{id}` — Chi tiết tài khoản

**Quyền:** Quản trị viên. Trả dữ liệu cần cho biểu mẫu cập nhật: `id`, tên đăng nhập, vai trò, trạng thái, hồ sơ liên kết, thời gian tạo/cập nhật và hành động cho phép. Không trả `mat_khau`, `mat_khau_hash`, lịch sử mật khẩu, token hoặc session.

**Phản hồi HTTP 200**

```json
{
  "data": {
    "id": 12,
    "ten_dang_nhap": "gv.nguyen",
    "vai_tro": "GIAO_VIEN",
    "trang_thai": "HOAT_DONG",
    "ho_so_lien_ket": { "loai": "GIAO_VIEN", "id": 8, "ma": "GV008", "ten": "Nguyễn Văn A" },
    "created_at": "2026-08-20T09:00:00+07:00",
    "updated_at": "2026-08-20T10:15:00+07:00",
    "hanh_dong_duoc_phep": ["CAP_NHAT", "KHOA", "DAT_LAI_MAT_KHAU"]
  }
}
```

### 3.5. `PATCH /api/v1/tai-khoan/{id}` — Cập nhật tài khoản

**Quyền:** Quản trị viên. Chỉ gửi trường cần thay đổi; **không nhận** `mat_khau` tại endpoint này.

```json
{
  "ten_dang_nhap": "gv.nguyen.a",
  "vai_tro": "GIAO_VIEN",
  "trang_thai": "HOAT_DONG",
  "giao_vien_id": 8,
  "hoc_sinh_id": null
}
```

- Đổi vai trò/hồ sơ liên kết phải tuân thủ ACC-BR-05/06/07. Khi đổi sang Quản trị viên/Nhân viên, body phải có cả hai ID hồ sơ là `null`.
- Nếu thay `trang_thai` qua API này, áp dụng cùng kiểm tra thu hồi phiên/ràng buộc quản trị viên cuối cùng như endpoint trạng thái; khuyến nghị giao diện dùng endpoint chuyên biệt ở mục 3.6.
- Thành công HTTP 200 trả tài khoản mới nhất, tạo audit `CAP_NHAT_TAI_KHOAN`; xung đột tên/hồ sơ trả 409.

### 3.6. `PATCH /api/v1/tai-khoan/{id}/trang-thai` — Khóa/mở khóa

**Quyền:** Quản trị viên.

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `trang_thai` | enum | Có | `HOAT_DONG` hoặc `KHOA`. |
| `ly_do` | chuỗi | Không | Ghi chú quản trị; yêu cầu theo chính sách khi khóa. |

```json
{ "trang_thai": "KHOA", "ly_do": "Tài khoản không còn sử dụng" }
```

Máy chủ khóa bản ghi tài khoản, kiểm tra không khóa quản trị viên hoạt động cuối cùng, đổi trạng thái và thu hồi session/refresh token hiện hành khi khóa. Thành công HTTP 200 trả trạng thái mới và thời điểm xử lý; tạo audit `DOI_TRANG_THAI_TAI_KHOAN`. Không tiết lộ trạng thái session cụ thể của người dùng đích ngoài thông tin cần thiết.

### 3.7. `POST /api/v1/tai-khoan/{id}/dat-lai-mat-khau` — Đặt lại mật khẩu

**Quyền:** Quản trị viên. Áp dụng rate limit, audit và chính sách mật khẩu giống tạo tài khoản.

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `mat_khau_moi` | chuỗi bí mật | Có | Đúng chính sách mật khẩu; không log/lưu client. |
| `xac_nhan_mat_khau` | chuỗi bí mật | Có | Phải khớp `mat_khau_moi`; chỉ dùng kiểm tra request, không lưu. |
| `thu_hoi_phien_hien_tai` | boolean | Không | Mặc định `true`; thu hồi session/token của tài khoản đích sau khi đổi. |

```json
{
  "mat_khau_moi": "MatKhauMoi!2026",
  "xac_nhan_mat_khau": "MatKhauMoi!2026",
  "thu_hoi_phien_hien_tai": true
}
```

Máy chủ băm mật khẩu mới, cập nhật atomically, thu hồi phiên theo request/chính sách và ghi audit `DAT_LAI_MAT_KHAU` không có mật khẩu/hash. Thành công HTTP 200 chỉ trả:

```json
{ "data": { "tai_khoan_id": 12, "dat_lai_luc": "2026-08-20T10:20:00+07:00" } }
```

### 3.8. `GET /api/v1/ho-so/giao-vien-kha-dung` — Hồ sơ giáo viên khả dụng

**Quyền:** Quản trị viên. Dùng cho autocomplete/chọn hồ sơ khi vai trò là Giáo viên.

| Query parameter | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `q` | chuỗi | Không | Tìm theo mã hoặc họ tên giáo viên. |
| `tai_khoan_id` | số nguyên | Không | Khi sửa, bao gồm hồ sơ đang liên kết với chính tài khoản này. |
| `include_inactive` | boolean | Không | Mặc định `false`; chỉ dùng khi chính sách cho phép. |
| `page`, `page_size` | số nguyên | Không | Mặc định 1/20, tối đa 100. |

API chỉ trả giáo viên chưa được liên kết với tài khoản nào, cộng hồ sơ đang liên kết với `tai_khoan_id` nếu có. Phản hồi HTTP 200:

```json
{
  "data": [{ "id": 8, "ma": "GV008", "ho_ten": "Nguyễn Văn A", "trang_thai": "DANG_HOAT_DONG" }],
  "meta": { "page": 1, "page_size": 20, "total": 1, "total_pages": 1 }
}
```

### 3.9. `GET /api/v1/ho-so/hoc-sinh-kha-dung` — Hồ sơ học sinh khả dụng

**Quyền:** Quản trị viên. Hợp đồng giống API giáo viên, nhưng truy vấn `HocSinh` theo mã/họ tên/trạng thái và chỉ trả hồ sơ chưa liên kết hoặc đang liên kết với `tai_khoan_id` được truyền.

```json
{
  "data": [{ "id": 21, "ma": "HS001", "ho_ten": "Trần Minh Anh", "trang_thai": "DANG_HOC" }],
  "meta": { "page": 1, "page_size": 20, "total": 1, "total_pages": 1 }
}
```

### 3.10. Bảng tổng hợp endpoint

| Endpoint | Quyền | Mục đích | Thành công |
| --- | --- | --- | --- |
| `GET /tai-khoan` | Quản trị viên | Danh sách có lọc/phân trang. | 200 |
| `POST /tai-khoan` | Quản trị viên | Tạo tài khoản. | 201 |
| `GET/PATCH /tai-khoan/{id}` | Quản trị viên | Chi tiết/cập nhật không gồm mật khẩu. | 200 |
| `PATCH /tai-khoan/{id}/trang-thai` | Quản trị viên | Khóa/mở khóa và thu hồi phiên khi cần. | 200 |
| `POST /tai-khoan/{id}/dat-lai-mat-khau` | Quản trị viên | Đặt lại mật khẩu an toàn. | 200 |
| `GET /ho-so/giao-vien-kha-dung` | Quản trị viên | Tra cứu hồ sơ giáo viên có thể liên kết. | 200 |
| `GET /ho-so/hoc-sinh-kha-dung` | Quản trị viên | Tra cứu hồ sơ học sinh có thể liên kết. | 200 |

## 4. Quy tắc nghiệp vụ và kiểm tra dữ liệu

| Mã | Quy tắc |
| --- | --- |
| ACC-ACL-01 | Tất cả API trong nhóm này yêu cầu vai trò Quản trị viên. |
| ACC-BR-01 | `ten_dang_nhap` là bắt buộc, đã cắt khoảng trắng đầu/cuối và duy nhất, không phân biệt hoa/thường theo chính sách dữ liệu. |
| ACC-BR-02 | `mat_khau` bắt buộc khi tạo hoặc đặt lại; lưu qua hàm băm mật khẩu có salt, không mã hóa có thể đảo ngược. |
| ACC-BR-03 | `vai_tro` bắt buộc và thuộc bốn giá trị được phép. |
| ACC-BR-04 | `trang_thai` bắt buộc, thuộc `HOAT_DONG` hoặc `KHOA`; tài khoản khóa bị từ chối đăng nhập và yêu cầu xác thực mới. |
| ACC-BR-05 | Vai trò `GIAO_VIEN` yêu cầu một `giao_vien_id`; `hoc_sinh_id` phải rỗng. Vai trò `HOC_SINH` áp dụng quy tắc ngược lại. |
| ACC-BR-06 | Vai trò `QUAN_TRI_VIEN` hoặc `NHAN_VIEN` không được liên kết hồ sơ giáo viên/học sinh. |
| ACC-BR-07 | Một hồ sơ Giáo viên/Học sinh chỉ liên kết với tối đa một tài khoản. |
| ACC-BR-08 | Trước khi khóa tài khoản của người dùng đang có phiên hoạt động, máy chủ thu hồi phiên/tokens hiện hành theo chính sách bảo mật. |
| ACC-BR-09 | Không cho phép thao tác làm mất toàn bộ tài khoản Quản trị viên hoạt động cuối cùng. |
| ACC-BR-10 | Thay đổi vai trò, trạng thái, liên kết hồ sơ và đặt lại mật khẩu phải ghi nhật ký an toàn. |

## 5. Xử lý nghiệp vụ

```text
create_account(actor, request):
    require_admin(actor)
    validate_create_request(request)
    ensure_username_unique(request.ten_dang_nhap)
    validate_profile_link(request.vai_tro, request.giao_vien_id, request.hoc_sinh_id)
    begin_transaction()
    account = insert_account(password_hash(request.mat_khau), request)
    write_audit(actor, "TAO_TAI_KHOAN", account.id, safe_changes(request))
    commit_transaction()
    return account_without_secret(account)

change_account_status(actor, account_id, status):
    require_admin(actor)
    account = lock_account_for_update(account_id)
    ensure_not_disabling_last_active_admin(account, status)
    update_status(account, status)
    if status == KHOA: revoke_active_sessions(account.id)
    write_audit(actor, "DOI_TRANG_THAI", account.id, {trang_thai: status})
    return account_without_secret(account)
```

Việc kiểm tra trùng tên đăng nhập, liên kết hồ sơ và ràng buộc quản trị viên cuối cùng phải thực hiện trong giao dịch để tránh lỗi đồng thời.

## 6. Hành vi giao diện chi tiết

| Sự kiện | Xử lý trên giao diện | Xử lý máy chủ / kết quả |
| --- | --- | --- |
| Mở màn hình | Gọi API danh sách với trang 1 và bộ lọc mặc định. | Trả danh sách đã phân trang nếu phiên là quản trị viên. |
| Đổi vai trò | Làm mới trường hồ sơ liên kết; xóa lựa chọn không tương thích trước khi lưu. | Vẫn kiểm tra lại quy tắc ACC-BR-05/06. |
| Chọn hồ sơ | Chỉ nạp hồ sơ khả dụng đúng loại; hiển thị mã và họ tên. | Chặn liên kết đã thuộc tài khoản khác. |
| Nhấn Lưu | Khóa nút chống gửi lặp; hiển thị lỗi tại trường sai. | Tạo/cập nhật trong giao dịch. |
| Khóa/Mở khóa | Hiển thị hộp thoại xác nhận, nêu rõ tác động đăng nhập. | Đổi trạng thái, thu hồi phiên khi khóa. |
| Đặt lại mật khẩu | Hiển thị hai ô mật khẩu mới/xác nhận; xóa giá trị khi đóng. | Kiểm tra khớp, băm mật khẩu, ghi nhật ký không chứa mật khẩu. |

## 7. An toàn, hiệu năng và nhật ký

- Mật khẩu nhập trên HTTPS; giao diện dùng ô kiểu `password`, không tự điền lại và không ghi vào local storage, URL, thông báo hay log.
- Áp dụng giới hạn tần suất phù hợp cho API đặt lại mật khẩu và ghi nhật ký mọi lần thành công/thất bại theo chính sách bảo mật.
- Danh sách chỉ trả các cột cần hiển thị; sắp xếp mặc định `updated_at` giảm dần và dùng phân trang phía máy chủ.
- Thông báo lỗi xác thực dùng nội dung chung phù hợp, không tiết lộ hash, cấu hình mật khẩu hay sự tồn tại không cần thiết của tài khoản.
- Nhật ký ghi người thực hiện, thời điểm, hành động, đối tượng và thay đổi an toàn (ví dụ trạng thái/vai trò); che hoàn toàn mật khẩu.

## 8. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-ACC-01 | Quản trị viên tìm theo một phần tên đăng nhập và lọc vai trò. | Chỉ trả đúng bản ghi thỏa điều kiện, phân trang chính xác. |
| TC-ACC-02 | Tạo tài khoản với tên đăng nhập đã tồn tại. | Bị từ chối với lỗi tên đăng nhập trùng; không tạo bản ghi. |
| TC-ACC-03 | Tạo Giáo viên không có `giao_vien_id` hoặc gán hồ sơ Học sinh. | Bị từ chối bởi quy tắc liên kết hồ sơ. |
| TC-ACC-04 | Gán một hồ sơ Giáo viên đang được tài khoản khác sử dụng. | HTTP 409 hoặc lỗi nghiệp vụ tương đương; không thay đổi dữ liệu. |
| TC-ACC-05 | Khóa tài khoản đang hoạt động. | Tài khoản không đăng nhập lại được và phiên hiện hành bị thu hồi theo chính sách. |
| TC-ACC-06 | Đặt lại mật khẩu. | Mật khẩu mới hoạt động; API, danh sách và nhật ký không trả/ghi mật khẩu. |
| TC-ACC-07 | Khóa quản trị viên hoạt động cuối cùng. | Bị từ chối; hệ thống vẫn còn ít nhất một quản trị viên hoạt động. |
| TC-ACC-08 | Nhân viên/Giáo viên/Học sinh gọi URL hoặc API chức năng. | Bị từ chối HTTP 403, không rò rỉ dữ liệu tài khoản. |
