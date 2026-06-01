import { MapPin, QrCode, RadioTower } from "lucide-react";
import { PageHeader } from "@/components/shared/eco-ui";
import { seaTechService } from "@/application/services/seatech-service";

export default function AdminBinsPage() {
  const bins = seaTechService.listBins();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Thùng rác" title="Quản lý thùng rác" body="Danh sách thùng, mã QR, vị trí và trạng thái vận hành." />
      <div className="grid gap-4 md:grid-cols-2">
        {bins.map((bin) => (
          <article className="eco-card rounded-[24px] p-6" key={bin.id}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black tracking-[-0.03em] text-[#071b12]">{bin.name}</h2>
                <p className="mt-1 font-mono text-sm font-bold text-[#5d6a60]">{bin.qrCode}</p>
              </div>
              <span className={bin.active ? "badge bg-[#d8f5df] text-[#007a3d]" : "badge bg-[#fff0f0] text-[#B91C1C]"}>
                {bin.active ? "Hoạt động" : "Bảo trì"}
              </span>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#5d6a60]">
              <MapPin size={16} />
              {bin.locationName}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#d9e5da] bg-white p-4">
                <QrCode className="text-[#007a3d]" size={20} />
                <p className="mt-2 text-xs font-black uppercase text-[#6e7a70]">QR health</p>
                <p className="text-lg font-black text-[#071b12]">Ready</p>
              </div>
              <div className="rounded-2xl border border-[#d9e5da] bg-white p-4">
                <RadioTower className="text-[#007a3d]" size={20} />
                <p className="mt-2 text-xs font-black uppercase text-[#6e7a70]">Signal</p>
                <p className="text-lg font-black text-[#071b12]">{bin.active ? "Online" : "Paused"}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
