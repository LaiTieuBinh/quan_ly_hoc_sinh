# Detail Design — MH-11 Đánh giá và điểm

## 1. Thông tin thiết kế

| Thuộc tính | Nội dung |
| --- | --- |
| Mã màn hình | MH-11 |
| Mã chức năng | ASSESSMENT-AND-GRADING |
| Điều kiện vào | Người dùng đã xác thực và có quyền đánh giá/điểm trong phạm vi lớp-môn hợp lệ. |
| Đầu vào | Bộ lọc; dữ liệu đợt đánh giá; điểm, nhận xét; cấu hình xếp loại. |
| Đầu ra | Đợt đánh giá, danh sách điểm, trung bình/xếp loại, lịch sử thay đổi và kết quả công bố. |

## 2. Mô hình dữ liệu logic

| Thực thể | Trường tối thiểu | Ghi chú |
| --- | --- | --- |
| `DotDanhGia` | `id`, `ten`, `lop_hoc_id`, `mon_hoc_id`, `loai`, `ky_nang`, `ngay_danh_gia`, `diem_toi_thieu`, `diem_toi_da`, `cau_hinh_xep_loai_id`, `trang_thai` | Định nghĩa phạm vi/thang điểm. |
| `Diem` | `id`, `dot_danh_gia_id`, `hoc_sinh_id`, `diem`, `nhan_xet`, `diem_trung_binh`, `xep_loai`, `created_by`, `updated_by`, thời gian | Unique `(dot_danh_gia_id, hoc_sinh_id)`. |
| `CauHinhXepLoai` | `id`, ngưỡng điểm, nhãn xếp loại, hiệu lực | Nguồn tính kết quả. |
| `DangKyLop` | học sinh, lớp, trạng thái, khoảng hiệu lực | Danh sách học sinh được nhập điểm. |
| `PhanCong` | giáo viên, lớp, môn, hiệu lực | Kiểm tra quyền giáo viên. |
| `LichSuDiem` | điểm cũ/mới, nhận xét cũ/mới, người thực hiện, thời gian | Dấu vết chỉnh sửa. |

## 3. Hợp đồng API đề xuất

| API | Mục đích |
| --- | --- |
| `GET/POST /api/v1/dot-danh-gia` | Danh sách và tạo đợt đánh giá. |
| `GET/PATCH /api/v1/dot-danh-gia/{id}` | Chi tiết/cập nhật đợt. |
| `GET /api/v1/dot-danh-gia/{id}/diem` | Danh sách học sinh hợp lệ và điểm hiện có. |
| `PUT /api/v1/dot-danh-gia/{id}/diem` | Lưu hàng loạt điểm. |
| `PUT /api/v1/dot-danh-gia/{id}/diem/{hoc_sinh_id}` | Lưu một điểm. |
| `POST /api/v1/dot-danh-gia/{id}/cong-bo` | Công bố kết quả. |
| `GET /api/v1/dot-danh-gia/{id}/diem/{hoc_sinh_id}/lich-su` | Lịch sử điểm. |
| `GET /api/v1/me/ket-qua-danh-gia` | Kết quả của học sinh đang đăng nhập. |

### 3.1. Tạo/cập nhật đợt đánh giá

```json
{
  "ten": "Kiểm tra nghe giữa kỳ",
  "lop_hoc_id": 5,
  "mon_hoc_id": 3,
  "loai": "KIEM_TRA",
  "ky_nang": "NGHE_HIEU",
  "ngay_danh_gia": "2026-09-15",
  "diem_toi_thieu": 0,
  "diem_toi_da": 100,
  "cau_hinh_xep_loai_id": 2,
  "trang_thai": "DANG_NHAP"
}
```

`POST` yêu cầu quyền `ASSESSMENT_WRITE`; giáo viên phải có phân công hiệu lực lớp/môn tại ngày đánh giá. `PATCH` chỉ gửi trường cần đổi; nếu đã công bố hoặc có điểm, các trường phạm vi/thang điểm chỉ được đổi theo chính sách và có ghi vết. Thành công trả HTTP 201/200 cùng đối tượng đợt đánh giá.

### 3.2. Danh sách và lưu điểm

`GET /api/v1/dot-danh-gia/{id}/diem` kiểm tra quyền đợt đánh giá, sau đó trả học sinh có đăng ký lớp hợp lệ tại ngày đánh giá và điểm hiện có.

```json
{
  "data": {
    "dot_danh_gia": { "id": 12, "diem_toi_thieu": 0, "diem_toi_da": 100, "trang_thai": "DANG_NHAP" },
    "hoc_sinh": [
      { "hoc_sinh_id": 21, "ma": "HS001", "ho_ten": "Trần Minh Anh", "diem": { "id": 101, "gia_tri": 82, "nhan_xet": "Tốt", "xep_loai": "KHA" } }
    ]
  }
}
```

`PUT /api/v1/dot-danh-gia/{id}/diem` nhận `{ "ban_ghi": [{ "hoc_sinh_id": 21, "diem": 82, "nhan_xet": "Tốt" }] }`. API từng dòng có đường dẫn `.../diem/{hoc_sinh_id}` và nhận `diem`, `nhan_xet`.

Máy chủ kiểm tra học sinh thuộc danh sách hợp lệ, điểm là số nằm trong `[diem_toi_thieu, diem_toi_da]`, sau đó upsert theo unique và tính trung bình/xếp loại trên máy chủ. Khi sửa bản ghi có sẵn, tạo `LichSuDiem`; trả HTTP 200 với dòng sau tính toán. Lỗi dữ liệu trả 422, lỗi trùng/xung đột đồng thời trả 409.

### 3.3. Công bố, lịch sử và kết quả cá nhân

`POST /api/v1/dot-danh-gia/{id}/cong-bo` yêu cầu quyền `ASSESSMENT_PUBLISH`, nhận tùy chọn `{ "ghi_chu": "..." }`. Máy chủ kiểm tra đợt có thể công bố theo chính sách, chuyển trạng thái `DA_CONG_BO`, ghi người/thời gian công bố và trả HTTP 200.

`GET /api/v1/dot-danh-gia/{id}/diem/{hoc_sinh_id}/lich-su` trả giá trị cũ/mới, nhận xét, xếp loại, người/thời điểm thay đổi; học sinh không được truy cập lịch sử ngoài chính sách.

`GET /api/v1/me/ket-qua-danh-gia` nhận bộ lọc khoảng thời gian/lớp/môn/kỹ năng. API cố định học sinh theo tài khoản phiên và chỉ trả điểm của đợt `DA_CONG_BO`.

## 4. Quy tắc nghiệp vụ và phân quyền

| Mã | Quy tắc |
| --- | --- |
| GRD-ACL-01 | Giáo viên chỉ tạo/sửa đợt và điểm trong lớp/môn có phân công hiệu lực. |
| GRD-ACL-02 | Học sinh chỉ đọc kết quả đã công bố của chính mình. |
| GRD-BR-01 | Đợt đánh giá có lớp, môn, loại, kỹ năng, ngày, thang điểm và cấu hình xếp loại hợp lệ. |
| GRD-BR-02 | Kỹ năng mặc định hỗ trợ Từ vựng/Ngữ pháp, Đọc hiểu, Nghe hiểu; Nói/Viết theo danh mục mở rộng. |
| GRD-BR-03 | Mỗi học sinh chỉ có một điểm trong một đợt; chỉ học sinh đăng ký lớp hợp lệ mới được nhập. |
| GRD-BR-04 | Điểm phải thuộc thang điểm đợt; trung bình/xếp loại tính ở máy chủ theo cấu hình. |
| GRD-BR-05 | Công bố là cổng hiển thị kết quả cho học sinh; chỉnh sửa sau công bố phải theo quyền/chính sách và ghi lịch sử. |
| GRD-BR-06 | Mọi tạo/sửa/công bố có người thực hiện, thời điểm và nhật ký theo BR-10. |

## 5. Pseudocode lưu điểm

```text
save_scores(actor, assessment_id, records):
    assessment = require_assessment_write_permission(actor, assessment_id)
    eligible = enrolled_students(assessment.class_id, assessment.date)
    validate_records_belong_to(eligible)
    validate_score_range(records, assessment.scale)
    begin_transaction()
    for record in records:
        previous = lock_score(assessment_id, record.student_id)
        result = calculate_grade(record.score, assessment.grading_config)
        upsert_score(record, result, actor)
        if previous changed: write_score_history(previous, record, actor)
    commit_transaction()
```

## 6. Hành vi giao diện, an toàn và hiệu năng

| Sự kiện | Xử lý |
| --- | --- |
| Chọn lớp/môn | Chỉ hiển thị tổ hợp giáo viên được phân công. |
| Nhập điểm | Kiểm tra phạm vi điểm ở giao diện, máy chủ kiểm tra lại khi lưu. |
| Lưu hàng loạt | Chỉ gửi dòng thay đổi; hiển thị lỗi từng dòng/tổng kết thao tác. |
| Công bố | Hiển thị xác nhận, trạng thái và cảnh báo ảnh hưởng đến học sinh. |
| Mở kết quả | Học sinh chỉ thấy dữ liệu đã công bố của bản thân. |

- Dùng ràng buộc unique tại cơ sở dữ liệu và giao dịch khi upsert điểm.
- Không trả điểm hay nhận xét của học sinh khác cho tài khoản học sinh.
- Ghi nhật ký tạo/sửa đợt, điểm, công bố và mọi thay đổi sau công bố.

## 7. Kiểm thử chi tiết tối thiểu

| Mã test | Tình huống | Kết quả mong đợi |
| --- | --- | --- |
| TC-GRD-01 | Giáo viên tạo đợt ngoài lớp/môn phân công. | HTTP 403, không tạo đợt. |
| TC-GRD-02 | Nhập điểm ngoài thang 0–100. | Lỗi tại dòng, không lưu điểm. |
| TC-GRD-03 | Gửi học sinh không đăng ký lớp tại ngày đánh giá. | Bị từ chối, không tạo điểm. |
| TC-GRD-04 | Lưu lại điểm cùng học sinh/đợt. | Cập nhật một bản ghi duy nhất và tạo lịch sử. |
| TC-GRD-05 | Lưu điểm hợp lệ. | Tính đúng trung bình/xếp loại theo cấu hình. |
| TC-GRD-06 | Học sinh xem điểm đợt chưa công bố. | Không nhận dữ liệu. |
| TC-GRD-07 | Công bố đợt đánh giá. | Đúng trạng thái, lưu người/thời gian và học sinh xem được kết quả của mình. |
| TC-GRD-08 | Học sinh truy vấn ID học sinh khác. | Bị từ chối hoặc cố định về hồ sơ bản thân, không rò rỉ dữ liệu. |
