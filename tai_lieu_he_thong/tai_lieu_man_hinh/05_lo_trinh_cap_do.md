# MH-05 — Lộ trình cấp độ JLPT

**Người dùng:** Quản trị viên, nhân viên được cấp quyền.  
**Liên quan:** FR-LVL-01 đến FR-LVL-04, BR-01, BR-10.

## Nội dung

- Danh sách học sinh theo cấp độ hiện tại và trạng thái đạt/sắp đạt/chưa đạt điều kiện lên cấp.
- Lịch sử gồm cấp độ cũ, cấp độ mới, ngày áp dụng, lý do, người thực hiện và thời gian thao tác.
- Khu vực cấu hình tiêu chí: điểm, tỷ lệ chuyên cần và đánh giá giáo viên.

## Thao tác và kiểm tra

1. Chọn học sinh, nhập cấp độ mới, ngày áp dụng và lý do.
2. Hệ thống ghi `LichSuCapDo`, cập nhật cấp độ hiện tại và nhật ký thay đổi.
3. Mỗi học sinh chỉ có một cấp độ hiện tại tại một thời điểm (BR-01); giá trị hợp lệ là N5–N1.
4. Ngoại lệ đăng ký lớp khác cấp độ phải có dấu vết phê duyệt theo BR-02.
