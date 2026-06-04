import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Coins, Cpu, Leaf, MapPin, Recycle, ShieldCheck, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { SubmissionStatus } from "@/core/entities/types";
import { mvpWasteTypeLabel } from "@/core/points/point-rules";
import { createClient } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/database.types";
import { buildResultImpact } from "./result-impact";

type SubmissionRow = Pick<Database["public"]["Tables"]["submissions"]["Row"], "id" | "bin_id" | "image_url" | "ai_result" | "status" | "points" | "reason" | "risk_flags" | "created_at">;
type BinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "name" | "location_name">;

function statusCopy(status: SubmissionStatus) {
  if (status === "approved") return { title: "Đã xác minh thành công", body: "Lượt gửi hợp lệ và điểm đã được cộng vào ví.", Icon: CheckCircle2, tone: "text-[#007a3d]", bg: "bg-[#d8f5df]" };
  if (status === "pending_review") return { title: "Đang chờ kiểm tra", body: "AI cần thêm xác nhận từ quản trị viên trước khi cộng điểm.", Icon: Clock3, tone: "text-[#92400E]", bg: "bg-[#fff7e6]" };
  return { title: "Lượt gửi bị từ chối", body: "Lượt gửi không đạt điều kiện nhận điểm.", Icon: AlertTriangle, tone: "text-[#93000a]", bg: "bg-[#ffdad6]" };
}

function aiResult(row: SubmissionRow) {
  return row.ai_result && typeof row.ai_result === "object" && !Array.isArray(row.ai_result) ? row.ai_result : {};
}

function wasteTypeLabel(value: unknown) {
  if (value === "manual_review") return "Duyệt thủ công";
  return mvpWasteTypeLabel(value);
}

function aiReviewBadge(result: Record<string, unknown>, status: SubmissionStatus) {
  if (status !== "pending_review") return "Đã xác minh";
  if (result.provider === "manual" || result.mode === "manual_review") return "Chờ duyệt thủ công";
  return "AI đã phân tích";
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: submissionData, error } = await supabase
    .from("submissions")
    .select("id,bin_id,image_url,ai_result,status,points,reason,risk_flags,created_at")
    .eq("id", id)
    .single();

  if (error || !submissionData) notFound();

  const submission = submissionData as SubmissionRow;
  const { data: binData } = await supabase.from("bins").select("id,name,location_name").eq("id", submission.bin_id).maybeSingle();
  const bin = binData as BinRow | null;

  const result = aiResult(submission);
  const resultMode = typeof result.mode === "string" ? result.mode : undefined;
  const confidence = typeof result.confidence === "number" ? Math.round(result.confidence * 100) : 0;
  const detectedWasteType = typeof result.wasteType === "string" ? result.wasteType : resultMode;
  const wasteType = wasteTypeLabel(detectedWasteType);
  const status = statusCopy(submission.status);
  const StatusIcon = status.Icon;
  const impact = buildResultImpact({ points: submission.points, status: submission.status, wasteType: detectedWasteType });

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link className="grid size-11 place-items-center rounded-full bg-white text-[#007a3d] ring-1 ring-[#d9e5da] transition hover:bg-[#edf6ed]" href="/history" aria-label="Quay lại lịch sử">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#007a3d]">Chi tiết lượt gửi</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#093719] md:text-5xl">{wasteType}</h1>
          </div>
        </div>
        <StatusBadge status={submission.status} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[34px] border border-[#d9e5da] bg-white/86 shadow-[0_22px_70px_rgba(21,29,24,0.08)]">
            <div className="relative min-h-[420px] bg-[#edf6ed]">
              <Image alt={`Ảnh phân tích ${wasteType}`} className="object-contain p-8 transition duration-500" fill sizes="(min-width: 1024px) 720px, 100vw" src={submission.image_url} unoptimized={submission.image_url.startsWith("data:")} />
              <div className="absolute bottom-5 left-5 right-5 rounded-[26px] border border-white/40 bg-white/88 p-4 shadow-[0_16px_42px_rgba(21,29,24,0.12)] backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`grid size-11 place-items-center rounded-2xl ${status.bg} ${status.tone}`}>
                      <StatusIcon size={22} />
                    </span>
                    <div>
                      <p className="font-black text-[#151d18]">{status.title}</p>
                      <p className="mt-1 text-sm font-semibold text-[#5d6a60]">{new Date(submission.created_at).toLocaleString("vi-VN")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black tracking-[-0.04em] text-[#007a3d]">+{submission.points}</p>
                    <p className="text-xs font-black text-[#007a3d]">Điểm SeaTech</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-[30px] border border-[#d9e5da] bg-white/84 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[#6e7a70]">Trạng thái giao dịch</h2>
            <div className="mt-6 grid gap-6">
              <TimelineItem title="Phiên QR đã ghi nhận" body="Hệ thống đã ghi nhận mã QR, thùng rác và ảnh người dùng gửi." active />
              <TimelineItem title="AI phân tích & admin xác nhận" body={submission.status === "pending_review" ? "AI đã phân tích ảnh. Admin sẽ xác nhận lần cuối trước khi cộng điểm." : `Xác nhận: ${wasteType}${confidence ? ` • ${confidence}% độ tin cậy.` : "."}`} active={submission.status !== "rejected"} />
              <TimelineItem title="Điểm thưởng đã cộng" body={`${submission.points} điểm được thêm vào ví SeaTech.`} active={submission.status === "approved"} last />
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-[30px] border border-[#d9e5da] bg-white/84 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
                <Cpu size={24} />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#d8f5df] px-3 py-1 text-xs font-black text-[#007a3d]">
                <ShieldCheck size={15} />
                {aiReviewBadge(result, submission.status)}
              </span>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6e7a70]">Loại rác phát hiện</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#151d18]">{wasteType}</h2>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm font-black">
                <span className="text-[#5d6a60]">Độ tin cậy AI</span>
                <span className="text-[#007a3d]">{confidence ? `${confidence}%` : "N/A"}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#edf6ed]">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#006496,#007a3d)]" style={{ width: `${confidence}%` }} />
              </div>
            </div>
            <p className="mt-5 rounded-[22px] bg-[#f3fcf3] p-4 text-sm font-semibold leading-6 text-[#5d6a60]">{submission.reason || status.body}</p>
          </section>

          <section className="rounded-[30px] border border-[#d9e5da] bg-white/84 p-6 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[#6e7a70]">Vị trí & Thiết bị</h2>
            <div className="mt-4 grid gap-3">
              <InfoRow icon={Recycle} title={bin?.name ?? `Bin ${submission.bin_id.slice(0, 8)}`} body={`Mã bin: ${submission.bin_id.slice(0, 8)}`} />
              <InfoRow icon={MapPin} title={bin?.location_name ?? "Chưa có vị trí"} body="Phiên quét QR đã được gắn với lượt gửi này." />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[30px] bg-[#007a3d] p-6 text-white shadow-[0_18px_44px_rgba(0,106,61,0.16)]">
            <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[#8ff8b6]">Tác động môi trường</h2>
            <p className="mt-2 text-2xl font-black tracking-[-0.04em]">{impact.title}</p>
            {impact.showMetrics ? (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <ImpactMetric icon={Leaf} value={impact.co2Label} label="CO2 ước tính" />
                <ImpactMetric icon={Coins} value={impact.pointsLabel} label="Điểm đã cộng" />
              </div>
            ) : null}
            <div className="mt-5 flex items-start gap-3 rounded-[22px] bg-white/10 p-4">
              <Leaf className="mt-0.5 shrink-0 text-[#8ff8b6]" size={20} />
              <p className="text-sm font-semibold leading-6 text-white/84">{impact.note}</p>
            </div>
            <div className="absolute -right-14 -top-14 size-48 rounded-full bg-white/10 blur-3xl" />
          </section>

          {submission.risk_flags.length ? (
            <section className="rounded-[26px] bg-[#fff7e6] p-5">
              <p className="font-black text-[#92400E]">Tín hiệu cần chú ý</p>
              <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-[#5d6a60]">
                {submission.risk_flags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="grid gap-3">
            <Link className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 font-black text-white shadow-[0_12px_30px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35]" href="/scan">
              Gửi lượt khác
              <ArrowRight size={18} />
            </Link>
            <Link className="inline-flex min-h-14 items-center justify-center rounded-full bg-[#edf6ed] px-5 font-black text-[#151d18] ring-1 ring-[#d9e5da] transition hover:bg-white" href="/history">
              Quay lại lịch sử
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}

function TimelineItem({ title, body, active, last = false }: { title: string; body: string; active: boolean; last?: boolean }) {
  return (
    <div className="relative flex gap-4">
      {!last ? <div className={`absolute left-[11px] top-7 h-[calc(100%+1.5rem)] w-0.5 ${active ? "bg-[#007a3d]" : "bg-[#d9e5da]"}`} /> : null}
      <span className={`z-10 grid size-6 shrink-0 place-items-center rounded-full ${active ? "bg-[#007a3d] text-white" : "bg-[#d9e5da] text-[#6e7a70]"}`}>
        <Check size={14} />
      </span>
      <div>
        <p className="font-black text-[#151d18]">{title}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-[#5d6a60]">{body}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex items-center gap-4 rounded-[22px] bg-[#f3fcf3] p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[#007a3d]">
        <Icon size={20} />
      </span>
      <div>
        <p className="font-black text-[#151d18]">{title}</p>
        <p className="mt-1 text-sm font-semibold text-[#5d6a60]">{body}</p>
      </div>
    </div>
  );
}

function ImpactMetric({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
      <Icon className="mb-3 text-[#8ff8b6]" size={22} />
      <p className="text-2xl font-black tracking-[-0.04em]">{value}</p>
      <p className="mt-1 text-xs font-bold text-white/78">{label}</p>
    </div>
  );
}
