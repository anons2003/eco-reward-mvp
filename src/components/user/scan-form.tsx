"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, QrCode, ScanLine } from "lucide-react";

export function ScanForm() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("ECO-BIN-A1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/scan-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode, lat: 10.7769, lng: 106.7009 }),
    });
    const payload = (await response.json()) as { session?: { id: string }; error?: string };
    setLoading(false);

    if (!response.ok || !payload.session) {
      setError(payload.error ?? "Không tạo được phiên quét.");
      return;
    }

    router.push(`/capture?scanSessionId=${payload.session.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="eco-card overflow-hidden rounded-[28px]">
        <div className="grid min-h-[520px] place-items-center bg-[#fbfbff] p-6 text-[#151515]">
          <div className="w-full max-w-sm">
            <div className="relative aspect-square rounded-[28px] border-2 border-[#151515] bg-[#F4FDE7] p-5">
              <div className="grid h-full place-items-center rounded-[22px] border border-dashed border-white/55">
                <QrCode size={92} />
              </div>
              <span className="absolute left-5 top-5 size-10 rounded-tl-2xl border-l-4 border-t-4 border-[#151515]" />
              <span className="absolute right-5 top-5 size-10 rounded-tr-2xl border-r-4 border-t-4 border-[#151515]" />
              <span className="absolute bottom-5 left-5 size-10 rounded-bl-2xl border-b-4 border-l-4 border-[#151515]" />
              <span className="absolute bottom-5 right-5 size-10 rounded-br-2xl border-b-4 border-r-4 border-[#151515]" />
            </div>
            <p className="mt-5 text-center text-sm font-bold text-[#151515]/72">Camera scanner sẽ được nối ở bản mobile/native. MVP dùng mã QR demo.</p>
          </div>
        </div>
      </section>

      <aside className="eco-card rounded-[28px] p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#f4f5fb] text-[#151515]">
            <ScanLine size={24} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#151515]">Mã demo</p>
            <h2 className="text-xl font-black text-[#151515]">Xác nhận thùng</h2>
          </div>
        </div>
        <label className="mt-6 block text-sm font-bold text-[#5f6472]" htmlFor="qr">
          Mã QR
        </label>
        <input className="input mt-2" id="qr" value={qrCode} onChange={(event) => setQrCode(event.target.value)} />
        <div className="mt-4 grid gap-3">
          <div className="flex items-start gap-3 rounded-2xl bg-white p-4">
            <MapPin className="mt-0.5 text-[#166534]" size={18} />
            <div>
              <p className="font-black">Sảnh chính tòa nhà A</p>
              <p className="mt-1 text-sm leading-5 text-[#5f6472]">Demo tự gửi vị trí gần thùng A1.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-[#f4f5fb] p-4">
            <CheckCircle2 className="mt-0.5 text-[#151515]" size={18} />
            <p className="text-sm font-bold leading-5 text-[#5f6472]">Thùng đang hoạt động, có thể tạo phiên gửi.</p>
          </div>
        </div>
        {error ? <p className="mt-4 rounded-xl bg-[#fff0f0] p-3 text-sm font-bold text-[#B91C1C]">{error}</p> : null}
        <button className="btn-primary mt-6 w-full" disabled={loading} onClick={submit} type="button">
          {loading ? "Đang tạo phiên..." : "Tiếp tục chụp ảnh"}
        </button>
      </aside>
    </div>
  );
}
