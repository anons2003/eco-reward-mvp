# MVP Dự Án SeaTech Eco Reward

## 1. Tổng Quan

SeaTech Eco Reward là web app tích điểm khi người dùng phân loại rác tại các thùng rác hoặc điểm thu gom có QR code. Người dùng đăng nhập, quét QR, chụp ảnh rác, gửi lượt phân loại và nhận điểm sau khi hệ thống hoặc admin xác minh. Admin dùng dashboard để quản lý người dùng, lượt gửi, thùng rác, địa điểm, điểm thưởng, phần thưởng và nhật ký vận hành.

MVP hiện tại được xây dựng bằng Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Postgres/Storage/RLS, S3-compatible storage cho avatar, AI provider mock mặc định và adapter Roboflow tùy chọn. Source code chia theo lớp `core`, `application`, `infrastructure`, `app` và `components`.

Mục tiêu MVP là có một bản demo/pilot nhỏ chạy được, chứng minh luồng nghiệp vụ cốt lõi:

1. User đăng ký hoặc đăng nhập.
2. User quét hoặc nhập QR của thùng rác.
3. Hệ thống tạo phiên QR ngắn hạn.
4. User chụp ảnh rác trong web app.
5. Hệ thống tạo submission và chuyển vào hàng chờ duyệt.
6. Admin xem submission, duyệt hoặc từ chối.
7. Khi được duyệt, hệ thống cộng điểm và ghi lịch sử điểm.
8. User xem điểm, lịch sử, tác động môi trường và đổi phần thưởng demo.

## 2. Đối Tượng Sử Dụng

### 2.1. User

Người tham gia chương trình phân loại rác. User cần thao tác nhanh trên mobile tại thùng rác: đăng nhập, quét QR, chụp ảnh, gửi lượt phân loại, xem kết quả, xem ví điểm, lịch sử, phần thưởng và thông tin cá nhân.

### 2.2. Admin

Người vận hành hệ thống. Admin cần dashboard desktop để xem tình hình, xử lý lượt gửi, quản lý dữ liệu nền và theo dõi nhật ký thao tác.

### 2.3. System Operator

Người cấu hình Supabase, biến môi trường, OAuth, storage, seed data, CI/CD và môi trường deploy.

## 3. Phạm Vi MVP

### 3.1. Bao Gồm

- Landing page giới thiệu ngắn và điều hướng vào app.
- Đăng ký, đăng nhập, đăng xuất bằng Supabase Auth.
- Google OAuth qua Supabase.
- Quên mật khẩu, reset mật khẩu, đổi mật khẩu và gửi lại email xác minh.
- Route protection theo session và role `user`/`admin`.
- User dashboard hiển thị điểm, hoạt động gần đây và lối vào các tác vụ chính.
- Hồ sơ người dùng, cập nhật thông tin cá nhân và upload avatar.
- Quét/nhập QR để tạo scan session ngắn hạn.
- Chụp ảnh rác trực tiếp bằng browser camera flow.
- Upload hoặc truyền image URL cho submission flow.
- Tạo submission gắn với user, bin và scan session.
- Submission mặc định vào `pending_review` trong API Supabase thật.
- Adapter AI riêng gồm mock provider và Roboflow provider cho demo/khả năng mở rộng.
- Domain logic tính điểm theo loại rác.
- Domain logic chấm rủi ro để quyết định `approved`, `pending_review`, `rejected`.
- Ví điểm và lịch sử point transactions.
- Lịch sử hoạt động của user.
- Trang phần thưởng, chi tiết phần thưởng và đổi thưởng demo qua RPC `redeem_reward`.
- Trang impact hiển thị tác động môi trường và bản đồ điểm thu gom gần người dùng.
- Admin dashboard tổng quan.
- Admin xem danh sách và chi tiết submissions.
- Admin duyệt hoặc từ chối submission, cộng điểm khi duyệt và ghi audit log.
- Admin quản lý bins: tạo, sửa, deactivate và sinh QR.
- Admin quản lý locations và nhóm địa điểm.
- Admin quản lý users và trạng thái tài khoản.
- Admin quản lý point rules theo loại rác.
- Admin quản lý rewards và lịch sử đổi thưởng.
- Admin xem reports, fraud alerts, audit logs và settings ở mức dashboard MVP.
- Supabase schema, migration, seed demo, RLS policies và storage bucket `waste-submissions`.
- Test bằng Vitest cho domain logic, auth, API routes, proxy, repository demo và helper logic.

### 3.2. Không Bao Gồm Trong MVP

- Native mobile app iOS/Android.
- IoT/cảm biến thùng rác thật nếu chưa có API ổn định.
- Voucher/payment thật hoặc tích hợp đối tác đổi thưởng production.
- BI/report nâng cao, export báo cáo đầy đủ.
- Bảng xếp hạng production, huy hiệu/thành tích phức tạp.
- Chống gian lận nâng cao bằng phân tích hành vi dài hạn, device fingerprint hoặc computer vision chống ảnh chụp màn hình.
- Tự huấn luyện model AI từ đầu.
- SLA production quy mô lớn hoặc multi-tenant nhiều tổ chức.

## 4. Kiến Trúc Hiện Tại

### 4.1. Stack

- Frontend/backend: Next.js App Router, React 19, TypeScript.
- Styling: Tailwind CSS, shadcn-style components, Radix UI, lucide-react, GSAP cho animation.
- Backend platform: Supabase Auth, Postgres, RLS, Storage.
- Storage bổ sung: S3-compatible API cho avatar.
- AI: mock provider mặc định, Roboflow provider optional.
- Validation: Zod cho payload admin APIs.
- Test: Vitest.
- Deploy target: Vercel, có `vercel.json` và script smoke production.

### 4.2. Cấu Trúc Source

- `src/core`: entity types, rule tính điểm, risk score.
- `src/application`: AI use case, repository contract, service boundary.
- `src/infrastructure`: Supabase clients, auth/session, admin session, AI providers, storage, env config, demo repository.
- `src/app`: pages, layouts, API route handlers và route protection entry.
- `src/components`: UI theo nhóm user, admin, shared và base UI.
- `db/migrations`: schema, RLS, indexes, profile fields, user/admin CRUD, rewards, locations, bins và demo data.
- `docs`: proposal, SRS, kế hoạch triển khai, thiết kế, chống gian lận và kế hoạch Superpowers.

### 4.3. Lớp Dữ Liệu

MVP hiện có hai lớp dữ liệu:

- Supabase thật: Auth, profiles, scan sessions, submissions, point transactions, rewards, redemptions, bins, locations, point rules, audit logs và admin CRUD APIs.
- Demo repository in-memory: phục vụ một số use-case/demo flow như AI decision tự động, dữ liệu mẫu dashboard và submission demo.

Điểm cần lưu ý: API Supabase thật `/api/submissions` hiện tạo submission `pending_review` với `ai_result: { mode: "manual_review" }`, chưa tự động gọi AI và chưa tự động cộng điểm. Logic AI tự động và risk decision đã có trong `src/core`/`src/application`/demo repository để làm nền mở rộng.

## 5. Tính Năng User

### 5.1. Auth Và Tài Khoản

User có thể đăng ký bằng email/password, đăng nhập, đăng xuất, quên mật khẩu, reset mật khẩu, đổi mật khẩu và xác minh email. Google OAuth được xử lý qua Supabase callback. Sau đăng nhập, route protection điều hướng user về `/dashboard`; admin được điều hướng về `/admin/dashboard`.

User có thể cập nhật hồ sơ gồm tên, số điện thoại, vị trí, giới thiệu ngắn và avatar. Avatar được kiểm tra MIME type, giới hạn 2MB và upload lên S3-compatible storage trước khi cập nhật profile.

### 5.2. Dashboard

Dashboard user hiển thị điểm hiện tại, trust score, hoạt động gần đây, phần thưởng nổi bật và CTA cho luồng phân loại rác. UI được thiết kế mobile-first để dùng nhanh tại thùng rác.

### 5.3. Scan QR

User vào `/scan`, nhập hoặc quét QR. API `/api/scan-sessions` chuẩn hóa QR bằng trim, thay khoảng trắng bằng dấu gạch ngang và uppercase. QR hợp lệ phải tồn tại trong bảng `bins` và bin phải active. Khi hợp lệ, hệ thống tạo scan session với TTL mặc định 120 giây và có thể lưu `lat`/`lng` nếu browser gửi lên.

QR demo trong seed:

- `ECO-BIN-A1`: active.
- `ECO-BIN-B2`: active.
- `ECO-BIN-C3`: inactive/bảo trì.

### 5.4. Capture Và Submission

User vào `/capture`, chụp ảnh rác bằng browser camera flow, sau đó gửi image URL cùng `scan_session_id`. API `/api/submissions` kiểm tra user đã đăng nhập, session thuộc đúng user, session còn hạn và có image URL. Submission được lưu với trạng thái `pending_review`, lý do “Chờ admin duyệt thủ công.”

### 5.5. Kết Quả, Lịch Sử Và Ví Điểm

User xem kết quả submission tại `/result/[id]`, lịch sử tại `/history` và ví điểm tại `/wallet`. Điểm chỉ tăng khi submission được duyệt và có point transaction tương ứng.

### 5.6. Rewards

User xem danh sách rewards tại `/rewards`, xem chi tiết tại `/rewards/[id]` và đổi thưởng bằng `/api/rewards/[id]/redeem`. Flow đổi thưởng dựa trên RPC Supabase `redeem_reward`, có kiểm tra thiếu điểm, hết stock và reward không tồn tại.

### 5.7. Impact

User xem trang impact để theo dõi đóng góp môi trường và điểm thu gom gần mình. Dự án có helper tính khoảng cách địa lý và components bản đồ MapLibre.

## 6. Tính Năng Admin

### 6.1. Admin Auth Và Route Protection

Admin dùng `/admin/login` hoặc login thường. Middleware/proxy kiểm tra Supabase session bằng `auth.getUser()` và role trong `profiles`. API admin dùng `requireAdmin()`, yêu cầu profile có `role = admin` và `status = active`.

### 6.2. Dashboard Vận Hành

Admin dashboard hiển thị tổng quan submissions, trạng thái duyệt, điểm đã cấp, hoạt động gần đây và các lối vào quản trị.

### 6.3. Submission Review

Admin xem danh sách submissions, lọc trạng thái và mở chi tiết. API `/api/admin/review` nhận `submissionId`, `decision` và `reason`. Khi duyệt:

- Cập nhật status, reason, `reviewed_at`, `reviewed_by`.
- Tính điểm từ `points` hiện có hoặc tra `point_rules` theo `ai_result.wasteType`.
- Cộng điểm vào profile nếu submission trước đó chưa approved.
- Ghi point transaction.
- Ghi audit log.

Khi từ chối, hệ thống cập nhật status `rejected`, điểm bằng 0 và ghi audit log.

### 6.4. Quản Lý Bins

Admin có thể xem, tạo, sửa và deactivate bins. Khi tạo bin, hệ thống có thể tạo hoặc cập nhật location theo địa chỉ, sinh QR dạng `SEATECH-BIN-XXXXXXXX` và ghi audit log. Delete trong MVP là soft delete bằng cách set `active = false`.

### 6.5. Quản Lý Locations

Admin quản lý địa điểm và nhóm địa điểm. Các migration mới hỗ trợ location fields, unique address groups, dữ liệu demo Đà Nẵng và hygiene cho policy/view.

### 6.6. Quản Lý Users

Admin có API danh sách user, chi tiết user, cập nhật user và trạng thái tài khoản. Đây là phần phục vụ vận hành tài khoản, khóa/mở hoặc chỉnh thông tin theo scope admin.

### 6.7. Quản Lý Point Rules

Admin xem, tạo, sửa và deactivate point rules theo waste type. Các loại rác hợp lệ:

- `plastic_bottle`: 10 điểm.
- `metal_can`: 12 điểm.
- `paper`: 6 điểm.
- `cardboard`: 8 điểm.
- `glass_bottle`: 9 điểm.
- `organic`: 5 điểm.
- `hazardous`: 0 điểm.
- `unknown`: 0 điểm.

### 6.8. Quản Lý Rewards

Admin tạo, sửa và deactivate rewards. Reward gồm title, description, số điểm cần đổi, stock và trạng thái active. Mọi thao tác chính ghi audit log.

### 6.9. Audit, Fraud Và Reports

Admin có các trang audit logs, fraud alerts và reports. Ở MVP, các trang này phục vụ quan sát và trình bày vận hành; phần phân tích BI/gian lận nâng cao nằm ngoài scope MVP.

## 7. AI Và Chấm Rủi Ro

### 7.1. AI Provider

`/api/ai/analyze` nhận `imageUrl` và gọi `analyzeImage()`. Nếu `AI_PROVIDER=roboflow`, hệ thống dùng Roboflow adapter; mặc định dùng mock provider để demo ổn định.

AI result gồm:

- `wasteType`.
- `confidence`.
- `objectCount`.
- `imageQuality`.
- `notes` tùy chọn.

### 7.2. Rule Quyết Định Submission

`calculateSubmissionDecision()` sử dụng AI result và validation signals:

- QR hợp lệ.
- Session còn hạn.
- Bin active.
- GPS trong bán kính, thiếu GPS hoặc ngoài bán kính.
- Vượt giới hạn gửi trong ngày.
- Ảnh trùng.
- Confidence AI.
- Chất lượng ảnh.
- Số lượng vật thể.

Hard reject xảy ra khi QR invalid, session hết hạn, bin inactive, daily limit reached, duplicate image hoặc GPS ngoài bán kính. Pending review xảy ra khi thiếu GPS, confidence thấp, ảnh chưa tốt, quá nhiều vật thể, waste type unknown hoặc hazardous. Approved xảy ra khi tất cả tín hiệu đạt yêu cầu và điểm được tính theo waste type.

Trong API Supabase thật hiện tại, rule này chưa được nối trực tiếp vào `/api/submissions`; submission vẫn đi qua kiểm duyệt admin trước khi cộng điểm.

## 8. Dữ Liệu Chính

Các bảng chính trong Supabase:

- `profiles`: user/admin profile, role, points, trust score, avatar và thông tin cá nhân.
- `bins`: thùng rác, QR, vị trí, trạng thái active.
- `locations`: địa điểm, địa chỉ, tọa độ và metadata mở rộng.
- `scan_sessions`: phiên QR ngắn hạn gắn user/bin.
- `submissions`: ảnh, AI result, trạng thái, điểm, lý do, risk flags và review metadata.
- `point_transactions`: lịch sử cộng/trừ điểm.
- `reward_items`: danh sách phần thưởng.
- `reward_redemptions`: lịch sử đổi thưởng.
- `point_rules`: cấu hình điểm theo loại rác.
- `audit_logs`: nhật ký thao tác admin.

RLS yêu cầu user chỉ xem dữ liệu của mình, admin xem/ghi dữ liệu vận hành và service role chỉ dùng server-side.

## 9. API Chính

### 9.1. Auth/User

- `POST /api/auth/register`.
- `POST /api/auth/login`.
- `POST /api/auth/logout`.
- `GET /api/auth/google`.
- `POST /api/auth/forgot-password`.
- `POST /api/auth/reset-password`.
- `POST /api/auth/change-password`.
- `POST /api/auth/resend-verification`.
- `POST /api/auth/verify-recovery-otp`.
- `POST /api/profile`.
- `POST /api/profile/avatar`.

### 9.2. User Flow

- `POST /api/scan-sessions`.
- `POST /api/submissions`.
- `POST /api/ai/analyze`.
- `POST /api/rewards/[id]/redeem`.

### 9.3. Admin

- `GET/POST /api/admin/bins`.
- `PATCH/DELETE /api/admin/bins/[id]`.
- `GET/POST /api/admin/locations`.
- `PATCH/DELETE /api/admin/locations/[id]`.
- `GET/POST /api/admin/users`.
- `PATCH /api/admin/users/[id]`.
- `GET/POST /api/admin/rewards`.
- `PATCH/DELETE /api/admin/rewards/[id]`.
- `GET/POST /api/admin/point-rules`.
- `PATCH/DELETE /api/admin/point-rules/[wasteType]`.
- `POST /api/admin/review`.
- `GET /api/admin/goong/autocomplete`.
- `GET /api/admin/goong/place-detail`.

## 10. Biến Môi Trường

Các biến quan trọng:

```bash
APP_NAME=SeaTech
APP_URL=http://localhost:3000
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

Các biến S3/avatar và Goong map API cần được cấu hình theo `.env.example` nếu sử dụng các phần tương ứng.

## 11. Luồng Demo Đề Xuất

### 11.1. User Demo

1. Đăng nhập bằng tài khoản user seeded.
2. Mở dashboard để xem điểm và CTA.
3. Vào scan, nhập `ECO-BIN-A1`.
4. Tạo scan session thành công.
5. Vào capture, chụp hoặc gửi ảnh demo.
6. Submission được tạo ở trạng thái `pending_review`.
7. User xem result/history/wallet.
8. Sau khi admin approve, user quay lại wallet để thấy điểm được cộng.
9. User vào rewards và thử đổi phần thưởng nếu đủ điểm.

### 11.2. Admin Demo

1. Đăng nhập bằng tài khoản admin seeded.
2. Mở admin dashboard.
3. Vào submissions, mở submission mới.
4. Duyệt hoặc từ chối với reason.
5. Kiểm tra audit log và point transaction.
6. Tạo hoặc sửa bin, reward và point rule.
7. Xem users, reports, fraud alerts và locations để trình bày năng lực vận hành.

## 12. Tiêu Chí Hoàn Thành MVP

MVP được xem là đạt khi:

- App chạy local bằng `npm run dev`.
- Supabase migration và seed dựng được dữ liệu demo.
- User đăng ký, đăng nhập, đăng xuất và reset password hoạt động.
- Route user/admin được bảo vệ đúng role.
- User tạo scan session từ QR active.
- User tạo được submission từ scan session còn hạn.
- Admin duyệt hoặc từ chối submission.
- Submission approved cộng điểm đúng và ghi point transaction.
- Reward redemption xử lý đủ điểm, thiếu điểm và hết stock.
- Admin CRUD bins, rewards và point rules hoạt động.
- Audit log được ghi cho thao tác admin quan trọng.
- `npm test`, `npm run lint` và `npm run build` pass trước khi demo/deploy.

## 13. Rủi Ro Và Giới Hạn Hiện Tại

- API submission thật chưa tự động gọi AI/risk decision; cần admin review để cộng điểm.
- Một số màn hình vẫn có thể dựa trên demo repository hoặc dữ liệu trình bày.
- QR hiện là QR tĩnh, cần GPS/rate limit/review để giảm gian lận.
- Chưa có cảm biến thùng rác để xác nhận người dùng thật sự bỏ rác.
- Reward vẫn là mô hình demo, chưa có voucher/payment/partner fulfillment thật.
- Roboflow phụ thuộc cấu hình API ngoài; mock provider nên là default cho demo.
- RLS và service role cần kiểm tra kỹ trước pilot có người dùng thật.

## 14. Roadmap Sau MVP

### 14.1. Pilot Thực Tế

- Nối AI/risk decision vào `/api/submissions`.
- Upload ảnh submission thật vào Supabase Storage hoặc object storage chuẩn.
- Thêm GPS radius check thật theo bin/location.
- Thêm rate limit theo user/IP.
- Thêm phát hiện ảnh trùng bằng hash/perceptual hash.
- Bổ sung random review cho submission rủi ro trung bình.
- Hoàn thiện báo cáo theo bin, khu vực và thời gian.

### 14.2. Mở Rộng

- Tích hợp cảm biến thùng rác.
- Bảng xếp hạng theo cá nhân/nhóm/khu vực.
- Huy hiệu, streak và chiến dịch.
- Voucher thật với đối tác.
- Fraud analytics nâng cao.
- AI cải thiện bằng dữ liệu ảnh thực tế.
- Multi-location/multi-campaign operations.

## 15. Kết Luận

SeaTech Eco Reward MVP đã có nền tảng đủ tốt để demo một web app tích điểm phân loại rác: auth, user app, admin app, scan QR, submission, review, điểm, rewards, dữ liệu Supabase, RLS và test coverage. Phần cần ưu tiên tiếp theo trước pilot thực tế là nối trực tiếp AI/risk decision vào submission API, chuẩn hóa upload ảnh rác production và bổ sung các lớp chống gian lận thực dụng như GPS check, rate limit và duplicate image detection.
