import Link from "next/link";
import { BarChart3, CheckCircle2, Clock3, Coins, type LucideIcon, XCircle } from "lucide-react";
import { ecoRewardService } from "@/application/services/eco-reward-service";
import { StatusBadge } from "@/components/shared/status-badge";

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
      <h1 className="mb-6 text-3xl font-black">Dashboard tổng quan</h1>
      <div className="grid gap-4 md:grid-cols-5">
        {cards.map(([label, value, Icon]) => (
          <div className="surface rounded-2xl p-4" key={label as string}>
            <Icon className="text-[#006492]" />
            <p className="mt-3 text-2xl font-black">{value as number}</p>
            <p className="text-sm text-[#3f4850]">{label as string}</p>
          </div>
        ))}
      </div>
      <section className="surface mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">Lượt gửi mới</h2>
          <Link className="font-bold text-[#006492]" href="/admin/submissions">
            Xem tất cả
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {latest.map((submission) => (
            <Link className="flex items-center justify-between rounded-xl border border-[#d7dcdf] bg-white p-4" href={`/admin/submissions/${submission.id}`} key={submission.id}>
              <div>
                <p className="font-bold">{submission.aiResult.wasteType.replaceAll("_", " ")}</p>
                <p className="text-sm text-[#3f4850]">{submission.reason}</p>
              </div>
              <StatusBadge status={submission.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
