import Link from "next/link";
import { AlertTriangle, ArrowRight, BarChart3, CheckCircle2, Clock3, Coins, type LucideIcon, RadioTower, ShieldCheck, XCircle } from "lucide-react";
import { ecoRewardService } from "@/application/services/eco-reward-service";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/eco-ui";

export default function AdminDashboardPage() {
  const stats = ecoRewardService.getDashboardStats();
  const latest = ecoRewardService.listSubmissions().slice(0, 5);
  const approvalRate = Math.round((stats.approved / Math.max(stats.totalSubmissions, 1)) * 100);
  const cards: Array<[string, number | string, LucideIcon, string]> = [
    ["Tổng lượt gửi", stats.totalSubmissions, BarChart3, "Tất cả phiên đã tạo"],
    ["Chờ duyệt", stats.pending, Clock3, "Cần xử lý trong ngày"],
    ["Đã duyệt", stats.approved, CheckCircle2, `${approvalRate}% tỉ lệ duyệt`],
    ["Từ chối", stats.rejected, XCircle, "Theo dõi gian lận"],
    ["Điểm đã cấp", stats.pointsIssued, Coins, "Tổng ngân sách điểm"],
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Quản trị" title="Tổng quan vận hành" body="Theo dõi lượt gửi, trạng thái duyệt và tổng điểm đã cấp cho chiến dịch." />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[28px] bg-[#071b12] p-6 text-white shadow-[0_22px_70px_rgba(7,27,18,0.22)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ff8b6]">Queue health</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">Hàng chờ đang ổn định</h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/68">Ưu tiên các lượt chờ duyệt, sau đó kiểm tra những submission bị từ chối hoặc có điểm bất thường.</p>
            </div>
            <span className="grid size-12 place-items-center rounded-2xl bg-[#8ff8b6] text-[#071b12]">
              <RadioTower size={24} />
            </span>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              ["Pending", stats.pending, "#fff3c4"],
              ["Approval", `${approvalRate}%`, "#8ff8b6"],
              ["Issued", stats.pointsIssued, "#cbe6ff"],
            ].map(([label, value, color]) => (
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4" key={label}>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-white/48">{label}</p>
                <p className="mt-2 text-3xl font-black tracking-[-0.04em]" style={{ color: color as string }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="eco-card rounded-[24px] p-5">
            <ShieldCheck className="text-[#007a3d]" size={24} />
            <p className="mt-4 text-xl font-black text-[#071b12]">Luồng duyệt rõ ràng</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#5d6a60]">Mỗi lượt gửi có trạng thái, lý do AI và điểm riêng để admin quét nhanh.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 font-black text-white shadow-[0_12px_30px_rgba(0,106,61,0.18)] transition hover:bg-[#006a35]" href="/admin/submissions">
            Xử lý lượt gửi
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-5">
        {cards.map(([label, value, Icon, note]) => (
          <div className="eco-card rounded-[22px] p-4" key={label as string}>
            <Icon className="text-[#007a3d]" />
            <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#071b12]">{value}</p>
            <p className="text-sm font-bold text-[#5d6a60]">{label as string}</p>
            <p className="mt-2 text-xs font-semibold text-[#6e7a70]">{note}</p>
          </div>
        ))}
      </div>

      <section className="eco-card rounded-[28px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-[#071b12]">Lượt gửi mới</h2>
            <p className="mt-1 text-sm font-semibold text-[#5d6a60]">5 submission gần nhất trong hàng vận hành</p>
          </div>
          <Link className="inline-flex items-center gap-1 text-sm font-black text-[#007a3d]" href="/admin/submissions">
            Xem tất cả
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#d9e5da] bg-white">
          {latest.map((submission) => (
            <Link className="grid gap-3 border-b border-[#d9e5da] px-4 py-4 transition hover:bg-[#f3fcf3] last:border-b-0 md:grid-cols-[1fr_120px_140px] md:items-center" href={`/admin/submissions/${submission.id}`} key={submission.id}>
              <div className="min-w-0">
                <p className="truncate font-black text-[#071b12]">{submission.aiResult.wasteType.replaceAll("_", " ")}</p>
                <p className="mt-1 line-clamp-1 text-sm font-semibold text-[#5d6a60]">{submission.reason}</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-black text-[#071b12]">
                <AlertTriangle className="text-[#f0a100]" size={16} />
                +{submission.points} pts
              </span>
              <StatusBadge status={submission.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
