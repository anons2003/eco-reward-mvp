import { Bot, Edit3, Leaf, RotateCcw, Save, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";

const pointCards = [
  { title: "Chai nhựa", description: "PET, HDPE và chai nhựa sạch sau phân loại.", value: 10, Icon: Trash2, tone: "blue" },
  { title: "Lon kim loại", description: "Nhôm, sắt tây hoặc kim loại nhẹ tái chế.", value: 15, Icon: Sparkles, tone: "amber" },
  { title: "Giấy & Carton", description: "Lưu ý tách giấy, tạp chí và carton khô.", value: 2, secondaryLabel: "Carton (kg)", secondaryValue: 50, Icon: Leaf, tone: "green" },
  { title: "Thủy tinh", description: "Chai, lọ thủy tinh không vỡ, đã làm sạch.", value: 20, suffix: "pts", Icon: RotateCcw, tone: "red" },
] as const;

export default function AdminPointsPage() {
  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#006d37] lg:text-4xl">Cấu hình Điểm & Quy tắc</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Thiết lập tỷ lệ quy đổi điểm và các ngưỡng AI để tối ưu hóa hệ thống thu gom rác thải SeaTech.</p>
        </div>
        <button className="inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#006d37] px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(0,109,55,0.20)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
          <Save size={18} />
          Lưu tất cả thay đổi
        </button>
      </section>

      <section className="grid-flow-dense grid gap-6 lg:grid-cols-12">
        <div className="grid-flow-dense grid gap-6 md:grid-cols-2 lg:col-span-8">
          {pointCards.map((card, index) => (
            <PointRuleCard key={card.title} {...card} wide={index === 2 || index === 3} />
          ))}
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <article className="relative overflow-hidden rounded-3xl bg-[#006d37] p-7 text-white shadow-[0_18px_44px_rgba(0,109,55,0.22)]" data-admin-reveal>
            <div className="mb-7 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white/14">
                <Bot size={22} />
              </span>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-white/80">Hệ thống AI</span>
            </div>
            <h2 className="text-2xl font-black leading-tight tracking-[-0.04em]">Ngưỡng tự động duyệt (Auto-approve)</h2>
            <div className="mt-8 flex items-end gap-3">
              <span className="text-6xl font-black tracking-[-0.08em]">85</span>
              <span className="mb-2 text-2xl font-black">%</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
              <div data-admin-bar className="h-full rounded-full bg-white" style={{ width: "71%" }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-bold text-white/65">
              <span>50%</span>
              <span>99%</span>
            </div>
            <p className="mt-6 text-sm font-semibold leading-6 text-white/82">Các lần gửi có độ tin cậy AI trên ngưỡng này sẽ được cộng điểm ngay lập tức mà không cần hậu kiểm.</p>
            <Bot className="absolute -right-8 -top-8 text-white/8" size={170} />
          </article>

          <article className="rounded-3xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
            <h2 className="mb-6 text-xl font-black tracking-[-0.03em] text-[#2c3e50]">Giới hạn hằng ngày</h2>
            <div className="grid gap-5">
              <NumberField label="Lượt gửi tối đa" value="15" helper="lượt / user / ngày" />
              <NumberField label="Điểm tối đa" value="500" helper="points / ngày" />
            </div>
            <div className="mt-6 rounded-2xl bg-[#2d9cdb]/10 p-4 text-sm font-semibold leading-6 text-[#006492]">
              Giới hạn giúp hệ thống chống spam và giữ điểm thưởng công bằng giữa các người dùng.
            </div>
          </article>
        </aside>
      </section>

      <section className="relative overflow-hidden rounded-3xl bg-[#006d37] p-8 text-white shadow-[0_18px_44px_rgba(0,109,55,0.20)] lg:p-10" data-admin-reveal>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(255,255,255,0.24),transparent_24%),linear-gradient(135deg,rgba(45,156,219,0.18),rgba(46,204,113,0.28))] opacity-90" />
        <Leaf className="absolute right-8 top-1/2 hidden -translate-y-1/2 rotate-12 text-white/16 lg:block" size={210} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#006d37] via-[#006d37]/88 to-[#006d37]/35" />
        <div className="relative max-w-xl">
          <h2 className="text-3xl font-black leading-tight tracking-[-0.04em]">Mọi thay đổi đều tác động đến môi trường</h2>
          <p className="mt-3 text-base font-semibold leading-7 text-white/82">Đảm bảo các cấu hình điểm khuyến khích người dùng phân loại rác đúng cách và giữ niềm tin với hệ thống SeaTech.</p>
        </div>
      </section>
    </div>
  );
}

function PointRuleCard({
  title,
  description,
  value,
  secondaryLabel,
  secondaryValue,
  suffix,
  Icon,
  tone,
  wide,
}: {
  title: string;
  description: string;
  value: number;
  secondaryLabel?: string;
  secondaryValue?: number;
  suffix?: string;
  Icon: LucideIcon;
  tone: "blue" | "amber" | "green" | "red";
  wide: boolean;
}) {
  const toneClass = {
    blue: "bg-[#2d9cdb]/10 text-[#006492]",
    amber: "bg-[#f39c12]/12 text-[#735c00]",
    green: "bg-[#006d37]/10 text-[#006d37]",
    red: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
  }[tone];

  return (
    <article className={`rounded-3xl border border-[#bbcbbb]/25 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] ${wide ? "md:col-span-2" : ""}`} data-admin-reveal>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className={`mb-5 grid size-12 place-items-center rounded-2xl ${toneClass}`}>
            <Icon size={22} />
          </span>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-[#2c3e50]">{title}</h2>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#6c7b6d]">{description}</p>
        </div>
        <button className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#efedec] text-[#6c7b6d] transition hover:text-[#006d37]" type="button" aria-label={`Chỉnh ${title}`}>
          <Edit3 size={17} />
        </button>
      </div>

      <div className={`mt-7 grid gap-4 ${secondaryValue ? "md:grid-cols-2" : ""}`}>
        <NumberField label={secondaryValue ? "Giấy (tờ)" : "Điểm / Vật phẩm"} value={value.toString()} helper={suffix} />
        {secondaryValue ? <NumberField label={secondaryLabel ?? "Điểm"} value={secondaryValue.toString()} /> : null}
      </div>
    </article>
  );
}

function NumberField({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</span>
      <span className="relative">
        <input className="h-14 w-full rounded-xl border-2 border-[#bbcbbb]/30 bg-[#f5f3f2] px-4 text-2xl font-black tracking-[-0.03em] text-[#006d37] outline-none transition focus:border-[#2d9cdb]" defaultValue={value} type="number" />
        {helper ? <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#6c7b6d]">{helper}</span> : null}
      </span>
    </label>
  );
}
