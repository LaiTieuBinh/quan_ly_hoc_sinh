# Detail Design — MH-01 Đăng nhập

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-01 |
| Mã chức năng | AUTH-LOGIN |
| Đầu vào | `ten_dang_nhap`, `mat_khau` |
| Đầu ra | Phiên đăng nhập hợp lệ và thông tin người dùng tối thiểu, hoặc lỗi xác thực chung. |
| Bảng chính | `TaiKhoan`; bảng nhật ký thao tác khi được triển khai. |

Thiết kế này là logic độc lập với framework. Đường dẫn API, kiểu token và cấu trúc phiên có thể được ánh xạ theo công nghệ triển khai.

## 2. Đặc tả dữ liệu giao diện

| Mã | Tên trường | Tên dữ liệu | Kiểu | Ràng buộc | Giá trị sau lỗi |
| --- | --- | --- | --- | --- | --- |
| LGN-01 | Tên đăng nhập | `ten_dang_nhap` | Chuỗi | Bắt buộc; cắt khoảng trắng đầu/cuối trước khi gửi. | Giữ lại. |
| LGN-02 | Mật khẩu | `mat_khau` | Chuỗi bí mật | Bắt buộc; không ghi log, không lưu vào local storage. | Xóa. |
| LGN-04 | Nút Đăng nhập | — | Hành động | Chỉ gọi API sau khi kiểm tra hai trường bắt buộc. | Kích hoạt lại khi xử lý xong. |

## 3. Quy tắc kiểm tra

| Mã | Điều kiện | Xử lý tại giao diện | Xử lý tại máy chủ |
| --- | --- | --- | --- |
| V-LOGIN-01 | `ten_dang_nhap` rỗng sau khi trim | Báo lỗi trường. | Từ chối yêu cầu không hợp lệ. |
| V-LOGIN-02 | `mat_khau` rỗng | Báo lỗi trường. | Từ chối yêu cầu không hợp lệ. |
| V-LOGIN-03 | Không tìm thấy tài khoản | Không phân biệt nguyên nhân. | Trả lỗi xác thực chung. |
| V-LOGIN-04 | Mật khẩu không khớp | Không phân biệt nguyên nhân. | Trả lỗi xác thực chung. |
| V-LOGIN-05 | Tài khoản không hoạt động/bị khóa | Không phân biệt nguyên nhân. | Không tạo phiên; trả lỗi xác thực chung. |

## 4. Hợp đồng API đề xuất

### 4.1. Quy ước chung

- Base URL: `/api/v1`; request/response dùng JSON UTF-8, trừ API trả cookie/CSRF.
- API xác thực dùng HTTPS bắt buộc. Máy chủ không ghi `mat_khau`, token phiên đầy đủ, refresh token hay mã CSRF vào log.
- Phiên được ưu tiên lưu trong cookie `HttpOnly`, `Secure`, `SameSite=Lax` hoặc `SameSite=Strict` tùy kiến trúc. Cookie không được JavaScript đọc.
- Nếu hệ thống dùng cookie cho API thay đổi dữ liệu, ứng dụng phải có cơ chế CSRF: token đồng bộ hoặc double-submit cookie, kiểm tra `Origin`/`Referer` phù hợp.
- Thời gian dùng ISO-8601 UTC. Mọi API sau đăng nhập lấy tài khoản từ phiên/token, không nhận `tai_khoan_id` hay `vai_tro` từ client để xác định quyền.
- Cấu trúc lỗi chuẩn:

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Không thể đăng nhập. Vui lòng kiểm tra thông tin đăng nhập hoặc liên hệ quản trị viên.",
    "fields": {}
  }
}
```

| HTTP | Mã lỗi điển hình | Ý nghĩa |
| --- | --- | --- |
| 200 | — | Thao tác thành công. |
| 204 | — | Đăng xuất thành công, không có body. |
| 400 | `VALIDATION_ERROR` | Thiếu/sai định dạng dữ liệu đầu vào. |
| 401 | `AUTH_INVALID_CREDENTIALS`, `SESSION_EXPIRED` | Thông tin xác thực hoặc phiên không hợp lệ. |
| 403 | `ACCOUNT_LOCKED`, `CSRF_INVALID` | Phiên hợp lệ nhưng bị khóa/không qua kiểm tra bảo vệ yêu cầu. |
| 429 | `LOGIN_RATE_LIMITED` | Vượt giới hạn thử đăng nhập. |
| 500 | `AUTH_SERVICE_ERROR` | Lỗi hệ thống; không tiết lộ chi tiết kỹ thuật. |

### 4.2. `POST /api/v1/auth/login` — Đăng nhập

**Không yêu cầu phiên.** Áp dụng rate limit theo địa chỉ nguồn và định danh tài khoản đã chuẩn hóa. Tên đăng nhập được trim trước khi kiểm tra; mật khẩu không trim hoặc chuẩn hóa để không làm thay đổi giá trị bí mật.

`POST /api/v1/auth/login`

| Trường body | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| `ten_dang_nhap` | chuỗi | Có | Không rỗng sau khi trim; giới hạn độ dài theo cấu hình. |
| `mat_khau` | chuỗi bí mật | Có | Không rỗng; chỉ truyền qua HTTPS, không ghi log/lưu client. |
| `remember_me` | boolean | Không | Mặc định `false`; chỉ ảnh hưởng thời hạn phiên theo chính sách. |

**Request body mẫu**

```json
{
  "ten_dang_nhap": "nguyen.van.a",
  "mat_khau": "<gia-tri-nhap-tu-nguoi-dung>",
  "remember_me": false
}
```

**Xử lý máy chủ**

1. Kiểm tra dữ liệu bắt buộc và giới hạn tần suất.
2. Tìm tài khoản theo tên đăng nhập chuẩn hóa; kiểm tra mật khẩu bằng Argon2id/bcrypt; kiểm tra trạng thái hoạt động.
3. Với mọi thất bại xác thực, trả cùng HTTP 401/nội dung chung để không phân biệt tài khoản không tồn tại, sai mật khẩu hay bị khóa.
4. Khi thành công, xoay vòng session ID, tạo phiên có hạn, thiết lập cookie phiên, ghi audit thành công và trả dữ liệu người dùng tối thiểu.

**Phản hồi thành công — HTTP 200**

```json
{
  "data": {
    "tai_khoan_id": 101,
    "ten_dang_nhap": "nguyen.van.a",
    "vai_tro": "GIAO_VIEN",
    "ho_ten": "Nguyễn Văn A",
    "phien": {
      "het_han_luc": "2026-08-20T12:00:00Z",
      "thoi_luong_phut": 120
    }
  }
}
```

Ví dụ header phản hồi:

```text
Set-Cookie: session_id=<opaque-value>; Path=/; HttpOnly; Secure; SameSite=Lax
Cache-Control: no-store
```

Cookie chỉ chứa định danh phiên opaque hoặc token ngắn hạn có chữ ký; không chứa mật khẩu. Nếu kiến trúc bắt buộc trả access token trong body, token phải ngắn hạn, không lưu persistent trong `localStorage`; rủi ro XSS phải được đánh giá riêng.

**Phản hồi lỗi xác thực — HTTP 401**

```json
{
  "error": {
    "code": "AUTH_INVALID_CREDENTIALS",
    "message": "Không thể đăng nhập. Vui lòng kiểm tra thông tin đăng nhập hoặc liên hệ quản trị viên."
  }
}
```

**Phản hồi dữ liệu không hợp lệ — HTTP 400**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "fields": {
      "ten_dang_nhap": "Vui lòng nhập tên đăng nhập."
    }
  }
}
```

**Phản hồi giới hạn tần suất — HTTP 429**

```json
{
  "error": {
    "code": "LOGIN_RATE_LIMITED",
    "message": "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau."
  }
}
```

Response có header `Retry-After`; thông điệp không nêu định danh tài khoản bị giới hạn.

### 4.3. `GET /api/v1/auth/me` — Lấy thông tin phiên hiện tại

**Yêu cầu phiên hợp lệ.** API được gọi khi khởi động lại ứng dụng, tải lại trang hoặc trước khi dựng menu/điều hướng. Không trả hash mật khẩu, token, dữ liệu tài chính hay hồ sơ đầy đủ.

**Request:** không có body. Với cookie session, trình duyệt gửi cookie `session_id`; với Bearer token, gửi header `Authorization`.

**Phản hồi thành công — HTTP 200**

```json
{
  "data": {
    "tai_khoan_id": 101,
    "ten_dang_nhap": "nguyen.van.a",
    "vai_tro": "GIAO_VIEN",
    "ho_ten": "Nguyễn Văn A",
    "ho_so_lien_ket": { "loai": "GIAO_VIEN", "id": 8 },
    "quyen": ["DASHBOARD_READ", "ATTENDANCE_WRITE"],
    "phien": { "het_han_luc": "2026-08-20T12:00:00Z" }
  }
}
```

Nếu phiên hết hạn/bị thu hồi/tài khoản đã khóa, trả HTTP 401 `SESSION_EXPIRED`, đồng thời xóa cookie phiên khi phù hợp. Client phải đưa người dùng về màn hình đăng nhập và không dùng dữ liệu phiên cache cũ.

### 4.4. `POST /api/v1/auth/refresh` — Làm mới phiên (khi áp dụng)

**Yêu cầu refresh cookie/token hợp lệ.** Endpoint chỉ cần khi kiến trúc dùng access token ngắn hạn tách refresh token; nếu dùng session server-side có sliding expiration, endpoint này có thể không triển khai.

**Request:** không cần body; refresh token phải nằm trong cookie `HttpOnly` riêng với `Path` hẹp, ví dụ `/api/v1/auth/refresh`.

**Phản hồi thành công — HTTP 200:** thiết lập access/session mới, xoay vòng refresh token và trả thông tin phiên tối thiểu.

```json
{
  "data": {
    "phien": { "het_han_luc": "2026-08-20T14:00:00Z" }
  }
}
```

- Refresh token phải một lần dùng hoặc được xoay vòng; phát hiện token cũ bị dùng lại thì thu hồi chuỗi phiên theo chính sách.
- Không gọi refresh đồng thời nhiều lần từ client; giao diện gom các request đang chờ thành một request refresh.
- Lỗi refresh trả HTTP 401 `SESSION_EXPIRED`, xóa cookie tương ứng và yêu cầu đăng nhập lại.

### 4.5. `POST /api/v1/auth/logout` — Đăng xuất

**Yêu cầu phiên hợp lệ; idempotent theo chính sách.** Nếu dùng cookie, request phải gửi CSRF token hợp lệ.

**Request body:** không bắt buộc. Có thể hỗ trợ tùy chọn sau cho thiết bị hiện tại:

```json
{ "thu_hoi_tat_ca_phien": false }
```

`thu_hoi_tat_ca_phien` chỉ được chấp nhận khi người dùng đã xác thực lại hoặc có chính sách phù hợp; mặc định chỉ thu hồi phiên hiện tại.

**Phản hồi thành công — HTTP 204:** máy chủ đánh dấu phiên thu hồi, xóa cookie phiên và refresh cookie bằng `Max-Age=0`, ghi audit `DANG_XUAT`. Với phiên đã hết hạn, API vẫn có thể trả 204 để tránh tiết lộ trạng thái phiên.

### 4.6. `GET /api/v1/auth/csrf-token` — Lấy token CSRF (khi dùng cookie)

**Không yêu cầu phiên, không tạo phiên đăng nhập.** Chỉ triển khai khi cơ chế CSRF yêu cầu token do máy chủ cấp.

**Phản hồi HTTP 200**

```json
{
  "data": { "csrf_token": "<token-ngau-nhien-ngan-han>" }
}
```

Client gửi token ở header `X-CSRF-Token` cho các request thay đổi trạng thái, gồm logout. Token bị thiếu/không hợp lệ trả HTTP 403 `CSRF_INVALID`. Token không phải bí mật thay thế cho phiên và không cấp quyền độc lập.

### 4.7. Bảng tổng hợp endpoint

| Endpoint | Xác thực | Mục đích | Phản hồi thành công |
| --- | --- | --- | --- |
| `POST /auth/login` | Không | Xác thực và tạo phiên. | 200 + cookie phiên. |
| `GET /auth/me` | Phiên hợp lệ | Lấy người dùng/quyền hiện tại. | 200. |
| `POST /auth/refresh` | Refresh token, nếu áp dụng | Gia hạn/đổi phiên. | 200 + cookie/token mới. |
| `POST /auth/logout` | Phiên + CSRF nếu cookie | Thu hồi phiên hiện tại. | 204. |
| `GET /auth/csrf-token` | Không/phiên tùy cơ chế | Cấp token bảo vệ CSRF. | 200. |

## 5. Pseudocode xử lý phía máy chủ

```text
login(ten_dang_nhap, mat_khau, request_context):
    username = trim(ten_dang_nhap)
    validate(username is not empty, mat_khau is not empty)

    tai_khoan = tim_tai_khoan_theo_ten_dang_nhap(username)
    authentication_valid = tai_khoan exists
        AND tai_khoan.trang_thai == HOAT_DONG
        AND verify_password(mat_khau, tai_khoan.mat_khau_ma_hoa)

    if not authentication_valid:
        ghi_nhat_ky_dang_nhap(FAIL, username, request_context)
        return HTTP 401 with generic message

    session = tao_phien_an_toan(tai_khoan.id, tai_khoan.vai_tro)
    ghi_nhat_ky_dang_nhap(SUCCESS, username, request_context)
    return HTTP 200 with minimal account/session information
```

Việc so sánh mật khẩu phải sử dụng hàm kiểm tra của thuật toán băm đã chọn (ví dụ Argon2id hoặc bcrypt); không tự mã hóa lại mật khẩu bằng thuật toán có thể đảo ngược.

## 6. Truy cập dữ liệu và nhật ký

| Đối tượng | Thao tác | Điều kiện |
| --- | --- | --- |
| `TaiKhoan` | Đọc theo `ten_dang_nhap` | Chỉ lấy dữ liệu phục vụ xác thực; không trả `mat_khau_ma_hoa` ra client. |
| `TaiKhoan` | Kiểm tra `trang_thai`, `vai_tro` | Chỉ tạo phiên cho tài khoản hoạt động. |
| `NhatKyThaoTac` hoặc nhật ký hệ thống | Thêm | Ghi kết quả thành công/thất bại, thời gian, tài khoản nếu xác định được và thông tin kỹ thuật tối thiểu. |

Không ghi mật khẩu, token phiên đầy đủ hoặc dữ liệu bí mật vào nhật ký. Cần hạn chế tốc độ/thử lại đăng nhập theo tên tài khoản và/hoặc địa chỉ nguồn để giảm nguy cơ dò mật khẩu.

## 7. Trạng thái giao diện và lỗi kỹ thuật

| Trạng thái | Hành vi |
| --- | --- |
| Mặc định | Nút đăng nhập hoạt động; trường mật khẩu ở chế độ che. |
| Đang gửi | Vô hiệu hóa nút, hiển thị chỉ báo đang xử lý, ngăn gửi trùng. |
| Lỗi kiểm tra | Hiển thị lỗi tại trường tương ứng, không gọi API. |
| Lỗi 401 | Xóa mật khẩu, hiển thị thông báo chung, đưa tiêu điểm về trường tên đăng nhập hoặc mật khẩu theo thiết kế UX. |
| Lỗi mạng/5xx | Giữ tên đăng nhập, xóa mật khẩu, cho phép thử lại; không hiển thị chi tiết kỹ thuật cho người dùng. |
| Thành công | Lưu phiên theo cơ chế bảo mật, điều hướng đến Tổng quan. |

## 8. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-LGN-01 | Bỏ trống cả hai trường | Hiện hai lỗi bắt buộc, không gọi API. |
| TC-LGN-02 | Tài khoản/mật khẩu hợp lệ, đang hoạt động | Nhận HTTP 200, tạo phiên và chuyển trang đúng vai trò. |
| TC-LGN-03 | Sai tên đăng nhập | Nhận HTTP 401 với thông báo chung; có nhật ký thất bại. |
| TC-LGN-04 | Sai mật khẩu | Kết quả hiển thị giống TC-LGN-03; mật khẩu bị xóa. |
| TC-LGN-05 | Tài khoản bị khóa | Không tạo phiên; thông báo giống lỗi xác thực chung. |
| TC-LGN-06 | Nhấn nút nhiều lần khi đang xử lý | Chỉ gửi một yêu cầu đăng nhập. |
| TC-LGN-07 | Kiểm tra nhật ký | Có sự kiện thành công/thất bại, không chứa mật khẩu hoặc token. |
