import { NextResponse, type NextRequest } from "next/server";
import { isMvpReviewWasteType } from "@/core/points/point-rules";
import { requireAdmin } from "@/infrastructure/auth/admin-session";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import { pointRuleColumns, pointRuleUpdateSchema, toPointRuleUpdate, type AuditInsertTable, type PointRuleRow, type PointRuleUpdate } from "../point-rule-schema";

type RouteContext = {
  params: Promise<{ wasteType: string }>;
};

type PointRuleUpdateTable = {
  update(values: PointRuleUpdate): {
    eq(column: "waste_type", value: string): {
      select(columns: string): {
        single(): Promise<{ data: PointRuleRow | null; error: { message: string } | null }>;
      };
    };
  };
};

async function getWasteType(context: RouteContext) {
  const { wasteType } = await context.params;
  return wasteType;
}

export async function PATCH(request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const wasteType = await getWasteType(context);
  if (!isMvpReviewWasteType(wasteType)) {
    return NextResponse.json({ error: "Invalid waste type" }, { status: 400 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = pointRuleUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid point rule payload", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const values = toPointRuleUpdate(parsed.data);
  const supabase = createAdminClient();
  const rules = supabase.from("point_rules") as unknown as PointRuleUpdateTable;
  const { data, error } = await rules.update(values).eq("waste_type", wasteType).select(pointRuleColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: "Point rule not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.point_rule.update",
    target_id: null,
    metadata: { wasteType, points: values.points, active: values.active },
  });

  return NextResponse.json({ rule: data });
}

export async function DELETE(_request: NextRequest | Request, context: RouteContext) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const wasteType = await getWasteType(context);
  if (!isMvpReviewWasteType(wasteType)) {
    return NextResponse.json({ error: "Invalid waste type" }, { status: 400 });
  }

  const values = { active: false, updated_at: new Date().toISOString() };
  const supabase = createAdminClient();
  const rules = supabase.from("point_rules") as unknown as PointRuleUpdateTable;
  const { data, error } = await rules.update(values).eq("waste_type", wasteType).select(pointRuleColumns).single();

  if (error || !data) {
    return NextResponse.json({ error: "Point rule not found" }, { status: 404 });
  }

  const auditLogs = supabase.from("audit_logs") as unknown as AuditInsertTable;
  await auditLogs.insert({
    actor_id: admin.actorId,
    action: "admin.point_rule.delete",
    target_id: null,
    metadata: { wasteType },
  });

  return NextResponse.json({ rule: data });
}
