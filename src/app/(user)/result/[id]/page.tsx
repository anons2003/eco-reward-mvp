import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Coins, Recycle, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = ecoRewardService.getSubmission(id);
  if (!submission) notFound();

  const confidence = Math.round(submission.aiResult.confidence * 100);
  const isApproved = submission.status === "approved";

  return (
    <div className="mx-auto max-w-5xl">
      <section className="eco-card overflow-hidden rounded-[28px]">
        <div className={isApproved ? "bg-[#f4f5fb] p-8" : "bg-[#fff7e6] p-8"}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#151515]">Kết quả phân tích</p>
              <h1 className="mt-3 text-4xl font-black text-[#151515]">{submission.aiResult.wasteType.replaceAll("_", " ")}</h1>
              <p className="mt-3 max-w-2xl leading-7 text-[#5f6472]">{submission.reason}</p>
            </div>
            <StatusBadge status={submission.status} />
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5">
            <Sparkles className="text-[#166534]" />
            <p className="mt-4 text-sm font-bold text-[#5f6472]">Độ tin cậy AI</p>
            <p className="mt-1 text-3xl font-black">{confidence}%</p>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <Coins className="text-[#151515]" />
            <p className="mt-4 text-sm font-bold text-[#5f6472]">Điểm</p>
            <p className="mt-1 text-3xl font-black text-[#151515]">+{submission.points}</p>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <Recycle className="text-[#92400E]" />
            <p className="mt-4 text-sm font-bold text-[#5f6472]">Vật thể</p>
            <p className="mt-1 text-3xl font-black">{submission.aiResult.objectCount}</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="rounded-2xl border border-[#e6e7ef] bg-white p-5">
            <div className="flex gap-3">
              {isApproved ? <CheckCircle2 className="mt-0.5 text-[#151515]" /> : <AlertTriangle className="mt-0.5 text-[#92400E]" />}
              <div>
                <p className="font-black">{isApproved ? "Điểm đã được ghi nhận" : "Lượt gửi cần kiểm tra thêm"}</p>
                <p className="mt-1 text-sm leading-6 text-[#5f6472]">{submission.aiResult.notes ?? "Kết quả đã được lưu vào lịch sử."}</p>
              </div>
            </div>
          </div>
          {submission.riskFlags.length ? (
            <div className="mt-4 rounded-2xl bg-[#fff7e6] p-5">
              <p className="font-black text-[#92400E]">Tín hiệu cần chú ý</p>
              <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-[#5f6472]">
                {submission.riskFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link className="btn-primary" href="/scan">
              Gửi lượt khác
              <ArrowRight size={18} />
            </Link>
            <Link className="btn-secondary" href="/wallet">
              Xem ví điểm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
