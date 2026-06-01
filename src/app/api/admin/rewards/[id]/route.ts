import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { rewardColumns, rewardPayloadSchema, toRewardValues, type AuditInsertTable, type RewardMutationTable, type RewardUpdate } from "../reward-schema";

type RouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

type RewardDeleteTable = {
  update(values: Pick<RewardUpdate, "active">): {
    eq(column: "id", value: string): {
      select(columns: "id"): {
        single(): Promise<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };
};

async function getRewardId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

export async function PATCH(request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const payload = await request.json().catch(() => null);
  const parsed = rewardPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reward payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const id = await getRewardId(context);
  const values = toRewardValues(parsed.data);
  const supabase = createAdminClient();
  const rewards = supabase.from("reward_items") as unknown as RewardMutationTable<RewardUpdate>;
  const { data, error } = await rewards.update(values).eq("id", id).select(rewardColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.reward.update",
    target_id: id,
    metadata: { title: values.title, active: values.active, stock: values.stock },
  });

  return NextResponse.json({ reward: data });
}

export async function DELETE(_request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const id = await getRewardId(context);
  const supabase = createAdminClient();
  const rewards = supabase.from("reward_items") as unknown as RewardDeleteTable;
  const { data, error } = await rewards.update({ active: false }).eq("id", id).select("id").single();

  if (error || !data) {
    return NextResponse.json({ error: "Reward not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.reward.delete",
    target_id: id,
    metadata: { mode: "deactivate" },
  });

  return NextResponse.json({ ok: true });
}
