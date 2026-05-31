import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Coins, Filter, Gift, Leaf, Recycle, ShoppingBag, Sparkles, TreePine, XCircle, type LucideIcon } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ecoRewardService } from "@/application/services/eco-reward-service";
import type { Submission, SubmissionStatus } from "@/core/entities/types";

const redemptionRows = [
  {
    id: "redeem-canvas-bag",
    title: "Đổi túi vải Canvas Eco",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    points: -120,
    category: "Cửa hàng",
  },
  {
    id: "redeem-tree-fund",
    title: "Quyên góp quỹ Trồng Rừng",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    points: -80,
    category: "Cộng đồng",
  },
];

function statusTone(status: SubmissionStatus) {
  if (status === "approved") return { label: "Hoàn thành", Icon: CheckCircle2, className: "bg-[#d8f5df] text-[#007a3d]" };
  if (status === "pending_review") return { label: "Đang xử lý", Icon: Clock3, className: "bg-[#fff7e6] text-[#92400E]" };
  return { label: "Từ chối", Icon: XCircle, className: "bg-[#ffdad6] text-[#93000a]" };
}

export default function HistoryPage() {
  const user = ecoRewardService.getDemoUser("user");
  const submissions = ecoRewardService.listUserSubmissions(user.id);
  const approved = submissions.filter((submission) => submission.status === "approved");
  const pending = submissions.filter((submission) => submission.status === "pending_review");
  const pointsEarned = approved.reduce((total, submission) => total + submission.points, 0);
  const pointsSpent = redemptionRows.reduce((total, row) => total + Math.abs(row.points), 0);
  const allRows = [
    ...submissions.map((submission) => ({ kind: "submission" as const, createdAt: submission.createdAt, submission })),
    ...redemptionRows.map((redemption) => ({ kind: "redemption" as const, createdAt: redemption.createdAt, redemption })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#007a3d]">Lịch sử</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#093719] md:text-5xl">Lịch sử hoạt động</h1>
          <p className="mt-2 max-w-2xl font-semibold leading-7 text-[#5d6a60]">Theo dõi các lượt phân loại, điểm nhận và giao dịch đổi thưởng gần đây.</p>
        </div>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 font-black text-[#151d18] ring-1 ring-[#d9e5da] transition hover:bg-[#edf6ed]" type="button">
          <CalendarDays size={18} />
          Tháng này
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Recycle} label="Lượt phân loại" value={submissions.length.toString()} note={`${approved.length} lượt đã hoàn thành`} />
        <SummaryCard icon={Coins} label="Điểm đã nhận" value={`+${pointsEarned}`} note={`${pending.length} lượt đang chờ duyệt`} />
        <SummaryCard icon={Gift} label="Điểm đã đổi" value={`-${pointsSpent}`} note={`${redemptionRows.length} giao dịch đổi thưởng`} />
      </section>

      <section className="rounded-[30px] border border-[#d9e5da] bg-white/84 p-4 shadow-[0_12px_40px_rgba(21,29,24,0.05)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 overflow-x-auto rounded-full bg-[#edf6ed] p-1">
            {["Tất cả", "Đã nhận", "Đã đổi"].map((tab, index) => (
              <button className={`min-h-10 shrink-0 rounded-full px-5 text-sm font-black transition ${index === 0 ? "bg-white text-[#007a3d] shadow-sm" : "text-[#3e4941] hover:bg-white/60"}`} key={tab} type="button">
                {tab}
              </button>
            ))}
          </div>
          <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#151d18] ring-1 ring-[#d9e5da]" type="button">
            <Filter size={16} />
            Bộ lọc
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {allRows.map((row) =>
            row.kind === "submission" ? <SubmissionActivity key={row.submission.id} submission={row.submission} /> : <RedemptionActivity key={row.redemption.id} redemption={row.redemption} />,
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-2 rounded-full bg-[#edf6ed] px-5 py-3 text-sm font-black text-[#007a3d] transition hover:bg-[#d8f5df]" type="button">
            Xem tất cả giao dịch
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section className="relative min-h-48 overflow-hidden rounded-[32px] bg-[#007a3d] p-7 text-white shadow-[0_18px_44px_rgba(0,106,61,0.16)]">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#8ff8b6]">Tác động của bạn</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Bạn đã giúp giảm 45kg CO2 trong tháng này.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/78">Mỗi lượt phân loại đúng giúp hệ thống ghi nhận tác động môi trường và cộng tiến độ xanh cho tài khoản.</p>
        </div>
        <TreePine className="absolute -bottom-10 right-8 text-white/18" size={180} />
        <div className="absolute -right-16 -top-16 size-72 rounded-full bg-white/10 blur-3xl" />
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, note }: { icon: LucideIcon; label: string; value: string; note: string }) {
  return (
    <div className="rounded-[28px] border border-[#d9e5da] bg-white/84 p-5 shadow-[0_12px_40px_rgba(21,29,24,0.05)]">
      <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
        <Icon size={22} />
      </span>
      <p className="mt-4 text-sm font-bold text-[#5d6a60]">{label}</p>
      <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#151d18]">{value}</p>
      <p className="mt-2 text-xs font-bold text-[#6e7a70]">{note}</p>
    </div>
  );
}

function SubmissionActivity({ submission }: { submission: Submission }) {
  const tone = statusTone(submission.status);
  const Icon = tone.Icon;
  const wasteType = submission.aiResult.wasteType.replaceAll("_", " ");

  return (
    <Link className="group flex items-center gap-4 rounded-[24px] border border-[#d9e5da] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#007a3d] hover:shadow-[0_10px_24px_rgba(0,106,61,0.10)]" href={`/result/${submission.id}`}>
      <span className={`grid size-14 shrink-0 place-items-center rounded-full ${tone.className}`}>
        <Icon size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-3">
          <strong className="truncate text-base font-black text-[#151d18]">Phân loại {wasteType}</strong>
          <span className="shrink-0 text-base font-black text-[#007a3d]">+{submission.points} pts</span>
        </span>
        <span className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#5d6a60]">{new Date(submission.createdAt).toLocaleString("vi-VN")}</span>
          <StatusBadge status={submission.status} />
        </span>
      </span>
    </Link>
  );
}

function RedemptionActivity({ redemption }: { redemption: (typeof redemptionRows)[number] }) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-[#d9e5da] bg-white p-4">
      <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#cbe6ff] text-[#006496]">
        <ShoppingBag size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <strong className="truncate text-base font-black text-[#151d18]">{redemption.title}</strong>
          <span className="shrink-0 text-base font-black text-[#ba1a1a]">{redemption.points} pts</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#5d6a60]">{new Date(redemption.createdAt).toLocaleString("vi-VN")}</span>
          <span className="rounded-full bg-[#cbe6ff] px-3 py-1 text-xs font-black text-[#00517b]">Đã đổi</span>
        </div>
      </div>
    </div>
  );
}
