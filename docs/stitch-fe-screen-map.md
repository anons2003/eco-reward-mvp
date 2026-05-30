# Stitch FE Screen Map

Project Stitch: `13786008349239194193`

Design system: `assets/f1b96b5ef642437b838c4137a4ace2bf`

## User App Routes

| Next.js route | Stitch screen title | Stitch screen id | Status in source |
|---|---|---|---|
| `/login` | Đăng nhập - Hệ thống Tích điểm Xanh | `7de4c82bf76b41feb0c45b21f853473c` | Implemented, needs visual polish from Stitch |
| `/dashboard` | Bảng điều khiển - Hệ thống Tích điểm Xanh | `97872601556949e781a2045eff56915e` | Implemented with Supabase data |
| `/scan` | Quét mã QR - Eco-Reward System | `521ed038827d4dc083b8f2b20ce9f628` | Implemented with demo scan form |
| `/capture` | Chụp ảnh rác - Eco-Reward System | `b1faff75fa25463e9e3eef99eb28d01e` | Implemented with browser camera flow |
| `/result/[id]` | Kết quả Phân tích - Eco-Reward System | `c56140fea9f44a5b8894b6ec8f75650b` | Implemented with demo repository data |
| `/wallet` | Ví điểm (Updated) - Hệ thống Tích điểm Xanh | `faa62b93e52645e685caf6c540f1da13` | Implemented, needs Supabase transaction data |
| `/rewards` | Đổi thưởng - Hệ thống Tích điểm Xanh | `65969ced91df4886adf2a6bf7ffbe034` | Implemented, needs redemption flow |

## Optional User Routes From Stitch

| Feature | Stitch screen title | Stitch screen id | MVP status |
|---|---|---|---|
| Bin confirmation | Xác nhận Thùng rác - Eco-Reward System | `38948e35d83d46d7beff77a3fae37a5a` | Useful for `/scan` -> `/capture` transition |
| Analyzing state | Đang phân tích - Eco-Reward System | `0399778292b54a8eacd0f58ba767ea5e` | Useful between upload and result |
| Submission detail | Chi tiết lượt gửi (Fixed) - Hệ thống Tích điểm Xanh | `b262698fbb5f46e992af04e939cf518d` | Useful for user history detail |
| Activity history | Lịch sử hoạt động - Hệ thống Tích điểm Xanh | `8d39bac237ff442db19d694338d93e36` | Post-MVP |
| Reward detail | Chi tiết phần thưởng - Hệ thống Tích điểm Xanh | `db3a6b338f3e4c4c80eba64776888596` | Post-MVP |
| Ranking | Bảng xếp hạng - Hệ thống Tích điểm Xanh | `b04295ceeb79492aa3ce68b391d4fc61` | Post-MVP |
| Achievements | Thành tích & Huy hiệu - Hệ thống Tích điểm Xanh | `5bddf560e26448758dcc73ce6d376c90` | Post-MVP |

## Admin Routes

| Next.js route | Stitch screen title | Stitch screen id | Status in source |
|---|---|---|---|
| `/admin/dashboard` | Dashboard Tổng quan - Admin Eco-Reward | `080f9dd8b53d442d9794d406326b117e` | Implemented with demo repository data |
| `/admin/submissions` | Danh sách lượt gửi - Admin Eco-Reward | `c782c4aeb44f4c8cb21b15d04c3775c8` | Implemented with demo repository data |
| `/admin/submissions/[id]` | Chi tiết lượt gửi - Admin Eco-Reward | `57b865125114461cb7b8418f1a78d4aa` | Implemented with demo repository data |
| `/admin/bins` | Quản lý Thùng rác - Admin Eco-Reward | `5d746b230c9d4cceb00f7bb2675e1728` | Implemented basic UI |
| `/admin/points` | Cấu hình điểm - Admin Eco-Reward | `d5ee7653fc2448f38e433ce729376913` | Implemented basic UI |

## Optional Admin Routes From Stitch

| Feature | Stitch screen title | Stitch screen id | MVP status |
|---|---|---|---|
| Moderation queue | Hàng chờ kiểm duyệt - Admin Eco-Reward | `fd79e785a2be4f61a99293438782ba9c` | Should merge into `/admin/submissions?status=pending_review` |
| Fraud alerts | Cảnh báo gian lận - Admin Eco-Reward | `dc550f3a5a614c75a510fdbc4d1af4d5` | Post-MVP or admin detail panel |
| Audit logs | Nhật ký thao tác - Admin Eco-Reward (V1) | `df06a7e74b354f8184b14780ca408096` | Post-MVP |
| User management | Quản lý người dùng - Admin Eco-Reward | `e3b6761f3e34495b964ca3197e4d25f7` | Post-MVP |
| Reward management | Quản lý quà tặng - Admin Eco-Reward | `1cba6685c02a44b2a51ca02c27b35fa6` | Post-MVP |
| Reports | Báo cáo & Thống kê - Admin Eco-Reward (V1) | `f1dafc748b07433d869ce9ed627f7de5` | Post-MVP |
| System settings | Cấu hình hệ thống - Admin Eco-Reward (V1) | `86cb8d5a5072444d8b3060fd647ce3e4` | Post-MVP |

## Implementation Priority

1. Sync `/login`, `/dashboard`, `/scan`, `/capture`, `/result/[id]` with Stitch visual structure.
2. Add bin confirmation and analyzing states into user flow.
3. Sync `/admin/dashboard`, `/admin/submissions`, `/admin/submissions/[id]`.
4. Connect admin pages to Supabase data after visual sync.
5. Defer leaderboard, achievements, reports, user management and campaign screens until after MVP core flow is stable.

## Notes

- Stitch generation for a new bundled mobile screen pack timed out. No retry was performed to avoid duplicate generation.
- Existing Stitch project already contains the required MVP FE screens, so these screens should be treated as the source of visual reference.
- Current source already has matching Next.js routes for the MVP screens, but some routes still use demo/in-memory data.
