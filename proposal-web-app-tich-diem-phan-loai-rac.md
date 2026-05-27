# Proposal: Web App Tích Điểm Khi Phân Loại Rác

## 1. Tổng Quan Dự Án

Dự án là một nền tảng web app khuyến khích người dùng phân loại rác đúng cách thông qua cơ chế tích điểm. Người dùng sẽ đến gần thùng rác thông minh, quét mã QR trên thùng, chụp ảnh rác cần bỏ và gửi lên hệ thống. Web app sẽ phân tích ảnh bằng AI, đối chiếu với thông tin QR, vị trí, thời gian và dữ liệu cảm biến của thùng rác để xác định hành động có hợp lệ hay không trước khi cộng điểm.

Trong mô hình này, thùng rác thông minh đảm nhận việc phân loại rác vật lý ngoài đời. Web app đảm nhận phần xác minh, ghi nhận dữ liệu, chống gian lận, tính điểm, đổi thưởng và báo cáo.

## 2. Mục Tiêu Sản Phẩm

### 2.1. Mục Tiêu Cho Người Dùng

- Tạo động lực phân loại rác thông qua điểm thưởng.
- Giúp người dùng hiểu rõ hơn về các nhóm rác và cách phân loại.
- Ghi nhận đóng góp cá nhân vào hoạt động bảo vệ môi trường.
- Tạo trải nghiệm đơn giản: quét QR, chụp ảnh, gửi xác nhận, nhận điểm.
- Tăng sự tham gia thông qua bảng xếp hạng, thành tích và đổi thưởng.

### 2.2. Mục Tiêu Cho Đơn Vị Vận Hành

- Theo dõi tần suất sử dụng các thùng rác thông minh.
- Ghi nhận dữ liệu về loại rác, khu vực, thời gian và hành vi người dùng.
- Hạn chế gian lận trong chương trình tích điểm.
- Có dữ liệu phục vụ báo cáo môi trường, truyền thông và đánh giá hiệu quả chiến dịch.
- Quản lý điểm thưởng, voucher, đối tác và các chương trình khuyến khích.

## 3. Đối Tượng Sử Dụng

### 3.1. Người Dùng Cuối

Người dân, cư dân chung cư, học sinh, sinh viên, nhân viên văn phòng, khách tham quan hoặc thành viên của một cộng đồng tham gia chương trình phân loại rác.

### 3.2. Quản Trị Viên

Nhân sự phụ trách vận hành hệ thống, quản lý thùng rác, theo dõi dữ liệu, duyệt các lượt gửi nghi ngờ và quản lý chương trình điểm thưởng.

### 3.3. Đối Tác / Nhà Tài Trợ

Các đơn vị cung cấp voucher, quà tặng, ưu đãi hoặc tài trợ cho chương trình đổi điểm.

## 4. Giá Trị Cốt Lõi

- Biến việc phân loại rác thành một hành động có phần thưởng rõ ràng.
- Tạo dữ liệu thực tế về hành vi phân loại rác.
- Tăng tính minh bạch trong việc ghi nhận đóng góp của người dùng.
- Kết hợp QR code, ảnh chụp, AI và cảm biến thùng rác để tăng độ tin cậy.
- Có thể triển khai theo từng giai đoạn, từ bản thử nghiệm nhỏ đến hệ thống vận hành nhiều địa điểm.

## 5. Luồng Hoạt Động Chính

### 5.1. Luồng Tích Điểm Của Người Dùng

1. Người dùng đăng nhập vào web app.
2. Người dùng đến gần thùng rác thông minh.
3. Người dùng quét mã QR được gắn trên thùng rác.
4. Hệ thống tạo một phiên ghi nhận tại thùng rác đó.
5. Người dùng chụp ảnh rác trước khi bỏ vào thùng.
6. Web app gửi ảnh và thông tin phiên lên hệ thống.
7. AI phân tích loại rác và ngữ cảnh ảnh.
8. Hệ thống kiểm tra tính hợp lệ dựa trên QR, vị trí, thời gian, ảnh chụp và dữ liệu cảm biến nếu có.
9. Nếu hợp lệ, người dùng được cộng điểm.
10. Nếu nghi ngờ, lượt gửi được đưa vào hàng chờ kiểm duyệt.
11. Người dùng xem điểm, lịch sử và thành tích của mình.

### 5.2. Luồng Kiểm Duyệt Của Quản Trị Viên

1. Quản trị viên đăng nhập vào dashboard.
2. Xem danh sách lượt gửi mới, hợp lệ, bị từ chối hoặc đang chờ duyệt.
3. Kiểm tra ảnh, kết quả AI, QR, vị trí, thời gian và dữ liệu cảm biến.
4. Phê duyệt, từ chối hoặc điều chỉnh loại rác nếu cần.
5. Hệ thống cập nhật điểm cho người dùng nếu lượt gửi được chấp nhận.
6. Quản trị viên theo dõi thống kê và xuất báo cáo.

## 6. Tính Năng Dành Cho Người Dùng

### 6.1. Đăng Ký Và Đăng Nhập

- Đăng ký tài khoản bằng email, số điện thoại hoặc mã thành viên.
- Đăng nhập để sử dụng tính năng tích điểm.
- Quản lý hồ sơ cá nhân gồm tên, ảnh đại diện, đơn vị, lớp, phòng ban hoặc khu vực nếu cần.

### 6.2. Quét QR Trên Thùng Rác

- Người dùng quét mã QR trên thùng rác để bắt đầu phiên tích điểm.
- QR giúp xác định đúng thùng rác, vị trí và trạng thái hoạt động.
- Phiên quét QR có thời hạn nhất định để tránh việc dùng lại mã sau thời gian dài.
- Mỗi QR có thể gắn với một thùng rác, một điểm thu gom hoặc một khu vực cụ thể.

### 6.3. Chụp Ảnh Rác

- Người dùng chụp ảnh trực tiếp trong web app.
- Ảnh được dùng để AI phân tích loại rác và kiểm tra tính hợp lệ.
- Hệ thống có thể yêu cầu chụp lại nếu ảnh quá mờ, thiếu sáng, không thấy vật thể hoặc có dấu hiệu không hợp lệ.

### 6.4. Kết Quả Phân Tích

Sau khi gửi ảnh, người dùng có thể nhận được:

- Loại rác được nhận diện.
- Mức độ tin cậy của AI.
- Số điểm được cộng hoặc trạng thái chờ duyệt.
- Lý do nếu lượt gửi bị từ chối.
- Hướng dẫn xử lý nếu rác thuộc nhóm đặc biệt như pin, rác nguy hại hoặc rác không được cộng điểm.

### 6.5. Ví Điểm

- Hiển thị tổng điểm hiện có.
- Hiển thị điểm đã nhận theo ngày, tuần, tháng.
- Hiển thị lịch sử cộng/trừ điểm.
- Hiển thị nguồn điểm: loại rác, thùng rác, thời gian và trạng thái xác minh.

### 6.6. Đổi Thưởng

- Người dùng đổi điểm lấy voucher, quà tặng, ưu đãi hoặc đóng góp vào quỹ môi trường.
- Mỗi phần thưởng có số điểm yêu cầu, mô tả, số lượng và trạng thái còn/hết.
- Hệ thống lưu lịch sử đổi thưởng của từng người dùng.

### 6.7. Bảng Xếp Hạng

- Xếp hạng theo cá nhân.
- Xếp hạng theo lớp, phòng ban, tòa nhà, khu dân cư hoặc nhóm.
- Có thể lọc theo tuần, tháng, chiến dịch hoặc địa điểm.
- Tạo động lực cạnh tranh tích cực trong cộng đồng.

### 6.8. Thành Tích Và Huy Hiệu

- Huy hiệu cho các mốc như 7 ngày liên tiếp, 100 chai nhựa, 10kg giấy, top 10 trong tháng.
- Ghi nhận thành tích dài hạn để tăng sự gắn kết của người dùng.

### 6.9. Theo Dõi Tác Động Môi Trường

- Hiển thị số lượng rác đã phân loại.
- Hiển thị số chai, lon, giấy hoặc rác hữu cơ đã ghi nhận.
- Hiển thị tác động ước tính như lượng rác được đưa vào tái chế hoặc lượng CO2 giảm thải theo quy đổi phù hợp.

## 7. Tính Năng AI Phân Tích Rác

AI được sử dụng như một lớp hỗ trợ xác minh, không phải yếu tố duy nhất quyết định cộng điểm.

### 7.1. Nhận Diện Loại Rác

Các nhóm rác có thể nhận diện trong giai đoạn đầu:

- Chai nhựa.
- Lon kim loại.
- Giấy.
- Bìa carton.
- Chai thủy tinh.
- Rác hữu cơ.
- Pin hoặc rác nguy hại.
- Khác hoặc không xác định.

### 7.2. Kiểm Tra Ngữ Cảnh Ảnh

Hệ thống có thể đánh giá:

- Ảnh có vật thể rác rõ ràng hay không.
- Ảnh có dấu hiệu chụp lại từ màn hình hoặc dùng ảnh cũ hay không.
- Ảnh có quá mờ, quá tối hoặc thiếu thông tin hay không.
- Ảnh có phù hợp với bối cảnh quét QR tại thùng rác hay không.

### 7.3. Mức Độ Tin Cậy

Mỗi kết quả AI có mức độ tin cậy:

- Tin cậy cao: có thể đưa vào quy trình cộng điểm tự động.
- Tin cậy trung bình: đưa vào hàng chờ duyệt.
- Tin cậy thấp: yêu cầu chụp lại hoặc từ chối.

## 8. Cơ Chế Chống Gian Lận

Vì điểm thưởng có thể quy đổi thành quà hoặc ưu đãi, hệ thống cần có nhiều lớp chống gian lận.

### 8.1. Xác Minh QR

- Mỗi thùng rác có mã QR riêng.
- QR gắn với mã thùng rác, địa điểm và trạng thái hoạt động.
- Hệ thống kiểm tra QR có hợp lệ, còn hiệu lực và có dấu hiệu bị lạm dụng hay không.

### 8.2. Xác Minh Vị Trí

- Kiểm tra vị trí người dùng có gần thùng rác hay không.
- Bán kính hợp lệ có thể cấu hình, ví dụ 20-50m tùy khu vực.
- Nếu vị trí không khớp, lượt gửi có thể bị từ chối hoặc đưa vào hàng chờ duyệt.

### 8.3. Xác Minh Thời Gian

- Ảnh phải được chụp trong khoảng thời gian gần với lúc quét QR.
- Phiên quét QR sẽ hết hiệu lực sau một thời gian nhất định.
- Nếu có dữ liệu cảm biến, sự kiện bỏ rác cần nằm trong khoảng thời gian hợp lý với ảnh chụp.

### 8.4. Phát Hiện Ảnh Trùng Lặp

- Kiểm tra ảnh có bị dùng lại nhiều lần hay không.
- Phát hiện ảnh giống nhau hoặc gần giống nhau.
- Hạn chế việc chụp lại ảnh cũ hoặc gửi cùng một ảnh cho nhiều lượt tích điểm.

### 8.5. Giới Hạn Tần Suất

- Giới hạn số lượt gửi mỗi người trong ngày.
- Giới hạn số lần quét trên cùng một thùng trong thời gian ngắn.
- Phát hiện hành vi bất thường như gửi quá nhiều ảnh liên tục.

### 8.6. Đối Chiếu Cảm Biến Thùng Rác

Nếu thùng rác có cảm biến, hệ thống có thể đối chiếu:

- Có sự kiện bỏ rác sau khi người dùng quét QR hay không.
- Loại rác do thùng rác ghi nhận có gần với loại rác AI nhận diện hay không.
- Khối lượng hoặc trạng thái thùng có thay đổi hay không.

### 8.7. Chấm Điểm Hợp Lệ

Hệ thống có thể tính điểm tin cậy dựa trên nhiều tiêu chí:

- QR hợp lệ.
- Vị trí hợp lệ.
- Ảnh mới và không trùng lặp.
- AI nhận diện được loại rác.
- Có sự kiện từ cảm biến thùng rác.
- Tần suất sử dụng bình thường.

Chỉ các lượt gửi đạt ngưỡng tin cậy mới được cộng điểm tự động.

## 9. Tính Năng Quản Trị

### 9.1. Dashboard Tổng Quan

- Tổng số người dùng.
- Tổng số lượt gửi.
- Tổng điểm đã cộng.
- Tổng số rác được ghi nhận.
- Số lượt gửi hợp lệ, bị từ chối và đang chờ duyệt.
- Thống kê theo ngày, tuần, tháng.

### 9.2. Quản Lý Lượt Gửi

- Xem ảnh người dùng đã gửi.
- Xem kết quả AI.
- Xem QR, thùng rác và địa điểm liên quan.
- Xem thời gian, vị trí và dữ liệu cảm biến nếu có.
- Phê duyệt, từ chối hoặc sửa loại rác.
- Ghi chú lý do xử lý.

### 9.3. Quản Lý Thùng Rác

- Thêm, sửa, xóa thùng rác.
- Quản lý mã QR của từng thùng.
- Gắn thùng rác với địa điểm.
- Theo dõi trạng thái hoạt động của thùng.
- Xem lịch sử sử dụng của từng thùng.

### 9.4. Quản Lý Người Dùng

- Xem danh sách người dùng.
- Xem điểm, lịch sử hoạt động và lượt gửi.
- Phát hiện tài khoản có hành vi bất thường.
- Khóa hoặc hạn chế tài khoản nếu cần.

### 9.5. Quản Lý Điểm Thưởng

- Cấu hình số điểm theo từng loại rác.
- Cấu hình điểm thưởng theo chiến dịch.
- Cấu hình giới hạn điểm/ngày.
- Điều chỉnh điểm thủ công trong trường hợp đặc biệt.

### 9.6. Quản Lý Quà Tặng Và Voucher

- Tạo phần thưởng mới.
- Cấu hình số điểm cần đổi.
- Quản lý số lượng tồn.
- Theo dõi lịch sử đổi thưởng.
- Gắn đối tác tài trợ cho từng phần thưởng.

### 9.7. Báo Cáo

- Báo cáo số lượng rác theo loại.
- Báo cáo theo khu vực hoặc thùng rác.
- Báo cáo theo chiến dịch.
- Báo cáo người dùng tích cực.
- Báo cáo lượt gửi nghi ngờ hoặc gian lận.
- Xuất file phục vụ truyền thông, báo cáo nội bộ hoặc báo cáo cho đối tác.

## 10. Hệ Thống Điểm Đề Xuất

Điểm thưởng có thể cấu hình linh hoạt theo mục tiêu chiến dịch. Ví dụ:

- Chai nhựa: 5 điểm.
- Lon kim loại: 8 điểm.
- Giấy/carton: 3 điểm.
- Thủy tinh: 6 điểm.
- Rác hữu cơ: 2 điểm.
- Pin/rác nguy hại: không cộng điểm tự động, hiển thị hướng dẫn xử lý riêng.

Có thể bổ sung điểm thưởng:

- Thưởng cho 7 ngày liên tiếp.
- Thưởng cho khu vực có tỷ lệ phân loại đúng cao.
- Thưởng trong sự kiện hoặc chiến dịch đặc biệt.
- Thưởng cho nhóm, lớp hoặc phòng ban đạt mục tiêu.

## 11. Các Màn Hình Cần Có

### 11.1. Phía Người Dùng

- Đăng nhập/đăng ký.
- Trang chính hiển thị điểm và hành động nhanh.
- Quét QR.
- Chụp ảnh.
- Kết quả phân tích.
- Ví điểm.
- Lịch sử hoạt động.
- Đổi quà.
- Bảng xếp hạng.
- Hồ sơ cá nhân.

### 11.2. Phía Quản Trị

- Dashboard tổng quan.
- Quản lý lượt gửi.
- Quản lý thùng rác.
- Quản lý người dùng.
- Quản lý điểm thưởng.
- Quản lý voucher/quà tặng.
- Báo cáo và thống kê.
- Cấu hình chiến dịch.

## 12. Lộ Trình Triển Khai Đề Xuất

### 12.1. Giai Đoạn 1: MVP

Mục tiêu: xây dựng bản thử nghiệm có thể demo và pilot nhỏ.

Tính năng chính:

- Đăng nhập người dùng.
- Quét QR thùng rác.
- Chụp ảnh rác.
- AI nhận diện loại rác cơ bản.
- Cộng điểm nếu hợp lệ.
- Lịch sử tích điểm.
- Dashboard admin cơ bản.
- Duyệt lượt gửi nghi ngờ.

### 12.2. Giai Đoạn 2: Pilot Thực Tế

Mục tiêu: thử nghiệm với một số thùng rác và nhóm người dùng giới hạn.

Tính năng bổ sung:

- Tích hợp dữ liệu cảm biến thùng rác.
- Bảng xếp hạng.
- Đổi voucher.
- Báo cáo theo thùng/khu vực.
- Phát hiện ảnh trùng lặp.
- Cấu hình điểm theo chiến dịch.

### 12.3. Giai Đoạn 3: Mở Rộng

Mục tiêu: vận hành trên nhiều địa điểm và nhiều nhóm người dùng.

Tính năng bổ sung:

- Hệ thống huy hiệu/thành tích.
- Phân tích hành vi gian lận nâng cao.
- Báo cáo tác động môi trường.
- Quản lý đối tác và voucher nâng cao.
- Cải thiện AI bằng dữ liệu thực tế.
- Hỗ trợ nhiều chiến dịch đồng thời.

## 13. Tiêu Chí Thành Công

- Người dùng có thể quét QR, chụp ảnh và nhận điểm trong một luồng đơn giản.
- Hệ thống nhận diện được các loại rác cơ bản với độ tin cậy phù hợp cho giai đoạn pilot.
- Có cơ chế hạn chế các hình thức gian lận phổ biến.
- Quản trị viên có thể xem, duyệt và quản lý lượt gửi.
- Đơn vị vận hành có báo cáo về số lượng rác, người dùng, thùng rác và điểm thưởng.
- Sản phẩm có thể mở rộng từ pilot lên nhiều địa điểm mà không phải thay đổi mô hình vận hành cốt lõi.

## 14. Phạm Vi Chưa Bao Gồm Trong Giai Đoạn Đầu

Để MVP gọn và khả thi, giai đoạn đầu chưa nên đưa vào:

- Ứng dụng mobile native riêng cho iOS/Android.
- AI tự huấn luyện hoàn toàn từ đầu nếu chưa có đủ dữ liệu ảnh thực tế.
- Hệ thống IoT phức tạp nếu thùng rác chưa sẵn sàng tích hợp.
- Blockchain, NFT hoặc điểm thưởng phi tập trung.
- Phân tích môi trường chuyên sâu theo chuẩn carbon accounting.
- Đổi thưởng giá trị cao khi chưa có quy trình kiểm soát gian lận đầy đủ.

## 15. Kết Luận

Web app tích điểm khi phân loại rác là một giải pháp khả thi để tăng động lực phân loại rác, thu thập dữ liệu vận hành và tạo tác động tích cực cho cộng đồng. Hướng triển khai phù hợp là bắt đầu với MVP tập trung vào quét QR, chụp ảnh, AI nhận diện loại rác, chống gian lận cơ bản và cộng điểm.

Sau giai đoạn pilot, hệ thống có thể tiếp tục mở rộng bằng dữ liệu cảm biến thùng rác, dashboard báo cáo nâng cao, cơ chế đổi thưởng và cải thiện AI dựa trên ảnh thực tế thu thập được.
