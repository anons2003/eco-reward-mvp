import { notFound } from "next/navigation";
import { ReviewActions } from "@/components/admin/review-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default async function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = ecoRewardService.getSubmission(id);
  if (!submission) notFound();
  const bin = ecoRewardService.listBins().find((row) => row.id === submission.binId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="surface rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-[#006492]">Chi tiết lượt gửi</p>
            <h1 className="mt-2 text-3xl font-black">{submission.aiResult.wasteType.replaceAll("_", " ")}</h1>
          </div>
          <StatusBadge status={submission.status} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-[#f5f3f3] p-4">
            <p className="text-sm text-[#3f4850]">AI confidence</p>
            <p className="text-2xl font-black">{Math.round(submission.aiResult.confidence * 100)}%</p>
          </div>
          <div className="rounded-xl bg-[#f5f3f3] p-4">
            <p className="text-sm text-[#3f4850]">Thùng rác</p>
            <p className="font-bold">{bin?.name ?? "Không rõ"}</p>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-[#d7dcdf] bg-white p-4">
          <p className="font-bold">Lý do hiện tại</p>
          <p className="mt-1 text-[#3f4850]">{submission.reason}</p>
        </div>
        <div className="mt-6 rounded-xl bg-[#fff4c2] p-4">
          <p className="font-bold text-[#904d00]">Risk flags</p>
          <p className="mt-1 text-sm text-[#3f4850]">{submission.riskFlags.length ? submission.riskFlags.join(", ") : "Không có cảnh báo."}</p>
        </div>
      </section>
      <ReviewActions submissionId={submission.id} />
    </div>
  );
}
