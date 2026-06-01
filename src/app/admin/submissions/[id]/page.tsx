import { notFound } from "next/navigation";
import { ReviewActions } from "@/components/admin/review-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { seaTechService } from "@/application/services/seatech-service";
import { PageHeader } from "@/components/shared/eco-ui";

export default async function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = seaTechService.getSubmission(id);
  if (!submission) notFound();
  const bin = seaTechService.listBins().find((row) => row.id === submission.binId);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Chi tiết kiểm duyệt" title="Chi tiết lượt gửi" body="Xem kết quả nhận diện, thùng rác, điểm và cảnh báo trước khi duyệt." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="eco-card rounded-[28px] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#007a3d]">Kết quả nhận diện</p>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#071b12]">{submission.aiResult.wasteType.replaceAll("_", " ")}</h1>
            </div>
            <StatusBadge status={submission.status} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#d9e5da] bg-white p-4">
              <p className="text-sm font-bold text-[#5d6a60]">Độ tin cậy</p>
              <p className="text-2xl font-black text-[#071b12]">{Math.round(submission.aiResult.confidence * 100)}%</p>
            </div>
            <div className="rounded-2xl border border-[#d9e5da] bg-white p-4">
              <p className="text-sm font-bold text-[#5d6a60]">Thùng rác</p>
              <p className="font-black text-[#071b12]">{bin?.name ?? "Không rõ"}</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-[#d9e5da] bg-white p-4">
            <p className="font-black text-[#071b12]">Lý do hiện tại</p>
            <p className="mt-1 font-semibold text-[#5d6a60]">{submission.reason}</p>
          </div>
          <div className="mt-6 rounded-2xl bg-[#fff7e6] p-4">
            <p className="font-black text-[#92400E]">Cảnh báo cần kiểm tra</p>
            <p className="mt-1 text-sm font-semibold text-[#5d6a60]">{submission.riskFlags.length ? submission.riskFlags.join(", ") : "Không có cảnh báo."}</p>
          </div>
        </section>
        <ReviewActions submissionId={submission.id} />
      </div>
    </div>
  );
}
