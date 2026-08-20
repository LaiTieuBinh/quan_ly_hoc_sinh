# Basic Design — MH-08 Giáo viên và phân công

## 1. Thông tin chung

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-08 |
| Tên màn hình | Giáo viên và phân công |
| Tài liệu nguồn | `../08_giao_vien_phan_cong.md` |
| Yêu cầu liên quan | FR-TCH-01, FR-TCH-02 |
| Người dùng | Quản trị viên, Nhân viên |
| Mục đích | Quản lý hồ sơ giáo viên, chuyên môn/cấp độ giảng dạy và phân công giáo viên theo lớp, môn học, vai trò và thời gian hiệu lực. |

## 2. Nguyên tắc truy cập

- Chỉ Quản trị viên hoặc Nhân viên có quyền quản lý giáo viên/phân công được truy cập giao diện và API ghi.
- Giáo viên chỉ được sử dụng các chức năng buổi học, điểm danh, điểm, bài tập và tài liệu trong lớp/môn thuộc phân công hiệu lực của chính mình.
- Phạm vi quyền của giáo viên được máy chủ tính từ phân công, không nhận danh sách lớp/môn do trình duyệt cung cấp.
- Mã giáo viên là duy nhất; hồ sơ đã phát sinh dữ liệu được giữ lịch sử theo trạng thái thay vì xóa cứng.

## 3. Bố cục giao diện

```text
+----------------------------------------------------------------------------+
| Giáo viên và phân công                                                     |
+----------------------------------------------------------------------------+
| [Giáo viên] [Phân công giảng dạy]                                          |
+----------------------------------------------------------------------------+
| [Mã/Họ tên] [Chuyên môn ▼] [Cấp độ dạy ▼] [Trạng thái ▼]     [+ Thêm GV] |
| Mã GV | Họ tên | Liên hệ | Chuyên môn | Cấp độ dạy | Trạng thái | [⋮]   |
| ...                                                                        |
+----------------------------------------------------------------------------+
```

Tab **Phân công giảng dạy** có bộ lọc giáo viên, lớp, môn học, vai trò, trạng thái và ngày hiệu lực; nút `Tạo phân công` chỉ hiện với người có quyền ghi. Trên màn hình nhỏ, bộ lọc xếp dọc và bảng cuộn ngang.

## 4. Danh sách và hồ sơ giáo viên

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| TCH-LST-01 | Mã giáo viên | Bắt buộc, duy nhất; chọn để mở chi tiết. |
| TCH-LST-02 | Họ tên | Bắt buộc. |
| TCH-LST-03 | Liên hệ | Số điện thoại, email và thông tin liên quan theo chính sách bảo vệ dữ liệu. |
| TCH-LST-04 | Chuyên môn | Một hoặc nhiều chuyên môn/danh mục được cấu hình. |
| TCH-LST-05 | Cấp độ có thể giảng dạy | Một hoặc nhiều giá trị N5–N1. |
| TCH-LST-06 | Trạng thái | Trạng thái hoạt động của giáo viên. |
| TCH-FLT-01 | Tìm kiếm | Tìm gần đúng theo mã hoặc họ tên. |
| TCH-FLT-02 | Chuyên môn/cấp độ/trạng thái | Lọc theo điều kiện chọn; mặc định `Tất cả`. |

### Biểu mẫu hồ sơ

| Trường | Quy tắc |
| --- | --- |
| Mã giáo viên | Bắt buộc, duy nhất. |
| Họ tên | Bắt buộc. |
| Liên hệ | Kiểm tra định dạng số điện thoại/email nếu nhập. |
| Chuyên môn | Chọn một hoặc nhiều giá trị hợp lệ. |
| Cấp độ có thể giảng dạy | Chọn một hoặc nhiều cấp độ N5–N1. |
| Trạng thái | Bắt buộc; giáo viên không hoạt động không được gán phân công mới. |

## 5. Danh sách và biểu mẫu phân công

| Mã | Thành phần | Quy tắc |
| --- | --- | --- |
| ASN-LST-01 | Giáo viên | Mã và họ tên giáo viên được phân công. |
| ASN-LST-02 | Lớp/môn học | Lớp và môn học của phân công. |
| ASN-LST-03 | Vai trò | Ví dụ `Giáo viên chính`, `Trợ giảng`; quyết định phạm vi thao tác khi cấu hình. |
| ASN-LST-04 | Thời gian hiệu lực | Từ ngày/đến ngày; dùng kiểm tra lịch và quyền tại thời điểm thao tác. |
| ASN-LST-05 | Trạng thái | Hiệu lực, hết hiệu lực hoặc hủy theo chính sách. |
| ASN-FRM-01 | Giáo viên, lớp, môn học | Bắt buộc; chỉ chọn bản ghi áp dụng. |
| ASN-FRM-02 | Vai trò | Bắt buộc; chọn từ danh mục vai trò phân công. |
| ASN-FRM-03 | Từ ngày/đến ngày | Từ ngày bắt buộc; đến ngày không trước từ ngày nếu có. |
| ASN-FRM-04 | Ghi chú | Không bắt buộc. |

## 6. Hành vi và kiểm tra chính

- Khi chọn lớp, hệ thống đối chiếu cấp độ lớp với danh sách cấp độ giáo viên có thể giảng dạy; cảnh báo hoặc chặn theo chính sách chuyên môn.
- Không tạo phân công mới cho giáo viên/lớp/môn không còn áp dụng hoặc ngoài thời gian hợp lệ của lớp/kỳ học.
- Phân công hết hiệu lực/hủy không bị xóa lịch sử; nó không cấp quyền cho giáo viên thao tác dữ liệu tương lai.
- Các quyền tạo buổi học, điểm danh, điểm, bài tập, tài liệu đều phải kiểm tra lớp, môn và ngày thao tác nằm trong phân công hiệu lực.

## 7. Trạng thái và tiêu chí nghiệm thu

| Trạng thái | Cách hiển thị |
| --- | --- |
| Đang tải | Khung chờ cho từng tab/bảng/biểu mẫu. |
| Không có dữ liệu | Thông báo theo bộ lọc đang chọn. |
| Lỗi kiểm tra | Hiển thị dưới trường nhập, giữ dữ liệu đã nhập. |
| Không có quyền | Ẩn hành động; API từ chối riêng. |
| Thành công | Thông báo xác nhận và tải lại danh sách liên quan. |

- Mã giáo viên không trùng, tìm kiếm/lọc phản ánh đúng chuyên môn và cấp độ dạy.
- Phân công luôn có giáo viên, lớp, môn học, vai trò và thời gian hiệu lực hợp lệ.
- Giáo viên chỉ được thao tác học vụ trong đúng lớp/môn và khoảng thời gian được phân công.
- Dữ liệu phân công cũ vẫn truy vết được sau khi kết thúc hoặc hủy.
