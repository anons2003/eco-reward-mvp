import { POINTS_BY_WASTE_TYPE } from "@/core/points/calculate-points";
import { PageHeader } from "@/components/shared/eco-ui";

export default function AdminPointsPage() {
  return (
    <div>
      <PageHeader eyebrow="Point rules" title="Cấu hình điểm" body="Bảng điểm theo loại rác dùng cho AI decision và lịch sử giao dịch." />
      <section className="eco-card rounded-[28px] p-6">
        <div className="grid gap-3">
          {Object.entries(POINTS_BY_WASTE_TYPE).map(([type, points]) => (
            <div className="flex items-center justify-between rounded-2xl bg-white p-4" key={type}>
              <p className="font-bold">{type.replaceAll("_", " ")}</p>
              <p className="text-xl font-black text-[#151515]">{points}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
