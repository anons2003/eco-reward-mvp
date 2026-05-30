import { Gift } from "lucide-react";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default function RewardsPage() {
  const user = ecoRewardService.getDemoUser("user");
  const rewards = ecoRewardService.listRewards();

  return (
    <div>
      <h1 className="mb-2 text-3xl font-black">Đổi thưởng</h1>
      <p className="mb-6 text-[#3f4850]">Bạn đang có {user.points} điểm xanh.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {rewards.map((reward) => (
          <article className="surface rounded-2xl p-6" key={reward.id}>
            <Gift className="text-[#006492]" />
            <h2 className="mt-4 text-xl font-black">{reward.title}</h2>
            <p className="mt-2 text-[#3f4850]">{reward.description}</p>
            <div className="mt-6 flex items-center justify-between">
              <p className="font-black">{reward.pointsRequired} điểm</p>
              <button className={user.points >= reward.pointsRequired ? "btn-primary" : "btn-secondary"} type="button">
                {user.points >= reward.pointsRequired ? "Đổi ngay" : "Chưa đủ điểm"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
