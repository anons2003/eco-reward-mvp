import { ScanForm } from "@/components/user/scan-form";
import { PageHeader } from "@/components/shared/eco-ui";

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Phiên gửi" title="Quét mã QR" body="Đưa mã QR trên thùng vào khung hoặc dùng mã demo để tạo phiên gửi trong 120 giây." />
      <ScanForm />
    </div>
  );
}
