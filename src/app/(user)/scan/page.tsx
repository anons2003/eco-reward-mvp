import { DynamicScanForm } from "@/components/shared/dynamic-client-components";
import { PageHeader } from "@/components/shared/eco-ui";

export default function ScanPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Phiên gửi" title="Quét mã QR" body="Đưa mã QR trên thùng vào khung để xác nhận thùng rác và tạo lượt phân loại trong 120 giây." />
      <DynamicScanForm />
    </div>
  );
}
