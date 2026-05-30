# Kế Hoạch Triển Khai Theo Giai Đoạn 10-14 Ngày

## 1. Mục Đích Tài Liệu

Tài liệu này mô tả kế hoạch triển khai dự án web app tích điểm khi phân loại rác trong phạm vi 10-14 ngày. Mục tiêu là tạo ra một bản MVP/demo có thể trình bày cho khách hàng, kiểm chứng luồng nghiệp vụ chính và làm nền tảng cho các giai đoạn mở rộng sau này.

Trong phạm vi 10-14 ngày, sản phẩm tập trung vào luồng cốt lõi:

1. Người dùng đăng nhập.
2. Người dùng quét QR trên thùng rác.
3. Người dùng chụp ảnh rác.
4. Hệ thống phân tích ảnh bằng AI.
5. Hệ thống kiểm tra điều kiện hợp lệ cơ bản.
6. Hệ thống cộng điểm hoặc chuyển lượt gửi sang trạng thái chờ duyệt.
7. Admin xem và xử lý các lượt gửi.

Tài liệu này chưa đi sâu vào thiết kế kỹ thuật, cấu trúc code hoặc hạ tầng triển khai chi tiết.

## 2. Nguyên Tắc Triển Khai Trong 10-14 Ngày

Vì thời gian triển khai ngắn, dự án cần ưu tiên tính khả thi và khả năng demo rõ ràng. Các nguyên tắc chính:

- Tập trung vào luồng nghiệp vụ chính, chưa mở rộng quá nhiều tính năng phụ.
- Ưu tiên các tính năng giúp khách hàng nhìn thấy giá trị sản phẩm ngay.
- Sử dụng AI/API có sẵn thay vì tự huấn luyện model từ đầu.
- Chỉ triển khai chống gian lận ở mức cơ bản, đủ cho demo và pilot nhỏ.
- Admin dashboard làm ở mức vận hành cơ bản, chưa cần báo cáo chuyên sâu.
- Đổi thưởng/voucher chỉ nên làm dạng mô phỏng nếu cần demo.
- Tích hợp cảm biến thùng rác thật chỉ thực hiện nếu thiết bị/API đã sẵn sàng.

## 3. Phạm Vi Sản Phẩm Trong 10-14 Ngày

### 3.1. Bao Gồm

- Đăng nhập người dùng.
- Trang chính hiển thị điểm.
- Quét QR trên thùng rác.
- Tạo phiên gửi rác sau khi quét QR.
- Chụp ảnh rác trực tiếp trên web app.
- Gửi ảnh để AI nhận diện loại rác.
- Hiển thị kết quả phân tích.
- Cộng điểm nếu lượt gửi hợp lệ.
- Lưu lịch sử tích điểm.
- Admin dashboard cơ bản.
- Admin xem, duyệt hoặc từ chối lượt gửi.
- Quản lý danh sách thùng rác mẫu.
- Cấu hình điểm cơ bản theo loại rác.

### 3.2. Chưa Bao Gồm

- Ứng dụng mobile native riêng cho iOS/Android.
- Hệ thống đổi voucher thật đầy đủ.
- Tích hợp thanh toán.
- Phân quyền admin phức tạp.
- Báo cáo BI chuyên sâu.
- Tự train model AI từ đầu.
- Hệ thống IoT/cảm biến phức tạp nếu chưa có API sẵn.
- Chống gian lận nâng cao như phân tích hành vi dài hạn hoặc risk scoring phức tạp.
- Triển khai production quy mô lớn.

## 4. Tổng Quan Giai Đoạn 10-14 Ngày

| Giai đoạn | Thời gian | Mục tiêu | Kết quả |
|---|---:|---|---|
| Phase 1 | Ngày 1-2 | Chốt phạm vi và luồng nghiệp vụ | Scope rõ ràng, danh sách màn hình, rule điểm cơ bản |
| Phase 2 | Ngày 3-4 | Thiết kế luồng giao diện và dữ liệu mẫu | Wireframe/flow, dữ liệu thùng rác và loại rác mẫu |
| Phase 3 | Ngày 5-7 | Xây dựng luồng người dùng chính | Đăng nhập, quét QR, chụp ảnh, tạo lượt gửi |
| Phase 4 | Ngày 8-9 | Tích hợp AI và xử lý điểm | AI nhận diện ảnh, tính điểm, trạng thái submission |
| Phase 5 | Ngày 10-11 | Xây dựng admin dashboard cơ bản | Admin xem và duyệt/từ chối lượt gửi |
| Phase 6 | Ngày 12-14 | Kiểm thử, chỉnh lỗi và chuẩn bị demo | Bản demo ổn định, tài liệu bàn giao ngắn |

Nếu chỉ có 10 ngày, có thể rút gọn Phase 6 và giảm bớt mức độ hoàn thiện UI. Nếu có đủ 14 ngày, nên dùng thêm thời gian cho kiểm thử, chỉnh trải nghiệm người dùng và chuẩn bị demo kỹ hơn.

## 5. Phase 1: Chốt Phạm Vi Và Luồng Nghiệp Vụ

### 5.1. Thời Gian

Ngày 1-2.

### 5.2. Mục Tiêu

Thống nhất chính xác bản demo sẽ làm gì, chưa làm gì và luồng nghiệp vụ nào là bắt buộc.

### 5.3. Công Việc Chính

- Chốt actor chính: người dùng và admin.
- Chốt luồng người dùng: đăng nhập, quét QR, chụp ảnh, gửi ảnh, nhận điểm.
- Chốt luồng admin: xem lượt gửi, kiểm tra ảnh, duyệt hoặc từ chối.
- Chốt danh sách loại rác ban đầu.
- Chốt quy tắc cộng điểm cơ bản.
- Chốt điều kiện hợp lệ tối thiểu.
- Chốt các màn hình cần có trong demo.

### 5.4. Kết Quả Bàn Giao

- Danh sách tính năng MVP.
- User flow tổng quan.
- Danh sách màn hình.
- Rule điểm cơ bản.
- Danh sách loại rác demo.

### 5.5. Tiêu Chí Hoàn Thành

- Các bên thống nhất phạm vi 10-14 ngày.
- Không còn yêu cầu lớn chưa rõ trong luồng chính.
- Có thể bắt đầu triển khai mà không phải chờ thêm quyết định nghiệp vụ lớn.

## 6. Phase 2: Thiết Kế Luồng Giao Diện Và Dữ Liệu Mẫu

### 6.1. Thời Gian

Ngày 3-4.

### 6.2. Mục Tiêu

Chuẩn bị giao diện và dữ liệu cần thiết để triển khai nhanh bản demo.

### 6.3. Công Việc Chính

- Thiết kế wireframe mức cơ bản cho các màn hình chính.
- Chuẩn bị danh sách thùng rác mẫu.
- Chuẩn bị QR mẫu cho từng thùng rác.
- Chuẩn bị danh sách loại rác và điểm tương ứng.
- Chuẩn bị trạng thái của lượt gửi.
- Chuẩn bị dữ liệu demo cho admin dashboard.

### 6.4. Các Màn Hình Người Dùng

- Đăng nhập.
- Trang chính.
- Quét QR.
- Chụp ảnh.
- Kết quả phân tích.
- Ví điểm/lịch sử điểm.

### 6.5. Các Màn Hình Admin

- Đăng nhập admin.
- Dashboard tổng quan.
- Danh sách lượt gửi.
- Chi tiết lượt gửi.
- Quản lý thùng rác mẫu.
- Cấu hình điểm cơ bản.

### 6.6. Kết Quả Bàn Giao

- Flow màn hình.
- Bộ dữ liệu demo.
- QR mẫu.
- Quy định trạng thái submission.

### 6.7. Tiêu Chí Hoàn Thành

- Đủ màn hình để bắt đầu triển khai giao diện.
- Đủ dữ liệu mẫu để chạy demo mà chưa cần dữ liệu thật.
- Khách hàng hiểu được hành trình người dùng và admin.

## 7. Phase 3: Xây Dựng Luồng Người Dùng Chính

### 7.1. Thời Gian

Ngày 5-7.

### 7.2. Mục Tiêu

Hoàn thiện luồng người dùng cốt lõi từ lúc đăng nhập đến lúc gửi ảnh rác.

### 7.3. Tính Năng

- Đăng nhập người dùng.
- Hiển thị tổng điểm hiện có.
- Quét QR trên thùng rác.
- Xác nhận QR hợp lệ.
- Tạo phiên gửi rác.
- Chụp ảnh trực tiếp trên web app.
- Gửi ảnh lên hệ thống.
- Hiển thị trạng thái đang xử lý.

### 7.4. Điều Kiện Xác Minh Cơ Bản

- QR tồn tại trong hệ thống.
- QR thuộc thùng rác đang hoạt động.
- Phiên quét QR còn hiệu lực.
- Người dùng đã đăng nhập.
- Ảnh được gửi trong thời gian cho phép.

### 7.5. Kết Quả Bàn Giao

- Người dùng có thể đi hết luồng quét QR và gửi ảnh.
- Hệ thống lưu được lượt gửi.
- Lượt gửi có trạng thái ban đầu để chờ AI xử lý.

### 7.6. Tiêu Chí Hoàn Thành

- Luồng chính không bị đứt.
- Có thể tạo submission từ người dùng thật trong môi trường demo.
- Dữ liệu lượt gửi hiển thị được ở phía admin hoặc hệ thống quản trị.

## 8. Phase 4: Tích Hợp AI Và Xử Lý Điểm

### 8.1. Thời Gian

Ngày 8-9.

### 8.2. Mục Tiêu

Tích hợp AI nhận diện ảnh rác và áp dụng rule cơ bản để quyết định cộng điểm, chờ duyệt hoặc từ chối.

### 8.3. Tính Năng AI

- Gửi ảnh rác sang AI/API nhận diện.
- Nhận kết quả loại rác.
- Nhận mức độ tin cậy.
- Lưu kết quả AI vào từng lượt gửi.
- Hiển thị kết quả cho người dùng.

### 8.4. Loại Rác Demo

- Chai nhựa.
- Lon kim loại.
- Giấy.
- Bìa carton.
- Thủy tinh.
- Rác hữu cơ.
- Không xác định.

### 8.5. Rule Cộng Điểm Cơ Bản

Ví dụ:

- Chai nhựa: 5 điểm.
- Lon kim loại: 8 điểm.
- Giấy/carton: 3 điểm.
- Thủy tinh: 6 điểm.
- Rác hữu cơ: 2 điểm.
- Không xác định: không tự động cộng điểm, chuyển chờ duyệt.

### 8.6. Rule Trạng Thái

- Nếu AI nhận diện thành công và độ tin cậy đạt ngưỡng: cộng điểm.
- Nếu AI nhận diện được nhưng độ tin cậy thấp: chờ admin duyệt.
- Nếu ảnh không hợp lệ hoặc không có rác rõ ràng: từ chối hoặc yêu cầu gửi lại.

### 8.7. Kết Quả Bàn Giao

- AI trả kết quả cho ảnh người dùng gửi.
- Hệ thống cộng điểm theo loại rác.
- Người dùng thấy kết quả sau khi gửi.
- Lịch sử điểm được cập nhật.

### 8.8. Tiêu Chí Hoàn Thành

- Có thể demo ảnh rác được phân tích và cộng điểm.
- Admin xem được kết quả AI trong chi tiết lượt gửi.
- Các trường hợp không chắc chắn được chuyển sang trạng thái chờ duyệt.

## 9. Phase 5: Admin Dashboard Cơ Bản

### 9.1. Thời Gian

Ngày 10-11.

### 9.2. Mục Tiêu

Cung cấp công cụ cơ bản để admin theo dõi và xử lý các lượt gửi của người dùng.

### 9.3. Tính Năng

- Đăng nhập admin.
- Xem tổng số người dùng.
- Xem tổng số lượt gửi.
- Xem tổng điểm đã cộng.
- Xem danh sách lượt gửi.
- Lọc theo trạng thái: đã duyệt, chờ duyệt, bị từ chối.
- Xem chi tiết lượt gửi gồm ảnh, người dùng, thùng rác, thời gian, loại rác AI nhận diện và điểm.
- Phê duyệt lượt gửi đang chờ duyệt.
- Từ chối lượt gửi không hợp lệ.

### 9.4. Kết Quả Bàn Giao

- Admin dashboard đủ để vận hành demo.
- Admin có thể kiểm soát các lượt gửi chưa chắc chắn.
- Dữ liệu điểm được cập nhật khi admin duyệt.

### 9.5. Tiêu Chí Hoàn Thành

- Admin xem được danh sách lượt gửi.
- Admin duyệt/từ chối được lượt gửi.
- Trạng thái và điểm người dùng được cập nhật đúng sau thao tác admin.

## 10. Phase 6: Kiểm Thử, Chỉnh Lỗi Và Chuẩn Bị Demo

### 10.1. Thời Gian

Ngày 12-14.

Nếu timeline chỉ có 10 ngày, phase này cần được rút gọn và thực hiện song song với Phase 5.

### 10.2. Mục Tiêu

Đảm bảo bản demo chạy ổn định, luồng chính rõ ràng và có thể trình bày cho khách hàng.

### 10.3. Công Việc Chính

- Kiểm thử luồng người dùng.
- Kiểm thử luồng admin.
- Kiểm thử một số ảnh rác mẫu.
- Kiểm thử QR hợp lệ và QR không hợp lệ.
- Kiểm thử trường hợp AI không chắc chắn.
- Kiểm thử cộng điểm và lịch sử điểm.
- Chỉnh lỗi giao diện và lỗi luồng chính.
- Chuẩn bị dữ liệu demo.
- Chuẩn bị tài liệu hướng dẫn demo ngắn.

### 10.4. Kết Quả Bàn Giao

- Bản demo web app.
- Tài khoản demo người dùng.
- Tài khoản demo admin.
- Bộ QR/thùng rác mẫu.
- Bộ ảnh test mẫu nếu cần.
- Tài liệu hướng dẫn demo.
- Danh sách các hạng mục đề xuất làm sau demo.

### 10.5. Tiêu Chí Hoàn Thành

- Demo được luồng end-to-end.
- Không có lỗi nghiêm trọng trong luồng chính.
- Khách hàng có thể hiểu rõ cách hệ thống hoạt động.
- Có danh sách rõ ràng những phần nằm ngoài phạm vi 10-14 ngày.

## 11. Timeline Chi Tiết Theo Ngày

| Ngày | Trọng tâm | Kết quả cần đạt |
|---:|---|---|
| 1 | Kickoff, chốt scope | Thống nhất mục tiêu, phạm vi, actor, luồng chính |
| 2 | Chốt rule nghiệp vụ | Loại rác, điểm, trạng thái, điều kiện hợp lệ cơ bản |
| 3 | Wireframe và dữ liệu mẫu | Màn hình chính, QR mẫu, thùng rác mẫu |
| 4 | Chuẩn bị flow demo | User flow/admin flow rõ ràng |
| 5 | Đăng nhập và trang chính | Người dùng vào được hệ thống, thấy điểm |
| 6 | Quét QR và tạo phiên | QR hợp lệ tạo được session |
| 7 | Chụp ảnh và gửi submission | Người dùng gửi được ảnh rác |
| 8 | Tích hợp AI | Ảnh có kết quả loại rác và confidence |
| 9 | Xử lý điểm và trạng thái | Hệ thống cộng điểm/chờ duyệt/từ chối |
| 10 | Admin danh sách submission | Admin xem được dữ liệu gửi lên |
| 11 | Admin duyệt/từ chối | Admin xử lý được submission |
| 12 | Kiểm thử luồng chính | Sửa lỗi chính, ổn định demo |
| 13 | Hoàn thiện UI và dữ liệu demo | Demo mượt hơn, dữ liệu dễ trình bày |
| 14 | Tổng duyệt và bàn giao | Demo end-to-end, tài liệu bàn giao |

## 12. Deliverables Sau 10-14 Ngày

- Web app người dùng bản demo.
- Admin dashboard cơ bản.
- Luồng quét QR, chụp ảnh, AI nhận diện và cộng điểm.
- Danh sách thùng rác mẫu và QR mẫu.
- Rule điểm cơ bản.
- Lịch sử tích điểm.
- Cơ chế duyệt/từ chối lượt gửi.
- Tài khoản demo.
- Tài liệu hướng dẫn demo ngắn.
- Danh sách đề xuất tính năng giai đoạn sau.

## 13. Tiêu Chí Nghiệm Thu

Bản demo được xem là hoàn thành khi:

- Người dùng có thể đăng nhập.
- Người dùng có thể quét QR hợp lệ.
- Người dùng có thể chụp và gửi ảnh rác.
- Hệ thống có thể phân tích ảnh bằng AI hoặc API nhận diện.
- Hệ thống có thể cộng điểm theo rule cơ bản.
- Người dùng xem được lịch sử điểm.
- Admin xem được danh sách lượt gửi.
- Admin duyệt hoặc từ chối được lượt gửi.
- Có thể demo trọn vẹn một kịch bản hợp lệ và một kịch bản cần duyệt/từ chối.

## 14. Rủi Ro Trong Timeline 10-14 Ngày

| Rủi ro | Tác động | Cách kiểm soát |
|---|---|---|
| Scope mở rộng trong quá trình làm | Trễ timeline | Chốt rõ phạm vi từ ngày 1-2 |
| AI nhận diện chưa ổn định | Demo kém thuyết phục | Chuẩn bị bộ ảnh demo phù hợp, dùng ngưỡng confidence và trạng thái chờ duyệt |
| Tích hợp cảm biến thùng rác chưa sẵn sàng | Không đối chiếu được dữ liệu thật | Dùng dữ liệu mô phỏng hoặc bỏ khỏi phạm vi 10-14 ngày |
| UI yêu cầu hoàn thiện quá cao | Không đủ thời gian cho core flow | Ưu tiên UI sạch, rõ, đủ dùng cho demo |
| Rule điểm thay đổi nhiều | Ảnh hưởng xử lý nghiệp vụ | Chốt rule đơn giản trước, để rule nâng cao sau demo |
| Thiếu ảnh mẫu để test | Khó kiểm chứng AI | Chuẩn bị bộ ảnh mẫu từ đầu dự án |

## 15. Hạng Mục Đề Xuất Sau 14 Ngày

Các hạng mục nên để sau bản demo:

- Tích hợp cảm biến thùng rác thật.
- Kiểm tra vị trí GPS chi tiết.
- Phát hiện ảnh trùng lặp nâng cao.
- Bảng xếp hạng.
- Đổi voucher/quà tặng thật.
- Báo cáo theo khu vực/thùng rác/chiến dịch.
- Phân quyền admin.
- Quản lý nhiều địa điểm.
- Cải thiện AI bằng dữ liệu thực tế.
- Tối ưu chống gian lận theo hành vi người dùng.
- Triển khai production chính thức.

## 16. Kết Luận

Trong phạm vi 10-14 ngày, dự án nên tập trung vào một bản MVP/demo có luồng nghiệp vụ rõ ràng và có thể trình bày được giá trị cốt lõi: quét QR, chụp ảnh rác, AI phân tích, xác minh cơ bản, cộng điểm và admin kiểm duyệt.

Các tính năng nâng cao nên được tách sang giai đoạn sau để tránh làm loãng phạm vi và tăng rủi ro trễ tiến độ. Cách tiếp cận này giúp khách hàng sớm nhìn thấy sản phẩm hoạt động, đồng thời có cơ sở thực tế để quyết định đầu tư tiếp cho pilot hoặc production.
