import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { rewardColumns, rewardPayloadSchema, toRewardValues, type AuditInsertTable, type RewardInsert, type RewardRow } from "./reward-schema";

type RewardSelectTable = {
  select(columns: string): {
    order(column: "created_at", options: { ascending: boolean }): Promise<{ data: RewardRow[] | null; error: { message: string } | null }>;
  };
};

type RewardInsertTable = {
  insert(values: RewardInsert): {
    select(columns: string): {
      single(): Promise<{ data: RewardRow | null; error: { message: string } | null }>;
    };
  };
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const supabase = createAdminClient();
  const rewards = supabase.from("reward_items") as unknown as RewardSelectTable;
  const { data, error } = await rewards.select(rewardColumns).order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load rewards" }, { status: 500 });
  }

  return NextResponse.json({ rewards: data ?? [] });
}

export async function POST(request: NextRequest | Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const payload = await request.json().catch(() => null);
  const parsed = rewardPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reward payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const values = toRewardValues(parsed.data);
  const supabase = createAdminClient();
  const rewards = supabase.from("reward_items") as unknown as RewardInsertTable;
  const { data, error } = await rewards.insert(values).select(rewardColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Unable to create reward" }, { status: 500 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.reward.create",
    target_id: data.id,
    metadata: { title: values.title, pointsRequired: values.points_required, stock: values.stock },
  });

  return NextResponse.json({ reward: data }, { status: 201 });
}
