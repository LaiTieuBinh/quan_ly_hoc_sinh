# Basic Design — MH-03 Tài khoản và phân quyền

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-03 |
| Tên màn hình | Tài khoản và phân quyền |
| Tài liệu nguồn | `../03_tai_khoan_phan_quyen.md` |
| Yêu cầu liên quan | FR-AUTH-02, FR-AUTH-03, NFR-02 |
| Người dùng | Quản trị viên |
| Mục đích | Quản lý tài khoản đăng nhập, vai trò, trạng thái truy cập và liên kết hồ sơ giáo viên/học sinh. |

## 2. Phạm vi và nguyên tắc truy cập

- Chỉ người dùng có vai trò **Quản trị viên** được mở màn hình và gọi API của chức năng này.
- Người dùng không có quyền bị từ chối truy cập (HTTP 403 hoặc chuyển về trang không có quyền); không hiển thị dữ liệu tài khoản.
- Mật khẩu chỉ được nhập khi tạo hoặc đặt lại; không hiển thị, không trả về API và không ghi log.
- Mỗi tài khoản có một vai trò chính: Quản trị viên, Nhân viên, Giáo viên hoặc Học sinh.
- Hồ sơ liên kết chỉ áp dụng với vai trò Giáo viên/Học sinh và tối đa một hồ sơ tương ứng cho mỗi tài khoản.

## 3. Bố cục giao diện

```text
+------------------------------------------------------------------------+
| Tài khoản và phân quyền                              [+ Tạo tài khoản] |
+------------------------------------------------------------------------+
| [Tìm theo tên đăng nhập] [Vai trò ▼] [Trạng thái ▼] [Tìm kiếm] [Đặt lại] |
+------------------------------------------------------------------------+
| Tên đăng nhập | Vai trò | Trạng thái | Hồ sơ liên kết | Cập nhật | ... |
| admin          | QTV     | Hoạt động | —              | ...      | [⋮] |
| gv.nguyen      | GV      | Khóa      | Nguyễn A       | ...      | [⋮] |
|                                                                    ... |
|                                      [<] Trang 1 / N [>]               |
+------------------------------------------------------------------------+

Nhấn [⋮] trên một dòng: [Chỉnh sửa] [Khóa/Mở khóa] [Đặt lại mật khẩu]
```

Trên màn hình nhỏ, vùng lọc xếp dọc; bảng cho phép cuộn ngang. Các thao tác của mỗi dòng vẫn luôn truy cập được qua nút hành động.

## 4. Danh sách tài khoản

| Mã | Thành phần | Hiển thị / quy tắc |
| --- | --- | --- |
| ACC-LST-01 | Tên đăng nhập | Chuỗi duy nhất; là liên kết mở biểu mẫu chỉnh sửa nếu người dùng có quyền. |
| ACC-LST-02 | Vai trò | Quản trị viên, Nhân viên, Giáo viên hoặc Học sinh. |
| ACC-LST-03 | Trạng thái | Nhãn `Hoạt động` hoặc `Khóa`; tài khoản khóa không thể đăng nhập. |
| ACC-LST-04 | Hồ sơ liên kết | Tên và mã hồ sơ Giáo viên/Học sinh nếu có; các vai trò khác hiển thị `—`. |
| ACC-LST-05 | Thời gian tạo/cập nhật | Định dạng ngày giờ theo cấu hình hệ thống; cập nhật là lần thay đổi gần nhất. |
| ACC-LST-06 | Hành động | Chỉnh sửa, Khóa/Mở khóa, Đặt lại mật khẩu. |
| ACC-LST-07 | Phân trang | Mặc định 20 dòng/trang; hỗ trợ chuyển trang và hiển thị tổng số bản ghi. |

## 5. Bộ lọc và tìm kiếm

| Mã | Trường | Kiểu | Quy tắc |
| --- | --- | --- | --- |
| ACC-FLT-01 | Tên đăng nhập | Ô nhập | Tìm gần đúng, không phân biệt hoa/thường; bỏ khoảng trắng đầu/cuối. |
| ACC-FLT-02 | Vai trò | Danh sách chọn | `Tất cả` là mặc định. |
| ACC-FLT-03 | Trạng thái | Danh sách chọn | `Tất cả`, `Hoạt động`, `Khóa`; mặc định `Tất cả`. |
| ACC-FLT-04 | Tìm kiếm | Nút | Áp dụng điều kiện, đưa phân trang về trang đầu. |
| ACC-FLT-05 | Đặt lại | Nút | Xóa toàn bộ điều kiện lọc và tải lại danh sách. |

## 6. Biểu mẫu tạo và cập nhật

Biểu mẫu hiển thị dạng hộp thoại hoặc trang chi tiết, tiêu đề lần lượt là `Tạo tài khoản` và `Cập nhật tài khoản`.

| Mã | Trường | Tạo | Cập nhật | Quy tắc hiển thị |
| --- | --- | --- | --- | --- |
| ACC-FRM-01 | Tên đăng nhập | Bắt buộc | Bắt buộc | Duy nhất trong hệ thống. |
| ACC-FRM-02 | Mật khẩu | Bắt buộc | Không hiển thị | Chỉ tồn tại ở luồng tạo/đặt lại mật khẩu. |
| ACC-FRM-03 | Vai trò | Bắt buộc | Bắt buộc | Chọn một trong bốn vai trò được hỗ trợ. |
| ACC-FRM-04 | Trạng thái | Bắt buộc | Bắt buộc | Mặc định `Hoạt động` khi tạo. |
| ACC-FRM-05 | Hồ sơ liên kết | Có điều kiện | Có điều kiện | Chỉ hiện khi vai trò là Giáo viên hoặc Học sinh; tối đa một hồ sơ. |
| ACC-FRM-06 | Lưu / Hủy | Có | Có | Lưu khi hợp lệ; Hủy không ghi nhận thay đổi. |

Khi đổi vai trò sang Giáo viên hoặc Học sinh, hệ thống yêu cầu chọn hồ sơ đúng loại. Khi đổi sang Quản trị viên/Nhân viên, trường hồ sơ liên kết bị ẩn; nếu đã có liên kết, người dùng phải xác nhận việc gỡ liên kết trước khi lưu.

## 7. Luồng thao tác chính

| Thao tác | Luồng người dùng | Kết quả |
| --- | --- | --- |
| Tạo tài khoản | Chọn `Tạo tài khoản` → nhập biểu mẫu → `Lưu` | Tạo tài khoản, mã hóa mật khẩu và hiển thị bản ghi mới trong danh sách. |
| Cập nhật | Chọn `Chỉnh sửa` → sửa thông tin cho phép → `Lưu` | Cập nhật tài khoản và thời gian cập nhật. |
| Khóa/Mở khóa | Chọn hành động → xác nhận | Đổi trạng thái; tài khoản khóa không đăng nhập được. |
| Đặt lại mật khẩu | Chọn hành động → nhập mật khẩu mới → xác nhận | Thay mật khẩu đã mã hóa; không hiển thị lại giá trị nhập. |
| Gán vai trò/hồ sơ | Chỉnh sửa vai trò và hồ sơ liên kết → `Lưu` | Kiểm tra tính tương ứng, duy nhất và quyền truy cập sau thay đổi. |

## 8. Trạng thái giao diện

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ tại vùng bảng hoặc biểu mẫu. |
| Không có dữ liệu | `Không tìm thấy tài khoản phù hợp.` |
| Lỗi tải dữ liệu | Thông báo ngắn và nút `Thử lại`. |
| Dữ liệu không hợp lệ | Hiển thị lỗi ngay dưới trường tương ứng; giữ nguyên dữ liệu đã nhập. |
| Thao tác thành công | Thông báo xác nhận, đóng biểu mẫu/xác nhận và tải lại danh sách. |
| Thao tác thất bại | Thông báo nguyên nhân an toàn, không để lộ thông tin mật khẩu hoặc dữ liệu nhạy cảm. |

## 9. Tiêu chí nghiệm thu

- Quản trị viên tìm kiếm, lọc và phân trang được danh sách tài khoản theo đúng điều kiện.
- Tài khoản mới có tên đăng nhập duy nhất, vai trò/trạng thái hợp lệ và mật khẩu không bị hiển thị lại.
- Tài khoản Giáo viên/Học sinh chỉ liên kết tối đa một hồ sơ đúng loại; hồ sơ không được gán trùng cho tài khoản khác.
- Sau khi khóa, tài khoản không thể đăng nhập; sau khi mở khóa, có thể đăng nhập lại nếu thông tin xác thực hợp lệ.
- Người không phải quản trị viên không thể truy cập cả giao diện lẫn API quản lý tài khoản.
