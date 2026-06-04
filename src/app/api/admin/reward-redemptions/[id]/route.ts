import { NextResponse } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

const allowedStatuses = new Set(["issued", "used", "cancelled"]);

type RedemptionStatusUpdate = {
  status: string;
  fulfilled_at: string | null;
};

type RewardRedemptionUpdateTable = {
  update(values: RedemptionStatusUpdate): {
    eq(column: "id", value: string): {
      select(columns: "id,status,redemption_code,fulfilled_at"): {
        maybeSingle(): Promise<{
          data: { id: string; status: string; redemption_code: string; fulfilled_at: string | null } | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

async function redemptionId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = typeof body?.status === "string" ? body.status.trim() : "";
  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Trạng thái nhận quà không hợp lệ." }, { status: 400 });
  }

  const id = await redemptionId(context);
  const supabase = createAdminClient();
  const redemptions = supabase.from("reward_redemptions") as unknown as RewardRedemptionUpdateTable;
  const { data, error } = await redemptions
    .update({
      status,
      fulfilled_at: status === "used" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("id,status,redemption_code,fulfilled_at")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Không thể cập nhật trạng thái nhận quà." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Không tìm thấy giao dịch đổi thưởng." }, { status: 404 });

  return NextResponse.json({ redemption: data });
}
