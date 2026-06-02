import Link from "next/link";
import { ArrowRight, LocateFixed, QrCode, Trash2 } from "lucide-react";
import { DynamicNearbyBinsMap } from "@/components/shared/dynamic-client-components";
import { getSupabaseServerClient } from "@/infrastructure/auth/session";
import type { Database } from "@/infrastructure/supabase/database.types";

type BinRow = Pick<Database["public"]["Tables"]["bins"]["Row"], "id" | "name" | "qr_code" | "location_name" | "lat" | "lng" | "active">;

export default async function BinsPage() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("bins").select("id,name,qr_code,location_name,lat,lng,active").eq("active", true).order("name", { ascending: true });
  const bins: BinRow[] = data ?? [];

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] bg-[#071b12] p-6 text-white shadow-[0_18px_46px_rgba(7,27,18,0.18)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-[#8ff8b6]">
              <Trash2 size={15} />
              Bản đồ thùng rác SeaTech
            </div>
            <h1 className="text-3xl font-black leading-[0.98] tracking-[-0.05em] md:text-5xl">Tìm thùng rác gần bạn.</h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/75 md:text-base">
              Bật định vị để xem thùng đang hoạt động quanh khu vực hiện tại, mở chỉ đường và quét QR đúng thùng khi đến nơi.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-black shadow-[0_14px_30px_rgba(0,0,0,0.16)] transition hover:bg-[#edf6ed]" href="#nearby-map" style={{ color: "#071b12" }}>
              <LocateFixed size={18} />
              Xem bản đồ
            </Link>
            <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 text-sm font-black text-white transition hover:bg-[#006a35]" href="/scan" style={{ color: "#ffffff" }}>
              <QrCode size={18} />
              Quét QR
            </Link>
          </div>
        </div>
      </section>

      <div id="nearby-map">
        <DynamicNearbyBinsMap bins={bins} />
      </div>

      <section className="rounded-[28px] border border-[#d9e5da] bg-white/86 p-5 shadow-[0_12px_40px_rgba(21,29,24,0.05)] md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-[-0.04em] text-[#151d18]">Quy trình sử dụng</h2>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#667468]">Định vị để chọn thùng gần nhất, đi tới điểm phân loại, quét QR và gửi ảnh để hệ thống ghi nhận điểm xanh.</p>
          </div>
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d9e5da] bg-white px-4 text-sm font-black transition hover:border-[#007a3d]" href="/history" style={{ color: "#071b12" }}>
            Xem lịch sử
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
