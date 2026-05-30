import { POINTS_BY_WASTE_TYPE } from "@/core/points/calculate-points";

export default function AdminPointsPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">Cấu hình điểm</h1>
      <section className="surface rounded-2xl p-6">
        <div className="grid gap-3">
          {Object.entries(POINTS_BY_WASTE_TYPE).map(([type, points]) => (
            <div className="flex items-center justify-between rounded-xl bg-white p-4" key={type}>
              <p className="font-bold">{type.replaceAll("_", " ")}</p>
              <p className="text-xl font-black text-[#219653]">{points}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
