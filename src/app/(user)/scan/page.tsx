import { ScanForm } from "@/components/user/scan-form";

export default function ScanPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-black">Quét mã QR</h1>
      <p className="mb-6 text-[#3f4850]">Đưa mã QR trên thùng vào khung hoặc dùng mã demo.</p>
      <ScanForm />
    </div>
  );
}
