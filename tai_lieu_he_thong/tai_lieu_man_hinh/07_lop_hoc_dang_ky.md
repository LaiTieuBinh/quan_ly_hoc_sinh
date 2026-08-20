# MH-07 — Lớp học và đăng ký lớp

**Người dùng:** Quản trị viên, nhân viên; giáo viên/học sinh chỉ xem dữ liệu liên quan.  
**Liên quan:** FR-CLS-01 đến FR-CLS-03, BR-02, BR-03.

## Lớp học

Hiển thị mã lớp, tên lớp, cấp độ, niên khóa, kỳ học, phòng học, sĩ số và trạng thái. Khi tạo/sửa, bắt buộc chọn đúng một niên khóa, một kỳ học và một cấp độ; kỳ học phải thuộc niên khóa đã chọn.

## Đăng ký lớp

| Thành phần | Quy tắc |
| --- | --- |
| Học sinh và lớp | Bắt buộc; chỉ cho chọn học sinh hợp lệ. |
| Ngày đăng ký | Bắt buộc; là mốc hiệu lực của đăng ký. |
| Trạng thái | Đang học, Đã chuyển lớp, Đã kết thúc hoặc Hủy. |
| Chuyển/kết thúc | Không xóa lịch sử; cập nhật trạng thái và ghi nhận bản ghi liên quan. |

Không được có hai đăng ký `Đang học` chồng lấn của một học sinh trong cùng lớp. Cảnh báo khi cấp độ lớp không phù hợp với cấp độ hiện tại của học sinh, trừ ngoại lệ được phê duyệt.
