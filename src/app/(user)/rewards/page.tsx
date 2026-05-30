import { Gift, Leaf, Lock, Ticket } from "lucide-react";
import { PageHeader } from "@/components/shared/eco-ui";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default function RewardsPage() {
  const user = ecoRewardService.getDemoUser("user");
  const rewards = ecoRewardService.listRewards();

  return (
    <div>
      <PageHeader eyebrow="Đổi thưởng" title="Phần thưởng xanh" body={`Bạn đang có ${user.points} điểm xanh. Chọn phần thưởng phù hợp để demo luồng redemption.`} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => {
          const canRedeem = user.points >= reward.pointsRequired;
          return (
            <article className="eco-card rounded-[28px] p-6" key={reward.id}>
              <div className="flex items-start justify-between gap-4">
                <span className={canRedeem ? "grid size-14 place-items-center rounded-2xl bg-[#f4f5fb] text-[#151515]" : "grid size-14 place-items-center rounded-2xl bg-white text-[#9ca3af]"}>
                  {canRedeem ? <Ticket size={28} /> : <Lock size={26} />}
                </span>
                <span className="rounded-full bg-[#e8fbff] px-3 py-1 text-sm font-black text-[#166534]">{reward.pointsRequired} điểm</span>
              </div>
              <h2 className="mt-6 text-2xl font-black text-[#151515]">{reward.title}</h2>
              <p className="mt-3 min-h-14 leading-7 text-[#5f6472]">{reward.description}</p>
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4">
                <div className="flex items-center gap-2">
                  <Leaf size={18} className="text-[#151515]" />
                  <span className="text-sm font-bold text-[#5f6472]">Còn hàng demo</span>
                </div>
                <Gift size={18} className="text-[#166534]" />
              </div>
              <button className={canRedeem ? "btn-primary mt-5 w-full" : "btn-secondary mt-5 w-full"} type="button">
                {canRedeem ? "Đổi ngay" : "Chưa đủ điểm"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
