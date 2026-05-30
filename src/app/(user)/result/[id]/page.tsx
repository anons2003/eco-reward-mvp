import { notFound } from "next/navigation";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = ecoRewardService.getSubmission(id);
  if (!submission) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <section className="surface rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-[#006492]">Kết quả phân tích</p>
            <h1 className="mt-2 text-3xl font-black">{submission.aiResult.wasteType.replaceAll("_", " ")}</h1>
          </div>
          <StatusBadge status={submission.status} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-[#f5f3f3] p-4">
            <p className="text-sm text-[#3f4850]">Độ tin cậy AI</p>
            <p className="mt-1 text-2xl font-black">{Math.round(submission.aiResult.confidence * 100)}%</p>
          </div>
          <div className="rounded-xl bg-[#f5f3f3] p-4">
            <p className="text-sm text-[#3f4850]">Điểm</p>
            <p className="mt-1 text-2xl font-black text-[#219653]">+{submission.points}</p>
          </div>
          <div className="rounded-xl bg-[#f5f3f3] p-4">
            <p className="text-sm text-[#3f4850]">Vật thể</p>
            <p className="mt-1 text-2xl font-black">{submission.aiResult.objectCount}</p>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-[#d7dcdf] bg-white p-4">
          <div className="flex gap-3">
            {submission.status === "approved" ? <CheckCircle2 className="text-[#219653]" /> : <CircleAlert className="text-[#904d00]" />}
            <div>
              <p className="font-bold">{submission.reason}</p>
              <p className="mt-1 text-sm text-[#3f4850]">{submission.aiResult.notes ?? "Kết quả đã được lưu vào lịch sử."}</p>
            </div>
          </div>
        </div>
        {submission.riskFlags.length ? (
          <div className="mt-4 rounded-xl bg-[#fff4c2] p-4">
            <p className="font-bold text-[#904d00]">Tín hiệu cần chú ý</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-[#3f4850]">
              {submission.riskFlags.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a className="btn-primary" href="/scan">
            Gửi lượt khác
          </a>
          <a className="btn-secondary" href="/wallet">
            Xem ví điểm
          </a>
        </div>
      </section>
    </div>
  );
}
