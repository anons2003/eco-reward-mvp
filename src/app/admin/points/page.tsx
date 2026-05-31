import { POINTS_BY_WASTE_TYPE } from "@/core/points/calculate-points";
import { PageHeader } from "@/components/shared/eco-ui";

export default function AdminPointsPage() {
  const entries = Object.entries(POINTS_BY_WASTE_TYPE);
  const highest = Math.max(...entries.map(([, points]) => points));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Quy tắc điểm" title="Cấu hình điểm" body="Bảng điểm theo loại rác dùng để tính điểm và ghi nhận lịch sử giao dịch." />
      <section className="eco-card rounded-[28px] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#071b12]">Ma trận điểm</h2>
            <p className="mt-1 text-sm font-semibold text-[#5d6a60]">Loại rác có giá trị cao hơn cần được kiểm duyệt kỹ hơn.</p>
          </div>
          <span className="rounded-full bg-[#d8f5df] px-4 py-2 text-sm font-black text-[#007a3d]">{entries.length} loại</span>
        </div>
        <div className="grid gap-3">
          {entries.map(([type, points]) => (
            <div className="grid gap-4 rounded-2xl border border-[#d9e5da] bg-white p-4 md:grid-cols-[220px_1fr_90px] md:items-center" key={type}>
              <p className="font-black text-[#071b12]">{type.replaceAll("_", " ")}</p>
              <div className="h-3 overflow-hidden rounded-full bg-[#edf6ed]">
                <div className="h-full rounded-full bg-[#007a3d]" style={{ width: `${Math.max(8, Math.round((points / highest) * 100))}%` }} />
              </div>
              <p className="text-right text-xl font-black text-[#071b12]">{points}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
