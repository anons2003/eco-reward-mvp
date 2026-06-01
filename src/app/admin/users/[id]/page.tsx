import Link from "next/link";
import { ArrowLeft, Bell, CalendarDays, Edit, Eye, Gift, ImageIcon, Lock, Mail, MapPin, Phone, Recycle, Send, ShieldCheck, ShieldAlert, TrendingUp, UserRound, WalletCards, type LucideIcon } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";

const userProfile = {
  name: "Nguyễn Văn An",
  email: "an.nguyen@email.com",
  phone: "+84 901 234 567",
  location: "Quận 1, TP. Hồ Chí Minh",
  joinedAt: "12/05/2023",
};

const metrics = [
  { label: "Tổng lượt phân loại", value: "1,248", note: "+12% tháng này", Icon: Recycle, tone: "green" },
  { label: "Tổng điểm hiện có", value: "45,600", note: "Hạng Vàng", Icon: WalletCards, tone: "blue" },
  { label: "Độ uy tín", value: "95/100", note: "Rất cao", Icon: ShieldCheck, tone: "greenSolid" },
  { label: "Cảnh báo", value: "02", note: "Lần cuối: 15 ngày trước", Icon: ShieldAlert, tone: "red" },
] as const;

const submissions = [
  {
    type: "Nhựa (PET)",
    date: "Hôm nay, 10:45",
    points: 150,
    status: "AI Xác minh",
    tone: "blue",
  },
  {
    type: "Giấy / Carton",
    date: "Hôm qua, 16:20",
    points: 80,
    status: "Đã duyệt",
    tone: "amber",
  },
];

const tabs: Array<{ label: string; Icon: LucideIcon; active: boolean }> = [
  { label: "Lịch sử lượt gửi", Icon: Recycle, active: true },
  { label: "Lịch sử đổi thưởng", Icon: Gift, active: false },
  { label: "Cảnh báo gian lận", Icon: ShieldCheck, active: false },
];

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between" data-admin-reveal>
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start">
          <div className="group relative grid size-32 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-[radial-gradient(circle_at_35%_28%,rgba(46,204,113,0.30),transparent_34%),linear-gradient(135deg,#e8f5ff,#edf6ed)] shadow-lg">
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,109,55,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(0,100,150,0.13)_1px,transparent_1px)] [background-size:18px_18px]" />
            <UserRound className="relative text-[#006d37]" size={58} />
            <span className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-lg border-2 border-white bg-[#2ecc71] text-white shadow-md">
              <ShieldCheck size={18} />
            </span>
          </div>
          <div className="min-w-0">
            <Link className="mb-4 inline-flex items-center gap-2 text-sm font-black text-[#6c7b6d] transition hover:text-[#006d37]" href="/admin/users">
              <ArrowLeft size={17} />
              Quay lại
            </Link>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-[#1b1c1b] lg:text-4xl">{userProfile.name}</h1>
            <p className="mt-1 text-xs font-bold text-[#6c7b6d]">Mã người dùng: {id.replace("seatech", "#SEA").toUpperCase()}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#3d4a3e]">
              <ProfileFact Icon={CalendarDays} text={`Tham gia: ${userProfile.joinedAt}`} />
              <ProfileFact Icon={Mail} text={userProfile.email} />
              <ProfileFact Icon={Phone} text={userProfile.phone} />
              <ProfileFact Icon={MapPin} text={userProfile.location} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <ActionButton Icon={Send} label="Gửi thông báo" tone="green" />
          <ActionButton Icon={Edit} label="Điều chỉnh điểm" tone="blue" />
          <ActionButton Icon={Lock} label="Khóa tài khoản" tone="red" />
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/30 bg-white shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="flex overflow-x-auto border-b border-[#bbcbbb]/45">
          {tabs.map(({ label, Icon, active }) => (
            <button className={`inline-flex min-h-16 shrink-0 items-center gap-2 border-b-2 px-6 text-sm font-black transition ${active ? "border-[#006d37] text-[#006d37]" : "border-transparent text-[#6c7b6d] hover:text-[#006d37]"}`} key={label} type="button">
              <Icon size={17} />
              {label}
            </button>
          ))}
        </div>

        <div className="hidden overflow-x-auto p-6 lg:block">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#bbcbbb]/45 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]">
                <th className="px-4 pb-4">Ảnh minh chứng</th>
                <th className="px-4 pb-4">Loại rác thải</th>
                <th className="px-4 pb-4">Ngày gửi</th>
                <th className="px-4 pb-4">Điểm nhận</th>
                <th className="px-4 pb-4">Trạng thái</th>
                <th className="px-4 pb-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr className="group border-b border-[#bbcbbb]/25 transition hover:bg-[#f5f3f2]/70" key={submission.type}>
                  <td className="px-4 py-4">
                    <ProofVisual tone={submission.tone} />
                  </td>
                  <td className="px-4 py-4">
                    <WastePill label={submission.type} tone={submission.tone} />
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#6c7b6d]">{submission.date}</td>
                  <td className="px-4 py-4 text-sm font-black text-[#2ecc71]">+{submission.points}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 text-sm font-black text-[#2ecc71]">
                      <span className="size-2 rounded-full bg-[#2ecc71]" />
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button className="grid size-9 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#006d37]/10 hover:text-[#006d37]" type="button" aria-label="Xem lượt gửi">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-4 lg:hidden">
          {submissions.map((submission) => (
            <article className="rounded-2xl border border-[#bbcbbb]/30 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={submission.type}>
              <div className="flex gap-3">
                <ProofVisual tone={submission.tone} large />
                <div className="min-w-0 flex-1">
                  <WastePill label={submission.type} tone={submission.tone} />
                  <p className="mt-2 text-xs font-semibold text-[#6c7b6d]">{submission.date}</p>
                  <p className="mt-1 text-sm font-black text-[#2ecc71]">+{submission.points} điểm</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProfileFact({ Icon, text }: { Icon: LucideIcon; text: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon size={17} />
      {text}
    </span>
  );
}

function ActionButton({ Icon, label, tone }: { Icon: LucideIcon; label: string; tone: "green" | "blue" | "red" }) {
  const className = {
    green: "bg-[#2ecc71] shadow-[#2ecc71]/20",
    blue: "bg-[#2d9cdb] shadow-[#2d9cdb]/20",
    red: "bg-[#e74c3c] shadow-[#e74c3c]/20",
  }[tone];

  return (
    <button className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-black text-white shadow-lg transition hover:scale-[1.03] active:scale-[0.98] ${className}`} type="button">
      <Icon size={17} />
      {label}
    </button>
  );
}

function MetricCard({ label, value, note, Icon, tone }: { label: string; value: string; note: string; Icon: LucideIcon; tone: "green" | "blue" | "greenSolid" | "red" }) {
  const toneClass = {
    green: "bg-[#2ecc71]/10 text-[#2ecc71]",
    blue: "bg-[#2d9cdb]/10 text-[#2d9cdb]",
    greenSolid: "bg-[#2ecc71] text-white shadow-[#2ecc71]/30",
    red: "bg-[#e74c3c]/10 text-[#e74c3c]",
  }[tone];

  return (
    <article className="flex min-h-44 flex-col justify-between rounded-2xl border border-[#bbcbbb]/30 bg-white p-6 shadow-[0_12px_34px_rgba(45,156,219,0.06)] transition duration-300 hover:-translate-y-1" data-admin-reveal>
      <div>
        <span className={`grid size-10 place-items-center rounded-full shadow-sm ${toneClass}`}>
          <Icon size={20} />
        </span>
        <p className="mt-4 text-sm font-black text-[#3d4a3e]">{label}</p>
      </div>
      <div className="mt-4">
        <h2 className={`text-4xl font-black tracking-[-0.05em] ${tone === "red" ? "text-[#e74c3c]" : "text-[#1b1c1b]"}`}>{value}</h2>
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#6c7b6d]">
          <TrendingUp size={14} />
          {note}
        </p>
      </div>
    </article>
  );
}

function WastePill({ label, tone }: { label: string; tone: string }) {
  const className = {
    blue: "bg-[#58bcfd]/18 text-[#004a6d]",
    amber: "bg-[#f39c12]/18 text-[#735c00]",
  }[tone];

  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${className}`}>{label}</span>;
}

function ProofVisual({ tone, large = false }: { tone: string; large?: boolean }) {
  const className = tone === "amber" ? "bg-[linear-gradient(135deg,#fff7e6,#edf6ed)]" : "bg-[linear-gradient(135deg,#e8f5ff,#edf6ed)]";

  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-lg shadow-sm transition-transform group-hover:scale-105 ${large ? "h-16 w-20 rounded-xl" : "h-12 w-16"} ${className}`}>
      <ImageIcon className="text-[#006d37]" size={large ? 24 : 20} />
    </span>
  );
}
