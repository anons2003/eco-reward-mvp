import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertTriangle, CalendarClock, Database, ImageIcon, MapPin, Recycle, ShieldCheck } from "lucide-react";
import { AdminCard, AdminMetric, AdminPageHeader, AdminStatusBadge } from "@/components/admin/admin-ui";
import { DynamicAdminDashboardMotion, DynamicReviewActions } from "@/components/shared/dynamic-client-components";
import { seaTechService } from "@/application/services/seatech-service";

const wasteTypeLabel: Record<string, string> = {
  plastic_bottle: "Chai nhựa",
  metal_can: "Lon kim loại",
  paper: "Giấy",
  cardboard: "Bìa carton",
  glass_bottle: "Chai thủy tinh",
  organic: "Hữu cơ",
  hazardous: "Nguy hại",
  unknown: "Không xác định",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = seaTechService.getSubmission(id);
  if (!submission) notFound();

  const bin = seaTechService.listBins().find((row) => row.id === submission.binId);
  const confidence = Math.round(submission.aiResult.confidence * 100);
  const wasteLabel = wasteTypeLabel[submission.aiResult.wasteType] ?? submission.aiResult.wasteType.replaceAll("_", " ");
  const riskFlags = submission.riskFlags.length ? submission.riskFlags : ["Không có cảnh báo."];

  return (
    <div className="space-y-6">
      <DynamicAdminDashboardMotion />

      <AdminPageHeader
        eyebrow="Chi tiết kiểm duyệt"
        title="Chi tiết lượt gửi"
        body="Rà soát ảnh, kết quả nhận diện, tín hiệu rủi ro và dữ liệu thùng rác trước khi duyệt điểm cho người dùng."
        action={<AdminStatusBadge status={submission.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <AdminCard className="overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="relative min-h-[280px] bg-[#efedec]">
                <Image alt={`Ảnh lượt gửi ${submission.id}`} className="object-contain p-6" fill priority sizes="(min-width: 1024px) 430px, 100vw" src={submission.imageUrl} />
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-[#006d37] shadow-sm backdrop-blur">
                  <ImageIcon size={14} />
                  Ảnh gốc
                </span>
              </div>

              <div className="p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-[#006d37]">Kết quả nhận diện</p>
                    <h2 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#1b1c1b]">{wasteLabel}</h2>
                  </div>
                  <span className="rounded-full bg-[#d8f5df] px-3 py-1 text-xs font-black text-[#006d37]">ID {submission.id}</span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <AdminMetric Icon={ShieldCheck} label="Độ tin cậy" tone={confidence >= 80 ? "green" : confidence >= 50 ? "amber" : "red"} value={`${confidence}%`} />
                  <AdminMetric Icon={Recycle} label="Số vật thể" tone="blue" value={`${submission.aiResult.objectCount}`} />
                  <AdminMetric Icon={Database} label="Điểm dự kiến" tone={submission.points > 0 ? "green" : "amber"} value={`${submission.points} pts`} />
                  <AdminMetric Icon={CalendarClock} label="Thời gian gửi" tone="blue" value={formatDate(submission.createdAt)} valueClassName="text-base leading-6" />
                </div>

                <div className="mt-5 rounded-2xl border border-[#d9e5da] bg-[#fbf9f8] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.1em] text-[#6e7a70]">Lý do hiện tại</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#1b1c1b]">{submission.reason}</p>
                </div>
              </div>
            </div>
          </AdminCard>

          <div className="grid gap-6 md:grid-cols-2">
            <AdminCard className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e8f5ff] text-[#006496]">
                  <MapPin size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#1b1c1b]">Dữ liệu thùng rác</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#6e7a70]">{bin?.name ?? "Không rõ"}</p>
                  <p className="text-sm font-semibold leading-6 text-[#6e7a70]">{bin?.locationName ?? "Chưa có địa điểm"}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.1em] text-[#006d37]">{bin?.active ? "Đang hoạt động" : "Không hoạt động"}</p>
                </div>
              </div>
            </AdminCard>

            <AdminCard className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff7e6] text-[#bd7700]">
                  <AlertTriangle size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-[#1b1c1b]">Cảnh báo cần kiểm tra</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {riskFlags.map((flag) => (
                      <span className="rounded-full bg-[#fff7e6] px-3 py-1 text-xs font-black text-[#735c00]" key={flag}>
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </AdminCard>
          </div>
        </div>

        <DynamicReviewActions submissionId={submission.id} />
      </div>
    </div>
  );
}
