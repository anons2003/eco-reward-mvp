# Web App Tích Điểm Khi Phân Loại Rác

Kho tài liệu proposal và MVP web app tích điểm khi người dùng phân loại rác bằng thùng rác thông minh, QR code, ảnh chụp và AI nhận diện.

## MVP Hiện Tại

Stack triển khai:

- Next.js App Router, TypeScript, Tailwind CSS.
- Supabase SSR client, migration SQL, seed demo, Storage bucket và RLS policy để nối backend thật.
- Supabase Auth thật cho login/logout, route protection và dashboard user.
- Demo repository trong bộ nhớ vẫn phục vụ các flow chưa nối database thật.
- AI adapter `mock` mặc định, có adapter Roboflow qua env.

Kiến trúc source:

- `src/core`: entity types, point rules, risk scoring thuần domain.
- `src/application`: use-case boundary và repository contract.
- `src/infrastructure`: demo repository, Supabase clients, AI providers, env config.
- `src/app`: Next.js routes, route handlers và page composition.
- `src/components`: UI components theo user/admin/shared.

Luồng demo:

- User đăng nhập bằng tài khoản Supabase seeded, xem dashboard lấy profile/submission/reward từ Supabase.
- Admin đăng nhập bằng tài khoản Supabase seeded, được bảo vệ route bằng role trong `profiles`.
- QR demo hợp lệ: `ECO-BIN-A1`, `ECO-BIN-B2`; QR bảo trì: `ECO-BIN-C3`.

## Chạy Local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở `http://localhost:3000/login`, sau đó đăng nhập bằng tài khoản seed.

Các lệnh kiểm thử:

```bash
npm test
npm run lint
npm run build
```

## GitHub CI/CD

Workflow GitHub Actions nằm ở `.github/workflows/ci-cd.yml`.

- Pull request vào `main`: chạy `npm ci`, `npm run lint`, `npm test`, `npm run build`.
- Push vào `main`: chạy cùng bộ kiểm tra, sau đó deploy Vercel nếu đã cấu hình đủ secrets.

Secrets cần cấu hình trong GitHub repo:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_TOKEN` nếu dùng deploy Vercel qua GitHub Actions.
- `VERCEL_ORG_ID` nếu dùng deploy Vercel qua GitHub Actions.
- `VERCEL_PROJECT_ID` nếu dùng deploy Vercel qua GitHub Actions.

## Supabase Setup

1. Tạo project Supabase.
2. Chạy SQL trong `db/migrations/0001_eco_reward_mvp.sql`.
3. Chạy seed demo trong `db/seed.sql` nếu cần tài khoản và dữ liệu mẫu.
4. Cập nhật `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-or-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
AI_PROVIDER="mock"
```

MVP đã dùng Supabase Auth cho login/logout và route protection. Một số flow nghiệp vụ như scan/submission/admin list vẫn dùng demo repository trong bộ nhớ để phục vụ trình bày nhanh, và sẽ được nối database thật theo từng use case tiếp theo.

Seed demo tạo hai tài khoản local:

- `anons2003+eco-user@gmail.com` / `EcoReward123!`
- `anons2003+eco-admin@gmail.com` / `EcoReward123!`

## Tài Liệu

- [Proposal: Web App Tích Điểm Khi Phân Loại Rác](docs/proposal-web-app-tich-diem-phan-loai-rac.md)
- [Kế Hoạch Triển Khai Theo Giai Đoạn 10-14 Ngày](docs/ke-hoach-trien-khai-theo-giai-doan.md)
- [Cơ Chế Chống Gian Lận Cho Web App Phân Loại Rác](docs/co-che-chong-gian-lan-web-app-phan-loai-rac.md)
- [Đặc Tả Thiết Kế UI/UX](docs/Design.md)

## Environment

Repo public không nên commit file `.env` thật. Khi triển khai code, tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

Sau đó cập nhật các giá trị thật cho database, Roboflow, storage, QR secret và thông tin admin.

## Phạm Vi

MVP hiện bao gồm source chạy được cho demo web, schema Supabase nền tảng và tài liệu sản phẩm. Các phần ngoài scope MVP: native mobile app, IoT thật, voucher/payment thật và BI nâng cao.
