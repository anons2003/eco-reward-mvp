import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, Gift, ImageIcon, Mail, MapPin, Phone, Recycle, ShieldCheck, ShieldAlert, TrendingUp, UserRound, WalletCards, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion, DynamicUserManagementActions } from "@/components/shared/dynamic-client-components";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";

type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "full_name" | "avatar_url" | "phone" | "location" | "bio" | "role" | "status" | "points" | "trust_score" | "created_at">;
type SubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "status" | "points" | "reason" | "risk_flags" | "created_at" | "image_url" | "ai_result">;
type MetricTone = "green" | "blue" | "greenSolid" | "red";
type PillTone = "blue" | "amber" | "green" | "red";

const wasteTypeLabel: Record<string, string> = {
  plastic_bottle: "Chai nhựa",
  metal_can: "Lon kim loại",
  paper: "Giấy",
  cardboard: "Bìa carton",
  glass_bottle: "Chai thủy tinh",
  organic: "Hữu cơ",
  hazardous: "Nguy hại",
  unknown: "Chưa rõ",
};

const tabs: Array<{ label: string; Icon: LucideIcon; active: boolean }> = [
  { label: "Lịch sử lượt gửi", Icon: Recycle, active: true },
  { label: "Lịch sử đổi thưởng", Icon: Gift, active: false },
  { label: "Cảnh báo gian lận", Icon: ShieldCheck, active: false },
];

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,full_name,avatar_url,phone,location,bio,role,status,points,trust_score,created_at")
    .eq("id", id)
    .single();

  const profile = profileData as ProfileRow | null;

  if (profileError || !profile) {
    notFound();
  }

  const { data: submissionData } = await supabase
    .from("submissions")
    .select("id,status,points,reason,risk_flags,created_at,image_url,ai_result")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const submissions = (submissionData ?? []) as SubmissionRow[];
  const displayName = profile.full_name || profile.email;
  const warningCount = submissions.filter((submission) => submission.risk_flags.length > 0).length;
  const status = profileStatusMeta(profile.status);
  const metrics: Array<{ label: string; value: string; note: string; Icon: LucideIcon; tone: MetricTone }> = [
    { label: "Lượt gửi gần đây", value: formatNumber(submissions.length), note: "10 lượt mới nhất", Icon: Recycle, tone: "green" },
    { label: "Tổng điểm hiện có", value: formatNumber(profile.points), note: "Số dư ví hiện tại", Icon: WalletCards, tone: "blue" },
    { label: "Độ uy tín", value: `${profile.trust_score}/100`, note: status.note, Icon: ShieldCheck, tone: profile.status === "blocked" ? "red" : "greenSolid" },
    { label: "Cảnh báo", value: formatNumber(warningCount), note: warningCount > 0 ? "Có lượt cần rà soát" : "Không có cảnh báo gần đây", Icon: ShieldAlert, tone: "red" },
  ];

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between" data-admin-reveal>
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
          <div className="group relative grid size-32 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-[radial-gradient(circle_at_35%_28%,rgba(46,204,113,0.30),transparent_34%),linear-gradient(135deg,#e8f5ff,#edf6ed)] shadow-lg">
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.13)_1px,transparent_1px)] [background-size:18px_18px]" />
            <UserRound className="relative text-[#006d37]" size={58} />
            <span className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-lg border-2 border-white bg-[#2ecc71] text-white shadow-md">
              <ShieldCheck size={18} />
            </span>
          </div>
          <div className="min-w-0">
            <Link className="mb-4 inline-flex items-center gap-2 text-sm font-black text-[#6c7b6d] transition hover:text-[#006d37]" href="/admin/users">
              <ArrowLeft size={17} />
              Quay lại
            </Link>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-[#1b1c1b] lg:text-4xl">{displayName}</h1>
            <p className="mt-1 text-xs font-bold text-[#6c7b6d]">Mã người dùng: {profile.id}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#3d4a3e]">
              <ProfileFact Icon={CalendarDays} text={`Tham gia: ${formatDate(profile.created_at)}`} />
              <ProfileFact Icon={Mail} text={profile.email} />
              <ProfileFact Icon={Phone} text={profile.phone || "Chưa cập nhật SĐT"} />
              <ProfileFact Icon={MapPin} text={profile.location || "Chưa cập nhật khu vực"} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <DynamicUserManagementActions user={profile} />
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/30 bg-white shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="flex overflow-x-auto border-b border-[#bbcbbb]/45">
          {tabs.map(({ label, Icon, active }) => (
            <button className={`inline-flex min-h-16 shrink-0 items-center gap-2 border-b-2 px-6 text-sm font-black transition ${active ? "border-[#006d37] text-[#006d37]" : "border-transparent text-[#6c7b6d] hover:text-[#006d37]"}`} key={label} type="button">
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        <div className="hidden overflow-x-auto p-6 lg:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#bbcbbb]/45 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">
                <th className="px-4 pb-4">Ảnh minh chứng</th>
                <th className="px-4 pb-4">Loại rác thải</th>
                <th className="px-4 pb-4">Ngày gửi</th>
                <th className="px-4 pb-4">Điểm nhận</th>
                <th className="px-4 pb-4">Trạng thái</th>
                <th className="px-4 pb-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr className="group border-b border-[#bbcbbb]/25 transition hover:bg-[#f5f3f2]/70" key={submission.id}>
                  <td className="px-4 py-4">
                    <ProofVisual imageUrl={submission.image_url} label={wasteLabelFromAiResult(submission.ai_result)} tone={submissionTone(submission.status)} />
                  </td>
                  <td className="px-4 py-4">
                    <WastePill label={wasteLabelFromAiResult(submission.ai_result)} tone={submissionTone(submission.status)} />
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#6c7b6d]">{formatDateTime(submission.created_at)}</td>
                  <td className="px-4 py-4 text-sm font-black text-[#2ecc71]">+{submission.points}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-2 text-sm font-black ${submissionStatusClass(submission.status)}`}>
                      <span className="size-2 rounded-full bg-current" />
                      {submissionStatusLabel(submission.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="grid size-9 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#006d37]/10 hover:text-[#006d37]" type="button" aria-label="Xem lượt gửi">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td className="px-4 py-12 text-center text-sm font-black text-[#6c7b6d]" colSpan={6}>
                    Người dùng này chưa có lượt gửi nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 lg:hidden">
          {submissions.map((submission) => (
            <article className="rounded-2xl border border-[#bbcbbb]/30 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={submission.id}>
              <div className="flex gap-3">
                <ProofVisual imageUrl={submission.image_url} label={wasteLabelFromAiResult(submission.ai_result)} tone={submissionTone(submission.status)} large />
                <div className="min-w-0 flex-1">
                  <WastePill label={wasteLabelFromAiResult(submission.ai_result)} tone={submissionTone(submission.status)} />
                  <p className="mt-2 text-xs font-semibold text-[#6c7b6d]">{formatDateTime(submission.created_at)}</p>
                  <p className="mt-1 text-sm font-black text-[#2ecc71]">+{submission.points} điểm</p>
                  <button className="mt-3 inline-flex items-center gap-2 text-xs font-black text-[#006d37]" type="button">
                    Xem chi tiết
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {submissions.length === 0 ? <p className="rounded-2xl border border-[#bbcbbb]/30 bg-white p-6 text-center text-sm font-black text-[#6c7b6d]">Người dùng này chưa có lượt gửi nào.</p> : null}
        </div>
      </section>
    </div>
  );
}

function ProfileFact({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon size={17} />
      {text}
    </span>
  );
}

function MetricCard({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: MetricTone }) {
  const toneClass = {
    green: "bg-[#2ecc71]/10 text-[#2ecc71]",
    blue: "bg-[#2d9cdb]/10 text-[#2d9cdb]",
    greenSolid: "bg-[#2ecc71] text-white shadow-[#2ecc71]/30",
    red: "bg-[#e74c3c]/10 text-[#e74c3c]",
  }[tone];

  return (
    <article className="flex min-h-44 flex-col justify-between rounded-2xl border border-[#bbcbbb]/30 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] transition duration-300 hover:-translate-y-1" data-admin-reveal>
      <div>
        <span className={`grid size-10 place-items-center rounded-full shadow-sm ${toneClass}`}>
          <Icon size={20} />
        </span>
        <p className="mt-4 text-sm font-black text-[#3d4a3e]">{label}</p>
      </div>
      <div className="mt-4">
        <h2 className={`text-4xl font-black tracking-[-0.05em] ${tone === "red" ? "text-[#e74c3c]" : "text-[#1b1c1b]"}`}>{value}</h2>
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#6c7b6d]">
          <TrendingUp size={14} />
          {note}
        </p>
      </div>
    </article>
  );
}

function WastePill({ label, tone }: { label: string; tone: PillTone }) {
  const className = {
    blue: "bg-[#58bcfd]/18 text-[#004a6d]",
    amber: "bg-[#f39c12]/18 text-[#735c00]",
    green: "bg-[#2ecc71]/14 text-[#006d37]",
    red: "bg-[#ffdad6]/55 text-[#ba1a1a]",
  }[tone];

  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${className}`}>{label}</span>;
}

function ProofVisual({ imageUrl, label, tone, large = false }: { imageUrl: string; label: string; tone: PillTone; large?: boolean }) {
  const className = tone === "amber" ? "bg-[linear-gradient(135deg,#fff7e6,#edf6ed)]" : "bg-[linear-gradient(135deg,#e8f5ff,#edf6ed)]";

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-lg shadow-sm transition-transform group-hover:scale-105 ${large ? "h-16 w-20 rounded-xl" : "h-12 w-16"} ${className}`}>
      {imageUrl ? <Image alt={`Ảnh minh chứng ${label}`} className="h-full w-full object-cover" height={large ? 64 : 48} src={imageUrl} width={large ? 80 : 64} /> : <ImageIcon className="text-[#006d37]" size={large ? 24 : 20} />}
    </span>
  );
}

function profileStatusMeta(status: ProfileRow["status"]) {
  if (status === "blocked") return { note: "Tài khoản đang bị chặn" };
  if (status === "deleted") return { note: "Hồ sơ đã xóa" };
  return { note: "Tài khoản đang hoạt động" };
}

function submissionStatusLabel(status: SubmissionRow["status"]) {
  const labels: Record<SubmissionRow["status"], string> = {
    approved: "Đã duyệt",
    pending_review: "Chờ duyệt",
    rejected: "Từ chối",
  };

  return labels[status] ?? status;
}

function submissionStatusClass(status: SubmissionRow["status"]) {
  const classes: Record<SubmissionRow["status"], string> = {
    approved: "text-[#2ecc71]",
    pending_review: "text-[#bd7700]",
    rejected: "text-[#ba1a1a]",
  };

  return classes[status] ?? "text-[#6c7b6d]";
}

function submissionTone(status: SubmissionRow["status"]): PillTone {
  if (status === "approved") return "green";
  if (status === "rejected") return "red";
  return "amber";
}

function wasteLabelFromAiResult(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Chưa rõ";

  const record = value as Record<string, unknown>;
  const wasteType = typeof record.wasteType === "string" ? record.wasteType : typeof record.waste_type === "string" ? record.waste_type : "";

  if (!wasteType) return "Chưa rõ";
  return wasteTypeLabel[wasteType] ?? wasteType.replaceAll("_", " ");
}

function formatNumber(value: number) {
  return value.toLocaleString("vi-VN");
}

function parseDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" && typeof value !== "number" && !(value instanceof Date)) return null;

  try {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function formatDate(value: unknown) {
  const date = parseDate(value);
  if (!date) return "Chưa rõ";

  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatDateTime(value: unknown) {
  const date = parseDate(value);
  if (!date) return "Chưa rõ";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
