/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { AlertTriangle, CalendarClock, CheckCircle2, Database, ImageIcon, MapPin, Recycle, ShieldCheck, XCircle } from "lucide-react";
import { AdminCard, AdminMetric, AdminPageHeader, AdminStatusBadge } from "@/components/admin/admin-ui";
import { DynamicAdminDashboardMotion, DynamicReviewActions } from "@/components/shared/dynamic-client-components";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database as Db, Json } from "@/infrastructure/supabase/database.types";

type SubmissionRow = Db["public"]["Tables"]["submissions"]["Row"];
type BinRow = Pick<Db["public"]["Tables"]["bins"]["Row"], "id" | "name" | "location_name" | "active">;

const wasteTypeLabel: Record<string, string> = {
  manual_review: "Duyệt thủ công",
  plastic_bottle: "Chai nhựa",
  metal_can: "Lon kim loại",
  paper: "Giấy",
  cardboard: "Bìa carton",
  glass_bottle: "Chai thủy tinh",
  organic: "Hữu cơ",
  hazardous: "Nguy hại",
  unknown: "Không xác định",
};

const reviewStatusCopy = {
  approved: {
    title: "Đã cộng điểm",
    description: "Lượt gửi đã được duyệt. Điểm đã được ghi vào ví người dùng và không cần thao tác thêm.",
    Icon: CheckCircle2,
    iconClassName: "bg-[#d8f5df] text-[#006d37]",
  },
  rejected: {
    title: "Đã từ chối",
    description: "Lượt gửi đã bị từ chối. Kết quả được giữ lại để truy vết và đối soát.",
    Icon: XCircle,
    iconClassName: "bg-[#ffdad6] text-[#93000a]",
  },
} as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function resultObject(value: Json) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export default async function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("submissions").select("id,user_id,bin_id,scan_session_id,image_url,ai_result,status,points,reason,risk_flags,reviewed_at,reviewed_by,created_at").eq("id", id).single();
  const submission = data as SubmissionRow | null;
  if (error || !submission) notFound();

  const { data: binData } = await supabase.from("bins").select("id,name,location_name,active").eq("id", submission.bin_id).single();
  const bin = binData as BinRow | null;
  const aiResult = resultObject(submission.ai_result);
  const confidence = typeof aiResult.confidence === "number" ? Math.round(aiResult.confidence * 100) : 0;
  const wasteType = typeof aiResult.wasteType === "string" ? aiResult.wasteType : typeof aiResult.mode === "string" ? aiResult.mode : "unknown";
  const wasteLabel = wasteTypeLabel[wasteType] ?? wasteType.replaceAll("_", " ");
  const objectCount = typeof aiResult.objectCount === "number" ? aiResult.objectCount : 1;
  const riskFlags = submission.risk_flags.length ? submission.risk_flags : ["Không có cảnh báo."];

  return (
    <div className="space-y-6">
      <DynamicAdminDashboardMotion />

      <AdminPageHeader
        eyebrow="Chi tiết kiểm duyệt"
        title="Chi tiết lượt gửi"
        body="Rà soát ảnh, dữ liệu phiên QR, tín hiệu rủi ro và dữ liệu thùng rác trước khi duyệt điểm cho người dùng."
        action={<AdminStatusBadge status={submission.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AdminCard className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="relative min-h-[280px] bg-[#efedec]">
                <img alt={`Ảnh lượt gửi ${submission.id}`} className="absolute inset-0 h-full w-full object-contain p-6" src={submission.image_url} />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#006d37] shadow-sm backdrop-blur">
                  <ImageIcon size={14} />
                  Ảnh gốc
                </span>
              </div>

              <div className="p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#006d37]">Kết quả hiện tại</p>
                    <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#1b1c1b]">{wasteLabel}</h2>
                  </div>
                  <span className="rounded-full bg-[#d8f5df] px-3 py-1 text-xs font-black text-[#006d37]">ID {submission.id.slice(0, 8)}</span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <AdminMetric Icon={ShieldCheck} label="Độ tin cậy" tone={confidence >= 80 ? "green" : confidence >= 50 ? "amber" : "blue"} value={confidence ? `${confidence}%` : "Thủ công"} />
                  <AdminMetric Icon={Recycle} label="Số vật thể" tone="blue" value={`${objectCount}`} />
                  <AdminMetric Icon={Database} label="Điểm dự kiến" tone={submission.points > 0 ? "green" : "amber"} value={`${submission.points} pts`} />
                  <AdminMetric Icon={CalendarClock} label="Thời gian gửi" tone="blue" value={formatDate(submission.created_at)} valueClassName="text-base leading-6" />
                </div>

                <div className="mt-5 rounded-2xl border border-[#d9e5da] bg-[#fbf9f8] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-[#6e7a70]">Lý do hiện tại</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#1b1c1b]">{submission.reason}</p>
                </div>
              </div>
            </div>
          </AdminCard>

          <div className="grid gap-6 md:grid-cols-2">
            <AdminCard className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e8f5ff] text-[#006496]">
                  <MapPin size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#1b1c1b]">Dữ liệu thùng rác</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#6e7a70]">{bin?.name ?? submission.bin_id}</p>
                  <p className="text-sm font-semibold leading-6 text-[#6e7a70]">{bin?.location_name ?? "Chưa có địa điểm"}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.1em] text-[#006d37]">{bin?.active ? "Đang hoạt động" : "Không hoạt động"}</p>
                </div>
              </div>
            </AdminCard>

            <AdminCard className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff7e6] text-[#bd7700]">
                  <AlertTriangle size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#1b1c1b]">Cảnh báo cần kiểm tra</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {riskFlags.map((flag) => (
                      <span className="rounded-full bg-[#fff7e6] px-3 py-1 text-xs font-black text-[#735c00]" key={flag}>
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AdminCard>
          </div>
        </div>

        {submission.status === "pending_review" ? <DynamicReviewActions submissionId={submission.id} /> : <ReviewDecisionSummary submission={submission} />}
      </div>
    </div>
  );
}

function ReviewDecisionSummary({ submission }: { submission: SubmissionRow }) {
  const copy = reviewStatusCopy[submission.status as "approved" | "rejected"];
  const Icon = copy.Icon;

  return (
    <AdminCard className="h-fit p-5 lg:sticky lg:top-24 lg:p-6">
      <div className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${copy.iconClassName}`}>
          <Icon size={20} />
        </span>
        <div>
          <h2 className="text-xl font-black text-[#1b1c1b]">{copy.title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-[#6e7a70]">{copy.description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="rounded-2xl border border-[#d9e5da] bg-[#fbf9f8] p-4">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-[#6e7a70]">Lý do kiểm duyệt</p>
          <p className="mt-2 text-sm font-bold leading-6 text-[#1b1c1b]">{submission.reason}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <ReadOnlyMeta label="Thời gian duyệt" value={submission.reviewed_at ? formatDate(submission.reviewed_at) : "Chưa ghi nhận"} />
          <ReadOnlyMeta label="Người duyệt" value={submission.reviewed_by ? submission.reviewed_by.slice(0, 8) : "Chưa ghi nhận"} />
        </div>
      </div>
    </AdminCard>
  );
}

function ReadOnlyMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d9e5da] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-[#6e7a70]">{label}</p>
      <p className="mt-2 font-mono text-sm font-black text-[#1b1c1b]">{value}</p>
    </div>
  );
}
