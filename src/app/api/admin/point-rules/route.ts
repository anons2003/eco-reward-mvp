import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { pointRuleColumns, pointRulePayloadSchema, toPointRuleInsert, type AuditInsertTable, type PointRuleInsert, type PointRuleRow } from "./point-rule-schema";

type PointRuleSelectTable = {
  select(columns: string): {
    order(column: "waste_type", options: { ascending: boolean }): Promise<{ data: PointRuleRow[] | null; error: { message: string } | null }>;
  };
};

type PointRuleInsertTable = {
  insert(values: PointRuleInsert): {
    select(columns: string): {
      single(): Promise<{ data: PointRuleRow | null; error: { message: string } | null }>;
    };
  };
};

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const supabase = createAdminClient();
  const rules = supabase.from("point_rules") as unknown as PointRuleSelectTable;
  const { data, error } = await rules.select(pointRuleColumns).order("waste_type", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Unable to load point rules" }, { status: 500 });
  }

  return NextResponse.json({ rules: data ?? [] });
}

export async function POST(request: NextRequest | Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const payload = await request.json().catch(() => null);
  const parsed = pointRulePayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid point rule payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const values = toPointRuleInsert(parsed.data);
  const supabase = createAdminClient();
  const rules = supabase.from("point_rules") as unknown as PointRuleInsertTable;
  const { data, error } = await rules.insert(values).select(pointRuleColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Unable to create point rule" }, { status: 500 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.point_rule.create",
    target_id: null,
    metadata: { wasteType: values.waste_type, points: values.points, active: values.active },
  });

  return NextResponse.json({ rule: data }, { status: 201 });
}
