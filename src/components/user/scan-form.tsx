"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, MapPin, QrCode, ScanLine, ShieldCheck, Wifi, type LucideIcon } from "lucide-react";

type ScanPayload = {
  session?: { id: string; expiresAt: string };
  bin?: { name: string; locationName: string; qrCode: string };
  error?: string;
};

export function ScanForm() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("ECO-BIN-A1");
  const [payload, setPayload] = useState<ScanPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyBin() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/scan-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode, lat: 10.7769, lng: 106.7009 }),
    });
    const nextPayload = (await response.json()) as ScanPayload;
    setLoading(false);

    if (!response.ok || !nextPayload.session || !nextPayload.bin) {
      setPayload(null);
      setError(nextPayload.error ?? "Không tạo được phiên quét.");
      return;
    }

    setPayload(nextPayload);
  }

  function continueToCapture() {
    if (!payload?.session) return;
    router.push(`/capture?scanSessionId=${payload.session.id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="overflow-hidden rounded-[32px] border border-[#d9e5da] bg-white/82 shadow-[0_22px_70px_rgba(21,29,24,0.08)]">
        <div className="grid min-h-[560px] place-items-center bg-[#f3fcf3] bg-[radial-gradient(#bdcabe_1px,transparent_1px)] p-6 text-[#151d18] [background-size:24px_24px]">
          <div className="w-full max-w-sm">
            <div className="relative aspect-square rounded-[34px] border-2 border-[#007a3d] bg-white p-5 shadow-[0_22px_70px_rgba(0,106,61,0.12)]">
              <div className="grid h-full place-items-center rounded-[26px] border border-dashed border-[#bdcabe] bg-[#edf6ed]">
                <QrCode className="text-[#007a3d]" size={96} />
              </div>
              <span className="absolute left-5 top-5 size-11 rounded-tl-3xl border-l-4 border-t-4 border-[#007a3d]" />
              <span className="absolute right-5 top-5 size-11 rounded-tr-3xl border-r-4 border-t-4 border-[#007a3d]" />
              <span className="absolute bottom-5 left-5 size-11 rounded-bl-3xl border-b-4 border-l-4 border-[#007a3d]" />
              <span className="absolute bottom-5 right-5 size-11 rounded-br-3xl border-b-4 border-r-4 border-[#007a3d]" />
              <div className="absolute left-8 right-8 top-1/2 h-1 rounded-full bg-[#8ff8b6] shadow-[0_0_28px_rgba(0,122,61,0.55)]" />
            </div>
            <p className="mt-5 text-center text-sm font-bold leading-6 text-[#3e4941]">Đưa mã QR trên thùng vào khung hoặc nhập mã demo để xác nhận vị trí gửi.</p>
          </div>
        </div>
      </section>

      <aside className="rounded-[32px] border border-[#d9e5da] bg-white/82 p-6 shadow-[0_22px_70px_rgba(21,29,24,0.08)]">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[#d8f5df] text-[#007a3d]">
            <ScanLine size={24} />
          </span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#007a3d]">Mã thùng rác</p>
            <h2 className="text-xl font-black text-[#151d18]">Xác nhận thùng</h2>
          </div>
        </div>

        <label className="mt-6 block text-sm font-bold text-[#5d6a60]" htmlFor="qr">
          Mã QR
        </label>
        <input className="mt-2 min-h-14 w-full rounded-2xl border border-[#d9e5da] bg-white px-4 font-black text-[#151d18] outline-none focus:ring-2 focus:ring-[#007a3d]/20" id="qr" value={qrCode} onChange={(event) => setQrCode(event.target.value)} />

        <div className="mt-4 grid gap-3">
          <InfoRow icon={MapPin} title="Vị trí hiện tại" body="Sảnh chính tòa nhà A, trong bán kính hợp lệ." />
          <InfoRow icon={Wifi} title="Thùng đang hoạt động" body="Có thể tạo phiên gửi trong 120 giây." />
        </div>

        {payload?.bin ? (
          <div className="mt-5 rounded-[24px] border border-[#8ff8b6] bg-[#f3fcf3] p-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 shrink-0 text-[#007a3d]" />
              <div>
                <p className="font-black text-[#151d18]">{payload.bin.name}</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-[#5d6a60]">{payload.bin.locationName}</p>
                <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-[#007a3d]">
                  <Clock3 size={14} />
                  Phiên QR đã sẵn sàng
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {error ? <p className="mt-4 rounded-2xl bg-[#fff0f0] p-3 text-sm font-bold text-[#B91C1C]">{error}</p> : null}

        <div className="mt-6 grid gap-3">
          <button className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#007a3d] px-5 font-black text-white shadow-[0_12px_30px_rgba(0,106,61,0.22)] transition hover:bg-[#006a35] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} onClick={verifyBin} type="button">
            <ShieldCheck size={18} />
            {loading ? "Đang xác nhận..." : payload ? "Xác nhận lại" : "Xác nhận thùng"}
          </button>
          <button className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#edf6ed] px-5 font-black text-[#151d18] ring-1 ring-[#d9e5da] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!payload?.session} onClick={continueToCapture} type="button">
            Tiếp tục chụp ảnh
          </button>
        </div>
      </aside>
    </div>
  );
}

function InfoRow({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3 rounded-[22px] border border-[#d9e5da] bg-white p-4">
      <Icon className="mt-0.5 text-[#007a3d]" size={18} />
      <div>
        <p className="font-black text-[#151d18]">{title}</p>
        <p className="mt-1 text-sm leading-5 text-[#5d6a60]">{body}</p>
      </div>
    </div>
  );
}
