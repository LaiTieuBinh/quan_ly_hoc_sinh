# Sơ đồ di chuyển giữa các màn hình

Tài liệu này được tổng hợp từ `tai_lieu_man_hinh` và `tai_lieu_dac_ta/TAI_LIEU_DAC_TA_HE_THONG.md`.

![Sơ đồ di chuyển giữa các màn hình](./so_do_di_chuyen_man_hinh.png)

## 1. Luồng tổng thể

```mermaid
flowchart LR
    START([Mở hệ thống]) --> AUTH{Phiên hợp lệ?}
    AUTH -- Không --> MH01["MH-01<br/>Đăng nhập"]
    AUTH -- Có --> MH02["MH-02<br/>Tổng quan theo vai trò"]
    MH01 -- Đăng nhập thành công --> MH02
    MH01 -- Sai thông tin / tài khoản bị khóa --> MH01

    MH02 -->|Menu hoặc thẻ tổng quan| NGHIEPVU["Màn hình nghiệp vụ<br/>trong phạm vi quyền"]
    NGHIEPVU -->|Về Tổng quan| MH02

    MH02 -->|Đăng xuất| MH01
    NGHIEPVU -->|Đăng xuất hoặc phiên hết hạn| MH01
```

## 2. Điều hướng từ Tổng quan

```mermaid
flowchart TB
    MH02["MH-02<br/>Tổng quan"]

    subgraph QT_NV["Quản trị viên / Nhân viên"]
        MH04["MH-04<br/>Học sinh"]
        MH07["MH-07<br/>Lớp học & đăng ký"]
        MH13["MH-13<br/>Học phí"]
        MH16["MH-16<br/>Báo cáo"]
    end

    subgraph GV["Giáo viên"]
        MH09["MH-09<br/>Thời khóa biểu / buổi học"]
        MH08["MH-08<br/>Giáo viên & phân công"]
        MH10["MH-10<br/>Điểm danh"]
        MH14["MH-14<br/>Bài tập & bài nộp"]
    end

    subgraph HS["Học sinh"]
        HS09["MH-09<br/>Lịch học cá nhân"]
        HS10["MH-10<br/>Chuyên cần cá nhân"]
        HS14["MH-14<br/>Bài tập của tôi"]
        MH11["MH-11<br/>Điểm / kết quả cá nhân"]
        MH15["MH-15<br/>Tài liệu học tập"]
    end

    MH02 -->|Sĩ số| MH04
    MH02 -->|Lớp đang hoạt động| MH07
    MH02 -->|Công nợ| MH13
    MH02 -->|Doanh thu| MH16
    MH02 -->|Học sinh có nguy cơ| MH16

    MH02 -->|Buổi học sắp tới| MH09
    MH02 -->|Lớp / môn được phân công| MH08
    MH02 -->|Điểm danh cần xử lý| MH10
    MH02 -->|Bài tập cần xử lý| MH14

    MH02 -->|Lịch học gần nhất| HS09
    MH02 -->|Tỷ lệ chuyên cần| HS10
    MH02 -->|Bài tập cần nộp| HS14
    MH02 -->|Điểm gần nhất| MH11
    MH02 -->|Tài liệu mới| MH15
```

> Nhân viên chỉ thấy báo cáo được cấp quyền. Giáo viên chỉ thấy lớp/môn được phân công. Học sinh chỉ thấy dữ liệu cá nhân và lớp đang tham gia.

## 3. Luồng nghiệp vụ liên màn hình

```mermaid
flowchart LR
    MH03["MH-03<br/>Tài khoản & phân quyền"]
    MH04["MH-04<br/>Học sinh"]
    MH05["MH-05<br/>Lộ trình cấp độ"]
    MH06["MH-06<br/>Danh mục học vụ"]
    MH07["MH-07<br/>Lớp học & đăng ký"]
    MH08["MH-08<br/>Giáo viên & phân công"]
    MH09["MH-09<br/>Thời khóa biểu / buổi học"]
    MH10["MH-10<br/>Điểm danh"]
    MH11["MH-11<br/>Đánh giá & điểm"]
    MH12["MH-12<br/>Kỳ thi JLPT"]
    MH13["MH-13<br/>Học phí"]
    MH14["MH-14<br/>Bài tập & bài nộp"]
    MH15["MH-15<br/>Tài liệu học tập"]
    MH16["MH-16<br/>Báo cáo"]

    MH03 -->|Mở hồ sơ liên kết học sinh| MH04
    MH03 -->|Mở hồ sơ liên kết giáo viên| MH08

    MH04 -->|Tab Lịch sử cấp độ| MH05
    MH04 -->|Tab Đăng ký lớp| MH07
    MH04 -->|Tab Chuyên cần| MH10
    MH04 -->|Tab Điểm| MH11
    MH04 -->|Lịch sử / kết quả thi| MH12
    MH04 -->|Tab Học phí| MH13
    MH04 -->|Tab Bài tập| MH14

    MH06 -->|Chọn niên khóa, kỳ, môn khi tạo lớp| MH07
    MH07 -->|Phân công giáo viên cho lớp / môn| MH08
    MH08 -->|Tạo hoặc xem buổi theo phân công| MH09
    MH09 -->|Chọn buổi để điểm danh| MH10
    MH07 -->|Tạo đợt đánh giá theo lớp| MH11
    MH07 -->|Thiết lập nghĩa vụ theo lớp / đăng ký| MH13
    MH08 -->|Giao bài theo lớp / môn| MH14
    MH08 -->|Chia sẻ tài liệu theo lớp / môn| MH15

    MH16 -->|Sĩ số| MH04
    MH16 -->|Sĩ số / đăng ký| MH07
    MH16 -->|Chuyên cần| MH10
    MH16 -->|Kết quả học tập| MH11
    MH16 -->|Bài tập| MH14
    MH16 -->|Học phí| MH13
    MH16 -->|Nguy cơ / chưa đủ điều kiện lên cấp| MH05
```

Các mũi tên từ MH-06, MH-07 và MH-08 biểu diễn luồng nghiệp vụ hợp lý theo dữ liệu đầu vào của màn hình kế tiếp. Khi triển khai menu hoặc nút tắt, trang đích vẫn phải kiểm tra quyền độc lập.

## 4. Ma trận màn hình theo vai trò

| Vai trò | Màn hình có thể truy cập |
| --- | --- |
| Quản trị viên | MH-02 đến MH-16, theo toàn bộ quyền quản trị |
| Nhân viên | MH-02, MH-04 đến MH-10, MH-12, MH-13 và MH-16 khi được cấp quyền |
| Giáo viên | MH-02, MH-04 (chỉ xem), MH-07 (chỉ xem), MH-09 đến MH-12, MH-14 đến MH-16 trong phạm vi phân công |
| Học sinh | MH-02, MH-04 (hồ sơ cá nhân), MH-07 (lớp liên quan), MH-09 đến MH-15 với dữ liệu cá nhân/đã công bố |

MH-01 là màn hình công khai trước xác thực. Khi phiên hết hạn, bị thu hồi hoặc tài khoản bị khóa, người dùng được đưa về MH-01.
