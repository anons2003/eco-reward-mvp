import { MapPin } from "lucide-react";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default function AdminBinsPage() {
  const bins = ecoRewardService.listBins();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">Quản lý thùng rác</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {bins.map((bin) => (
          <article className="surface rounded-2xl p-6" key={bin.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black">{bin.name}</h2>
                <p className="mt-1 font-mono text-sm text-[#3f4850]">{bin.qrCode}</p>
              </div>
              <span className={bin.active ? "badge bg-[#D1EEDD] text-[#006d37]" : "badge bg-[#ffdad6] text-[#ba1a1a]"}>
                {bin.active ? "Hoạt động" : "Bảo trì"}
              </span>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[#3f4850]">
              <MapPin size={16} />
              {bin.locationName}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
