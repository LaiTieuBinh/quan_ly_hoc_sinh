# Quy tắc logic và chất lượng code

Tài liệu này là tiêu chuẩn bắt buộc khi phát triển và review code cho hệ thống quản lý học sinh tiếng Nhật. Mục tiêu là bảo đảm code đúng nghiệp vụ, dễ kiểm chứng, dễ bảo trì và không chứa code thừa hoặc giải pháp tạm thời không được kiểm soát.

## 1. Nguồn sự thật của nghiệp vụ

Khi triển khai, áp dụng tài liệu theo thứ tự ưu tiên sau:

1. Đặc tả hệ thống.
2. Detail Design của từng màn hình.
3. Danh sách và contract API.
4. ERD cùng các ràng buộc database.
5. Basic Design.
6. Giả định của người triển khai.

- Không tự suy diễn nghiệp vụ khi tài liệu chưa quy định.
- Nếu các tài liệu mâu thuẫn, phải ghi nhận và làm rõ trước khi triển khai logic có thể làm thay đổi dữ liệu.
- Business rule quan trọng nên được liên kết với mã yêu cầu tương ứng, ví dụ `BR-04` hoặc `FR-FEE-03`.
- Không lựa chọn cách triển khai chỉ vì thuận tiện nếu cách đó làm sai hoặc làm yếu đi nghiệp vụ.

## 2. Phân chia trách nhiệm

### 2.1. Frontend

- Chỉ hiển thị dữ liệu, thu thập đầu vào và validation để cải thiện trải nghiệm người dùng.
- Không coi validation frontend là lớp bảo vệ nghiệp vụ.
- Không tự quyết định học phí còn nợ, trạng thái trễ hạn, tỷ lệ chuyên cần, xếp loại hoặc quyền truy cập.
- Ẩn nút không thay thế cho kiểm tra quyền tại backend.
- Không truyền `hoc_sinh_id`, `giao_vien_id` hoặc vai trò nhằm mở rộng phạm vi của người đang đăng nhập.

### 2.2. Controller NestJS

- Chỉ nhận request, validation DTO, gọi use case/service và trả response.
- Không gọi Prisma trực tiếp.
- Không chứa business logic hoặc logic phân quyền dữ liệu.
- Không dùng `try/catch` chỉ để chuyển mọi lỗi thành HTTP 400.
- Không trả trực tiếp Prisma entity nếu có nguy cơ lộ trường nội bộ hoặc dữ liệu nhạy cảm.

### 2.3. Service/use case

- Là nơi điều phối nghiệp vụ và áp dụng business rule.
- Mỗi phương thức phải biểu diễn một hành động rõ ràng, ví dụ `chuyenLop`, `ghiNhanThanhToan`, `congBoDiem`.
- Phải kiểm tra quyền trên bản ghi cụ thể, không chỉ kiểm tra role chung.
- Nghiệp vụ thay đổi nhiều bảng phải chạy trong transaction.
- Không gộp nhiều use case không liên quan vào một hàm lớn.

### 2.4. Repository/Prisma

- Chỉ phụ trách truy xuất và lưu dữ liệu.
- Không chứa quyết định nghiệp vụ hoặc logic phân quyền phức tạp.
- Chỉ `select`/`include` các trường và quan hệ thực sự cần thiết.
- Không thực hiện query trong vòng lặp gây lỗi N+1.
- Không tải toàn bộ dữ liệu để lọc, sắp xếp hoặc phân trang bằng JavaScript.

## 3. Thứ tự validation bắt buộc

Mọi API thay đổi dữ liệu phải kiểm tra theo thứ tự:

1. Xác thực người dùng.
2. Quyền thực hiện hành động.
3. Phạm vi dữ liệu người dùng được phép truy cập.
4. Kiểu và định dạng dữ liệu đầu vào.
5. Sự tồn tại của bản ghi liên quan.
6. Trạng thái hiện tại có cho phép thao tác hay không.
7. Business rule của nghiệp vụ.
8. Xung đột đồng thời và tính duy nhất.
9. Thực thi transaction.
10. Ghi audit.

Không tin dữ liệu do client tính hoặc truyền lên nếu server có thể suy ra từ session/token hoặc database.

## 4. Business rule cốt lõi

### 4.1. Học sinh và cấp độ

- Một học sinh chỉ có một cấp độ JLPT hiện tại tại một thời điểm.
- Học sinh đang học phải có cấp độ thuộc `N5`, `N4`, `N3`, `N2` hoặc `N1`.
- Thay đổi cấp độ phải cập nhật học sinh, tạo lịch sử và ghi audit trong cùng transaction.

### 4.2. Lớp học và đăng ký

- Học sinh chỉ được đăng ký lớp phù hợp cấp độ, trừ ngoại lệ đã được người có quyền phê duyệt.
- Không có hai đăng ký hiệu lực trùng nhau cho cùng một học sinh trong cùng một lớp.
- Chuyển lớp phải kết thúc đăng ký cũ và tạo đăng ký mới trong cùng transaction.
- Không xóa đăng ký đã phát sinh lịch sử; phải chuyển trạng thái phù hợp.

### 4.3. Lịch học và điểm danh

- Thời điểm kết thúc buổi học phải sau thời điểm bắt đầu.
- Không cho phép trùng thời gian đối với cùng giáo viên, lớp hoặc phòng học.
- Phải kiểm tra xung đột lại trong transaction khi lưu, không chỉ dựa vào API kiểm tra trước.
- Chỉ điểm danh học sinh có đăng ký hiệu lực tại ngày diễn ra buổi học.
- Mỗi học sinh có tối đa một bản ghi điểm danh trong một buổi học.

### 4.4. Điểm và đánh giá

- Học sinh phải có đăng ký hợp lệ tại ngày đánh giá.
- Điểm phải nằm trong thang điểm của đợt đánh giá.
- Điểm trung bình và xếp loại phải được tính tại server.
- Học sinh chỉ xem được kết quả đã công bố của chính mình.
- Sửa điểm phải lưu giá trị cũ, giá trị mới, người sửa và thời điểm sửa.

### 4.5. Học phí

- Dữ liệu tiền phải dùng kiểu decimal chính xác; không dùng số thực dấu phẩy động để tính tiền.
- Miễn giảm phải thỏa mãn `0 <= mien_giam <= phai_thu`.
- Giao dịch thanh toán phải lớn hơn 0 và không vượt số tiền còn phải thu.
- Ghi nhận thanh toán phải khóa hoặc kiểm soát đồng thời trên nghĩa vụ học phí.
- API thanh toán phải hỗ trợ idempotency để tránh thu tiền hai lần do gửi request lặp.
- Không xóa cứng giao dịch hoặc phiếu thu.

### 4.6. Bài tập và bài nộp

- Chỉ bài tập `DA_GIAO` mới hiển thị cho học sinh.
- Trạng thái đúng hạn hoặc trễ hạn phải do server tính từ thời điểm nộp và hạn nộp.
- Không nhận bài khi bài tập đã đóng nộp, trừ khi giáo viên mở lại.
- Mỗi học sinh chỉ có một bài nộp cho một bài tập; cập nhật phải được kiểm soát bằng version khi cần.

### 4.7. Phân quyền dữ liệu

- Giáo viên chỉ thao tác trên lớp và môn có phân công hiệu lực.
- Học sinh chỉ truy cập dữ liệu cá nhân và dữ liệu đã công bố trong phạm vi lớp đang tham gia.
- Các endpoint `/me/*` phải suy ra đối tượng từ session/token, không nhận ID người dùng để thay đổi scope.
- Bộ lọc từ client phải được kiểm tra lại theo scope tại server.

## 5. Transaction và xử lý đồng thời

Bắt buộc dùng transaction cho:

- Chuyển lớp.
- Đổi cấp độ và tạo lịch sử cấp độ.
- Ghi nhận hoặc điều chỉnh học phí.
- Lưu điểm danh hàng loạt.
- Lưu điểm hàng loạt.
- Thao tác vừa cập nhật dữ liệu chính vừa tạo lịch sử hoặc audit.
- Các hành động giao, đóng hoặc mở lại bài tập nếu ảnh hưởng nhiều bản ghi.

Các bản ghi có khả năng được nhiều người sửa phải dùng optimistic locking bằng `version`, hoặc cơ chế khóa phù hợp. Không được kiểm tra điều kiện bên ngoài transaction rồi mặc định điều kiện vẫn đúng khi ghi dữ liệu.

## 6. Ràng buộc database

- Dùng unique constraint cho username, mã học sinh, mã giáo viên, mã lớp và các mã danh mục.
- Dùng composite unique cho điểm danh `(buoi_hoc_id, hoc_sinh_id)` và điểm `(dot_danh_gia_id, hoc_sinh_id)`.
- Khai báo foreign key đầy đủ.
- Dùng check constraint cho số tiền, thang điểm và khoảng thời gian khi phù hợp.
- Tạo index cho foreign key và các trường thường xuyên dùng để tìm kiếm, lọc hoặc lập báo cáo.
- Không chỉnh sửa schema thủ công; mọi thay đổi phải đi qua Prisma migration.
- Không xóa cứng dữ liệu đã phát sinh lịch sử, giao dịch hoặc audit.

## 7. Quy tắc chống code rác và code bẩn

Không chấp nhận trong code production:

- Hàm, component, endpoint hoặc file rỗng không có mục đích sử dụng hiện tại.
- Mock data, hard-code tạm thời, `TODO` hoặc `FIXME` không có issue theo dõi.
- Code cũ bị comment-out thay vì được xóa.
- Import, biến, DTO, route, dependency hoặc cấu hình không được sử dụng.
- `any`, `@ts-ignore` hoặc non-null assertion `!` không có lý do rõ ràng.
- Copy-paste business logic giữa nhiều service.
- Magic number, magic string hoặc trạng thái viết tay rải rác.
- `catch (error) {}` hoặc bất kỳ cách nuốt lỗi nào.
- Log mật khẩu, hash, token đầy đủ, storage key, URL ký dài hạn hoặc dữ liệu nhạy cảm.
- Hàm thực hiện quá nhiều trách nhiệm không liên quan.
- Abstraction chỉ làm code khó đọc hơn mà không loại bỏ sự lặp lại có ý nghĩa.
- Helper dùng chung cho các logic chỉ giống hình thức nhưng khác nghiệp vụ.

Code không còn được sử dụng phải xóa hoàn toàn cùng test, import, dependency và cấu hình liên quan.

## 8. Quy chuẩn lỗi API

Lỗi phải có cấu trúc thống nhất:

```json
{
  "error": {
    "code": "ENROLLMENT_LEVEL_MISMATCH",
    "message": "Cấp độ học sinh không phù hợp với lớp học.",
    "fields": {
      "hoc_sinh_id": "..."
    }
  }
}
```

Sử dụng HTTP status đúng ngữ nghĩa:

- `400`: query hoặc cấu trúc request không hợp lệ.
- `401`: chưa xác thực.
- `403`: không có quyền hoặc dữ liệu ngoài phạm vi truy cập.
- `404`: tài nguyên không tồn tại trong phạm vi được phép xem.
- `409`: xung đột trạng thái, dữ liệu trùng hoặc version đã cũ.
- `422`: dữ liệu đúng định dạng nhưng vi phạm nghiệp vụ.

Không trả raw Prisma error, stack trace hoặc thông tin hạ tầng cho client.

## 9. Quy tắc kiểm thử

Mỗi nghiệp vụ phải có tối thiểu:

- Một test cho luồng thành công.
- Một test cho input không hợp lệ.
- Một test không đủ quyền hoặc ngoài scope.
- Một test cho trạng thái nghiệp vụ không cho phép.
- Một test biên quan trọng.
- Một test rollback nếu nghiệp vụ dùng transaction.

Các nghiệp vụ thanh toán, chuyển lớp, điểm danh, nhập điểm và kiểm tra xung đột lịch phải có integration test với database thật. Test phải kiểm tra dữ liệu sau thao tác, lịch sử và audit; không chỉ kiểm tra HTTP status.

## 10. Definition of Done

Một chức năng chỉ được coi là hoàn thành khi:

- Đúng đặc tả nghiệp vụ và API contract.
- Có kiểm tra xác thực, quyền và scope tại backend.
- Có validation DTO và business validation.
- Transaction và concurrency được xử lý phù hợp.
- Có database constraint khi có thể áp dụng.
- Có audit cho thao tác quan trọng.
- Có test cho luồng đúng, sai và trường hợp biên.
- Không còn code chết, log debug, mock data hoặc giải pháp tạm không được quản lý.
- TypeScript type-check, lint, test và build đều thành công.
- Tài liệu API được cập nhật cùng thay đổi code.
- Không tạo thay đổi ngoài phạm vi chức năng được yêu cầu.

## 11. Nguyên tắc review cuối cùng

Mỗi dòng code phải phục vụ ít nhất một trong các mục đích sau:

1. Thực hiện một yêu cầu nghiệp vụ đã xác định.
2. Bảo vệ tính đúng đắn, an toàn hoặc toàn vẹn dữ liệu.
3. Làm cho code dễ hiểu, dễ kiểm thử hoặc dễ bảo trì hơn.

Nếu không chứng minh được mục đích của một đoạn code, đoạn code đó nên được xóa.
