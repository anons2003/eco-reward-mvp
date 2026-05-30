# Cơ Chế Chống Gian Lận Cho Web App Tích Điểm Phân Loại Rác

## 1. Mục Tiêu Tài Liệu

Tài liệu này mô tả các rủi ro gian lận và cơ chế kiểm soát đề xuất cho web app tích điểm khi người dùng phân loại rác. Bối cảnh hiện tại:

- Thùng rác sử dụng QR tĩnh.
- Người dùng quét QR trên thùng rác để bắt đầu phiên tích điểm.
- Người dùng chụp ảnh rác trên web app.
- AI phân tích loại rác và mức độ tin cậy.
- Cảm biến thùng rác chưa được tích hợp trực tiếp vào hệ thống web.

Vì chưa có dữ liệu cảm biến xác nhận rác đã thật sự được bỏ vào thùng, hệ thống cần áp dụng nhiều lớp kiểm soát để giảm rủi ro gian lận.

## 2. Nguyên Tắc Chống Gian Lận

Hệ thống không nên cộng điểm chỉ dựa trên một yếu tố duy nhất như ảnh chụp hoặc QR code. Mỗi lượt gửi cần được đánh giá bằng nhiều tín hiệu:

- QR có hợp lệ hay không.
- Người dùng có ở gần thùng rác hay không.
- Ảnh có được chụp trong phiên hợp lệ hay không.
- AI có nhận diện được rác rõ ràng hay không.
- Ảnh có bị dùng lại hay không.
- Người dùng có hành vi bất thường hay không.
- Lượt gửi có vượt giới hạn điểm/ngày hay không.

Mục tiêu là giảm tối đa khả năng gian lận, đồng thời vẫn giữ trải nghiệm người dùng đủ đơn giản cho giai đoạn MVP.

## 3. Rủi Ro Chính Khi Chưa Có Cảm Biến

### 3.1. Chụp Rác Nhưng Không Bỏ Vào Thùng

Người dùng có thể quét QR, chụp ảnh rác hợp lệ, nhận điểm nhưng không thật sự bỏ rác vào thùng.

Biện pháp giảm rủi ro:

- Chỉ cộng điểm nhỏ trong giai đoạn MVP.
- Giới hạn số lượt gửi/ngày.
- Dùng cơ chế random review.
- Chưa cho đổi thưởng giá trị cao ngay lập tức.
- Ưu tiên tích hợp cảm biến thùng ở giai đoạn sau.

### 3.2. Chụp Lại Cùng Một Món Rác Nhiều Lần

Người dùng có thể dùng cùng một chai/lon/giấy để chụp nhiều lần tại cùng một thùng hoặc nhiều thùng khác nhau.

Biện pháp giảm rủi ro:

- Phát hiện ảnh trùng bằng image hash hoặc perceptual hash.
- So sánh ảnh gần giống nhau theo vật thể, nền ảnh và thời gian.
- Giới hạn số lượt gửi cùng loại rác trong một khoảng thời gian ngắn.
- Đưa vào kiểm duyệt nếu cùng một vật thể xuất hiện nhiều lần.

### 3.3. Dùng Ảnh Cũ Hoặc Chụp Ảnh Trên Màn Hình

Người dùng có thể mở ảnh rác cũ trên điện thoại/laptop rồi dùng web app chụp lại.

Biện pháp giảm rủi ro:

- Chỉ cho chụp trực tiếp bằng camera trong web app ở giai đoạn MVP.
- Không cho upload ảnh từ thư viện.
- Kiểm tra ảnh có dấu hiệu chụp từ màn hình, phản chiếu, viền màn hình hoặc nhiễu bất thường.
- Có thể yêu cầu chụp lại nếu ảnh nghi ngờ.

### 3.4. Chụp Hoặc Chia Sẻ QR Tĩnh

Vì QR hiện tại là QR tĩnh, người dùng có thể chụp QR và scan lại ở nơi khác.

Biện pháp giảm rủi ro:

- Bắt buộc kiểm tra GPS gần vị trí thùng rác.
- Chỉ tạo phiên hợp lệ nếu người dùng nằm trong bán kính cho phép.
- Theo dõi QR bị scan bất thường từ nhiều vị trí hoặc nhiều tài khoản.
- Hiển thị tên/vị trí thùng sau khi quét để người dùng và admin dễ phát hiện sai lệch.

### 3.5. Giả Lập Vị Trí GPS

Người dùng có thể dùng công cụ giả lập GPS để vượt qua kiểm tra vị trí.

Biện pháp giảm rủi ro:

- Kiểm tra độ chính xác GPS.
- Không auto approve nếu GPS accuracy quá thấp.
- Đưa vào pending review nếu vị trí nhảy bất thường.
- Kết hợp thêm IP, thiết bị, lịch sử hành vi và tần suất gửi.

### 3.6. Tạo Nhiều Tài Khoản Để Nhận Nhiều Điểm

Một người có thể tạo nhiều tài khoản để vượt giới hạn điểm/ngày.

Biện pháp giảm rủi ro:

- Xác thực tài khoản bằng số điện thoại hoặc email.
- Giới hạn số tài khoản trên cùng thiết bị nếu có thể.
- Theo dõi nhiều tài khoản dùng cùng thiết bị, IP hoặc hành vi giống nhau.
- Chỉ cho tài khoản đủ uy tín đổi thưởng giá trị cao.

### 3.7. Chụp Nhiều Vật Trong Một Ảnh Để Lấy Nhiều Điểm

Người dùng có thể chụp nhiều món rác trong một ảnh nhưng không bỏ toàn bộ vào thùng.

Biện pháp giảm rủi ro:

- Giới hạn số vật thể được tính điểm trong mỗi phiên.
- Ví dụ mỗi phiên chỉ tính tối đa 1-3 vật thể.
- Ảnh có quá nhiều vật thể sẽ chuyển sang pending review.
- Không cộng điểm tuyến tính không giới hạn theo số lượng vật thể trong ảnh.

### 3.8. Chụp Rác Có Sẵn Gần Thùng

Người dùng có thể chụp rác có sẵn xung quanh thùng mà không thực hiện hành động phân loại.

Biện pháp giảm rủi ro:

- Yêu cầu ảnh chụp vật thể rác ở gần miệng thùng hoặc trên tay người dùng.
- AI kiểm tra bối cảnh ảnh nếu có thể.
- Random challenge trong các trường hợp nghi ngờ, ví dụ yêu cầu chụp lại ở góc khác.
- Đưa vào pending review nếu ảnh không thể hiện rõ hành động chuẩn bị bỏ rác.

### 3.9. Spam Gửi Ảnh Làm Tốn Chi Phí AI

Bot hoặc người dùng xấu có thể gửi nhiều ảnh để làm tốn quota AI.

Biện pháp giảm rủi ro:

- Rate limit theo user, IP và thiết bị.
- Chỉ gọi AI sau khi QR và vị trí cơ bản hợp lệ.
- Resize/nén ảnh trước khi gửi AI.
- Tạm khóa hoặc cooldown tài khoản có hành vi bất thường.

### 3.10. Gian Lận Nội Bộ Khi Duyệt Thủ Công

Admin có thể duyệt nhầm hoặc cố tình duyệt sai lượt gửi.

Biện pháp giảm rủi ro:

- Ghi audit log mọi thao tác admin.
- Phân quyền rõ vai trò admin.
- Không cho admin xóa dấu vết duyệt.
- Báo cáo các lượt chỉnh điểm thủ công.
- Có cơ chế kiểm tra chéo với các lượt có điểm cao.

## 4. Quy Trình Xác Minh Đề Xuất

### 4.1. Bước 1: Quét QR

Người dùng quét QR trên thùng rác. Hệ thống kiểm tra:

- QR có tồn tại trong hệ thống không.
- QR có gắn với thùng rác đang hoạt động không.
- Thùng rác có thuộc khu vực được phép sử dụng không.

Nếu hợp lệ, hệ thống tạo một phiên quét QR.

### 4.2. Bước 2: Tạo Phiên Ngắn Hạn

Sau khi quét QR hợp lệ, hệ thống tạo `scan_session`.

Đề xuất:

- Thời hạn phiên: 60-120 giây.
- Mỗi phiên chỉ dùng cho một lượt gửi.
- Phiên hết hạn thì người dùng phải quét QR lại.
- Ảnh phải được chụp trong thời gian phiên còn hiệu lực.

### 4.3. Bước 3: Kiểm Tra Vị Trí

Hệ thống kiểm tra vị trí người dùng so với vị trí thùng rác.

Đề xuất:

- Bán kính hợp lệ: 20-50m tùy khu vực.
- Nếu GPS chính xác và nằm trong vùng cho phép: tiếp tục.
- Nếu GPS yếu hoặc không có quyền vị trí: chuyển pending review hoặc từ chối tùy chính sách.
- Nếu vị trí quá xa: từ chối.

### 4.4. Bước 4: Chụp Ảnh

Người dùng chụp ảnh rác trực tiếp trên web app.

Đề xuất:

- Giai đoạn MVP không cho upload ảnh từ thư viện.
- Ảnh phải có chất lượng đủ tốt.
- Nếu ảnh quá mờ, quá tối hoặc không thấy vật thể: yêu cầu chụp lại.

### 4.5. Bước 5: Kiểm Tra Trùng Lặp

Trước hoặc sau khi gọi AI, hệ thống kiểm tra ảnh có bị dùng lại hay không.

Tín hiệu kiểm tra:

- Hash ảnh.
- Perceptual hash.
- Thời gian chụp.
- Người dùng.
- Thùng rác.
- Loại rác AI nhận diện.
- Mức độ giống nhau với các ảnh đã gửi trước đó.

Nếu ảnh trùng rõ ràng, hệ thống từ chối.

### 4.6. Bước 6: AI Phân Tích Ảnh

AI phân tích ảnh để nhận diện:

- Loại rác.
- Số lượng vật thể.
- Mức độ tin cậy.
- Có thấy rác rõ ràng hay không.
- Có dấu hiệu ảnh không hợp lệ hay không.

Kết quả AI không tự động quyết định cộng điểm, mà là một tín hiệu trong hệ thống chấm điểm rủi ro.

### 4.7. Bước 7: Chấm Điểm Rủi Ro

Hệ thống tính điểm tin cậy cho mỗi lượt gửi.

Ví dụ thang điểm:

| Tiêu chí | Điểm |
|---|---:|
| QR hợp lệ | +20 |
| GPS gần thùng | +20 |
| Ảnh chụp trong phiên hợp lệ | +20 |
| AI nhận diện rác với confidence đủ cao | +20 |
| Ảnh chưa từng được dùng | +20 |
| User có lịch sử tốt | +10 |
| User gửi quá nhiều lần trong thời gian ngắn | -20 |
| GPS yếu hoặc bất thường | -20 |
| Ảnh có dấu hiệu chụp lại màn hình | -30 |
| Ảnh có quá nhiều vật thể | -10 đến -30 |

Ngưỡng xử lý đề xuất:

| Tổng điểm | Kết quả |
|---|---|
| >= 80 | Tự động duyệt và cộng điểm |
| 50-79 | Chuyển sang pending review |
| < 50 | Từ chối |

## 5. Quy Tắc Cộng Điểm Đề Xuất Cho MVP

Vì chưa có cảm biến xác nhận rác đã được bỏ vào thùng, cơ chế điểm ở MVP nên thận trọng.

Đề xuất:

- Mỗi phiên QR chỉ tính một lượt gửi.
- Mỗi lượt gửi chỉ tính tối đa 1-3 vật thể.
- Mỗi người có giới hạn điểm/ngày.
- Tài khoản mới có giới hạn thấp hơn tài khoản uy tín.
- Điểm vừa nhận có thể ở trạng thái tạm giữ trước khi được dùng đổi quà.
- Voucher hoặc phần thưởng giá trị cao cần tài khoản đủ uy tín.

Ví dụ:

| Rule | Giá trị đề xuất |
|---|---|
| Thời hạn phiên QR | 60-120 giây |
| Bán kính GPS hợp lệ | 20-50m |
| Confidence AI tối thiểu để auto approve | >= 75% |
| Số vật thể tối đa tính điểm/session | 1-3 |
| Số submission tối đa/người/ngày | 5-10 |
| Tỷ lệ random review | 5-10% |
| Thời gian giữ điểm trước khi đổi quà | 24 giờ |

## 6. Trạng Thái Lượt Gửi

Mỗi lượt gửi nên có trạng thái rõ ràng:

| Trạng thái | Ý nghĩa |
|---|---|
| Draft | Người dùng đã bắt đầu nhưng chưa gửi |
| Submitted | Người dùng đã gửi ảnh |
| AI Analyzed | AI đã phân tích xong |
| Approved | Lượt gửi hợp lệ |
| Pending Review | Cần admin kiểm duyệt |
| Rejected | Lượt gửi bị từ chối |
| Rewarded | Điểm đã được cộng |
| Cancelled | Phiên bị hủy hoặc hết hạn |

## 7. Random Review Và Trust Score

### 7.1. Random Review

Ngay cả các lượt gửi có vẻ hợp lệ vẫn nên có một tỷ lệ được chọn ngẫu nhiên để kiểm tra.

Đề xuất:

- 5-10% lượt auto-approved được đưa vào audit.
- Nếu phát hiện gian lận, hệ thống có thể thu hồi điểm.
- User vi phạm nhiều lần sẽ bị giảm trust score.

### 7.2. Trust Score Người Dùng

Mỗi người dùng có thể có điểm uy tín dựa trên lịch sử:

- Số lượt gửi hợp lệ.
- Số lượt bị từ chối.
- Tần suất gửi ảnh.
- Số lần bị admin đánh dấu gian lận.
- Lịch sử đổi thưởng.

Ứng dụng trust score:

- User mới: kiểm soát chặt hơn.
- User uy tín: auto approve dễ hơn trong giới hạn cho phép.
- User rủi ro: tăng tỷ lệ pending review hoặc giới hạn điểm.

## 8. Biện Pháp Khi Phát Hiện Gian Lận

Tùy mức độ vi phạm, hệ thống có thể áp dụng:

- Từ chối lượt gửi.
- Không cộng điểm.
- Thu hồi điểm đã cộng.
- Tạm khóa quyền gửi ảnh.
- Tạm khóa quyền đổi thưởng.
- Khóa tài khoản nếu vi phạm nghiêm trọng.
- Đưa tài khoản vào danh sách cần theo dõi.

Admin cần nhìn thấy lý do hệ thống đánh dấu gian lận để ra quyết định minh bạch.

## 9. Hướng Nâng Cấp Sau MVP

Khi có điều kiện mở rộng, nên nâng cấp hệ thống chống gian lận bằng:

- Tích hợp cảm biến thùng rác để xác nhận có hành động bỏ rác.
- QR động thay cho QR tĩnh nếu thùng có màn hình hoặc thiết bị hiển thị.
- Camera tại miệng thùng hoặc bên trong thùng nếu phù hợp với chính sách riêng tư.
- Xác nhận từ nhân sự tại điểm thu gom trong các sự kiện lớn.
- Mô hình AI riêng được huấn luyện bằng dữ liệu thực tế.
- Phân tích hành vi bất thường theo nhóm người dùng, địa điểm và thời gian.

## 10. Kết Luận

Trong giai đoạn hiện tại, QR tĩnh và ảnh chụp chưa đủ để chứng minh tuyệt đối rằng người dùng đã bỏ rác vào thùng. Vì vậy, hệ thống cần kết hợp nhiều lớp kiểm soát: QR, GPS, session ngắn, camera trực tiếp, AI, phát hiện ảnh trùng, giới hạn điểm, random review và trust score.

Cách tiếp cận phù hợp cho MVP là giảm rủi ro thay vì cố gắng loại bỏ hoàn toàn gian lận. Khi cảm biến thùng rác được tích hợp, hệ thống sẽ có thêm bằng chứng quan trọng để tăng tỷ lệ tự động duyệt và cho phép các phần thưởng có giá trị cao hơn.
