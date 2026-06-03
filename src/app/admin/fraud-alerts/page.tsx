import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Copy, Filter, MapPin, Radar, RefreshCw, ShieldAlert, Zap, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion, DynamicFraudAlertActions } from "@/components/shared/dynamic-client-components";
import { createAdminClient } from "@/infrastructure/supabase/admin";
import {
  buildFraudAlertsViewModel,
  type FraudAlertRow,
  type FraudCategory,
  type FraudProfileRow,
  type FraudRisk,
  type FraudSubmissionRow,
} from "./fraud-alerts-metrics";

const pageSize = 10;
const submissionColumns = "id,user_id,bin_id,ai_result,status,reason,risk_flags,created_at";
const profileColumns = "id,email,full_name,phone,location,bio,role,status,trust_score";

type SearchParams = Promise<{ page?: string | string[]; risk?: string | string[] }>;
type PageState = { page: number; risk: FraudRisk | "all" };

const metricIcons: Record<"newAlerts" | FraudCategory, LucideIcon> = {
  duplicate: Copy,
  location: MapPin,
  newAlerts: ShieldAlert,
  other: Radar,
  spam: Zap,
};

const categoryLabel: Record<"newAlerts" | FraudCategory, string> = {
  duplicate: "Ảnh/lượt trùng",
  location: "Sai lệch vị trí",
  newAlerts: "Cảnh báo mới",
  other: "Khác",
  spam: "Spam lượt gửi",
};

const categoryNote: Record<"newAlerts" | FraudCategory, string> = {
  duplicate: "Từ risk_flags",
  location: "GPS/khoảng cách",
  newAlerts: "Cần rà soát",
  other: "Cần kiểm tra",
  spam: "Tần suất cao",
};

const categoryTone: Record<"newAlerts" | FraudCategory, "red" | "blue" | "amber" | "green"> = {
  duplicate: "amber",
  location: "blue",
  newAlerts: "red",
  other: "green",
  spam: "green",
};

const riskFilters: Array<{ label: string; value: FraudRisk | "all" }> = [
  { label: "Tất cả", value: "all" },
  { label: "Cao", value: "high" },
  { label: "Trung bình", value: "medium" },
  { label: "Thấp", value: "low" },
];

export default async function AdminFraudAlertsPage({ searchParams }: { searchParams: SearchParams }) {
  const state = parsePageState(await searchParams);
  const from = (state.page - 1) * pageSize;
  const to = from + pageSize;
  const supabase = createAdminClient();
  const submissionsResult = await supabase.from("submissions").select(submissionColumns).order("created_at", { ascending: false }).limit(1000);
  const submissions = (submissionsResult.data ?? []) as FraudSubmissionRow[];
  const userIds = [...new Set(submissions.map((submission) => submission.user_id))];
  const profilesResult = userIds.length
    ? await supabase.from("profiles").select(profileColumns).in("id", userIds)
    : { data: [] as FraudProfileRow[], error: null };
  const profiles = (profilesResult.data ?? []) as FraudProfileRow[];
  const viewModel = buildFraudAlertsViewModel({ profiles, riskFilter: state.risk, submissions });
  const totalPages = Math.max(1, Math.ceil(viewModel.alerts.length / pageSize));
  const visibleAlerts = viewModel.alerts.slice(from, to);
  const loadError = submissionsResult.error ?? profilesResult.error;

  if (!loadError && state.page > totalPages) {
    redirect(buildFraudHref({ ...state, page: totalPages }));
  }

  const metrics = [
    { key: "newAlerts", value: viewModel.metrics.newAlerts },
    { key: "location", value: viewModel.metrics.location },
    { key: "duplicate", value: viewModel.metrics.duplicate },
    { key: "spam", value: viewModel.metrics.spam },
  ] as const;

  const rangeStart = viewModel.alerts.length === 0 ? 0 : from + 1;
  const rangeEnd = viewModel.alerts.length === 0 ? 0 : Math.min(viewModel.alerts.length, to);

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Cảnh báo gian lận</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Dữ liệu lấy từ risk_flags và lượt gửi bị từ chối trong Supabase. Chọn một cảnh báo để kiểm duyệt hoặc khóa tài khoản liên quan.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:scale-[1.03] active:scale-[0.98]" href={buildFraudHref({ ...state })}>
            <RefreshCw size={17} />
            Tải lại dữ liệu
          </Link>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.key}
            Icon={metricIcons[metric.key]}
            label={categoryLabel[metric.key]}
            note={categoryNote[metric.key]}
            tone={categoryTone[metric.key]}
            value={metric.value.toLocaleString("vi-VN")}
          />
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white shadow-[0_16px_44px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="flex flex-col gap-4 border-b border-[#bbcbbb]/25 bg-[#fbf9f8] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-[-0.03em] text-[#2c3e50]">Danh sách cảnh báo hiện tại</h2>
            <p className="mt-1 text-sm font-semibold text-[#6c7b6d]">Hiển thị các lượt gửi có dấu hiệu cần rà soát, không còn dữ liệu mẫu.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {riskFilters.map((filter) => {
              const active = filter.value === state.risk;
              return (
                <Link className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black transition ${active ? "bg-[#006d37] text-white" : "bg-white text-[#3d4a3e] ring-1 ring-[#bbcbbb]/50 hover:ring-[#006d37]"}`} href={buildFraudHref({ page: 1, risk: filter.value })} key={filter.value}>
                  <Filter size={13} />
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-[#bbcbbb]/20 px-6 py-4">
          <RiskCountPill label="Cao" tone="red" value={viewModel.riskCounts.high} />
          <RiskCountPill label="Trung bình" tone="amber" value={viewModel.riskCounts.medium} />
          <RiskCountPill label="Thấp" tone="neutral" value={viewModel.riskCounts.low} />
        </div>

        {loadError ? (
          <p className="border-b border-[#bbcbbb]/35 bg-[#ffdad6]/35 px-6 py-4 text-sm font-black text-[#ba1a1a]">Không thể tải cảnh báo gian lận từ Supabase.</p>
        ) : null}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead className="bg-[#f5f3f2]">
              <tr>
                {["Thời gian", "Người dùng / ID", "Loại hành vi bất thường", "Mức độ rủi ro", "Thao tác"].map((heading) => (
                  <th className={`px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e] ${heading === "Mức độ rủi ro" ? "text-center" : ""} ${heading === "Thao tác" ? "text-right" : ""}`} key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {visibleAlerts.map((alert) => (
                <tr className="group transition hover:bg-[#fbf9f8]" key={alert.id}>
                  <td className="px-6 py-6">
                    <p className="text-sm font-black text-[#1b1c1b]">{alert.time}</p>
                    <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{alert.date}</p>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-[#0b1f18] text-xs font-black text-white">{alert.name.charAt(0)}</span>
                      <span>
                        <span className="block text-sm font-black text-[#006492]">{alert.handle}</span>
                        <span className="mt-1 block text-xs font-semibold text-[#6c7b6d]">{alert.name}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-black text-[#2c3e50]">{alert.issue}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#6c7b6d]">
                        <AlertCategoryIcon category={alert.category} />
                        {alert.detail}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center"><RiskPill risk={alert.risk} /></td>
                  <td className="px-6 py-6 text-right">
                    <DynamicFraudAlertActions submissionId={alert.id} user={alert.user} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {visibleAlerts.map((alert) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={alert.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#006492]">{alert.handle}</p>
                  <h2 className="mt-1 text-sm font-black text-[#2c3e50]">{alert.issue}</h2>
                  <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{alert.detail}</p>
                </div>
                <RiskPill risk={alert.risk} />
              </div>
              <div className="mt-4 border-t border-[#bbcbbb]/25 pt-3">
                <DynamicFraudAlertActions submissionId={alert.id} user={alert.user} />
              </div>
            </article>
          ))}
        </div>

        {visibleAlerts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-base font-black text-[#1b1c1b]">{loadError ? "Không có dữ liệu để hiển thị." : "Không có cảnh báo phù hợp."}</p>
            <p className="mt-2 text-sm font-semibold text-[#6c7b6d]">Khi `risk_flags` xuất hiện hoặc lượt gửi bị từ chối, cảnh báo sẽ hiện ở đây.</p>
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/25 bg-[#fbf9f8] px-6 py-5 md:flex-row">
          <p className="text-xs font-semibold text-[#6c7b6d]">
            Hiển thị {rangeStart} - {rangeEnd} trên {viewModel.alerts.length.toLocaleString("vi-VN")} cảnh báo
          </p>
          <div className="flex items-center gap-2">
            <PaginationArrow disabled={state.page <= 1} href={buildFraudHref({ ...state, page: Math.max(1, state.page - 1) })} direction="previous" />
            {paginationPages(state.page, totalPages).map((page) => (
              <Link className={`grid size-8 place-items-center rounded text-sm font-black ${page === state.page ? "bg-[#006d37] text-white" : "text-[#3d4a3e] hover:bg-white"}`} href={buildFraudHref({ ...state, page })} key={page}>
                {page}
              </Link>
            ))}
            <PaginationArrow disabled={state.page >= totalPages} href={buildFraudHref({ ...state, page: Math.min(totalPages, state.page + 1) })} direction="next" />
          </div>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-2" data-admin-reveal>
        <article className="relative overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white p-8 shadow-[0_12px_34px_rgba(45,156,219,0.06)]">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-[#2c3e50]">Nguồn cảnh báo đang dùng</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#3d4a3e]">Trang này chưa giả lập hệ thống AI riêng. Nó tổng hợp trực tiếp từ `submissions.risk_flags`, trạng thái rejected và hồ sơ người dùng thật.</p>
          </div>
          <ShieldAlert className="absolute -right-8 -top-8 rotate-12 text-[#006d37]/10" size={220} />
        </article>

        <article className="rounded-3xl border border-[#006d37]/10 bg-[#006d37]/6 p-8 shadow-[0_12px_34px_rgba(45,156,219,0.06)]">
          <div className="flex flex-col gap-6 md:flex-row">
            <span className="relative grid size-32 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-xl">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(46,204,113,0.30),transparent_30%),linear-gradient(135deg,#e8f5ff,#edf6ed)]" />
              <span className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.14)_1px,transparent_1px)] [background-size:18px_18px]" />
              <Radar className="relative text-[#006d37]" size={54} />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.03em] text-[#006d37]">Luồng xử lý thật</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#3d4a3e]">“Chi tiết” mở lượt gửi để kiểm duyệt. “Khóa tài khoản” gọi API admin users và ghi audit log qua backend hiện có.</p>
              <Link className="mt-5 inline-flex text-sm font-black text-[#006d37]" href="/admin/submissions/review">Mở hàng chờ kiểm duyệt</Link>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

function MetricCard({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: "red" | "blue" | "amber" | "green" }) {
  const className = {
    amber: "bg-[#f39c12]/12 text-[#735c00]",
    blue: "bg-[#2d9cdb]/12 text-[#006492]",
    green: "bg-[#006d37]/10 text-[#006d37]",
    red: "bg-[#ffdad6] text-[#ba1a1a]",
  }[tone];

  return (
    <article className="rounded-2xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] transition hover:shadow-[0_16px_38px_rgba(45,156,219,0.10)]" data-admin-reveal>
      <div className="mb-4 flex items-start justify-between">
        <span className={`grid size-12 place-items-center rounded-xl ${className}`}>
          <Icon size={22} />
        </span>
        <span className="text-xs font-black text-[#6c7b6d]">{note}</span>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
      <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2c3e50]">{value}</h2>
    </article>
  );
}

function RiskPill({ risk }: { risk: FraudRisk }) {
  const tone = risk === "high" ? "red" : risk === "medium" ? "amber" : "neutral";
  return <RiskCountPill label={risk === "high" ? "Cao" : risk === "medium" ? "Trung bình" : "Thấp"} tone={tone} />;
}

function RiskCountPill({ label, tone, value }: { label: string; tone: "red" | "amber" | "neutral"; value?: number }) {
  const className = {
    amber: "bg-[#f39c12]/14 text-[#735c00]",
    neutral: "bg-[#efedec] text-[#6c7b6d]",
    red: "bg-[#ffdad6] text-[#ba1a1a]",
  }[tone];
  return <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-black ${className}`}>{value === undefined ? label : `${value.toLocaleString("vi-VN")} ${label}`}</span>;
}

function AlertCategoryIcon({ category }: { category: FraudAlertRow["category"] }) {
  const Icon = metricIcons[category];
  return <Icon size={14} />;
}

function PaginationArrow({ direction, disabled, href }: { direction: "previous" | "next"; disabled: boolean; href: string }) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  if (disabled) {
    return (
      <span className="grid size-8 place-items-center rounded-lg text-[#6c7b6d] opacity-50">
        <Icon size={17} />
      </span>
    );
  }
  return (
    <Link className="grid size-8 place-items-center rounded-lg text-[#3d4a3e] hover:bg-white" href={href}>
      <Icon size={17} />
    </Link>
  );
}

function parsePageState(params: Awaited<SearchParams>): PageState {
  const pageValue = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Number.parseInt(pageValue ?? "1", 10);
  const riskValue = Array.isArray(params.risk) ? params.risk[0] : params.risk;
  const risk = riskValue === "high" || riskValue === "medium" || riskValue === "low" ? riskValue : "all";
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    risk,
  };
}

function buildFraudHref(state: PageState) {
  const params = new URLSearchParams();
  if (state.risk !== "all") params.set("risk", state.risk);
  if (state.page > 1) params.set("page", String(state.page));
  const query = params.toString();
  return query ? `/admin/fraud-alerts?${query}` : "/admin/fraud-alerts";
}

function paginationPages(currentPage: number, pageCount: number) {
  const pages = new Set([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);
}
