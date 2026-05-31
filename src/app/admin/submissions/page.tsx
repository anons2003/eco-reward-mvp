import Link from "next/link";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/eco-ui";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const submissions = ecoRewardService.listSubmissions(params.status);
  const pendingCount = ecoRewardService.listSubmissions("pending_review").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Kiểm duyệt"
        title="Danh sách lượt gửi"
        body="Lọc, xem và xử lý các lượt gửi của người dùng."
        action={
          <div className="flex gap-2">
            <Link className="btn-secondary" href="/admin/submissions">
              Tất cả
            </Link>
            <Link className="btn-primary" href="/admin/submissions?status=pending_review">
              Chờ duyệt: {pendingCount}
            </Link>
          </div>
        }
      />

      <section className="eco-card rounded-[28px] p-4">
        <div className="flex flex-col gap-3 border-b border-[#d9e5da] pb-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a70]" size={17} />
            <input className="h-11 w-full rounded-full border border-[#d9e5da] bg-white px-4 pl-10 text-sm font-bold text-[#071b12] outline-none placeholder:text-[#6e7a70] focus:border-[#007a3d]" placeholder="Tìm theo loại rác, lý do, trạng thái..." type="search" />
          </div>
          <div className="flex gap-2">
            <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#edf6ed] px-4 text-sm font-black text-[#3e4941]" type="button">
              <Filter size={16} />
              Bộ lọc
            </button>
            <button className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#071b12] ring-1 ring-[#d9e5da]" type="button">
              <SlidersHorizontal size={16} />
              Sắp xếp
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-[#d9e5da] bg-white">
          <div className="hidden grid-cols-[1fr_140px_150px_140px] gap-4 border-b border-[#d9e5da] bg-[#f7fbf7] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#5d6a60] md:grid">
            <span>Lượt gửi</span>
            <span>Điểm</span>
            <span>Rủi ro</span>
            <span>Trạng thái</span>
          </div>
          {submissions.map((submission) => (
            <Link className="grid gap-3 border-b border-[#d9e5da] bg-white px-5 py-4 transition hover:bg-[#f3fcf3] last:border-b-0 md:grid-cols-[1fr_140px_150px_140px] md:items-center" href={`/admin/submissions/${submission.id}`} key={submission.id}>
              <span className="min-w-0">
                <strong className="block truncate text-[#071b12]">{submission.aiResult.wasteType.replaceAll("_", " ")}</strong>
                <span className="mt-1 block truncate text-sm font-semibold text-[#5d6a60]">{submission.reason}</span>
              </span>
              <span className="font-black text-[#071b12]">+{submission.points} pts</span>
              <span className="w-fit rounded-full bg-[#fff7e6] px-3 py-1 text-xs font-black text-[#92400E]">Cần kiểm tra</span>
              <StatusBadge status={submission.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
