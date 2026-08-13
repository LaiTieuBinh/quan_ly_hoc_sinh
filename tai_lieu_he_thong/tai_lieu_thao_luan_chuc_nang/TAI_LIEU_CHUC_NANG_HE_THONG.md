# Tài liệu chức năng hệ thống quản lý học sinh tiếng Nhật

## 1. Mục tiêu

Hệ thống hỗ trợ trung tâm hoặc trường dạy tiếng Nhật quản lý học sinh, lớp học, giáo viên, quá trình học tập, học phí và tài liệu theo năm cấp độ JLPT: N5, N4, N3, N2 và N1.

## 2. Cấp độ tiếng Nhật (JLPT)

Hệ thống sử dụng năm cấp độ, từ cơ bản đến nâng cao:

| Cấp độ | Diễn giải |
| --- | --- |
| N5 | Cơ bản nhất |
| N4 | Sơ cấp |
| N3 | Trung cấp |
| N2 | Trung cấp cao |
| N1 | Nâng cao nhất |

Mỗi học sinh có cấp độ hiện tại. Lớp học, môn học, bài tập, tài liệu và đánh giá được liên kết với một hoặc nhiều cấp độ phù hợp.

## 3. Vai trò người dùng và phân quyền

| Vai trò | Quyền chính |
| --- | --- |
| Quản trị viên | Quản lý toàn bộ dữ liệu, tài khoản, cấu hình và báo cáo hệ thống. |
| Nhân viên | Quản lý hồ sơ học sinh, lớp học, đăng ký học và học phí. |
| Giáo viên | Xem lớp phụ trách, điểm danh, nhập điểm, giao/chấm bài tập và chia sẻ tài liệu. |
| Học sinh | Xem hồ sơ, lịch học, điểm, chuyên cần, bài tập và tài liệu thuộc lớp của mình. |

## 4. Chức năng chi tiết

### 4.1. Quản lý hồ sơ học sinh

- Lưu mã học sinh, họ tên, ngày sinh, giới tính, ảnh đại diện và thông tin liên hệ.
- Quản lý trạng thái học: đang học, bảo lưu hoặc nghỉ học.
- Ghi nhận cấp độ JLPT hiện tại: N5, N4, N3, N2 hoặc N1.
- Theo dõi lịch sử thay đổi lớp và cấp độ của học sinh.

### 4.2. Quản lý cấp độ JLPT và lộ trình học

- Thiết lập năm cấp độ N5 đến N1.
- Xếp học sinh vào lớp theo cấp độ.
- Thiết lập điều kiện lên cấp dựa trên điểm kiểm tra, tỷ lệ chuyên cần và đánh giá của giáo viên.
- Lập danh sách học sinh đủ hoặc sắp đủ điều kiện lên cấp.
- Ghi nhận lịch sử nâng cấp độ của từng học sinh.

### 4.3. Quản lý lớp học và niên khóa

- Tạo niên khóa, kỳ học, lớp học, ca học và phòng học.
- Mỗi lớp thuộc một cấp độ JLPT.
- Xếp học sinh vào lớp; hỗ trợ chuyển lớp hoặc chuyển cấp độ.
- Chỉ định giáo viên chủ nhiệm và giáo viên giảng dạy cho lớp.

### 4.4. Quản lý môn học

- Tạo danh mục môn học: từ vựng, ngữ pháp, nghe, nói, đọc, viết và Kanji.
- Thiết lập giáo trình hoặc nội dung theo từng cấp độ JLPT.
- Gán môn học cho lớp và phân công giáo viên phụ trách.

### 4.5. Quản lý giáo viên

- Lưu hồ sơ, thông tin liên hệ và chuyên môn của giáo viên.
- Khai báo các cấp độ N5-N1 giáo viên có thể giảng dạy.
- Phân công dạy theo lớp, môn học và thời gian.
- Theo dõi số tiết hoặc khối lượng giảng dạy.

### 4.6. Thời khóa biểu

- Lập lịch học theo lớp, môn học, giáo viên và phòng học.
- Kiểm tra trùng lịch giáo viên, lớp học và phòng học.
- Hiển thị thời khóa biểu phù hợp cho giáo viên và học sinh.

### 4.7. Điểm danh

- Ghi nhận các trạng thái: có mặt, đi muộn, vắng có phép, vắng không phép và về sớm.
- Giáo viên điểm danh theo buổi học hoặc ngày học.
- Thống kê chuyên cần theo học sinh, lớp, cấp độ, kỳ học và khoảng thời gian.
- Dùng tỷ lệ chuyên cần làm một tiêu chí xét lên cấp.

### 4.8. Quản lý điểm và đánh giá

- Nhập điểm bài kiểm tra, giữa kỳ, cuối kỳ hoặc đánh giá thường xuyên.
- Chấm theo kỹ năng: từ vựng/ngữ pháp, đọc hiểu, nghe hiểu; có thể bổ sung nói và viết.
- Tính điểm trung bình, xếp loại và lưu nhận xét giáo viên.
- Theo dõi tiến độ học tập của học sinh theo từng cấp độ N5-N1.

### 4.9. Kiểm tra và kỳ thi JLPT

- Tạo bài kiểm tra nội bộ, bài thi thử theo cấp độ.
- Lưu kết quả thi thử và so sánh kết quả giữa các lần thi.
- Lưu thông tin kỳ thi JLPT chính thức, kết quả và chứng chỉ của học sinh.

### 4.10. Quản lý học phí

- Thiết lập học phí theo lớp hoặc cấp độ JLPT.
- Quản lý các khoản thu, miễn giảm và trạng thái thanh toán.
- Theo dõi học phí đã đóng, còn thiếu và công nợ.
- Lập phiếu thu và báo cáo doanh thu theo lớp, cấp độ hoặc kỳ học.

### 4.11. Quản lý bài tập về nhà

- Giáo viên tạo bài tập theo lớp, môn học, cấp độ và hạn nộp.
- Đính kèm đề bài, tài liệu, hình ảnh hoặc liên kết tham khảo.
- Học sinh nộp bài trực tuyến bằng tệp hoặc nội dung văn bản.
- Lưu trạng thái nộp bài: đúng hạn, trễ hạn hoặc chưa nộp.
- Giáo viên chấm điểm, nhận xét, trả bài và lưu lịch sử nộp bài.
- Thống kê tỷ lệ hoàn thành bài tập theo học sinh hoặc lớp.

### 4.12. Chia sẻ tài liệu học tập

- Giáo viên tải lên và chia sẻ tài liệu theo lớp, môn học và cấp độ N5-N1.
- Hỗ trợ giáo trình, bài nghe, danh sách từ vựng, Kanji, ngữ pháp, đề thi thử và video.
- Phân loại tài liệu theo chủ đề, bài học, kỹ năng và cấp độ.
- Học sinh chỉ được xem hoặc tải tài liệu thuộc lớp/cấp độ được cấp quyền.
- Hỗ trợ tìm kiếm, theo dõi lượt xem hoặc tải tài liệu.
- Giáo viên có thể cập nhật, ẩn hoặc xóa tài liệu không còn sử dụng.

### 4.13. Báo cáo và thống kê

- Thống kê số lượng học sinh theo từng cấp độ N5-N1 và theo lớp.
- Báo cáo tỷ lệ chuyên cần, kết quả học tập và tỷ lệ hoàn thành bài tập.
- Danh sách học sinh có kết quả yếu, chuyên cần thấp hoặc chưa đủ điều kiện lên cấp.
- Báo cáo học phí, công nợ và doanh thu theo lớp, cấp độ hoặc kỳ học.

## 5. Liên kết dữ liệu chính

- Một học sinh có một cấp độ hiện tại và có thể có lịch sử nhiều cấp độ.
- Một lớp học thuộc một niên khóa và một cấp độ JLPT.
- Một lớp có nhiều học sinh, môn học, giáo viên, buổi học, bài tập và tài liệu.
- Bài tập và tài liệu phải xác định đối tượng nhận theo lớp, môn học hoặc cấp độ.
- Điểm danh, điểm số và kết quả bài tập là dữ liệu đầu vào để đánh giá tiến độ và xét lên cấp.

## 6. Phạm vi ưu tiên cho phiên bản đầu tiên

1. Đăng nhập và phân quyền cơ bản.
2. Hồ sơ học sinh và quản lý cấp độ N5-N1.
3. Lớp học, môn học, giáo viên và thời khóa biểu.
4. Điểm danh.
5. Điểm số, đánh giá và kiểm tra JLPT nội bộ.
6. Học phí.
7. Bài tập về nhà và chia sẻ tài liệu.
8. Báo cáo cơ bản.
