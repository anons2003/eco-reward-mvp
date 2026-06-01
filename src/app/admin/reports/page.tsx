import { ArrowDownToLine, Building2, Coins, Globe2, Leaf, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion } from "@/components/shared/dynamic-client-components";

const kpis = [
  { label: "Tổng rác thu gom", value: "124.5 Tấn", delta: "+12%", Icon: Leaf, tone: "green" },
  { label: "Người dùng mới", value: "1,204", delta: "+8.4%", Icon: Users, tone: "blue" },
  { label: "SeaPoints đã đổi", value: "45.2M", delta: "-2.1%", Icon: Coins, tone: "amber" },
  { label: "Khu vực hoạt động", value: "28 Quận", delta: "+15%", Icon: Building2, tone: "green" },
] as const;

const lineValues = [22, 32, 42, 36, 48, 62, 58, 72, 86];
const userValues = [14, 23, 28, 31, 39, 44, 53, 60, 66];
const rewardBars = [
  ["Thực phẩm", 88],
  ["Thời trang", 68],
  ["Điện tử", 54],
  ["Sự kiện", 38],
  ["Khác", 25],
] as const;
const districts = [
  ["Quận 1, TP.HCM", "12,450", "+15.2%", "Tăng"],
  ["Quận 7, TP.HCM", "10,890", "+10.5%", "Tăng"],
  ["Hoàn Kiếm, Hà Nội", "8,200", "-2.1%", "Giảm"],
  ["Hải Châu, Đà Nẵng", "5,200", "+2.1%", "Tăng"],
] as const;

export default function AdminReportsPage() {
  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Báo cáo & Thống kê Hệ thống</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Dữ liệu tổng quan giúp đội vận hành SeaTech ra quyết định nhanh hơn.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#bbcbbb]/60 bg-white px-4 text-sm font-black text-[#006492] transition hover:bg-[#2d9cdb]/8" type="button">
            <ArrowDownToLine size={17} />
            Xuất CSV
          </button>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
            <TrendingUp size={17} />
            Tải PDF
          </button>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-12">
        <article className="rounded-3xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:col-span-8" data-admin-reveal>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#2c3e50]">Xu hướng thu gom & Người dùng (6 tháng qua)</h2>
            <select className="rounded-xl border border-[#bbcbbb]/50 bg-[#fbf9f8] px-3 py-2 text-xs font-black text-[#3d4a3e]">
              <option>Tháng này</option>
              <option>6 tháng</option>
            </select>
          </div>
          <div className="relative h-80 overflow-hidden rounded-2xl bg-[#fbf9f8] p-4">
            <div className="absolute inset-x-6 bottom-12 top-8 grid grid-rows-4">
              {[0, 1, 2, 3].map((line) => (
                <span className="border-t border-[#bbcbbb]/30" key={line} />
              ))}
            </div>
            <svg className="absolute inset-x-6 bottom-12 top-8 h-[calc(100%-5rem)] w-[calc(100%-3rem)] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              <polyline fill="none" points={toPolyline(lineValues)} stroke="#006d37" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              <polyline fill="none" points={toPolyline(userValues)} stroke="#2d9cdb" strokeDasharray="6 6" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute inset-x-6 bottom-4 flex justify-between text-xs font-black text-[#6c7b6d]">
              {["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"].map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
            <div className="absolute bottom-14 left-8 flex gap-4 rounded-full bg-white/88 px-4 py-2 text-xs font-black shadow-sm">
              <span className="inline-flex items-center gap-2 text-[#006d37]"><span className="size-2 rounded-full bg-current" />Rác thu gom</span>
              <span className="inline-flex items-center gap-2 text-[#2d9cdb]"><span className="size-2 rounded-full bg-current" />Người dùng mới</span>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:col-span-4" data-admin-reveal>
          <h2 className="mb-6 text-lg font-black tracking-[-0.03em] text-[#2c3e50]">Cơ cấu loại rác thải</h2>
          <div className="mx-auto grid size-52 place-items-center rounded-full" style={{ background: "conic-gradient(#006d37 0 45%, #2d9cdb 45% 70%, #f39c12 70% 90%, #ba1a1a 90% 100%)" }}>
            <div className="grid size-28 place-items-center rounded-full bg-white text-center">
              <span className="text-2xl font-black text-[#2c3e50]">124.5</span>
              <span className="-mt-6 text-xs font-black text-[#6c7b6d]">Tấn</span>
            </div>
          </div>
          <div className="mt-7 grid gap-3">
            <Legend label="Nhựa" value="45%" color="bg-[#006d37]" />
            <Legend label="Giấy" value="25%" color="bg-[#2d9cdb]" />
            <Legend label="Kim loại" value="20%" color="bg-[#f39c12]" />
            <Legend label="Khác" value="10%" color="bg-[#ba1a1a]" />
          </div>
        </article>
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-12">
        <article className="rounded-3xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:col-span-5" data-admin-reveal>
          <h2 className="mb-6 text-lg font-black tracking-[-0.03em] text-[#2c3e50]">Phân bổ phần thưởng theo danh mục</h2>
          <div className="flex h-64 items-end gap-4">
            {rewardBars.map(([label, value]) => (
              <div className="flex flex-1 flex-col items-center gap-3" key={label}>
                <div className="flex h-52 w-full items-end rounded-xl bg-[#f5f3f2]">
                  <span data-admin-bar className="w-full rounded-xl bg-[#006d37]" style={{ height: `${value}%` }} />
                </div>
                <span className="text-center text-xs font-black text-[#6c7b6d]">{label}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:col-span-7" data-admin-reveal>
          <div className="flex items-center justify-between border-b border-[#bbcbbb]/25 px-6 py-5">
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#2c3e50]">Hoạt động khu vực nổi bật</h2>
            <button className="text-xs font-black text-[#006d37]" type="button">Xem tất cả</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#fbf9f8]">
                <tr>
                  {["Khu vực", "Lượt gửi", "Tăng trưởng", "Trạng thái"].map((heading) => (
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#bbcbbb]/18">
                {districts.map(([name, amount, growth, status]) => (
                  <tr className="transition hover:bg-[#fbf9f8]" key={name}>
                    <td className="px-6 py-4 text-sm font-black text-[#2c3e50]">{name}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#3d4a3e]">{amount}</td>
                    <td className={`px-6 py-4 text-sm font-black ${growth.startsWith("-") ? "text-[#ba1a1a]" : "text-[#006d37]"}`}>{growth}</td>
                    <td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${status === "Tăng" ? "bg-[#2ecc71]/12 text-[#006d37]" : "bg-[#ffdad6] text-[#ba1a1a]"}`}>{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-[#006d37] p-8 text-white shadow-[0_18px_44px_rgba(0,109,55,0.20)] lg:p-10" data-admin-reveal>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_60%_35%,rgba(255,255,255,0.28),transparent_28%),linear-gradient(135deg,rgba(45,156,219,0.22),rgba(46,204,113,0.28))] opacity-75" />
        <Leaf className="absolute right-12 top-1/2 hidden -translate-y-1/2 rotate-12 text-white/18 lg:block" size={220} />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-black leading-tight tracking-[-0.04em]">Tác động Môi trường</h2>
          <p className="mt-3 text-base font-semibold leading-7 text-white/86">Kể từ khi bắt đầu, SeaTech đã giúp giảm thiểu tương đương 2,450 tấn khí thải CO2 vào bầu khí quyển.</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Impact value="15,000+" label="Cây xanh đã cứu" />
            <Impact value="4.8/5" label="Mức hài lòng cộng đồng" />
          </div>
        </div>
      </section>
    </div>
  );
}

function toPolyline(values: number[]) {
  const max = 100;
  return values.map((value, index) => `${(index / (values.length - 1)) * 100},${max - value}`).join(" ");
}

function KpiCard({ label, value, delta, Icon, tone }: { label: string; value: string; delta: string; Icon: LucideIcon; tone: "green" | "blue" | "amber" }) {
  const toneClass = {
    green: "bg-[#006d37]/10 text-[#006d37]",
    blue: "bg-[#2d9cdb]/12 text-[#006492]",
    amber: "bg-[#f39c12]/12 text-[#735c00]",
  }[tone];
  return (
    <article className="rounded-2xl border border-[#bbcbbb]/25 bg-white p-5 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
      <div className="mb-4 flex items-start justify-between">
        <span className={`grid size-11 place-items-center rounded-xl ${toneClass}`}><Icon size={20} /></span>
        <span className={`text-xs font-black ${delta.startsWith("-") ? "text-[#ba1a1a]" : "text-[#006d37]"}`}>{delta}</span>
      </div>
      <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2c3e50]">{value}</h2>
    </article>
  );
}

function Legend({ label, value, color }: { label: string; value: string; color: string }) {
  return <div className="flex items-center justify-between text-sm font-black text-[#3d4a3e]"><span className="inline-flex items-center gap-2"><span className={`size-3 rounded-full ${color}`} />{label}</span><span>{value}</span></div>;
}

function Impact({ value, label }: { value: string; label: string }) {
  return <span className="rounded-2xl bg-white/14 px-5 py-4"><span className="block text-2xl font-black">{value}</span><span className="mt-1 block text-xs font-black uppercase tracking-[0.08em] text-white/72">{label}</span></span>;
}
