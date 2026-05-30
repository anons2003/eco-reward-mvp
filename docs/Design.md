# Đặc Tả Trang Thiết Kế Web App Tích Điểm Phân Loại Rác

## 1. Mục Đích Tài Liệu

Tài liệu này mô tả các trang cần thiết kế cho web app tích điểm khi người dùng phân loại rác. Nội dung được xây dựng dựa trên các tính năng chính đã xác định: đăng nhập, quét QR, chụp ảnh rác, AI nhận diện, cộng điểm, ví điểm, đổi thưởng, bảng xếp hạng và admin kiểm duyệt.

Tài liệu dùng cho bước thiết kế UI/UX, wireframe hoặc prototype. Mỗi trang được mô tả theo mục tiêu, người dùng, nội dung chính, hành động chính và các trạng thái cần thể hiện.

## 2. Nhóm Người Dùng Và Khu Vực Giao Diện

### 2.1. Người Dùng Cuối

Người dùng cuối là người tham gia chương trình phân loại rác. Các trang cần ưu tiên trải nghiệm nhanh, rõ ràng và phù hợp trên điện thoại vì luồng chính diễn ra tại thùng rác.

Các việc người dùng cần làm:

- Đăng ký, đăng nhập.
- Xem điểm hiện có.
- Quét QR trên thùng rác.
- Chụp ảnh rác.
- Nhận kết quả phân tích.
- Theo dõi lịch sử điểm.
- Đổi thưởng.
- Xem bảng xếp hạng, thành tích và hồ sơ cá nhân.

### 2.2. Quản Trị Viên

Admin là người vận hành hệ thống. Giao diện admin cần ưu tiên khả năng rà soát dữ liệu, lọc nhanh, kiểm duyệt nhanh và nhìn thấy lý do hệ thống đánh dấu rủi ro.

Các việc admin cần làm:

- Theo dõi dashboard tổng quan.
- Duyệt hoặc từ chối lượt gửi.
- Xem ảnh, kết quả AI, QR, vị trí và trạng thái rủi ro.
- Quản lý thùng rác, QR, địa điểm.
- Quản lý người dùng, điểm, voucher, chiến dịch và báo cáo.

### 2.3. Đối Tác / Nhà Tài Trợ

Đối tác có thể cần khu vực riêng ở giai đoạn sau để xem hiệu quả tài trợ, voucher đã đổi và số liệu truyền thông. Nếu chưa làm trong MVP, chỉ cần thể hiện như phần mở rộng.

## 3. Sitemap Tổng Quan

### 3.1. Phía Người Dùng

| Nhóm | Trang | Mục đích |
|---|---|---|
| Auth | Đăng nhập | Cho người dùng vào hệ thống |
| Auth | Đăng ký | Tạo tài khoản mới |
| Auth | Quên mật khẩu / OTP | Khôi phục quyền truy cập |
| Main | Trang chính | Xem điểm, tác động môi trường và bắt đầu quét QR |
| Core Flow | Quét QR | Xác định thùng rác và tạo phiên gửi |
| Core Flow | Xác nhận thùng rác | Cho người dùng biết đang ở đúng thùng |
| Core Flow | Chụp ảnh rác | Chụp ảnh trực tiếp trong web app |
| Core Flow | Đang phân tích | Hiển thị trạng thái xử lý AI |
| Core Flow | Kết quả phân tích | Hiển thị loại rác, điểm, trạng thái duyệt |
| Wallet | Ví điểm | Xem tổng điểm và biến động điểm |
| Wallet | Lịch sử hoạt động | Xem các lượt gửi và trạng thái |
| Rewards | Đổi thưởng | Duyệt danh sách voucher/quà tặng |
| Rewards | Chi tiết phần thưởng | Xem điều kiện và đổi điểm |
| Rewards | Lịch sử đổi thưởng | Theo dõi voucher/quà đã đổi |
| Community | Bảng xếp hạng | Xem xếp hạng cá nhân/nhóm |
| Community | Thành tích | Xem huy hiệu và mốc hoàn thành |
| Education | Hướng dẫn phân loại | Học cách phân loại các nhóm rác |
| Account | Hồ sơ cá nhân | Xem và sửa thông tin cá nhân |
| Account | Cài đặt | Quản lý thông báo, quyền vị trí, đăng xuất |
| Support | Thông báo / Tin tức | Xem chiến dịch, nhắc nhở, cập nhật |
| Support | Trợ giúp | Câu hỏi thường gặp và liên hệ hỗ trợ |

### 3.2. Phía Admin

| Nhóm | Trang | Mục đích |
|---|---|---|
| Auth | Đăng nhập admin | Cho admin vào dashboard |
| Dashboard | Tổng quan | Theo dõi chỉ số vận hành chính |
| Submissions | Danh sách lượt gửi | Lọc, tìm kiếm, xử lý lượt gửi |
| Submissions | Chi tiết lượt gửi | Xem bằng chứng và duyệt/từ chối |
| Submissions | Hàng chờ kiểm duyệt | Tập trung xử lý lượt cần admin xem |
| Fraud | Cảnh báo gian lận | Theo dõi user/QR/thùng có rủi ro |
| Bins | Quản lý thùng rác | Quản lý thùng, QR, trạng thái |
| Bins | Chi tiết thùng rác | Xem lịch sử sử dụng và cấu hình |
| Locations | Quản lý địa điểm | Quản lý khu vực, bán kính GPS, nhóm |
| Users | Quản lý người dùng | Xem tài khoản, điểm, trust score |
| Users | Chi tiết người dùng | Xem lịch sử gửi, đổi thưởng, cảnh báo |
| Points | Cấu hình điểm | Cấu hình điểm theo loại rác và rule |
| Rewards | Quản lý voucher/quà | Tạo, sửa, theo dõi phần thưởng |
| Rewards | Lịch sử đổi thưởng | Theo dõi yêu cầu đổi quà |
| Campaigns | Quản lý chiến dịch | Cấu hình thời gian, khu vực, bonus |
| Reports | Báo cáo | Thống kê rác, người dùng, thùng, điểm |
| Settings | Cấu hình hệ thống | Ngưỡng AI, giới hạn gửi, chống gian lận |
| Audit | Nhật ký thao tác | Xem thao tác admin và thay đổi điểm |

## 4. Nguyên Tắc Thiết Kế Chung

### 4.1. Trải Nghiệm Người Dùng Cuối

- Thiết kế mobile-first.
- Luồng chính phải ngắn: mở app, quét QR, chụp ảnh, gửi, nhận kết quả.
- Nút hành động chính cần nổi bật và dễ bấm bằng một tay.
- Trạng thái hệ thống phải rõ: hợp lệ, chờ duyệt, bị từ chối, cần chụp lại.
- Điểm thưởng phải dễ thấy nhưng không nên làm người dùng hiểu nhầm rằng mọi ảnh đều chắc chắn được cộng điểm.
- Các lỗi như QR hết hạn, GPS không khớp, ảnh mờ cần có hướng dẫn xử lý ngay trên màn hình.

### 4.2. Trải Nghiệm Admin

- Thiết kế theo hướng dashboard thao tác nhiều lần trong ngày.
- Ưu tiên bảng dữ liệu rõ, bộ lọc nhanh, trạng thái nổi bật.
- Chi tiết lượt gửi cần đặt ảnh, kết quả AI và quyết định admin trong cùng một luồng nhìn.
- Mỗi quyết định duyệt/từ chối cần có lý do và ghi vào audit log.
- Các cảnh báo gian lận phải giải thích được vì sao hệ thống đánh dấu.

### 4.3. Hệ Thống Trạng Thái Cần Thống Nhất

| Trạng thái | Ý nghĩa | Gợi ý hiển thị |
|---|---|---|
| Draft | Đã bắt đầu nhưng chưa gửi | Nhẹ, trung tính |
| Submitted | Đã gửi ảnh | Đang xử lý |
| AI Analyzed | AI đã phân tích xong | Có kết quả tạm |
| Approved | Hợp lệ | Tích cực |
| Pending Review | Chờ admin duyệt | Cảnh báo nhẹ |
| Rejected | Bị từ chối | Cảnh báo rõ |
| Rewarded | Đã cộng điểm | Tích cực |
| Cancelled | Phiên hết hạn hoặc bị hủy | Trung tính/cảnh báo |

## 5. Đặc Tả Trang Người Dùng

### 5.1. Trang Đăng Nhập

Mục tiêu: cho người dùng truy cập nhanh vào web app.

Nội dung cần có:

- Logo hoặc tên chương trình.
- Trường email/số điện thoại/mã thành viên.
- Trường mật khẩu hoặc OTP.
- Nút đăng nhập.
- Link đăng ký.
- Link quên mật khẩu.
- Thông báo lỗi khi sai thông tin.

Hành động chính:

- Đăng nhập.
- Chuyển sang đăng ký.
- Khôi phục mật khẩu.

Trạng thái cần thiết kế:

- Mặc định.
- Đang đăng nhập.
- Sai thông tin.
- Tài khoản bị khóa/tạm hạn chế.

### 5.2. Trang Đăng Ký

Mục tiêu: tạo tài khoản người dùng mới.

Nội dung cần có:

- Họ tên.
- Email hoặc số điện thoại.
- Mật khẩu/OTP.
- Khu vực, lớp, phòng ban hoặc nhóm nếu chương trình cần xếp hạng theo nhóm.
- Đồng ý điều khoản và chính sách riêng tư.

Hành động chính:

- Tạo tài khoản.
- Xác thực OTP/email nếu có.

Trạng thái cần thiết kế:

- Form ban đầu.
- Lỗi thiếu thông tin.
- Email/số điện thoại đã tồn tại.
- Đăng ký thành công.

### 5.3. Trang Chính Người Dùng

Mục tiêu: là điểm bắt đầu của người dùng sau khi đăng nhập.

Nội dung cần có:

- Tổng điểm hiện có.
- Điểm chờ duyệt hoặc điểm đang tạm giữ nếu áp dụng.
- Nút quét QR nổi bật.
- Tóm tắt tác động môi trường: số lượt phân loại, số chai/lon/giấy, CO2 giảm thải ước tính.
- Lịch sử gần đây.
- Phần thưởng nổi bật.
- Thứ hạng hiện tại nếu có.
- Thông báo chiến dịch hoặc nhiệm vụ hôm nay.

Hành động chính:

- Quét QR.
- Xem ví điểm.
- Xem lịch sử.
- Xem đổi thưởng.

Trạng thái cần thiết kế:

- Người dùng mới chưa có điểm.
- Người dùng có điểm và lịch sử.
- Có điểm đang chờ duyệt.
- Có thông báo cần chú ý.

### 5.4. Trang Quét QR

Mục tiêu: xác định thùng rác người dùng đang sử dụng.

Nội dung cần có:

- Khung camera quét QR.
- Hướng dẫn ngắn: đưa mã QR trên thùng vào khung.
- Nút bật/tắt đèn flash nếu thiết bị hỗ trợ.
- Nút nhập mã thủ công nếu cần phương án dự phòng.
- Thông báo quyền camera.

Hành động chính:

- Quét QR.
- Cho phép camera.
- Nhập mã thủ công.

Trạng thái cần thiết kế:

- Chưa cấp quyền camera.
- Đang quét.
- QR hợp lệ.
- QR không hợp lệ.
- QR thuộc thùng ngừng hoạt động.
- Không nhận diện được QR.

### 5.5. Trang Xác Nhận Thùng Rác

Mục tiêu: cho người dùng kiểm tra đang tương tác đúng thùng rác.

Nội dung cần có:

- Tên/mã thùng rác.
- Địa điểm.
- Khoảng cách GPS hoặc trạng thái vị trí.
- Trạng thái thùng: đang hoạt động, tạm ngưng, bảo trì.
- Thời gian còn lại của phiên quét QR.
- Nút tiếp tục chụp ảnh.

Hành động chính:

- Tiếp tục chụp ảnh.
- Quét lại QR.

Trạng thái cần thiết kế:

- Thùng hợp lệ và vị trí hợp lệ.
- GPS chưa được cấp quyền.
- Người dùng ở quá xa thùng.
- Phiên QR hết hạn.

### 5.6. Trang Chụp Ảnh Rác

Mục tiêu: người dùng chụp ảnh rác trực tiếp trong web app.

Nội dung cần có:

- Khung camera.
- Gợi ý đặt vật thể rác rõ trong khung.
- Thời gian còn lại của phiên.
- Nút chụp.
- Nút chụp lại sau khi đã chụp.
- Nút gửi ảnh.
- Cảnh báo không dùng ảnh cũ hoặc ảnh chụp từ màn hình.

Hành động chính:

- Chụp ảnh.
- Chụp lại.
- Gửi ảnh.

Trạng thái cần thiết kế:

- Đang mở camera.
- Đã chụp ảnh preview.
- Ảnh quá mờ/tối.
- Phiên hết hạn.
- Lỗi gửi ảnh.

### 5.7. Trang Đang Phân Tích

Mục tiêu: giữ người dùng trong luồng khi hệ thống xử lý ảnh.

Nội dung cần có:

- Trạng thái đang tải ảnh.
- Trạng thái AI đang nhận diện.
- Trạng thái kiểm tra QR, vị trí, thời gian, ảnh trùng nếu có.
- Thông điệp ngắn cho biết quá trình có thể mất vài giây.

Hành động chính:

- Không cần nhiều hành động, chỉ nên có nút hủy nếu thật sự cần.

Trạng thái cần thiết kế:

- Đang gửi ảnh.
- Đang phân tích AI.
- Đang xác minh.
- Lỗi mạng.
- Hết thời gian xử lý.

### 5.8. Trang Kết Quả Phân Tích

Mục tiêu: thông báo kết quả sau khi người dùng gửi ảnh.

Nội dung cần có:

- Ảnh đã gửi.
- Loại rác AI nhận diện.
- Mức độ tin cậy.
- Số điểm được cộng hoặc dự kiến được cộng.
- Trạng thái: đã cộng điểm, chờ duyệt, bị từ chối, cần chụp lại.
- Lý do nếu bị từ chối hoặc chờ duyệt.
- Hướng dẫn phân loại đúng nếu loại rác đặc biệt.

Hành động chính:

- Về trang chính.
- Xem lịch sử.
- Quét tiếp lượt khác nếu còn trong giới hạn.
- Chụp lại nếu ảnh không hợp lệ.

Trạng thái cần thiết kế:

- Được cộng điểm ngay.
- Chờ admin duyệt.
- Bị từ chối do ảnh không hợp lệ.
- Bị từ chối do QR/GPS không hợp lệ.
- AI không nhận diện được.

### 5.9. Trang Ví Điểm

Mục tiêu: cho người dùng hiểu điểm hiện có và lịch sử biến động.

Nội dung cần có:

- Tổng điểm khả dụng.
- Điểm đang chờ duyệt.
- Điểm đã dùng.
- Điểm sắp hết hạn nếu có.
- Biểu đồ điểm theo ngày/tuần/tháng.
- Danh sách giao dịch điểm.

Hành động chính:

- Xem chi tiết giao dịch.
- Đi đến đổi thưởng.

Trạng thái cần thiết kế:

- Chưa có điểm.
- Có điểm khả dụng.
- Có nhiều điểm chờ duyệt.
- Có điểm bị thu hồi hoặc điều chỉnh.

### 5.10. Trang Lịch Sử Hoạt Động

Mục tiêu: giúp người dùng xem lại các lượt gửi rác.

Nội dung cần có:

- Danh sách lượt gửi.
- Ảnh thumbnail.
- Loại rác.
- Thùng rác/địa điểm.
- Thời gian.
- Điểm.
- Trạng thái.
- Bộ lọc theo trạng thái, thời gian, loại rác.

Hành động chính:

- Xem chi tiết lượt gửi.
- Lọc/tìm kiếm.

Trạng thái cần thiết kế:

- Danh sách rỗng.
- Có nhiều lượt gửi.
- Có lượt chờ duyệt.
- Có lượt bị từ chối.

### 5.11. Trang Chi Tiết Lượt Gửi

Mục tiêu: giải thích rõ vì sao lượt gửi được cộng điểm, chờ duyệt hoặc bị từ chối.

Nội dung cần có:

- Ảnh đã gửi.
- Kết quả AI.
- Điểm nhận được.
- Trạng thái xác minh.
- Thùng rác, vị trí, thời gian.
- Lý do xử lý.
- Ghi chú admin nếu có.

Hành động chính:

- Quay lại lịch sử.
- Gửi phản hồi nếu người dùng không đồng ý kết quả.

Trạng thái cần thiết kế:

- Đã cộng điểm.
- Chờ duyệt.
- Bị từ chối.
- Điểm bị thu hồi sau random review.

### 5.12. Trang Đổi Thưởng

Mục tiêu: cho người dùng dùng điểm để đổi voucher, quà hoặc đóng góp môi trường.

Nội dung cần có:

- Tổng điểm khả dụng.
- Danh sách phần thưởng.
- Bộ lọc theo loại: voucher, quà, đóng góp, ưu đãi.
- Số điểm cần đổi.
- Số lượng còn lại.
- Nhãn hết hàng, sắp hết, nổi bật.

Hành động chính:

- Xem chi tiết phần thưởng.
- Đổi ngay nếu đủ điểm.

Trạng thái cần thiết kế:

- Chưa đủ điểm.
- Đủ điểm.
- Hết hàng.
- Đang bảo trì đổi thưởng.

### 5.13. Trang Chi Tiết Phần Thưởng

Mục tiêu: cung cấp đầy đủ thông tin trước khi người dùng đổi điểm.

Nội dung cần có:

- Ảnh phần thưởng hoặc logo đối tác.
- Tên phần thưởng.
- Mô tả.
- Số điểm cần đổi.
- Số lượng còn lại.
- Điều kiện sử dụng.
- Hạn sử dụng.
- Thông tin đối tác.

Hành động chính:

- Xác nhận đổi điểm.
- Quay lại danh sách.

Trạng thái cần thiết kế:

- Đủ điểm để đổi.
- Không đủ điểm.
- Hết hàng.
- Đổi thành công.
- Đổi thất bại.

### 5.14. Trang Lịch Sử Đổi Thưởng

Mục tiêu: giúp người dùng theo dõi các phần thưởng đã đổi.

Nội dung cần có:

- Danh sách phần thưởng đã đổi.
- Mã voucher nếu có.
- Trạng thái: chưa dùng, đã dùng, hết hạn, bị hủy.
- Ngày đổi.
- Điểm đã trừ.

Hành động chính:

- Xem chi tiết voucher.
- Sao chép mã voucher.

Trạng thái cần thiết kế:

- Chưa có đổi thưởng.
- Có voucher đang dùng được.
- Có voucher hết hạn.

### 5.15. Trang Bảng Xếp Hạng

Mục tiêu: tạo động lực cạnh tranh tích cực.

Nội dung cần có:

- Xếp hạng cá nhân.
- Xếp hạng nhóm/lớp/phòng ban/khu dân cư.
- Bộ lọc tuần, tháng, chiến dịch, địa điểm.
- Vị trí hiện tại của người dùng.
- Điểm hoặc số lượt phân loại.

Hành động chính:

- Đổi bộ lọc.
- Xem hồ sơ thành tích của người dùng/nhóm nếu được phép.

Trạng thái cần thiết kế:

- Chưa đủ dữ liệu xếp hạng.
- Người dùng chưa tham gia chiến dịch.
- Có bảng xếp hạng đầy đủ.

### 5.16. Trang Thành Tích Và Huy Hiệu

Mục tiêu: ghi nhận các mốc đóng góp dài hạn.

Nội dung cần có:

- Danh sách huy hiệu đã đạt.
- Danh sách huy hiệu chưa đạt.
- Tiến độ tới mốc tiếp theo.
- Các mốc như 7 ngày liên tiếp, 100 chai nhựa, top 10 tháng, 10kg giấy.

Hành động chính:

- Xem điều kiện từng huy hiệu.
- Chia sẻ thành tích nếu có tính năng social.

Trạng thái cần thiết kế:

- Chưa có huy hiệu.
- Đạt huy hiệu mới.
- Đang tiến gần tới một mốc.

### 5.17. Trang Hướng Dẫn Phân Loại

Mục tiêu: giáo dục người dùng để phân loại đúng hơn.

Nội dung cần có:

- Danh sách nhóm rác: nhựa, kim loại, giấy, carton, thủy tinh, hữu cơ, pin/rác nguy hại, khác.
- Ví dụ hình ảnh từng nhóm.
- Hướng dẫn nên làm và không nên làm.
- Lưu ý với rác nguy hại.
- Tìm kiếm nhanh theo tên vật phẩm.

Hành động chính:

- Tìm kiếm loại rác.
- Xem chi tiết nhóm rác.

Trạng thái cần thiết kế:

- Có kết quả tìm kiếm.
- Không tìm thấy kết quả.
- Nội dung khuyến cáo cho rác nguy hại.

### 5.18. Trang Hồ Sơ Cá Nhân

Mục tiêu: quản lý thông tin cá nhân và tổng quan đóng góp.

Nội dung cần có:

- Ảnh đại diện.
- Họ tên.
- Email/số điện thoại.
- Nhóm/lớp/phòng ban/khu vực.
- Tổng điểm.
- Tổng lượt phân loại.
- Thành tích nổi bật.
- Trust score hoặc cấp độ uy tín nếu muốn hiển thị cho người dùng.

Hành động chính:

- Chỉnh sửa hồ sơ.
- Xem thành tích.
- Đăng xuất.

Trạng thái cần thiết kế:

- Hồ sơ đầy đủ.
- Thiếu thông tin bắt buộc.
- Tài khoản bị hạn chế một phần.

### 5.19. Trang Cài Đặt

Mục tiêu: quản lý quyền và tùy chọn tài khoản.

Nội dung cần có:

- Quyền camera.
- Quyền vị trí.
- Thông báo.
- Ngôn ngữ nếu có.
- Đổi mật khẩu.
- Đăng xuất.
- Xóa tài khoản nếu chính sách yêu cầu.

Hành động chính:

- Cập nhật cài đặt.
- Đổi mật khẩu.
- Đăng xuất.

Trạng thái cần thiết kế:

- Chưa cấp quyền camera/vị trí.
- Đã cấp quyền.
- Cập nhật thành công.

### 5.20. Trang Thông Báo / Tin Tức

Mục tiêu: thông báo chiến dịch, kết quả duyệt, đổi thưởng và nhắc nhở.

Nội dung cần có:

- Danh sách thông báo.
- Loại thông báo: điểm, duyệt, đổi thưởng, chiến dịch, hệ thống.
- Trạng thái đã đọc/chưa đọc.
- Chi tiết thông báo.

Hành động chính:

- Đọc thông báo.
- Đánh dấu đã đọc.

Trạng thái cần thiết kế:

- Không có thông báo.
- Có thông báo mới.
- Thông báo quan trọng.

### 5.21. Trang Trợ Giúp

Mục tiêu: giảm câu hỏi lặp lại và hỗ trợ người dùng khi gặp lỗi.

Nội dung cần có:

- Câu hỏi thường gặp.
- Hướng dẫn xử lý lỗi QR, camera, GPS, ảnh không hợp lệ.
- Chính sách điểm và đổi thưởng.
- Kênh liên hệ hỗ trợ.

Hành động chính:

- Tìm kiếm câu hỏi.
- Gửi yêu cầu hỗ trợ.

Trạng thái cần thiết kế:

- Danh sách FAQ.
- Không tìm thấy câu trả lời.
- Gửi hỗ trợ thành công.

## 6. Đặc Tả Trang Admin

### 6.1. Trang Đăng Nhập Admin

Mục tiêu: cho admin truy cập hệ thống quản trị.

Nội dung cần có:

- Email/tài khoản admin.
- Mật khẩu.
- OTP hoặc xác thực hai lớp nếu có.
- Link quên mật khẩu.

Hành động chính:

- Đăng nhập.
- Xác thực OTP.

Trạng thái cần thiết kế:

- Sai thông tin.
- Cần OTP.
- Tài khoản không có quyền admin.
- Tài khoản bị khóa.

### 6.2. Dashboard Tổng Quan

Mục tiêu: cho admin nhìn nhanh sức khỏe hệ thống.

Nội dung cần có:

- Tổng người dùng.
- Tổng lượt gửi.
- Tổng điểm đã cộng.
- Tổng rác ghi nhận.
- Lượt chờ duyệt.
- Lượt bị từ chối.
- Tỷ lệ auto approve.
- Biểu đồ lượt gửi theo ngày/tuần/tháng.
- Biểu đồ loại rác.
- Top thùng rác/khu vực hoạt động nhiều.
- Cảnh báo bất thường.

Hành động chính:

- Đi tới hàng chờ duyệt.
- Xem báo cáo chi tiết.
- Lọc theo thời gian/khu vực/chiến dịch.

Trạng thái cần thiết kế:

- Chưa có dữ liệu.
- Dữ liệu bình thường.
- Có cảnh báo nhiều lượt nghi ngờ.

### 6.3. Danh Sách Lượt Gửi

Mục tiêu: quản lý toàn bộ lượt gửi của người dùng.

Nội dung cần có:

- Bảng danh sách lượt gửi.
- Ảnh thumbnail.
- Người dùng.
- Loại rác AI nhận diện.
- Confidence AI.
- Thùng rác/địa điểm.
- Thời gian.
- Điểm.
- Trạng thái.
- Risk score hoặc cảnh báo nếu có.
- Bộ lọc trạng thái, loại rác, thùng, khu vực, thời gian.
- Tìm kiếm theo user, mã submission, mã thùng.

Hành động chính:

- Xem chi tiết.
- Duyệt nhanh.
- Từ chối nhanh.
- Xuất dữ liệu nếu có.

Trạng thái cần thiết kế:

- Danh sách rỗng.
- Đang tải.
- Có nhiều lượt chờ duyệt.
- Lọc không có kết quả.

### 6.4. Hàng Chờ Kiểm Duyệt

Mục tiêu: tập trung xử lý các lượt cần quyết định thủ công.

Nội dung cần có:

- Danh sách chỉ gồm pending review.
- Lý do vào hàng chờ: AI confidence thấp, GPS yếu, ảnh nghi trùng, user rủi ro, random review.
- Thời gian chờ.
- Mức ưu tiên.

Hành động chính:

- Mở chi tiết lượt gửi.
- Duyệt.
- Từ chối.
- Gán cho admin khác nếu có phân công.

Trạng thái cần thiết kế:

- Không có lượt chờ duyệt.
- Có lượt quá hạn xử lý.
- Có lượt rủi ro cao.

### 6.5. Chi Tiết Lượt Gửi

Mục tiêu: giúp admin ra quyết định chính xác.

Nội dung cần có:

- Ảnh người dùng gửi ở kích thước lớn.
- Thông tin user: tên, điểm, trust score, lịch sử gần đây.
- Thông tin thùng: mã thùng, địa điểm, QR.
- Thời gian quét QR, thời gian chụp, thời gian gửi.
- Vị trí GPS và khoảng cách tới thùng.
- Kết quả AI: loại rác, confidence, số vật thể, cảnh báo ảnh.
- Kết quả kiểm tra trùng lặp.
- Risk score và các tiêu chí cộng/trừ điểm.
- Điểm đề xuất.
- Ghi chú xử lý.
- Lịch sử thao tác admin.

Hành động chính:

- Duyệt và cộng điểm.
- Từ chối.
- Sửa loại rác.
- Điều chỉnh điểm.
- Đánh dấu nghi gian lận.
- Yêu cầu người dùng gửi lại nếu có luồng hỗ trợ.

Trạng thái cần thiết kế:

- Lượt hợp lệ.
- Lượt thiếu dữ liệu GPS.
- AI không chắc chắn.
- Ảnh nghi trùng.
- Đã được admin khác xử lý.

### 6.6. Cảnh Báo Gian Lận

Mục tiêu: theo dõi các hành vi bất thường.

Nội dung cần có:

- Danh sách cảnh báo theo user, thùng, QR, IP/thiết bị nếu có.
- Loại cảnh báo: gửi quá nhiều, QR bị scan xa vị trí, ảnh trùng, GPS yếu, nhiều tài khoản cùng thiết bị.
- Mức độ rủi ro.
- Số lượt liên quan.
- Trạng thái xử lý.

Hành động chính:

- Xem chi tiết cảnh báo.
- Khóa/tạm hạn chế user.
- Đánh dấu đã xử lý.
- Điều chỉnh trust score.

Trạng thái cần thiết kế:

- Không có cảnh báo.
- Có cảnh báo mới.
- Cảnh báo nghiêm trọng cần xử lý ngay.

### 6.7. Quản Lý Thùng Rác

Mục tiêu: quản lý các thùng rác thông minh hoặc điểm thu gom.

Nội dung cần có:

- Danh sách thùng rác.
- Mã thùng.
- Tên thùng.
- Địa điểm.
- Loại thùng/nhóm rác hỗ trợ.
- Trạng thái: hoạt động, bảo trì, tạm ngưng.
- QR code.
- Số lượt sử dụng.
- Lần hoạt động gần nhất.

Hành động chính:

- Thêm thùng.
- Sửa thùng.
- Xem QR.
- Tải/in QR.
- Tạm ngưng thùng.

Trạng thái cần thiết kế:

- Chưa có thùng.
- Thùng hoạt động bình thường.
- Thùng bị scan bất thường.
- Thùng đang bảo trì.

### 6.8. Chi Tiết Thùng Rác

Mục tiêu: xem cấu hình và lịch sử của một thùng.

Nội dung cần có:

- Thông tin cơ bản.
- QR code.
- Vị trí bản đồ.
- Bán kính GPS hợp lệ.
- Trạng thái hoạt động.
- Lịch sử lượt gửi.
- Thống kê loại rác.
- Cảnh báo liên quan.
- Dữ liệu cảm biến nếu có.

Hành động chính:

- Cập nhật thông tin.
- Đổi trạng thái.
- Tạo lại QR nếu chính sách cho phép.
- Xem báo cáo của thùng.

Trạng thái cần thiết kế:

- Thùng mới chưa có dữ liệu.
- Thùng hoạt động tốt.
- Thùng có nhiều lượt bị từ chối.
- Thùng có dữ liệu cảm biến lỗi nếu có tích hợp.

### 6.9. Quản Lý Địa Điểm

Mục tiêu: quản lý khu vực triển khai.

Nội dung cần có:

- Danh sách địa điểm/khu vực.
- Tên địa điểm.
- Địa chỉ.
- Số thùng.
- Số người dùng.
- Bán kính GPS mặc định.
- Trạng thái chiến dịch tại địa điểm.

Hành động chính:

- Thêm địa điểm.
- Sửa địa điểm.
- Gắn thùng rác vào địa điểm.
- Xem thống kê địa điểm.

Trạng thái cần thiết kế:

- Chưa có địa điểm.
- Địa điểm đang hoạt động.
- Địa điểm tạm ngưng.

### 6.10. Quản Lý Người Dùng

Mục tiêu: theo dõi tài khoản người dùng và hành vi.

Nội dung cần có:

- Danh sách người dùng.
- Tên, email/số điện thoại.
- Nhóm/khu vực.
- Tổng điểm.
- Số lượt gửi.
- Số lượt bị từ chối.
- Trust score.
- Trạng thái tài khoản.
- Bộ lọc theo nhóm, trạng thái, rủi ro.

Hành động chính:

- Xem chi tiết.
- Khóa/tạm hạn chế.
- Điều chỉnh điểm nếu có quyền.
- Xuất danh sách.

Trạng thái cần thiết kế:

- Người dùng bình thường.
- Người dùng mới.
- Người dùng rủi ro.
- Người dùng bị khóa.

### 6.11. Chi Tiết Người Dùng

Mục tiêu: xem toàn bộ hồ sơ vận hành của một người dùng.

Nội dung cần có:

- Thông tin tài khoản.
- Tổng điểm, điểm khả dụng, điểm chờ duyệt, điểm đã dùng.
- Trust score.
- Lịch sử lượt gửi.
- Lịch sử đổi thưởng.
- Lịch sử điều chỉnh điểm.
- Cảnh báo gian lận liên quan.

Hành động chính:

- Điều chỉnh điểm.
- Khóa/tạm hạn chế tài khoản.
- Ghi chú nội bộ.
- Xem submission liên quan.

Trạng thái cần thiết kế:

- User uy tín.
- User có nhiều lượt pending.
- User có vi phạm.

### 6.12. Cấu Hình Điểm

Mục tiêu: cấu hình điểm theo loại rác và điều kiện cộng điểm.

Nội dung cần có:

- Danh sách loại rác.
- Điểm mỗi loại.
- Giới hạn vật thể/session.
- Giới hạn submission/ngày.
- Giới hạn điểm/ngày.
- Ngưỡng AI confidence để auto approve.
- Quy tắc điểm tạm giữ.
- Bonus theo chiến dịch nếu có.

Hành động chính:

- Sửa điểm.
- Thêm loại rác.
- Bật/tắt auto approve.
- Lưu cấu hình.

Trạng thái cần thiết kế:

- Cấu hình mặc định.
- Có thay đổi chưa lưu.
- Lưu thành công.
- Lỗi cấu hình không hợp lệ.

### 6.13. Quản Lý Voucher / Quà Tặng

Mục tiêu: quản lý phần thưởng người dùng có thể đổi.

Nội dung cần có:

- Danh sách phần thưởng.
- Tên.
- Loại.
- Đối tác.
- Điểm cần đổi.
- Số lượng tồn.
- Thời hạn.
- Trạng thái: nháp, đang mở, hết hàng, tạm dừng.

Hành động chính:

- Tạo phần thưởng.
- Sửa phần thưởng.
- Tạm dừng.
- Xem lịch sử đổi.

Trạng thái cần thiết kế:

- Chưa có phần thưởng.
- Phần thưởng đang hoạt động.
- Hết hàng.
- Sắp hết hạn.

### 6.14. Lịch Sử Đổi Thưởng Admin

Mục tiêu: theo dõi các giao dịch đổi thưởng.

Nội dung cần có:

- Người dùng.
- Phần thưởng.
- Điểm đã trừ.
- Mã voucher.
- Trạng thái sử dụng.
- Thời gian đổi.
- Đối tác.

Hành động chính:

- Xem chi tiết.
- Đánh dấu đã dùng.
- Hủy/hoàn điểm nếu chính sách cho phép.
- Xuất dữ liệu.

Trạng thái cần thiết kế:

- Không có giao dịch.
- Giao dịch thành công.
- Giao dịch lỗi.
- Giao dịch cần đối soát.

### 6.15. Quản Lý Chiến Dịch

Mục tiêu: cấu hình các chương trình theo thời gian, địa điểm hoặc nhóm.

Nội dung cần có:

- Danh sách chiến dịch.
- Tên chiến dịch.
- Thời gian bắt đầu/kết thúc.
- Địa điểm áp dụng.
- Nhóm người dùng áp dụng.
- Bonus điểm.
- Mục tiêu chiến dịch.
- Trạng thái.

Hành động chính:

- Tạo chiến dịch.
- Sửa chiến dịch.
- Tạm dừng/kết thúc.
- Xem báo cáo chiến dịch.

Trạng thái cần thiết kế:

- Nháp.
- Đang chạy.
- Đã kết thúc.
- Tạm dừng.

### 6.16. Báo Cáo Và Thống Kê

Mục tiêu: cung cấp số liệu cho vận hành, truyền thông và đối tác.

Nội dung cần có:

- Báo cáo số lượt gửi theo thời gian.
- Báo cáo loại rác.
- Báo cáo theo thùng/khu vực.
- Báo cáo người dùng tích cực.
- Báo cáo điểm đã cộng/đã đổi.
- Báo cáo lượt nghi ngờ/gian lận.
- Tác động môi trường ước tính.

Hành động chính:

- Lọc dữ liệu.
- Xuất CSV/PDF.
- Xem chi tiết theo biểu đồ.

Trạng thái cần thiết kế:

- Chưa có dữ liệu.
- Dữ liệu đầy đủ.
- Lọc không có kết quả.

### 6.17. Cấu Hình Hệ Thống

Mục tiêu: quản lý các rule vận hành toàn hệ thống.

Nội dung cần có:

- Thời hạn phiên QR.
- Bán kính GPS hợp lệ.
- Ngưỡng AI confidence.
- Tỷ lệ random review.
- Rate limit theo user/IP/thiết bị.
- Chính sách điểm tạm giữ.
- Cấu hình lý do từ chối.
- Cấu hình thông báo.

Hành động chính:

- Cập nhật cấu hình.
- Khôi phục mặc định.
- Lưu thay đổi.

Trạng thái cần thiết kế:

- Cấu hình hợp lệ.
- Có thay đổi chưa lưu.
- Cấu hình rủi ro cần xác nhận.

### 6.18. Nhật Ký Thao Tác

Mục tiêu: đảm bảo minh bạch trong vận hành.

Nội dung cần có:

- Admin thực hiện.
- Hành động.
- Đối tượng bị thay đổi.
- Giá trị trước/sau nếu có.
- Thời gian.
- IP/thiết bị nếu có.
- Bộ lọc theo admin, hành động, thời gian.

Hành động chính:

- Lọc.
- Xem chi tiết.
- Xuất log nếu có quyền.

Trạng thái cần thiết kế:

- Không có log.
- Có log thay đổi điểm.
- Có log duyệt/từ chối submission.

## 7. Luồng Chính Cần Thể Hiện Trong Prototype

### 7.1. Luồng Người Dùng Hợp Lệ

1. Đăng nhập.
2. Vào trang chính.
3. Bấm quét QR.
4. Quét QR thùng hợp lệ.
5. Xác nhận thùng rác và vị trí.
6. Chụp ảnh rác.
7. Gửi ảnh.
8. Hệ thống phân tích.
9. Nhận kết quả được cộng điểm.
10. Xem điểm trong ví và lịch sử.

### 7.2. Luồng Người Dùng Chờ Duyệt

1. Quét QR hợp lệ.
2. Chụp ảnh.
3. AI nhận diện được nhưng confidence thấp hoặc có tín hiệu rủi ro.
4. Người dùng thấy trạng thái chờ duyệt.
5. Admin duyệt.
6. Người dùng nhận thông báo điểm được cộng.

### 7.3. Luồng Người Dùng Bị Từ Chối

1. Quét QR.
2. Gửi ảnh.
3. Hệ thống phát hiện QR hết hạn, GPS quá xa, ảnh mờ hoặc không có rác rõ ràng.
4. Người dùng thấy lý do bị từ chối.
5. Người dùng có thể quét lại hoặc chụp lại nếu còn phù hợp.

### 7.4. Luồng Admin Kiểm Duyệt

1. Admin đăng nhập.
2. Vào dashboard.
3. Mở hàng chờ kiểm duyệt.
4. Xem chi tiết lượt gửi.
5. Kiểm tra ảnh, AI, QR, GPS, risk score.
6. Duyệt hoặc từ chối.
7. Hệ thống cập nhật điểm và ghi audit log.

## 8. Các Component Nên Thiết Kế Riêng

### 8.1. Component Người Dùng

- Thẻ tổng điểm.
- Nút quét QR chính.
- Camera scanner.
- Camera capture.
- Thẻ kết quả AI.
- Badge trạng thái submission.
- Dòng giao dịch điểm.
- Card phần thưởng.
- Card huy hiệu.
- Bảng xếp hạng mini.
- Empty state.
- Error state cho QR/camera/GPS.

### 8.2. Component Admin

- KPI card.
- Bộ lọc bảng.
- Bảng submission.
- Badge trạng thái.
- Risk score indicator.
- AI confidence indicator.
- Submission review panel.
- User trust score card.
- QR code preview.
- Map/location preview.
- Audit log row.
- Confirmation modal duyệt/từ chối.

## 9. Dữ Liệu Mẫu Cho Thiết Kế

### 9.1. Loại Rác Và Điểm

| Loại rác | Điểm đề xuất | Ghi chú |
|---|---:|---|
| Chai nhựa | 5 | Có thể auto approve nếu AI đủ tin cậy |
| Lon kim loại | 8 | Giá trị điểm cao hơn |
| Giấy | 3 | Có thể gộp với carton trong MVP |
| Bìa carton | 3 | Có thể tách riêng sau |
| Chai thủy tinh | 6 | Cần cảnh báo an toàn nếu cần |
| Rác hữu cơ | 2 | Tùy mô hình thùng |
| Pin/rác nguy hại | 0 | Không tự cộng điểm, hiển thị hướng dẫn riêng |
| Không xác định | 0 | Chờ duyệt hoặc từ chối |

### 9.2. Submission Mẫu

| Mã | Người dùng | Loại rác | Confidence | Trạng thái | Điểm |
|---|---|---|---:|---|---:|
| SUB-001 | Nguyễn Minh Anh | Chai nhựa | 92% | Rewarded | 5 |
| SUB-002 | Trần Quốc Huy | Lon kim loại | 81% | Approved | 8 |
| SUB-003 | Lê Hoàng Nam | Không xác định | 42% | Pending Review | 0 |
| SUB-004 | Phạm Thu Hà | Giấy | 68% | Pending Review | 0 |
| SUB-005 | Võ Minh Khang | Chai nhựa | 88% | Rejected | 0 |

### 9.3. Thùng Rác Mẫu

| Mã thùng | Tên | Địa điểm | Trạng thái |
|---|---|---|---|
| BIN-001 | Thùng A1 | Sảnh tòa nhà A | Hoạt động |
| BIN-002 | Thùng B1 | Khu căn tin | Hoạt động |
| BIN-003 | Thùng C1 | Cổng chính | Bảo trì |
| BIN-004 | Thùng D1 | Khu sinh hoạt chung | Tạm ngưng |

## 10. Phạm Vi Thiết Kế MVP Nên Ưu Tiên

Nếu cần thiết kế nhanh bản demo 10-14 ngày, ưu tiên các trang sau:

### 10.1. Người Dùng

- Đăng nhập.
- Trang chính.
- Quét QR.
- Xác nhận thùng rác.
- Chụp ảnh.
- Đang phân tích.
- Kết quả phân tích.
- Ví điểm.
- Lịch sử hoạt động.

### 10.2. Admin

- Đăng nhập admin.
- Dashboard tổng quan.
- Danh sách lượt gửi.
- Chi tiết lượt gửi.
- Hàng chờ kiểm duyệt.
- Quản lý thùng rác.
- Cấu hình điểm cơ bản.

### 10.3. Có Thể Để Sau MVP

- Đổi thưởng thật đầy đủ.
- Bảng xếp hạng nâng cao.
- Huy hiệu/thành tích.
- Cổng đối tác.
- Báo cáo BI chuyên sâu.
- Phân quyền admin phức tạp.
- Quản lý nhiều chiến dịch đồng thời.

## 11. Checklist Bàn Giao Thiết Kế

- Có sitemap tổng quan.
- Có user flow chính.
- Có admin flow chính.
- Có wireframe cho từng trang MVP.
- Có trạng thái lỗi cho QR, camera, GPS, AI và gửi ảnh.
- Có trạng thái empty/loading/error/success cho các trang chính.
- Có component library cơ bản.
- Có quy chuẩn badge trạng thái.
- Có dữ liệu mẫu để trình bày prototype.
- Có ghi chú rõ trang nào thuộc MVP và trang nào thuộc giai đoạn sau.

## 12. Ghi Chú Thiết Kế Quan Trọng

- Người dùng thường thao tác tại thùng rác, nên giao diện cần nhanh, ít chữ, dễ bấm.
- Các màn hình camera và QR cần được thiết kế kỹ vì đây là phần quan trọng nhất của trải nghiệm.
- Không nên chỉ hiển thị "thất bại"; mọi lỗi cần có hướng dẫn hành động tiếp theo.
- Admin cần nhìn thấy bằng chứng và lý do chấm rủi ro để quyết định minh bạch.
- Các màn hình điểm thưởng cần phân biệt rõ điểm khả dụng, điểm chờ duyệt và điểm đã dùng.
- Tính năng chống gian lận nên được thể hiện bằng trạng thái, lý do và lịch sử xử lý, không chỉ là một con số risk score.
