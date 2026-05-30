import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const submissions = ecoRewardService.listSubmissions(params.status);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Danh sách lượt gửi</h1>
          <p className="mt-1 text-[#3f4850]">Lọc, xem và xử lý các lượt gửi của người dùng.</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn-secondary" href="/admin/submissions">
            Tất cả
          </Link>
          <Link className="btn-secondary" href="/admin/submissions?status=pending_review">
            Chờ duyệt
          </Link>
        </div>
      </div>
      <section className="surface overflow-hidden rounded-2xl">
        <div className="grid grid-cols-[1fr_160px_140px] gap-4 border-b border-[#d7dcdf] px-5 py-3 text-sm font-bold text-[#3f4850]">
          <span>Lượt gửi</span>
          <span>Điểm</span>
          <span>Trạng thái</span>
        </div>
        {submissions.map((submission) => (
          <Link className="grid grid-cols-[1fr_160px_140px] gap-4 border-b border-[#eef1f2] bg-white px-5 py-4 last:border-b-0" href={`/admin/submissions/${submission.id}`} key={submission.id}>
            <span>
              <strong>{submission.aiResult.wasteType.replaceAll("_", " ")}</strong>
              <span className="block text-sm text-[#3f4850]">{submission.reason}</span>
            </span>
            <span className="font-black text-[#219653]">+{submission.points}</span>
            <StatusBadge status={submission.status} />
          </Link>
        ))}
      </section>
    </div>
  );
}
