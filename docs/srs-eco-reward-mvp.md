# Software Requirements Specification: Eco-Reward MVP

## 1. Mục Đích

Tài liệu SRS này mô tả yêu cầu phần mềm cho MVP Eco-Reward: web app tích điểm khi người dùng phân loại rác bằng QR, ảnh chụp và AI nhận diện. Tài liệu dùng làm chuẩn thống nhất giữa sản phẩm, thiết kế, kỹ thuật và vận hành trong giai đoạn demo/pilot 10-14 ngày.

MVP ưu tiên chạy được nhanh, có luồng người dùng và admin rõ ràng. Một số tích hợp như AI thật, IoT/cảm biến và voucher thật có thể dùng mock hoặc adapter thay thế.

## 2. Phạm Vi Sản Phẩm

### 2.1. Trong Phạm Vi MVP

- Người dùng đăng nhập bằng Supabase Auth, gồm email/password và Google OAuth.
- Người dùng xem dashboard, điểm hiện có, lịch sử gần đây và phần thưởng nổi bật.
- Người dùng quét hoặc nhập QR code demo của thùng rác.
- Hệ thống tạo phiên quét QR ngắn hạn.
- Người dùng chụp ảnh rác bằng browser camera API.
- Hệ thống phân tích ảnh bằng AI provider mock hoặc adapter Roboflow.
- Hệ thống quyết định trạng thái lượt gửi: approved, pending_review hoặc rejected.
- Hệ thống cộng điểm khi lượt gửi được duyệt.
- Admin đăng nhập, xem dashboard, danh sách lượt gửi, chi tiết lượt gửi.
- Admin duyệt hoặc từ chối lượt gửi và ghi audit log.
- Admin xem danh sách thùng rác và cấu hình điểm cơ bản.
- Supabase dùng cho Auth, Postgres, Storage, RLS và seed data demo.

### 2.2. Ngoài Phạm Vi MVP

- Native mobile app iOS/Android.
- IoT/cảm biến thật nếu chưa có API ổn định.
- Voucher thật, payment hoặc tích hợp đối tác đổi thưởng.
- Báo cáo BI nâng cao.
- Phân quyền admin nhiều cấp.
- Tự huấn luyện model AI từ đầu.
- Chống gian lận nâng cao bằng phân tích hành vi dài hạn.
- SLA production quy mô lớn.

## 3. Bối Cảnh Hệ Thống

Eco-Reward là web app chạy trên Next.js App Router. Backend chính dùng Supabase. UI chia thành hai khu vực:

- User app: mobile-first cho người dùng tại thùng rác.
- Admin app: dashboard desktop cho người vận hành.

Kiến trúc source theo clean architecture ở mức MVP:

- `src/core`: entity types, point calculation, risk scoring.
- `src/application`: use case boundary và repository contract.
- `src/infrastructure`: Supabase clients, AI providers, demo repository, env config.
- `src/app`: Next.js routes, route handlers và page composition.
- `src/components`: UI components cho user, admin và shared.

## 4. Đối Tượng Sử Dụng

### 4.1. User

Người tham gia chương trình phân loại rác. User cần đăng nhập, quét QR, chụp ảnh, gửi lượt phân loại, xem kết quả và theo dõi điểm.

### 4.2. Admin

Người vận hành hệ thống. Admin cần theo dõi hoạt động, kiểm duyệt lượt gửi nghi ngờ, quản lý thùng rác mẫu và cấu hình điểm.

### 4.3. System Operator

Người cấu hình Supabase, OAuth, biến môi trường, seed data, deployment và CI/CD.

## 5. Định Nghĩa Và Quy Ước

| Thuật ngữ | Ý nghĩa |
|---|---|
| Bin | Thùng rác hoặc điểm thu gom có QR code riêng |
| QR code | Mã định danh để bắt đầu phiên gửi rác tại một bin |
| Scan session | Phiên xác minh ngắn hạn sau khi quét QR |
| Submission | Một lượt gửi ảnh rác của user |
| AI result | Kết quả nhận diện loại rác, confidence, chất lượng ảnh |
| Point transaction | Giao dịch cộng/trừ điểm |
| Reward item | Phần thưởng demo có thể đổi bằng điểm |
| Audit log | Nhật ký thao tác admin |
| RLS | Row Level Security của Supabase/Postgres |

## 6. Yêu Cầu Chức Năng

### FR-001: Đăng Nhập Email/Password

Hệ thống phải cho phép user và admin đăng nhập bằng email/password qua Supabase Auth.

Acceptance criteria:

- Khi thông tin hợp lệ, hệ thống tạo Supabase session cookie.
- Khi role là `user`, truy cập mặc định tới `/dashboard`.
- Khi role là `admin`, truy cập mặc định tới `/admin/dashboard`.
- Khi thông tin sai, hệ thống quay về `/login?error=invalid_credentials`.

### FR-002: Đăng Nhập Google OAuth

Hệ thống phải cho phép đăng nhập bằng Google OAuth qua Supabase Auth provider.

Acceptance criteria:

- `/api/auth/google` redirect tới Supabase OAuth authorize URL.
- Supabase redirect tới Google OAuth.
- Callback `/auth/callback` đổi OAuth code thành Supabase session bằng `exchangeCodeForSession`.
- Sau callback, hệ thống điều hướng theo role trong bảng `profiles`.
- User mới từ Google được tạo profile mặc định role `user`.

### FR-003: Bảo Vệ Route Theo Role

Hệ thống phải bảo vệ các route user/admin bằng Supabase session và role từ bảng `profiles`.

Acceptance criteria:

- Route user gồm `/dashboard`, `/scan`, `/capture`, `/result/*`, `/wallet`, `/rewards`.
- Route admin gồm `/admin/*`.
- Người chưa đăng nhập bị redirect về `/login`.
- User thường không được vào `/admin/*`.
- Admin vào `/login` khi đã đăng nhập sẽ được redirect tới `/admin/dashboard`.

### FR-004: User Dashboard

Hệ thống phải hiển thị dashboard user với điểm hiện tại, trust score, lịch sử gần đây và reward nổi bật.

Acceptance criteria:

- Dashboard lấy profile từ Supabase `profiles`.
- Dashboard hiển thị `points` và `trust_score`.
- Dashboard hiển thị tối đa 4 submissions gần nhất.
- Dashboard hiển thị tối đa 2 reward items đang active.

### FR-005: Quét Hoặc Nhập QR

Hệ thống phải cho phép user bắt đầu luồng gửi rác bằng QR code.

Acceptance criteria:

- QR hợp lệ phải khớp một bin trong hệ thống.
- Bin inactive không được auto approve.
- QR invalid phải tạo quyết định rejected hoặc báo lỗi phù hợp.
- QR demo hợp lệ gồm `ECO-BIN-A1`, `ECO-BIN-B2`.
- QR demo inactive gồm `ECO-BIN-C3`.

### FR-006: Tạo Scan Session

Hệ thống phải tạo scan session sau khi QR hợp lệ.

Acceptance criteria:

- Scan session gắn với user, bin, QR code và thời gian hết hạn.
- TTL mặc định là `QR_SESSION_TTL_SECONDS=120`.
- Session hết hạn không được dùng để auto approve submission.
- Nếu browser cung cấp GPS, hệ thống lưu lat/lng vào session.

### FR-007: Chụp Ảnh Rác

Hệ thống phải cho phép user chụp ảnh trực tiếp bằng browser camera API.

Acceptance criteria:

- Camera flow chạy trên browser có quyền camera.
- MVP ưu tiên capture trực tiếp, không ưu tiên upload ảnh từ thư viện.
- Ảnh gửi lên hệ thống phải là image MIME hợp lệ.
- Ảnh được lưu vào Supabase Storage bucket `waste-submissions` hoặc demo storage tương ứng.

### FR-008: Phân Tích Ảnh Bằng AI

Hệ thống phải phân tích ảnh bằng AI provider.

Acceptance criteria:

- `AI_PROVIDER=mock` trả kết quả ổn định để demo.
- `AI_PROVIDER=roboflow` dùng Roboflow API khi có `ROBOFLOW_API_KEY`.
- AI result gồm `wasteType`, `confidence`, `objectCount`, `imageQuality`, `notes`.
- Nếu AI provider lỗi, submission phải chuyển sang pending_review hoặc trả lỗi có kiểm soát.

### FR-009: Tính Điểm

Hệ thống phải tính điểm theo loại rác.

Acceptance criteria:

- `plastic_bottle`: 10 điểm.
- `metal_can`: 12 điểm.
- `paper`: 6 điểm.
- `cardboard`: 8 điểm.
- `glass_bottle`: 9 điểm.
- `organic`: 5 điểm.
- `hazardous`: 0 điểm.
- `unknown`: 0 điểm.
- Chỉ cộng điểm vào profile khi submission approved.

### FR-010: Quyết Định Submission

Hệ thống phải quyết định trạng thái submission dựa trên AI result và validation signals.

Acceptance criteria:

- `approved` nếu QR hợp lệ, session còn hạn, bin active, chưa vượt giới hạn ngày và confidence >= `MIN_AI_CONFIDENCE`.
- `pending_review` nếu confidence thấp hơn ngưỡng hoặc GPS thiếu/không chắc chắn nhưng không có lỗi nghiêm trọng.
- `rejected` nếu QR invalid, session hết hạn, bin inactive, ảnh trùng rõ hoặc vượt giới hạn ngày.
- Decision phải lưu `reason` và `riskFlags`.

### FR-011: Lịch Sử Điểm

Hệ thống phải lưu lịch sử cộng/trừ điểm.

Acceptance criteria:

- Mỗi submission approved tạo một `point_transactions` record.
- Wallet hiển thị điểm và lịch sử giao dịch cơ bản.
- User chỉ xem được transaction của chính mình.
- Admin có thể xem transaction phục vụ vận hành.

### FR-012: Admin Dashboard

Hệ thống phải hiển thị dashboard tổng quan cho admin.

Acceptance criteria:

- Admin xem được tổng submissions.
- Admin xem được số pending, approved, rejected.
- Admin xem được tổng điểm đã cấp.
- Admin xem được submissions mới nhất.

### FR-013: Admin Submission List

Hệ thống phải cho admin xem danh sách submissions và lọc theo trạng thái.

Acceptance criteria:

- Danh sách hiển thị loại rác, điểm và status.
- Filter `pending_review` hoạt động.
- Click một row mở trang detail.

### FR-014: Admin Submission Detail

Hệ thống phải cho admin xem chi tiết submission.

Acceptance criteria:

- Detail hiển thị ảnh hoặc image URL.
- Detail hiển thị AI result, confidence, bin, reason và risk flags.
- Detail hiển thị action approve/reject khi submission cần xử lý.

### FR-015: Admin Review

Hệ thống phải cho admin approve/reject submission.

Acceptance criteria:

- Approve cập nhật status `approved`.
- Reject cập nhật status `rejected`.
- Reject bắt buộc có reason.
- Approve tạo point transaction nếu chưa có.
- Mỗi action ghi audit log.

### FR-016: Quản Lý Bins Cơ Bản

Hệ thống phải hiển thị danh sách bins mẫu cho admin.

Acceptance criteria:

- Admin xem được tên bin, QR code, vị trí và trạng thái active.
- MVP có thể chỉ đọc hoặc cập nhật đơn giản tùy thời gian demo.

### FR-017: Cấu Hình Điểm Cơ Bản

Hệ thống phải hiển thị point rules cho admin.

Acceptance criteria:

- Admin xem được điểm theo từng waste type.
- MVP có thể cho update đơn giản hoặc chỉ đọc nếu cần giữ scope 10-14 ngày.

### FR-018: Rewards Demo

Hệ thống phải hiển thị danh sách reward demo cho user.

Acceptance criteria:

- Reward item gồm title, description, points_required, stock.
- User xem được reward active.
- Redemption có thể ở mức basic hoặc mock trong MVP.

## 7. Yêu Cầu Dữ Liệu

### 7.1. Bảng Chính

Hệ thống cần các bảng Supabase/Postgres:

- `profiles`: hồ sơ user/admin, role, points, trust_score.
- `bins`: thùng rác, QR, vị trí, trạng thái.
- `scan_sessions`: phiên QR ngắn hạn.
- `submissions`: ảnh, AI result, trạng thái, risk flags.
- `point_transactions`: lịch sử điểm.
- `reward_items`: danh sách phần thưởng.
- `reward_redemptions`: lịch sử đổi thưởng.
- `point_rules`: cấu hình điểm theo loại rác.
- `audit_logs`: nhật ký thao tác admin.

### 7.2. RLS

RLS phải đảm bảo:

- User chỉ đọc profile, submissions, scan sessions, point transactions và reward redemptions của mình.
- User không thể cập nhật role hoặc điểm trực tiếp.
- Admin có thể đọc dữ liệu vận hành.
- Admin có thể update submissions, bins, point rules theo scope vận hành.
- Audit logs chỉ admin đọc và ghi.

### 7.3. Storage

Bucket `waste-submissions` phải:

- Không public.
- Chỉ cho authenticated user upload ảnh của chính mình.
- Cho owner hoặc admin đọc ảnh.
- Giới hạn file size mặc định 5MB.
- Chỉ nhận `image/jpeg`, `image/png`, `image/webp`.

## 8. Yêu Cầu Giao Diện

### 8.1. User UI

- Mobile-first.
- Tối ưu thao tác tại thùng rác.
- CTA chính rõ ràng: quét QR, chụp ảnh, gửi submission.
- Hiển thị kết quả ngắn gọn, dễ hiểu.
- Không dùng layout marketing thay cho app flow.

### 8.2. Admin UI

- Desktop dashboard.
- Ưu tiên đọc nhanh, lọc nhanh, xử lý nhanh.
- Dữ liệu submission cần đủ ngữ cảnh để quyết định approve/reject.

## 9. Yêu Cầu Phi Chức Năng

### 9.1. Hiệu Năng

- Trang login và dashboard phải render trong thời gian phù hợp cho demo local.
- Build production phải pass `npm run build`.
- API route phải trả lỗi có kiểm soát thay vì crash.

### 9.2. Bảo Mật

- Không commit `.env` thật.
- Không expose `SUPABASE_SERVICE_ROLE_KEY` ra client.
- Route protected phải dùng `supabase.auth.getUser()` thay vì tin cookie tự tạo.
- Role admin/user lấy từ bảng `profiles`, không lấy từ client input.
- Google OAuth phải dùng callback hợp lệ và allowlist redirect URLs trong Supabase.
- RLS phải bật trên các bảng public.

### 9.3. Khả Dụng Demo

- App chạy local bằng `npm run dev`.
- Demo account email/password hoạt động.
- Google login hoạt động khi Google Auth app đã publish hoặc email nằm trong test users.
- Mock AI phải ổn định để demo không phụ thuộc API ngoài.

### 9.4. Maintainability

- Domain logic nằm trong `src/core`.
- Use case/service nằm trong `src/application`.
- Adapter Supabase/AI nằm trong `src/infrastructure`.
- UI route/page nằm trong `src/app` và `src/components`.
- Tests tập trung vào logic điểm, risk, AI mock và repository demo.

## 10. Tích Hợp Ngoài

### 10.1. Supabase

- Auth: email/password, Google OAuth.
- Database: Postgres + RLS.
- Storage: ảnh submissions.
- Seed data: demo users, bins, rewards, point rules.

### 10.2. Google OAuth

- OAuth client type: Web application.
- Local origin: `http://localhost:3000`.
- Google redirect URI: Supabase callback `https://<project-ref>.supabase.co/auth/v1/callback`.
- Supabase redirect URLs gồm `http://localhost:3000/auth/callback` và domain production khi có.

### 10.3. AI Provider

- Mock provider là default.
- Roboflow provider là optional adapter.
- Hệ thống không phụ thuộc Roboflow để hoàn thành demo MVP.

### 10.4. CI/CD

- GitHub Actions chạy lint, test, build trên PR/push vào `main`.
- Deploy Vercel chỉ chạy khi có đủ Vercel secrets.
- Supabase secrets được cấu hình trong GitHub repo settings.

## 11. Biến Môi Trường

Các biến chính:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=mock
ROBOFLOW_API_KEY=
ROBOFLOW_MODEL_ID=
ROBOFLOW_API_URL=
QR_SESSION_TTL_SECONDS=120
MAX_SUBMISSIONS_PER_USER_PER_DAY=10
MIN_AI_CONFIDENCE=0.75
GPS_RADIUS_METERS=50
SUBMISSION_IMAGE_BUCKET=waste-submissions
```

## 12. Quy Tắc Nghiệp Vụ

### BR-001: Role

- User mới mặc định role `user`.
- Admin role chỉ được gán bằng seed hoặc thao tác quản trị database.

### BR-002: Session TTL

- Scan session mặc định hết hạn sau 120 giây.
- Submission dùng session hết hạn không được approved tự động.

### BR-003: Daily Limit

- User không được vượt quá `MAX_SUBMISSIONS_PER_USER_PER_DAY`.
- Vượt giới hạn ngày phải rejected hoặc pending theo policy vận hành.

### BR-004: AI Confidence

- Confidence >= `MIN_AI_CONFIDENCE` đủ điều kiện auto approve nếu các tín hiệu khác hợp lệ.
- Confidence thấp hơn ngưỡng chuyển pending_review.

### BR-005: GPS

- GPS trong bán kính `GPS_RADIUS_METERS` là tín hiệu tích cực.
- GPS thiếu hoặc không chắc chắn không nhất thiết rejected, nhưng phải tạo risk flag.

### BR-006: Điểm

- Chỉ submission approved mới tạo điểm.
- Submission rejected không cộng điểm.
- Submission pending_review chưa cộng điểm cho đến khi admin approve.

## 13. Trạng Thái Và Luồng Chính

### 13.1. User Submission Flow

1. User đăng nhập.
2. User vào `/scan`.
3. User nhập/quét QR.
4. Hệ thống tạo scan session.
5. User vào `/capture`.
6. User chụp ảnh.
7. Hệ thống upload ảnh.
8. AI phân tích ảnh.
9. Hệ thống tính decision.
10. User xem `/result/[id]`.
11. Nếu approved, wallet cập nhật điểm.

### 13.2. Admin Review Flow

1. Admin đăng nhập.
2. Admin vào `/admin/dashboard`.
3. Admin mở `/admin/submissions`.
4. Admin xem detail.
5. Admin approve hoặc reject.
6. Hệ thống cập nhật submission.
7. Hệ thống ghi audit log.
8. Nếu approve, hệ thống tạo point transaction.

## 14. Test Requirements

### 14.1. Unit Tests

- `calculatePoints()` trả đúng điểm theo waste type.
- `calculateSubmissionDecision()` xử lý approved, pending_review, rejected.
- `risk-score` tạo risk flags đúng với validation signals.
- `mock-provider` trả AI result ổn định.

### 14.2. Integration Tests

- Tạo scan session từ QR hợp lệ.
- Tạo submission từ scan session còn hạn.
- Approved submission tạo point transaction.
- Admin reject không cộng điểm và ghi audit log.

### 14.3. Manual Acceptance

- User login email/password thành công.
- User login Google thành công sau khi OAuth provider được cấu hình.
- User xem dashboard có profile thật từ Supabase.
- User đi được luồng scan -> capture -> result.
- Admin login và vào dashboard.
- Admin xem danh sách submissions.
- Admin approve/reject được submission.
- `npm run lint`, `npm test`, `npm run build` pass.

## 15. Ràng Buộc Và Giả Định

- Stack đã chốt: Next.js App Router + Supabase.
- MVP chạy trong 10-14 ngày, ưu tiên demo hơn production hardening.
- AI mặc định dùng mock để đảm bảo demo ổn định.
- Một số admin/user flows có thể còn dùng demo repository trong bộ nhớ cho đến khi nối Supabase đầy đủ.
- Google OAuth public cần Google Auth app ở Production hoặc email được thêm vào Test users.
- Supabase leaked password protection có thể bỏ qua trên Free plan.

## 16. Rủi Ro

| Rủi ro | Tác động | Giảm thiểu |
|---|---|---|
| Google OAuth chưa publish production | User ngoài test list không login được | Dùng Test users cho demo hoặc publish app |
| AI API ngoài không ổn định | Demo fail tại bước phân tích | Dùng mock provider làm default |
| Admin data còn demo/in-memory | Dữ liệu admin/user không đồng bộ | Ưu tiên nối Supabase cho submissions và review |
| Seed auth trực tiếp vào Supabase | Dễ lệch user id hoặc conflict email | Dùng Auth Admin API/script seed riêng cho auth |
| RLS policy chưa tối ưu | Performance warning khi data lớn | Tối ưu policy và index FK trước pilot lớn |

## 17. Tiêu Chí Hoàn Thành MVP

MVP được xem là hoàn thành khi:

- App chạy local tại `http://localhost:3000`.
- Supabase Auth email/password hoạt động.
- Google OAuth hoạt động với cấu hình hợp lệ.
- User dashboard đọc được dữ liệu Supabase.
- User đi được luồng submission demo.
- Admin vào được dashboard và xử lý submission demo.
- Migration/seed có thể dựng dữ liệu demo.
- CI GitHub Actions pass lint, test, build.
- README và tài liệu SRS mô tả được cách vận hành/demo.

## 18. Traceability Matrix

| Requirement | Source/Implementation Target |
|---|---|
| FR-001, FR-002 | `src/app/api/auth/*`, `src/app/auth/callback/route.ts` |
| FR-003 | `src/infrastructure/supabase/proxy.ts`, `src/proxy.ts` |
| FR-004 | `src/app/(user)/dashboard/page.tsx` |
| FR-005, FR-006 | `src/app/(user)/scan/page.tsx`, `src/app/api/scan-sessions/route.ts` |
| FR-007 | `src/app/(user)/capture/page.tsx`, `src/components/user/capture-flow.tsx` |
| FR-008 | `src/application/ai/analyze-image.ts`, `src/infrastructure/ai/*` |
| FR-009, FR-010 | `src/core/points/*`, `src/core/fraud/*` |
| FR-011 | `db/migrations/0001_eco_reward_mvp.sql`, `src/app/(user)/wallet/page.tsx` |
| FR-012 to FR-017 | `src/app/admin/*`, `src/components/admin/*` |
| Data/RLS | `db/migrations/0001_eco_reward_mvp.sql` |
| CI/CD | `.github/workflows/ci-cd.yml` |
