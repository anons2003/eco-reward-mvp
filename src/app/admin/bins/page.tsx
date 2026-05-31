import { MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/eco-ui";
import { ecoRewardService } from "@/application/services/eco-reward-service";

export default function AdminBinsPage() {
  const bins = ecoRewardService.listBins();

  return (
    <div>
      <PageHeader eyebrow="Thùng rác" title="Quản lý thùng rác" body="Danh sách thùng, mã QR, vị trí và trạng thái vận hành." />
      <div className="grid gap-4 md:grid-cols-2">
        {bins.map((bin) => (
          <article className="eco-card rounded-[32px] p-6" key={bin.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black">{bin.name}</h2>
                <p className="mt-1 font-mono text-sm text-[#5f6472]">{bin.qrCode}</p>
              </div>
              <span className={bin.active ? "badge bg-[#151515] text-white" : "badge bg-[#fff0f0] text-[#B91C1C]"}>
                {bin.active ? "Hoạt động" : "Bảo trì"}
              </span>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[#5f6472]">
              <MapPin size={16} />
              {bin.locationName}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
