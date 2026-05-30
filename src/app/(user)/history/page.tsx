import Link from "next/link";
import { Filter, Recycle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/eco-ui";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default function HistoryPage() {
  const user = ecoRewardService.getDemoUser("user");
  const submissions = ecoRewardService.listUserSubmissions(user.id);

  return (
    <div>
      <PageHeader
        eyebrow="Lịch sử"
        title="Lịch sử hoạt động"
        body="Các lượt phân loại rác gần đây, trạng thái duyệt và điểm tương ứng."
        action={
          <button className="btn-secondary" type="button">
            <Filter size={18} />
            Bộ lọc
          </button>
        }
      />
      <section className="eco-card overflow-hidden rounded-[28px]">
        <div className="hidden grid-cols-[1fr_160px_160px] border-b border-[#e6e7ef] px-5 py-3 text-sm font-black text-[#5f6472] md:grid">
          <span>Lượt gửi</span>
          <span>Điểm</span>
          <span>Trạng thái</span>
        </div>
        {submissions.map((submission) => (
          <Link className="grid gap-3 border-b border-[#e6e7ef] bg-white px-5 py-4 last:border-b-0 md:grid-cols-[1fr_160px_160px] md:items-center" href={`/result/${submission.id}`} key={submission.id}>
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f4f5fb] text-[#151515]">
                <Recycle size={20} />
              </span>
              <span className="min-w-0">
                <strong className="block truncate">{submission.aiResult.wasteType.replaceAll("_", " ")}</strong>
                <span className="block text-sm text-[#5f6472]">{new Date(submission.createdAt).toLocaleString("vi-VN")}</span>
              </span>
            </span>
            <span className="font-black text-[#151515]">+{submission.points}</span>
            <StatusBadge status={submission.status} />
          </Link>
        ))}
      </section>
    </div>
  );
}
