import Link from "next/link";
import { ArrowDownToLine, CheckCircle2, ChevronLeft, ChevronRight, Eye, FileCheck2, Plus, Search, SlidersHorizontal, XCircle, type LucideIcon } from "lucide-react";
import { AdminDashboardMotion } from "@/components/admin/admin-dashboard-motion";
import { seaTechService } from "@/application/services/seatech-service";

const statCards = [
  { label: "Tổng lượt gửi", value: "2,845", Icon: FileCheck2, tone: "green" },
  { label: "Đang chờ duyệt", value: "142", Icon: SlidersHorizontal, tone: "amber" },
  { label: "Thành công", value: "2,608", Icon: CheckCircle2, tone: "green" },
  { label: "Bị từ chối", value: "95", Icon: XCircle, tone: "red" },
] as const;

const submissionRows = [
  { id: "#SUB-8492", user: "Nguyễn An", type: "Nhựa PET", confidence: 98, place: "Bin #04 - Công viên 29/3", time: "14:20 - 24/05/2024", points: "+150", status: "Thành công", tone: "green" },
  { id: "#SUB-8493", user: "Trần Minh", type: "Giấy bồi", confidence: 72, place: "Bin #12 - Bến xe Miền Đông", time: "15:05 - 24/05/2024", points: "+80", status: "Chờ duyệt", tone: "amber" },
  { id: "#SUB-8494", user: "Lê Hoàng", type: "Kim loại", confidence: 45, place: "Bin #01 - Biển Mỹ Khê", time: "15:45 - 24/05/2024", points: "0", status: "Bị từ chối", tone: "red" },
  { id: "#SUB-8495", user: "Phạm Hà", type: "Thủy tinh", confidence: 99, place: "Bin #09 - Đại học Đà Nẵng", time: "16:10 - 24/05/2024", points: "+200", status: "Thành công", tone: "green" },
] as const;

export default async function AdminSubmissionsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  const seededSubmissions = seaTechService.listSubmissions(params.status);

  return (
    <div className="w-full max-w-full space-y-8 overflow-x-hidden">
      <AdminDashboardMotion />

      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between" data-admin-reveal>
        <div className="max-w-4xl">
          <h1 className="text-3xl font-black leading-tight tracking-[-0.04em] text-[#2c3e50] lg:text-4xl">Danh sách lượt gửi</h1>
          <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#3d4a3e]">Theo dõi và phê duyệt các lượt phân loại rác từ cộng đồng SeaTech. Mỗi hành động nhỏ đều góp phần bảo vệ hành tinh.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#006d37]/20 bg-white px-4 text-sm font-black text-[#006d37] transition hover:bg-[#006d37]/5" type="button">
            <ArrowDownToLine size={17} />
            Xuất báo cáo
          </button>
          <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#006d37] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,109,55,0.18)] transition hover:scale-[1.03] active:scale-[0.98]" type="button">
            <Plus size={17} />
            Thêm lượt gửi
          </button>
        </div>
      </section>

      <section className="grid-flow-dense grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between" data-admin-reveal>
        <div className="flex flex-wrap gap-2">
          {["Tất cả", "Chờ duyệt", "Thành công", "Bị từ chối"].map((filter, index) => (
            <button className={`rounded-full px-5 py-2 text-sm font-black transition ${index === 0 ? "bg-[#006d37] text-white" : "border border-[#bbcbbb]/60 bg-white text-[#3d4a3e] hover:border-[#006d37]"}`} key={filter} type="button">
              {filter}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative min-w-[260px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6c7b6d]" size={17} />
            <input className="h-11 w-full rounded-xl border border-[#bbcbbb]/60 bg-white px-3 pl-10 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20" placeholder="Tìm mã lượt gửi, tên người dùng..." type="search" />
          </label>
          <select className="h-11 rounded-xl border border-[#bbcbbb]/60 bg-white px-4 text-sm font-bold text-[#1b1c1b] outline-none focus:ring-2 focus:ring-[#006d37]/20">
            <option>Mới nhất</option>
            <option>Độ tin cậy thấp</option>
            <option>Điểm cao nhất</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-[#bbcbbb]/25 bg-white shadow-[0_14px_38px_rgba(45,156,219,0.08)]" data-admin-reveal>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-left">
            <thead className="border-b border-[#bbcbbb]/30 bg-[#f5f3f2]">
              <tr>
                {["Mã lượt gửi", "Người dùng", "Loại rác", "Độ tin cậy", "Vị trí / Bin", "Thời gian", "Điểm", "Trạng thái", ""].map((heading) => (
                  <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.08em] text-[#3d4a3e]" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bbcbbb]/18">
              {submissionRows.map((row, index) => (
                <tr className="group transition hover:bg-[#2ecc71]/5" key={row.id}>
                  <td className="px-5 py-5 font-mono text-sm font-black text-[#006492]">{row.id}</td>
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-full bg-[#0b1f18] text-xs font-black text-white">{row.user.charAt(0)}</span>
                      <span className="text-sm font-black text-[#1b1c1b]">{row.user}</span>
                    </div>
                  </td>
                  <td className="px-5 py-5"><WastePill label={row.type} tone={row.tone} /></td>
                  <td className="px-5 py-5"><Confidence value={row.confidence} tone={row.tone} /></td>
                  <td className="px-5 py-5 text-sm font-semibold text-[#3d4a3e]">{row.place}</td>
                  <td className="px-5 py-5 text-sm font-semibold text-[#6c7b6d]">{row.time}</td>
                  <td className={`px-5 py-5 text-sm font-black ${row.tone === "red" ? "text-[#ba1a1a]" : "text-[#006d37]"}`}>{row.points}</td>
                  <td className="px-5 py-5"><StatusPill label={row.status} tone={row.tone} /></td>
                  <td className="px-5 py-5 text-right">
                    <Link className="inline-grid size-9 place-items-center rounded-lg text-[#6c7b6d] opacity-0 transition hover:bg-[#efedec] hover:text-[#006d37] group-hover:opacity-100" href={`/admin/submissions/${seededSubmissions[index % Math.max(seededSubmissions.length, 1)]?.id ?? "sub-001"}`} title="Xem chi tiết">
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-3 lg:hidden">
          {submissionRows.map((row) => (
            <article className="rounded-2xl border border-[#bbcbbb]/35 bg-white p-4 shadow-[0_10px_24px_rgba(45,156,219,0.06)]" key={row.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-black text-[#006492]">{row.id}</p>
                  <h2 className="mt-1 text-base font-black text-[#2c3e50]">{row.user}</h2>
                  <p className="mt-1 text-xs font-semibold text-[#6c7b6d]">{row.place}</p>
                </div>
                <StatusPill label={row.status} tone={row.tone} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <SmallCell label="Loại rác" value={row.type} />
                <SmallCell label="Độ tin cậy" value={`${row.confidence}%`} />
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#bbcbbb]/30 px-6 py-4 md:flex-row">
          <p className="text-sm font-semibold text-[#6c7b6d]">Hiển thị 1-10 trong số 2,845 lượt gửi</p>
          <div className="flex items-center gap-2">
            <button className="grid size-9 place-items-center rounded-lg border border-[#bbcbbb]/50 text-[#6c7b6d] opacity-50" disabled type="button"><ChevronLeft size={17} /></button>
            {[1, 2, 3].map((page) => (
              <button className={`grid size-9 place-items-center rounded-lg text-sm font-black ${page === 1 ? "bg-[#006d37] text-white" : "text-[#3d4a3e] hover:bg-[#fbf9f8]"}`} key={page} type="button">{page}</button>
            ))}
            <button className="grid size-9 place-items-center rounded-lg border border-[#bbcbbb]/50 text-[#3d4a3e]" type="button"><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, Icon, tone }: { label: string; value: string; Icon: LucideIcon; tone: "green" | "amber" | "red" }) {
  const styles = {
    green: "border-l-[#006d37] text-[#006d37] bg-[#006d37]/10",
    amber: "border-l-[#f39c12] text-[#f39c12] bg-[#f39c12]/10",
    red: "border-l-[#ba1a1a] text-[#ba1a1a] bg-[#ba1a1a]/10",
  }[tone];

  return (
    <article className={`flex items-center gap-4 rounded-2xl border border-[#bbcbbb]/25 border-l-4 bg-white p-5 shadow-[0_12px_34px_rgba(45,156,219,0.06)] ${styles}`} data-admin-reveal>
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-current/10">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.08em] text-[#6c7b6d]">{label}</p>
        <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[#2c3e50]">{value}</h2>
      </div>
    </article>
  );
}

function Confidence({ value, tone }: { value: number; tone: string }) {
  const color = tone === "red" ? "bg-[#ba1a1a] text-[#ba1a1a]" : tone === "amber" ? "bg-[#f39c12] text-[#f39c12]" : "bg-[#006d37] text-[#006d37]";
  return (
    <div className="flex min-w-[110px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#e9e8e7]">
        <div data-admin-bar className={`h-full rounded-full ${color.split(" ")[0]}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-xs font-black ${color.split(" ")[1]}`}>{value}%</span>
    </div>
  );
}

function WastePill({ label, tone }: { label: string; tone: string }) {
  const className = tone === "red" ? "bg-[#ba1a1a]/10 text-[#ba1a1a]" : tone === "amber" ? "bg-[#f39c12]/10 text-[#735c00]" : "bg-[#006d37]/10 text-[#006d37]";
  return <span className={`rounded-full px-3 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function StatusPill({ label, tone }: { label: string; tone: string }) {
  const className = tone === "red" ? "text-[#ba1a1a]" : tone === "amber" ? "text-[#f39c12]" : "text-[#006d37]";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-black ${className}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function SmallCell({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl bg-[#fbf9f8] p-3">
      <span className="block text-[10px] font-black uppercase text-[#6c7b6d]">{label}</span>
      <span className="mt-1 block text-sm font-black text-[#1b1c1b]">{value}</span>
    </span>
  );
}
