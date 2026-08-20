# MH-04 — Quản lý học sinh

**Người dùng:** Quản trị viên, nhân viên; giáo viên chỉ xem học sinh thuộc lớp được phân công; học sinh chỉ xem hồ sơ của mình.  
**Liên quan:** FR-STU-01 đến FR-STU-03, FR-STU-02, BR-08.

## Danh sách

Hiển thị mã học sinh, họ tên, ngày sinh, liên hệ, trạng thái, cấp độ hiện tại và các lớp đang học. Lọc theo trạng thái, cấp độ, lớp, niên khóa/kỳ học; tìm theo mã hoặc họ tên.

## Biểu mẫu hồ sơ

| Trường | Quy tắc |
| --- | --- |
| Mã học sinh | Bắt buộc, duy nhất trong hệ thống. |
| Họ tên, ngày sinh, giới tính | Họ tên và ngày sinh bắt buộc; kiểm tra ngày hợp lệ. |
| Ảnh, liên hệ | Tệp ảnh hợp lệ; lưu thông tin liên hệ. |
| Trạng thái | Đang học, Bảo lưu hoặc Nghỉ học. |
| Cấp độ hiện tại | Bắt buộc với học sinh đang học: N5, N4, N3, N2 hoặc N1. |

## Thao tác

- Thêm, sửa, xem chi tiết hồ sơ; mở các tab lịch sử cấp độ, đăng ký lớp, chuyên cần, điểm, học phí và bài tập theo quyền.
- Không xóa cứng hồ sơ nếu đã có dữ liệu phát sinh; dùng trạng thái để giữ lịch sử.
