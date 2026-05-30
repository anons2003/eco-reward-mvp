import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/eco-ui";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const submissions = ecoRewardService.listSubmissions(params.status);

  return (
    <div>
      <PageHeader
        eyebrow="Moderation"
        title="Danh sách lượt gửi"
        body="Lọc, xem và xử lý các lượt gửi của người dùng."
        action={
        <div className="flex gap-2">
          <Link className="btn-secondary" href="/admin/submissions">
            Tất cả
          </Link>
          <Link className="btn-secondary" href="/admin/submissions?status=pending_review">
            Chờ duyệt
          </Link>
        </div>
        }
      />
      <section className="eco-card overflow-hidden rounded-[28px]">
        <div className="grid grid-cols-[1fr_160px_140px] gap-4 border-b border-[#e6e7ef] px-5 py-3 text-sm font-bold text-[#5f6472]">
          <span>Lượt gửi</span>
          <span>Điểm</span>
          <span>Trạng thái</span>
        </div>
        {submissions.map((submission) => (
          <Link className="grid grid-cols-[1fr_160px_140px] gap-4 border-b border-[#e6e7ef] bg-white px-5 py-4 transition hover:bg-[#151515] last:border-b-0" href={`/admin/submissions/${submission.id}`} key={submission.id}>
            <span>
              <strong>{submission.aiResult.wasteType.replaceAll("_", " ")}</strong>
              <span className="block text-sm text-[#5f6472]">{submission.reason}</span>
            </span>
            <span className="font-black text-[#151515]">+{submission.points}</span>
            <StatusBadge status={submission.status} />
          </Link>
        ))}
      </section>
    </div>
  );
}
