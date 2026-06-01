import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Leaf, PackageCheck, Share2, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { seaTechService } from "@/application/services/seatech-service";
import { rewardCatalog } from "@/components/user/rewards-catalog";

export default async function RewardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = rewardCatalog.find((reward) => reward.id === id);
  if (!item) notFound();

  const user = seaTechService.getDemoUser("user");
  const afterRedeem = Math.max(user.points - item.points, 0);
  const canRedeem = user.points >= item.points;

  const conditions = [
    "Mỗi tài khoản được đổi tối đa 02 phần thưởng trong chương trình.",
    "Phần thưởng được xác nhận trong ví điểm sau khi quy đổi thành công.",
    "Không áp dụng quy đổi thành tiền mặt hoặc dịch vụ khác.",
    "Thời hạn nhận quà theo từng chương trình và số lượng còn lại.",
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
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
            <div className="absolute left-4 top-4 rounded-full bg-[#09864f] px-3 py-1.5 text-[11px] font-black uppercase text-white shadow-sm">
              {item.category === "Quà tặng" ? "SeaTech choice" : item.category}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-[#bdcabe] bg-white p-4 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
              <Sparkles className="text-[#006a3d]" size={20} />
              <p className="mt-3 text-sm font-black text-[#151d18]">100% Organic</p>
              <p className="mt-1 text-xs font-semibold text-[#3e4941]">Sản phẩm tự nhiên</p>
            </div>
            <div className="rounded-3xl border border-[#bdcabe] bg-[#e3f2ff] p-4 shadow-[0_2px_8px_rgba(21,29,24,0.05)]">
              <Leaf className="text-[#006496]" size={20} />
              <p className="mt-3 text-sm font-black text-[#151d18]">-2kg CO2</p>
              <p className="mt-1 text-xs font-semibold text-[#3e4941]">Giảm thải nhựa</p>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[#d8f5df] px-3 py-1 text-[11px] font-black uppercase text-[#006a3d]">Cực hot</span>
            <span className="rounded-full bg-[#e3f2ff] px-3 py-1 text-[11px] font-black uppercase text-[#006496]">SeaTech shop exclusive</span>
            <span className="rounded-full bg-[#fff3c4] px-3 py-1 text-[11px] font-black uppercase text-[#755b00]">Còn lại: {item.stock}</span>
          </div>

          <div>
            <h1 className="text-4xl font-black tracking-[-0.05em] text-[#151d18] md:text-5xl">{item.title}</h1>
            <p className="mt-3 inline-flex items-center gap-2 text-lg font-black text-[#006a3d]">
              <WalletCards size={20} />
              {item.points.toLocaleString("vi-VN")} pts
            </p>
          </div>

          <section>
            <h2 className="text-base font-black text-[#151d18]">Mô tả sản phẩm</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-[#3e4941]">{item.description} {item.impact}</p>
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
              <span>{user.points.toLocaleString("vi-VN")} pts</span>
              <span>{afterRedeem.toLocaleString("vi-VN")} pts</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e7f0e7]">
              <div className="h-full rounded-full bg-[#09864f]" style={{ width: `${Math.min((afterRedeem / Math.max(user.points, 1)) * 100, 100)}%` }} />
            </div>
            <button
              className={`mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition ${
                canRedeem ? "bg-[#007a3d] text-white hover:bg-[#006a3d]" : "bg-[#e7f0e7] text-[#3e4941]"
              }`}
              type="button"
            >
              {canRedeem ? "Xác nhận đổi điểm" : "Chưa đủ điểm"}
              {canRedeem ? <ArrowRight size={18} /> : <PackageCheck size={18} />}
            </button>
          </section>

          <div className="rounded-3xl bg-[#fff3c4] p-4 text-sm font-semibold leading-6 text-[#3e4941]">
            <ShieldCheck className="mb-2 text-[#755b00]" size={20} />
            Sau khi đổi, hệ thống sẽ ghi nhận giao dịch vào lịch sử và ví điểm của bạn.
          </div>
        </aside>
      </section>
    </>
  );
}
