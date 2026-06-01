import { ArrowDownToLine, CheckCircle2, Eye, Filter, LockKeyhole, Search, ShieldAlert, ShieldCheck, UserCog, type LucideIcon } from "lucide-react";
import { DynamicAdminDashboardMotion } from "@/components/shared/dynamic-client-components";

const logs = [
  { time: "14:25:02\n15/10/2023", admin: "Lê Hoàng Minh", role: "Quản trị viên", action: "Phê duyệt", target: "Chiến dịch 'Sống Xanh'", ip: "Công viên Quận 1", value: "Đã duyệt", tone: "green" },
  { time: "11:10:45\n15/10/2023", admin: "Nguyễn Thu Thảo", role: "Kiểm duyệt viên", action: "Chỉnh sửa", target: "Tỷ lệ quy đổi điểm", ip: "100 điểm = 1k", value: "100 điểm -> 15k", tone: "amber" },
  { time: "09:45:12\n15/10/2023", admin: "Trần Đức Nam", role: "Quản trị viên", action: "Từ chối", target: "Yêu cầu hoàn SeaCoin", ip: "Người dùng Dũng", value: "Không hợp lệ", tone: "red" },
  { time: "17:55:30\n14/10/2023", admin: "Quản trị viên", role: "Quản trị cấp cao", action: "Cấu hình", target: "Cấp quyền biên tập", ip: "Người xem", value: "Biên tập", tone: "blue" },
] as const;

const summary = [
  { label: "Tổng phê duyệt (tháng)", value: "842", Icon: CheckCircle2, tone: "green" },
  { label: "Số lần chỉnh sửa", value: "3,120", Icon: UserCog, tone: "blue" },
  { label: "Cảnh báo bảo mật", value: "02", Icon: ShieldAlert, tone: "red" },
] as const;

export default function AdminAuditLogsPage() {
  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <DynamicAdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Nhật ký thao tác</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Theo dõi mọi thay đổi cấu hình, phê duyệt và hoạt động bảo mật của đội vận hành SeaTech.</p>
        </div>
        <button className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
          <ArrowDownToLine size={17} />
          Xuất báo cáo
        </button>
      </section>

      <section className="grid gap-4 rounded-3xl border border-[#bbcbbb]/25 bg-white p-5 shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:grid-cols-[160px_180px_1fr_220px]" data-admin-reveal>
        <FilterSelect label="Quản trị viên" options={["Tất cả quản trị viên", "Quản trị viên", "Kiểm duyệt viên"]} />
        <FilterSelect label="Loại thao tác" options={["Tất cả loại", "Phê duyệt", "Chỉnh sửa", "Từ chối"]} />
        <label className="grid gap-1">
          <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[#6c7b6d]">Tìm kiếm</span>
          <span className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={17} />
            <input className="h-11 w-full rounded-xl border border-[#bbcbbb]/60 bg-[#fbf9f8] px-3 pl-10 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20" placeholder="Tìm kiếm hành động..." type="search" />
          </span>
        </label>
        <button className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#006d37]/20 bg-white px-4 text-sm font-black text-[#006d37] transition hover:bg-[#006d37]/5" type="button">
          <Filter size={17} />
          Bộ lọc nâng cao
        </button>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white shadow-[0_16px_44px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead className="bg-[#f5f3f2]">
              <tr>
                {["Thời gian", "Quản trị viên", "Thao tác", "Đối tượng", "Giá trị cũ", "Giá trị mới", ""].map((heading) => (
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {logs.map((log) => (
                <tr className="group transition hover:bg-[#fbf9f8]" key={`${log.time}-${log.admin}`}>
                  <td className="whitespace-pre-line px-5 py-5 text-xs font-semibold text-[#6c7b6d]">{log.time}</td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-full bg-[#0b1f18] text-xs font-black text-white">{log.admin.charAt(0)}</span>
                      <span>
                        <span className="block text-sm font-black text-[#2c3e50]">{log.admin}</span>
                        <span className="mt-1 block text-xs font-semibold text-[#6c7b6d]">{log.role}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-5"><ActionPill label={log.action} tone={log.tone} /></td>
                  <td className="px-5 py-5 text-sm font-semibold text-[#3d4a3e]">{log.target}</td>
                  <td className="px-5 py-5 text-sm font-semibold text-[#6c7b6d]">{log.ip}</td>
                  <td className={`px-5 py-5 text-sm font-black ${log.tone === "red" ? "text-[#ba1a1a]" : "text-[#006d37]"}`}>{log.value}</td>
                  <td className="px-5 py-5 text-right">
                    <button className="grid size-9 place-items-center rounded-lg text-[#6c7b6d] transition hover:bg-[#efedec] hover:text-[#006d37]" type="button" aria-label="Xem chi tiết">
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {logs.map((log) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={log.time}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#2c3e50]">{log.admin}</p>
                  <p className="mt-1 whitespace-pre-line text-xs font-semibold text-[#6c7b6d]">{log.time}</p>
                </div>
                <ActionPill label={log.action} tone={log.tone} />
              </div>
              <p className="mt-3 text-sm font-semibold text-[#3d4a3e]">{log.target}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/25 bg-[#fbf9f8] px-6 py-5 md:flex-row">
          <p className="text-xs font-semibold text-[#6c7b6d]">Hiển thị 1-10 trên tổng số 1,240 thao tác</p>
          <div className="flex gap-2">
            {[1, 2, 3].map((page) => (
              <button className={`grid size-8 place-items-center rounded text-sm font-black ${page === 1 ? "bg-[#006d37] text-white" : "text-[#3d4a3e] hover:bg-white"}`} key={page} type="button">{page}</button>
            ))}
            <button className="rounded px-3 text-sm font-black text-[#6c7b6d] hover:bg-white" type="button">124</button>
          </div>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-3">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid-flow-dense grid gap-8 rounded-3xl border border-[#bbcbbb]/25 bg-white p-8 shadow-[0_12px_34px_rgba(45,156,219,0.06)] lg:grid-cols-[1fr_320px]" data-admin-reveal>
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-black tracking-[-0.04em] text-[#006d37]">Minh bạch & Tin cậy</h2>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[#3d4a3e]">Hệ thống SeaTech Audit Log lưu trữ mọi thay đổi cấu hình, trạng thái người dùng và lịch sử phê duyệt phần thưởng để đảm bảo truy xuất đầy đủ.</p>
          <div className="mt-8 grid max-w-lg gap-4 md:grid-cols-2">
            <TrustPoint title="Bộ máy kiểm toán AI" body="Tự động phát hiện bất thường." />
            <TrustPoint title="Bảo mật 24/7" body="Theo dõi mọi phiên quản trị." />
          </div>
        </div>
        <div className="relative min-h-72 overflow-hidden rounded-[32px] bg-[#0b1f18] shadow-2xl shadow-[#2d9cdb]/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(46,204,113,0.34),transparent_32%),linear-gradient(135deg,#0b1f18,#006d37)] opacity-95" />
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px]" />
          <ShieldCheck className="absolute right-8 top-8 text-white/18" size={160} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1f18]/70 to-transparent" />
          <div className="absolute bottom-5 left-5 rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#0b1f18] shadow-xl">Toàn bộ hành động đã được ký vết.</div>
        </div>
      </section>
    </div>
  );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</span>
      <select className="h-11 rounded-xl border border-[#bbcbbb]/60 bg-[#fbf9f8] px-3 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ActionPill({ label, tone }: { label: string; tone: string }) {
  const className = {
    green: "bg-[#2ecc71]/12 text-[#006d37]",
    amber: "bg-[#f39c12]/12 text-[#735c00]",
    red: "bg-[#ffdad6] text-[#ba1a1a]",
    blue: "bg-[#2d9cdb]/12 text-[#006492]",
  }[tone];
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function SummaryCard({ label, value, Icon, tone }: { label: string; value: string; Icon: LucideIcon; tone: "green" | "blue" | "red" }) {
  const className = {
    green: "bg-[#006d37]/10 text-[#006d37]",
    blue: "bg-[#2d9cdb]/12 text-[#006492]",
    red: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
  }[tone];
  return (
    <article className="rounded-2xl border border-[#bbcbbb]/25 bg-white p-5 shadow-[0_12px_34px_rgba(45,156,219,0.06)]" data-admin-reveal>
      <div className="flex items-center gap-4">
        <span className={`grid size-12 place-items-center rounded-xl ${className}`}><Icon size={22} /></span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
          <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2c3e50]">{value}</h2>
        </div>
      </div>
    </article>
  );
}

function TrustPoint({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-[#fbf9f8] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-[#006d37]">
        {title.includes("AI") ? <ShieldCheck size={17} /> : <LockKeyhole size={17} />}
        {title}
      </div>
      <p className="text-xs font-semibold leading-5 text-[#6c7b6d]">{body}</p>
    </div>
  );
}
