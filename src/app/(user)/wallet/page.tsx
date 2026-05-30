import { StatusBadge } from "@/components/shared/status-badge";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default function WalletPage() {
  const user = ecoRewardService.getDemoUser("user");
  const transactions = ecoRewardService.listPointTransactions(user.id);
  const submissions = ecoRewardService.listUserSubmissions(user.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <section className="surface rounded-2xl p-6">
        <p className="text-sm font-bold uppercase text-[#006492]">Ví điểm</p>
        <h1 className="mt-2 text-5xl font-black">{user.points}</h1>
        <p className="mt-2 text-[#3f4850]">Điểm khả dụng để đổi thưởng.</p>
      </section>
      <section className="surface rounded-2xl p-6">
        <h2 className="text-xl font-black">Lịch sử lượt gửi</h2>
        <div className="mt-4 grid gap-3">
          {submissions.map((submission) => (
            <div className="flex items-center justify-between rounded-xl border border-[#d7dcdf] bg-white p-4" key={submission.id}>
              <div>
                <p className="font-bold">{submission.aiResult.wasteType.replaceAll("_", " ")}</p>
                <p className="text-sm text-[#3f4850]">{new Date(submission.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              <StatusBadge status={submission.status} />
            </div>
          ))}
        </div>
      </section>
      <section className="surface rounded-2xl p-6 lg:col-span-2">
        <h2 className="text-xl font-black">Biến động điểm</h2>
        <div className="mt-4 grid gap-3">
          {transactions.map((transaction) => (
            <div className="flex items-center justify-between rounded-xl bg-white p-4" key={transaction.id}>
              <p className="font-bold">{transaction.reason}</p>
              <p className="text-xl font-black text-[#219653]">+{transaction.points}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
