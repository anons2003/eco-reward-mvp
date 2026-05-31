import { notFound } from "next/navigation";
import { ReviewActions } from "@/components/admin/review-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { ecoRewardService } from "@/application/services/eco-reward-service";
import { PageHeader } from "@/components/shared/eco-ui";

export default async function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = ecoRewardService.getSubmission(id);
  if (!submission) notFound();
  const bin = ecoRewardService.listBins().find((row) => row.id === submission.binId);

  return (
    <div>
      <PageHeader eyebrow="Chi tiết kiểm duyệt" title="Chi tiết lượt gửi" body="Xem kết quả nhận diện, thùng rác, điểm và cảnh báo trước khi duyệt." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="eco-card rounded-[32px] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#5f6472]">Kết quả nhận diện</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.03em]">{submission.aiResult.wasteType.replaceAll("_", " ")}</h1>
          </div>
          <StatusBadge status={submission.status} />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#e6e7ef] bg-white p-4">
            <p className="text-sm text-[#5f6472]">Độ tin cậy</p>
            <p className="text-2xl font-black">{Math.round(submission.aiResult.confidence * 100)}%</p>
          </div>
          <div className="rounded-2xl border border-[#e6e7ef] bg-white p-4">
            <p className="text-sm text-[#5f6472]">Thùng rác</p>
            <p className="font-bold">{bin?.name ?? "Không rõ"}</p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-[#e6e7ef] bg-white p-4">
          <p className="font-bold">Lý do hiện tại</p>
          <p className="mt-1 text-[#5f6472]">{submission.reason}</p>
        </div>
        <div className="mt-6 rounded-2xl bg-[#fff7e6] p-4">
          <p className="font-bold text-[#92400E]">Cảnh báo cần kiểm tra</p>
          <p className="mt-1 text-sm text-[#5f6472]">{submission.riskFlags.length ? submission.riskFlags.join(", ") : "Không có cảnh báo."}</p>
        </div>
      </section>
      <ReviewActions submissionId={submission.id} />
      </div>
    </div>
  );
}
