import dynamic from "next/dynamic";
import type { Database } from "@/infrastructure/supabase/database.types";

type BinRow = Database["public"]["Tables"]["bins"]["Row"];
type LocationRow = Database["public"]["Tables"]["locations"]["Row"];
type PointRuleRow = Database["public"]["Tables"]["point_rules"]["Row"];
type RewardRow = Database["public"]["Tables"]["reward_items"]["Row"];
type WasteType = PointRuleRow["waste_type"];
type NearbyBin = Pick<BinRow, "id" | "name" | "qr_code" | "location_name" | "lat" | "lng" | "active">;

type UserManagementUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  bio: string | null;
  role: "user" | "admin";
  status: "active" | "blocked" | "deleted";
  trust_score: number;
};

export const DynamicAdminDashboardMotion = dynamic(() =>
  import("@/components/admin/admin-dashboard-motion").then((mod) => mod.AdminDashboardMotion),
);

export const DynamicBinManagementActions = dynamic<{ bin?: BinRow; variant?: "compact" | "toolbar"; locations?: Pick<LocationRow, "id" | "name" | "address" | "district" | "ward" | "lat" | "lng">[] }>(() =>
  import("@/components/admin/bin-management-actions").then((mod) => mod.BinManagementActions),
);
export { DynamicAdminMapLibreMap } from "@/components/shared/admin-maplibre-map-dynamic";

export const DynamicPointRuleManagementActions = dynamic<{ rule?: PointRuleRow; wasteType: WasteType }>(() =>
  import("@/components/admin/point-rule-management-actions").then((mod) => mod.PointRuleManagementActions),
);

export const DynamicReviewActions = dynamic<{ submissionId: string }>(() => import("@/components/admin/review-actions").then((mod) => mod.ReviewActions));

export const DynamicFraudAlertActions = dynamic<{
  submissionId: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    location: string | null;
    bio: string | null;
    role: "user" | "admin";
    status: "active" | "blocked" | "deleted";
    trust_score: number;
  } | null;
}>(() => import("@/components/admin/fraud-alert-actions").then((mod) => mod.FraudAlertActions));

export const DynamicRewardManagementActions = dynamic<{ reward?: RewardRow }>(() =>
  import("@/components/admin/reward-management-actions").then((mod) => mod.RewardManagementActions),
);

export const DynamicUserManagementActions = dynamic<{ user?: UserManagementUser }>(() =>
  import("@/components/admin/user-management-actions").then((mod) => mod.UserManagementActions),
);

export const DynamicAvatarUploadForm = dynamic<{ displayName: string; avatarUrl?: string | null }>(() =>
  import("@/components/user/avatar-upload-form").then((mod) => mod.AvatarUploadForm),
);

export const DynamicCaptureFlow = dynamic<{ scanSessionId: string }>(() => import("@/components/user/capture-flow").then((mod) => mod.CaptureFlow));

export const DynamicRewardRedeemButton = dynamic<{ rewardId: string; canRedeem: boolean; className?: string }>(() =>
  import("@/components/user/reward-redeem-button").then((mod) => mod.RewardRedeemButton),
);

export const DynamicScanForm = dynamic(() => import("@/components/user/scan-form").then((mod) => mod.ScanForm));

export const DynamicNearbyBinsMap = dynamic<{ bins: NearbyBin[] }>(() =>
  import("@/components/user/nearby-bins-map").then((mod) => mod.NearbyBinsMap),
);
