# Web App Tích Điểm Khi Phân Loại Rác

Kho tài liệu proposal và kế hoạch triển khai cho dự án web app tích điểm khi người dùng phân loại rác bằng thùng rác thông minh, QR code, ảnh chụp và AI nhận diện.

## Tài Liệu

- [Proposal: Web App Tích Điểm Khi Phân Loại Rác](proposal-web-app-tich-diem-phan-loai-rac.md)
- [Kế Hoạch Triển Khai Theo Giai Đoạn 10-14 Ngày](ke-hoach-trien-khai-theo-giai-doan.md)
- [Cơ Chế Chống Gian Lận Cho Web App Phân Loại Rác](co-che-chong-gian-lan-web-app-phan-loai-rac.md)

## Environment

Repo public không nên commit file `.env` thật. Khi triển khai code, tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

Sau đó cập nhật các giá trị thật cho database, Roboflow, storage, QR secret và thông tin admin.

## Phạm Vi

Tài liệu tập trung vào góc nhìn sản phẩm, BA và proposal gửi khách hàng. Nội dung hiện tại chưa bao gồm source code triển khai.
