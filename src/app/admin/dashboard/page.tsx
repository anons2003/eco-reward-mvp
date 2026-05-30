import Link from "next/link";
import { BarChart3, CheckCircle2, Clock3, Coins, type LucideIcon, XCircle } from "lucide-react";
import { ecoRewardService } from "@/application/services/eco-reward-service";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/eco-ui";

export default function AdminDashboardPage() {
  const stats = ecoRewardService.getDashboardStats();
  const latest = ecoRewardService.listSubmissions().slice(0, 5);
  const cards: Array<[string, number, LucideIcon]> = [
    ["Tổng lượt gửi", stats.totalSubmissions, BarChart3],
    ["Chờ duyệt", stats.pending, Clock3],
    ["Đã duyệt", stats.approved, CheckCircle2],
    ["Từ chối", stats.rejected, XCircle],
    ["Điểm đã cấp", stats.pointsIssued, Coins],
  ];

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Dashboard tổng quan" body="Theo dõi lượt gửi, trạng thái duyệt và tổng điểm đã cấp cho chiến dịch." />
      <div className="grid gap-4 md:grid-cols-5">
        {cards.map(([label, value, Icon]) => (
          <div className="eco-card rounded-2xl p-4" key={label as string}>
            <Icon className="text-[#151515]" />
            <p className="mt-3 text-2xl font-black">{value as number}</p>
            <p className="text-sm font-bold text-[#5f6472]">{label as string}</p>
          </div>
        ))}
      </div>
      <section className="eco-card mt-6 rounded-[28px] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Lượt gửi mới</h2>
          <Link className="font-bold text-[#166534]" href="/admin/submissions">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {latest.map((submission) => (
            <Link className="flex items-center justify-between rounded-2xl border border-[#e6e7ef] bg-white p-4 transition hover:border-[#151515]" href={`/admin/submissions/${submission.id}`} key={submission.id}>
              <div>
                <p className="font-bold">{submission.aiResult.wasteType.replaceAll("_", " ")}</p>
                <p className="text-sm text-[#5f6472]">{submission.reason}</p>
              </div>
              <StatusBadge status={submission.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
