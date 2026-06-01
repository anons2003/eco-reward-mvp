import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Leaf, Share2, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { RewardRedeemButton } from "@/components/user/reward-redeem-button";
import { getSupabaseServerClient, getUserShell } from "@/infrastructure/auth/session";
import type { Database } from "@/infrastructure/supabase/database.types";

type RewardRow = Database["public"]["Tables"]["reward_items"]["Row"];

export default async function RewardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { points } = await getUserShell();
  const supabase = await getSupabaseServerClient();
  const { data: item } = await supabase
    .from("reward_items")
    .select("id,title,description,points_required,stock,active,category,partner,image_url,expires_at,created_at")
    .eq("id", id)
    .eq("active", true)
    .single();

  if (!item) notFound();

  const reward = item as RewardRow;
  const afterRedeem = Math.max(points - reward.points_required, 0);
  const canRedeem = points >= reward.points_required && reward.stock > 0;
  const expires = reward.expires_at ? new Date(reward.expires_at).toLocaleDateString("vi-VN") : "Theo thông báo chương trình";

  const conditions = [
    "Mỗi lần đổi tạo một giao dịch trong lịch sử ví điểm.",
    "MVP phát hành trạng thái issued, chưa tích hợp mã voucher thật.",
    "Không áp dụng quy đổi thành tiền mặt hoặc dịch vụ khác.",
    `Thời hạn nhận quà: ${expires}. Số lượng còn lại: ${reward.stock.toLocaleString("vi-VN")}.`,
  ];

  return (
    <>
      <section className="flex items-center justify-between gap-4">
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#006a3d] ring-1 ring-[#bdcabe] transition hover:bg-[#edf6ed]" href="/rewards">
          <ArrowLeft size={18} />
          Quay lại
        </Link>
        <button className="grid size-11 place-items-center rounded-full bg-white text-[#3e4941] ring-1 ring-[#bdcabe] transition hover:bg-[#edf6ed]" type="button" aria-label="Chia sẻ">
          <Share2 size={18} />
        </button>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-[#d8f5df] shadow-[0_18px_42px_rgba(21,29,24,0.12)] md:min-h-[520px]">
            {reward.image_url ? <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${reward.image_url})` }} /> : null}
            <div className={`absolute inset-0 ${reward.image_url ? "opacity-25" : ""} bg-[radial-gradient(circle_at_35%_30%,rgba(46,204,113,0.30),transparent_32%),linear-gradient(135deg,#d8f5df,#e3f2ff)]`} />
            <Leaf className="absolute bottom-8 right-8 text-[#007a3d]/20" size={210} strokeWidth={1.2} />
            <div className="absolute left-4 top-4 rounded-full bg-[#09864f] px-3 py-1.5 text-[11px] font-black uppercase text-white shadow-sm">{reward.category}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-[#bdcabe] bg-white p-4 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
              <Sparkles className="text-[#006a3d]" size={20} />
              <p className="mt-3 text-sm font-black text-[#151d18]">{reward.partner}</p>
              <p className="mt-1 text-xs font-semibold text-[#3e4941]">Đối tác chương trình</p>
            </div>
            <div className="rounded-3xl border border-[#bdcabe] bg-[#e3f2ff] p-4 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
              <Leaf className="text-[#006496]" size={20} />
              <p className="mt-3 text-sm font-black text-[#151d18]">{reward.stock.toLocaleString("vi-VN")} còn lại</p>
              <p className="mt-1 text-xs font-semibold text-[#3e4941]">Tồn kho khả dụng</p>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#d8f5df] px-3 py-1 text-[11px] font-black uppercase text-[#006a3d]">Đang mở</span>
            <span className="rounded-full bg-[#e3f2ff] px-3 py-1 text-[11px] font-black uppercase text-[#006496]">{reward.partner}</span>
            <span className="rounded-full bg-[#fff3c4] px-3 py-1 text-[11px] font-black uppercase text-[#755b00]">Còn lại: {reward.stock.toLocaleString("vi-VN")}</span>
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-[-0.05em] text-[#151d18] md:text-5xl">{reward.title}</h1>
            <p className="mt-3 inline-flex items-center gap-2 text-lg font-black text-[#006a3d]">
              <WalletCards size={20} />
              {reward.points_required.toLocaleString("vi-VN")} pts
            </p>
          </div>

          <section>
            <h2 className="text-base font-black text-[#151d18]">Mô tả sản phẩm</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#3e4941]">{reward.description}</p>
          </section>

          <section className="rounded-3xl border border-[#bdcabe] bg-white p-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
            <h2 className="text-base font-black text-[#151d18]">Điều khoản và điều kiện</h2>
            <div className="mt-4 space-y-3">
              {conditions.map((condition) => (
                <div className="flex gap-3" key={condition}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#09864f]" size={18} />
                  <p className="text-sm font-semibold leading-6 text-[#3e4941]">{condition}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#bdcabe] bg-white p-5 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
            <div className="flex items-center justify-between text-sm font-semibold text-[#3e4941]">
              <span>Điểm hiện tại</span>
              <span>Sau khi đổi</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-lg font-black text-[#151d18]">
              <span>{points.toLocaleString("vi-VN")} pts</span>
              <span>{afterRedeem.toLocaleString("vi-VN")} pts</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7f0e7]">
              <div className="h-full rounded-full bg-[#09864f]" style={{ width: `${Math.min((afterRedeem / Math.max(points, 1)) * 100, 100)}%` }} />
            </div>
            <RewardRedeemButton rewardId={reward.id} canRedeem={canRedeem} />
          </section>

          <div className="rounded-3xl bg-[#fff3c4] p-4 text-sm font-semibold leading-6 text-[#3e4941]">
            <ShieldCheck className="mb-2 text-[#755b00]" size={20} />
            Sau khi đổi, hệ thống trừ điểm, giảm tồn kho và ghi giao dịch vào lịch sử ví điểm của bạn.
          </div>
        </aside>
      </section>
    </>
  );
}
