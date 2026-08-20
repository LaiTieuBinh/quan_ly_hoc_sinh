# Tài liệu mối quan hệ bảng và ERD

## 1. Mục đích và phạm vi

Tài liệu này diễn giải mô hình dữ liệu logic từ mục **7. Dữ liệu cốt lõi** trong tài liệu đặc tả hệ thống quản lý học sinh tiếng Nhật. Để phản ánh đúng quan hệ và tránh lặp dữ liệu, các mục được viết gộp trong đặc tả được tách thành các bảng riêng:

- `DotDanhGia/Diem` → `DotDanhGia` và `Diem`.
- `NghiaVuHocPhi/GiaoDich` → `NghiaVuHocPhi` và `GiaoDichHocPhi`.
- `BaiTap/BaiNop` → `BaiTap` và `BaiNop`.
- `NienKhoa/KyHoc` → `NienKhoa` và `KyHoc`.

`MonHoc` cũng được bổ sung vì nhiều bảng đã tham chiếu `mon_hoc_id` và yêu cầu FR-SUB-01 quy định phải quản lý danh mục môn học.

Quy ước: `PK` là khóa chính, `FK` là khóa ngoại, `UQ` là ràng buộc duy nhất. Quan hệ mang nhãn `0..n` là tùy chọn ở phía nhiều.

## 2. Danh mục bảng và vai trò

| Nhóm | Bảng | Khóa chính / khóa ngoại chính | Vai trò |
| --- | --- | --- | --- |
| Người dùng | `TaiKhoan` | `id` | Lưu thông tin đăng nhập, vai trò và trạng thái tài khoản. |
| Người dùng | `HocSinh` | `id`, `tai_khoan_id` (FK, UQ, có thể rỗng) | Hồ sơ học sinh và cấp độ JLPT hiện tại. |
| Người dùng | `GiaoVien` | `id`, `tai_khoan_id` (FK, UQ, có thể rỗng) | Hồ sơ, liên hệ và chuyên môn giáo viên. |
| Lộ trình | `LichSuCapDo` | `id`, `hoc_sinh_id` (FK) | Lưu từng lần thay đổi cấp độ của học sinh. |
| Học vụ | `NienKhoa` | `id` | Khoảng thời gian của niên khóa. |
| Học vụ | `KyHoc` | `id`, `nien_khoa_id` (FK) | Kỳ học thuộc một niên khóa. |
| Học vụ | `MonHoc` | `id` | Danh mục môn/kỹ năng: từ vựng, ngữ pháp, nghe, nói, đọc, viết, Kanji. |
| Học vụ | `LopHoc` | `id`, `nien_khoa_id` (FK), `ky_hoc_id` (FK) | Lớp theo cấp độ, niên khóa, kỳ học và phòng mặc định. |
| Học vụ | `DangKyLop` | `id`, `hoc_sinh_id` (FK), `lop_hoc_id` (FK) | Liên kết học sinh–lớp và lưu lịch sử trạng thái đăng ký. |
| Giảng dạy | `PhanCong` | `id`, `giao_vien_id` (FK), `lop_hoc_id` (FK), `mon_hoc_id` (FK) | Phân công giáo viên cho một lớp và môn học. |
| Giảng dạy | `BuoiHoc` | `id`, `phan_cong_id` (FK) | Một buổi học cụ thể; dùng phân công để xác định lớp, môn và giáo viên. |
| Chuyên cần | `DiemDanh` | `id`, `buoi_hoc_id` (FK), `hoc_sinh_id` (FK) | Kết quả điểm danh của một học sinh trong một buổi. |
| Đánh giá | `DotDanhGia` | `id`, `lop_hoc_id` (FK), `mon_hoc_id` (FK) | Đợt kiểm tra/đánh giá theo lớp, môn, loại và kỹ năng. |
| Đánh giá | `Diem` | `id`, `dot_danh_gia_id` (FK), `hoc_sinh_id` (FK) | Điểm và nhận xét của một học sinh ở một đợt đánh giá. |
| Thi chứng chỉ | `KyThiJLPT` | `id`, `hoc_sinh_id` (FK) | Kết quả các lần thi JLPT chính thức hoặc thi thử. |
| Học phí | `NghiaVuHocPhi` | `id`, `hoc_sinh_id` (FK), `lop_hoc_id` (FK) | Khoản phải thu của học sinh theo lớp; lưu tổng tiền, miễn giảm và trạng thái. |
| Học phí | `GiaoDichHocPhi` | `id`, `nghia_vu_hoc_phi_id` (FK), `nguoi_thu_id` (FK) | Mỗi lần thanh toán thuộc một nghĩa vụ học phí. |
| Bài tập | `BaiTap` | `id`, `lop_hoc_id` (FK), `mon_hoc_id` (FK), `nguoi_tao_id` (FK) | Bài tập được giao cho lớp/môn, có hạn nộp và trạng thái. |
| Bài tập | `BaiNop` | `id`, `bai_tap_id` (FK), `hoc_sinh_id` (FK) | Bài làm của một học sinh, thời điểm nộp, điểm và nhận xét. |
| Học liệu | `TaiLieu` | `id`, `nguoi_tao_id` (FK), `lop_hoc_id` (FK, có thể rỗng), `mon_hoc_id` (FK, có thể rỗng) | Tài liệu theo lớp, môn và/hoặc cấp độ; có thể ẩn hoặc hiển thị. |

## 3. Quan hệ giữa các bảng

| Bảng cha | Quan hệ | Bảng con | Ý nghĩa |
| --- | --- | --- | --- |
| `TaiKhoan` | 1 — 0..1 | `HocSinh` | Một học sinh có thể được cấp một tài khoản; một tài khoản học sinh chỉ gắn tối đa một hồ sơ học sinh. |
| `TaiKhoan` | 1 — 0..1 | `GiaoVien` | Một giáo viên có thể được cấp một tài khoản; một tài khoản giáo viên chỉ gắn tối đa một hồ sơ giáo viên. |
| `TaiKhoan` | 1 — 0..n | `TaiLieu`, `BaiTap`, `GiaoDichHocPhi` | Tài khoản tạo tài liệu/bài tập hoặc là người thu tiền. |
| `HocSinh` | 1 — 0..n | `LichSuCapDo` | Mỗi thay đổi cấp độ tạo một bản ghi lịch sử. |
| `NienKhoa` | 1 — 1..n | `KyHoc` | Một niên khóa gồm một hoặc nhiều kỳ học. |
| `NienKhoa` | 1 — 0..n | `LopHoc` | Lớp thuộc niên khóa. |
| `KyHoc` | 1 — 0..n | `LopHoc` | Lớp thuộc kỳ học. `KyHoc.nien_khoa_id` phải khớp `LopHoc.nien_khoa_id`. |
| `HocSinh` ↔ `LopHoc` | n — n | `DangKyLop` | Bảng trung gian lưu việc đăng ký, chuyển lớp, kết thúc hoặc hủy. |
| `GiaoVien` ↔ `LopHoc` ↔ `MonHoc` | n — n — n | `PhanCong` | Một phân công xác định giáo viên dạy một môn trong một lớp. |
| `PhanCong` | 1 — 0..n | `BuoiHoc` | Buổi học phải dùng một phân công hợp lệ, nhờ đó không lệch lớp/môn/giáo viên. |
| `BuoiHoc` ↔ `HocSinh` | n — n | `DiemDanh` | Một dòng điểm danh cho một học sinh trong một buổi học. |
| `LopHoc`, `MonHoc` | 1 — 0..n | `DotDanhGia` | Đợt đánh giá áp dụng cho một lớp và một môn. |
| `DotDanhGia` ↔ `HocSinh` | n — n | `Diem` | Một điểm là kết quả của một học sinh trong một đợt đánh giá. |
| `HocSinh` | 1 — 0..n | `KyThiJLPT` | Lưu nhiều lần thi để so sánh kết quả. |
| `HocSinh`, `LopHoc` | 1 — 0..n | `NghiaVuHocPhi` | Nghĩa vụ học phí phát sinh cho học sinh đăng ký lớp. |
| `NghiaVuHocPhi` | 1 — 0..n | `GiaoDichHocPhi` | Một nghĩa vụ có thể thanh toán một hoặc nhiều đợt. |
| `LopHoc`, `MonHoc` | 1 — 0..n | `BaiTap` | Bài tập được giao cho một lớp và môn học. |
| `BaiTap` ↔ `HocSinh` | n — n | `BaiNop` | Mỗi học sinh có tối đa một bài nộp cho một bài tập. |
| `LopHoc`, `MonHoc` | 1 — 0..n | `TaiLieu` | Tài liệu có thể gắn lớp/môn; hai khóa này có thể rỗng với tài liệu dùng chung theo cấp độ. |

## 4. Ràng buộc dữ liệu quan trọng

1. `TaiKhoan.ten_dang_nhap`, `HocSinh.ma_hoc_sinh` và `GiaoVien.ma_giao_vien` là duy nhất.
2. `HocSinh.tai_khoan_id` và `GiaoVien.tai_khoan_id`, nếu dùng, là duy nhất. Vai trò của tài khoản phải tương ứng với hồ sơ gắn kèm.
3. `DangKyLop` cần ràng buộc duy nhất theo `(hoc_sinh_id, lop_hoc_id, ngay_dang_ky)` để lưu lịch sử mà không lặp cùng sự kiện. Đồng thời áp dụng BR-03: không có hai đăng ký `Dang hoc` chồng lấn cho cùng học sinh và lớp.
4. `DiemDanh` duy nhất theo `(buoi_hoc_id, hoc_sinh_id)`; chỉ được tạo khi học sinh có đăng ký lớp hợp lệ tại ngày diễn ra buổi học (BR-04, BR-05).
5. `Diem` duy nhất theo `(dot_danh_gia_id, hoc_sinh_id)`; học sinh phải thuộc lớp của đợt đánh giá.
6. `BaiNop` duy nhất theo `(bai_tap_id, hoc_sinh_id)`; chỉ nhận từ học sinh đang học lớp được giao. Trạng thái đúng/trễ hạn được suy ra từ `thoi_diem_nop` và `BaiTap.han_nop`.
7. Tổng `GiaoDichHocPhi.so_tien` của một `NghiaVuHocPhi` không vượt số phải thu sau miễn giảm, trừ khi hệ thống hỗ trợ thanh toán thừa (BR-09).
8. `BuoiHoc` không được trùng thời gian với cùng lớp, giáo viên hoặc phòng. Phân công và đợt đánh giá cần phù hợp với lớp/môn liên quan.
9. Các thay đổi cấp độ, điểm, điểm danh và giao dịch học phí phải lưu `nguoi_thuc_hien_id` và thời gian tạo/cập nhật để đáp ứng BR-10. Có thể chuẩn hóa thêm bảng `NhatKyThaoTac` ở giai đoạn triển khai.

## 5. ERD

Sơ đồ dưới đây dùng cú pháp Mermaid. Có thể xem trực tiếp trên GitHub, GitLab, Mermaid Live Editor hoặc các công cụ hỗ trợ Mermaid.

```mermaid
erDiagram
    TAI_KHOAN ||--o| HOC_SINH : "dang_nhap_cho"
    TAI_KHOAN ||--o| GIAO_VIEN : "dang_nhap_cho"
    TAI_KHOAN ||--o{ TAI_LIEU : "tao"
    TAI_KHOAN ||--o{ BAI_TAP : "tao"
    TAI_KHOAN ||--o{ GIAO_DICH_HOC_PHI : "thu"

    HOC_SINH ||--o{ LICH_SU_CAP_DO : "co"
    NIEN_KHOA ||--|{ KY_HOC : "gom"
    NIEN_KHOA ||--o{ LOP_HOC : "quan_ly"
    KY_HOC ||--o{ LOP_HOC : "co"
    HOC_SINH ||--o{ DANG_KY_LOP : "dang_ky"
    LOP_HOC ||--o{ DANG_KY_LOP : "co"

    GIAO_VIEN ||--o{ PHAN_CONG : "duoc_phan_cong"
    LOP_HOC ||--o{ PHAN_CONG : "phan_cong"
    MON_HOC ||--o{ PHAN_CONG : "giang_day"
    PHAN_CONG ||--o{ BUOI_HOC : "lap_lich"
    BUOI_HOC ||--o{ DIEM_DANH : "ghi_nhan"
    HOC_SINH ||--o{ DIEM_DANH : "duoc_diem_danh"

    LOP_HOC ||--o{ DOT_DANH_GIA : "to_chuc"
    MON_HOC ||--o{ DOT_DANH_GIA : "thuoc_mon"
    DOT_DANH_GIA ||--o{ DIEM : "co"
    HOC_SINH ||--o{ DIEM : "nhan"
    HOC_SINH ||--o{ KY_THI_JLPT : "du_thi"

    HOC_SINH ||--o{ NGHIA_VU_HOC_PHI : "phai_nop"
    LOP_HOC ||--o{ NGHIA_VU_HOC_PHI : "phat_sinh"
    NGHIA_VU_HOC_PHI ||--o{ GIAO_DICH_HOC_PHI : "thanh_toan"

    LOP_HOC ||--o{ BAI_TAP : "duoc_giao"
    MON_HOC ||--o{ BAI_TAP : "thuoc_mon"
    BAI_TAP ||--o{ BAI_NOP : "nhan"
    HOC_SINH ||--o{ BAI_NOP : "nop"

    LOP_HOC o|--o{ TAI_LIEU : "ap_dung_cho"
    MON_HOC o|--o{ TAI_LIEU : "phan_loai"

    TAI_KHOAN {
        bigint id PK
        string ten_dang_nhap UK
        string mat_khau_ma_hoa
        string vai_tro
        string trang_thai
    }
    HOC_SINH {
        bigint id PK
        bigint tai_khoan_id FK_UK
        string ma_hoc_sinh UK
        string ho_ten
        string cap_do_hien_tai
        string trang_thai
    }
    GIAO_VIEN {
        bigint id PK
        bigint tai_khoan_id FK_UK
        string ma_giao_vien UK
        string ho_ten
        string chuyen_mon
    }
    LICH_SU_CAP_DO {
        bigint id PK
        bigint hoc_sinh_id FK
        string cap_do_cu
        string cap_do_moi
        date ngay_ap_dung
    }
    NIEN_KHOA {
        bigint id PK
        string ten
        date ngay_bat_dau
        date ngay_ket_thuc
    }
    KY_HOC {
        bigint id PK
        bigint nien_khoa_id FK
        string ten
        date ngay_bat_dau
        date ngay_ket_thuc
    }
    MON_HOC {
        bigint id PK
        string ma_mon UK
        string ten_mon
    }
    LOP_HOC {
        bigint id PK
        bigint nien_khoa_id FK
        bigint ky_hoc_id FK
        string ma_lop UK
        string cap_do
    }
    DANG_KY_LOP {
        bigint id PK
        bigint hoc_sinh_id FK
        bigint lop_hoc_id FK
        date ngay_dang_ky
        string trang_thai
    }
    PHAN_CONG {
        bigint id PK
        bigint giao_vien_id FK
        bigint lop_hoc_id FK
        bigint mon_hoc_id FK
        string vai_tro
    }
    BUOI_HOC {
        bigint id PK
        bigint phan_cong_id FK
        string phong
        datetime bat_dau
        datetime ket_thuc
    }
    DIEM_DANH {
        bigint id PK
        bigint buoi_hoc_id FK
        bigint hoc_sinh_id FK
        string trang_thai
    }
    DOT_DANH_GIA {
        bigint id PK
        bigint lop_hoc_id FK
        bigint mon_hoc_id FK
        string loai
        string ky_nang
    }
    DIEM {
        bigint id PK
        bigint dot_danh_gia_id FK
        bigint hoc_sinh_id FK
        decimal diem
    }
    KY_THI_JLPT {
        bigint id PK
        bigint hoc_sinh_id FK
        string cap_do
        date ngay_thi
        string ket_qua
    }
    NGHIA_VU_HOC_PHI {
        bigint id PK
        bigint hoc_sinh_id FK
        bigint lop_hoc_id FK
        decimal so_tien_phai_thu
        decimal mien_giam
        string trang_thai
    }
    GIAO_DICH_HOC_PHI {
        bigint id PK
        bigint nghia_vu_hoc_phi_id FK
        bigint nguoi_thu_id FK
        decimal so_tien
        datetime ngay_thu
    }
    BAI_TAP {
        bigint id PK
        bigint lop_hoc_id FK
        bigint mon_hoc_id FK
        bigint nguoi_tao_id FK
        datetime han_nop
        string trang_thai
    }
    BAI_NOP {
        bigint id PK
        bigint bai_tap_id FK
        bigint hoc_sinh_id FK
        datetime thoi_diem_nop
        decimal diem
    }
    TAI_LIEU {
        bigint id PK
        bigint nguoi_tao_id FK
        bigint lop_hoc_id FK
        bigint mon_hoc_id FK
        string cap_do
        string tieu_de
        string trang_thai
    }
```

## 6. Ghi chú thiết kế

- Mô hình trên là ERD logic, chưa gắn với hệ quản trị cơ sở dữ liệu cụ thể. Kiểu `bigint`, `string`, `decimal`, `date` và `datetime` cần được ánh xạ khi triển khai.
- `cap_do`/`cap_do_hien_tai` nên bị giới hạn trong `N5`, `N4`, `N3`, `N2`, `N1` bằng `CHECK` hoặc bảng danh mục nếu cần mở rộng.
- Các khóa ngoại tùy chọn của `TaiLieu` cho phép tài liệu dùng chung theo cấp độ. Khi có `lop_hoc_id`, quyền xem phải kiểm tra học sinh có `DangKyLop` đang hiệu lực.
- Nếu yêu cầu phân công theo thời gian được triển khai đầy đủ, thêm `tu_ngay`, `den_ngay` vào `PhanCong`; `BuoiHoc` chỉ được tham chiếu phân công còn hiệu lực.
