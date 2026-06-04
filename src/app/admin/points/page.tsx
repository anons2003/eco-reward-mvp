import { Bot, CircleHelp, Leaf, RotateCcw, Scale, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion, DynamicPointRuleManagementActions } from "@/components/shared/dynamic-client-components";
import { MVP_REVIEW_WASTE_TYPES, WASTE_TYPE_DESCRIPTIONS, WASTE_TYPE_LABELS, WASTE_TYPE_TONES } from "@/core/points/point-rules";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type PointRuleRow = Database["public"]["Tables"]["point_rules"]["Row"];
type WasteType = PointRuleRow["waste_type"];

const pointRuleColumns = "waste_type,points,active,updated_at";

const iconByWasteType: Partial<Record<WasteType, LucideIcon>> = {
  plastic: Trash2,
  metal: Sparkles,
  paper: Leaf,
  glass: RotateCcw,
  unknown: CircleHelp,
};

export default async function AdminPointsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("point_rules").select(pointRuleColumns).order("waste_type", { ascending: true });
  const rules = (data ?? []) as PointRuleRow[];
  const ruleByWasteType = new Map(rules.map((rule) => [rule.waste_type, rule]));
  const visibleRules = rules.filter((rule) => (MVP_REVIEW_WASTE_TYPES as readonly string[]).includes(rule.waste_type));
  const activeRules = visibleRules.filter((rule) => rule.active).length;
  const totalAward = visibleRules.filter((rule) => rule.active).reduce((sum, rule) => sum + rule.points, 0);
  const highestRule = visibleRules.reduce<PointRuleRow | null>((highest, rule) => (!highest || rule.points > highest.points ? rule : highest), null);

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#1b1c1b] lg:text-4xl">Cấu hình Điểm & Quy tắc</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Quản trị điểm cộng theo loại rác. Admin review sẽ dùng rule đang bật khi submission có loại rác từ AI nhưng chưa có điểm tính sẵn.</p>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-4 lg:grid-cols-12">
        <MetricCard Icon={Sparkles} label="Rule đang bật" value={`${activeRules}/${MVP_REVIEW_WASTE_TYPES.length}`} tone="green" />
        <MetricCard Icon={Scale} label="Tổng điểm mỗi vòng" value={totalAward.toLocaleString("vi-VN")} tone="blue" />
        <MetricCard Icon={Bot} label="Rule cao nhất" value={highestRule ? `${WASTE_TYPE_LABELS[highestRule.waste_type]} · ${highestRule.points}` : "Chưa có"} tone="amber" />
      </section>

      {error ? (
        <section className="rounded-2xl border border-[#ffdad6] bg-[#ffdad6]/35 p-5 text-sm font-black text-[#ba1a1a]" data-admin-reveal>
          Không thể tải cấu hình điểm.
        </section>
      ) : null}

      <section className="grid-flow-dense grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {MVP_REVIEW_WASTE_TYPES.map((wasteType) => {
          const rule = ruleByWasteType.get(wasteType);
          return <PointRuleCard key={wasteType} rule={rule} wasteType={wasteType} />;
        })}
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-12">
        <article className="relative overflow-hidden rounded-2xl bg-[#006d37] p-7 text-white shadow-[0_18px_44px_rgba(0,109,55,0.20)] lg:col-span-7" data-admin-reveal>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_25%,rgba(255,255,255,0.24),transparent_24%),linear-gradient(135deg,rgba(45,156,219,0.12),rgba(46,204,113,0.22))]" />
          <Leaf className="absolute -right-8 -top-8 text-white/12" size={190} />
          <div className="relative max-w-2xl">
            <h2 className="text-2xl font-black leading-tight tracking-[-0.04em]">Rule điểm là nguồn cấu hình cho bước duyệt</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-white/82">Các submission đã có điểm sẵn sẽ giữ nguyên điểm đó. Submission chưa có điểm nhưng có `wasteType` hợp lệ sẽ được tính theo rule đang bật.</p>
          </div>
        </article>

        <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:col-span-5" data-admin-reveal>
          <h2 className="text-xl font-black tracking-[-0.03em] text-[#1b1c1b]">Phạm vi MVP</h2>
          <div className="mt-5 grid gap-3">
            <ScopeRow label="Loại rác" value="4 loại + chưa phân loại" />
            <ScopeRow label="Điểm cơ bản" value="Đã áp dụng" />
            <ScopeRow label="Cân nặng" value="Chờ field capture" />
            <ScopeRow label="Giới hạn lượt gửi" value="Chờ rule chống spam" />
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ Icon, label, value, tone }: { Icon: LucideIcon; label: string; value: string; tone: "green" | "blue" | "amber" }) {
  const toneClass = {
    green: "bg-[#d8f5df] text-[#006d37]",
    blue: "bg-[#e8f5ff] text-[#006496]",
    amber: "bg-[#fff7e6] text-[#755b00]",
  }[tone];

  return (
    <article className="rounded-2xl border border-[#bbcbbb]/45 bg-white/85 p-5 shadow-[0_12px_34px_rgba(45,156,219,0.05)] backdrop-blur-md lg:col-span-4" data-admin-reveal>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#1b1c1b]">{value}</p>
        </div>
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${toneClass}`}>
          <Icon size={20} />
        </span>
      </div>
    </article>
  );
}

function PointRuleCard({ rule, wasteType }: { rule?: PointRuleRow; wasteType: WasteType }) {
  const Icon = iconByWasteType[wasteType] ?? CircleHelp;
  const tone = WASTE_TYPE_TONES[wasteType];
  const toneClass = {
    blue: "bg-[#2d9cdb]/10 text-[#006492]",
    amber: "bg-[#f39c12]/12 text-[#735c00]",
    green: "bg-[#006d37]/10 text-[#006d37]",
    red: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
  }[tone];
  const active = rule?.active ?? false;

  return (
    <article className="group rounded-2xl border border-[#bbcbbb]/35 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(21,29,24,0.08)]" data-admin-reveal>
      <div className="flex items-start justify-between gap-4">
        <span className={`grid size-12 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-105 ${toneClass}`}>
          <Icon size={22} />
        </span>
        <DynamicPointRuleManagementActions rule={rule} wasteType={wasteType} />
      </div>

      <div className="mt-6">
        <div className="flex min-h-8 items-center gap-2">
          <span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black ${active ? "bg-[#d8f5df] text-[#006d37]" : "bg-[#e9e8e7] text-[#6c7b6d]"}`}>{active ? "Đang áp dụng" : "Tạm tắt"}</span>
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#1b1c1b]">{WASTE_TYPE_LABELS[wasteType]}</h2>
        <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-[#6c7b6d]">{WASTE_TYPE_DESCRIPTIONS[wasteType]}</p>
      </div>

      <div className="mt-7 rounded-2xl bg-[#f5f3f2] p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#6c7b6d]">Điểm cộng</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-5xl font-black leading-none tracking-[-0.07em] text-[#006d37]">{rule?.points ?? 0}</span>
          <span className="mb-1 text-sm font-black text-[#3d4a3e]">pts</span>
        </div>
      </div>

      <p className="mt-4 text-xs font-bold text-[#6c7b6d]">
        Cập nhật: <span className="text-[#1b1c1b]">{rule?.updated_at ? new Date(rule.updated_at).toLocaleDateString("vi-VN") : "Chưa tạo"}</span>
      </p>
    </article>
  );
}

function ScopeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f5f3f2] px-4 py-3">
      <span className="text-sm font-black text-[#3d4a3e]">{label}</span>
      <span className="text-right text-sm font-black text-[#006d37]">{value}</span>
    </div>
  );
}
