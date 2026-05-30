import Link from "next/link";
import { ArrowRight, Coins, Gift, History, Recycle, WalletCards } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/eco-ui";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default function WalletPage() {
  const user = ecoRewardService.getDemoUser("user");
  const transactions = ecoRewardService.listPointTransactions(user.id);
  const submissions = ecoRewardService.listUserSubmissions(user.id);

  return (
    <div>
      <PageHeader
        eyebrow="Ví điểm"
        title="Điểm xanh của bạn"
        body="Theo dõi điểm khả dụng, lịch sử cộng điểm và trạng thái các lượt gửi."
        action={
          <Link className="btn-primary" href="/rewards">
            <Gift size={18} />
            Đổi thưởng
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-[28px] bg-[#ffffff] p-7 text-[#151515]">
          <WalletCards className="text-[#151515]" size={32} />
          <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#151515]/60">Điểm khả dụng</p>
          <h2 className="mt-2 text-6xl font-black">{user.points}</h2>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/16">
            <div className="h-full w-[68%] rounded-full bg-[#A3E635]" />
          </div>
          <p className="mt-3 text-sm font-bold text-[#151515]/72">Còn 80 điểm để đạt mốc quà tiếp theo.</p>
        </section>

        <section className="eco-card rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#151515]">Lịch sử lượt gửi</h2>
            <Link className="inline-flex items-center gap-1 font-black text-[#151515]" href="/history">
              Xem đủ
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {submissions.map((submission) => (
              <Link className="flex items-center justify-between gap-4 rounded-2xl border border-[#e6e7ef] bg-white p-4 transition hover:border-[#151515]" href={`/result/${submission.id}`} key={submission.id}>
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f4f5fb] text-[#151515]">
                    <Recycle size={20} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-black">{submission.aiResult.wasteType.replaceAll("_", " ")}</p>
                    <p className="text-sm text-[#5f6472]">{new Date(submission.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
                <StatusBadge status={submission.status} />
              </Link>
            ))}
          </div>
        </section>

        <section className="eco-card rounded-[28px] p-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-[#e8fbff] text-[#166534]">
              <History size={20} />
            </span>
            <h2 className="text-xl font-black text-[#151515]">Biến động điểm</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {transactions.map((transaction) => (
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4" key={transaction.id}>
                <div>
                  <p className="font-black">{transaction.reason}</p>
                  <p className="mt-1 text-sm text-[#5f6472]">{new Date(transaction.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <p className="inline-flex items-center gap-1 text-xl font-black text-[#151515]">
                  <Coins size={18} />+{transaction.points}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
