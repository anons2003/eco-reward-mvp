import type { SubmissionStatus } from "@/core/entities/types";

const statusClass: Record<SubmissionStatus, string> = {
  approved: "bg-[#151515] text-white",
  pending_review: "bg-[#fff7e6] text-[#92400E]",
  rejected: "bg-[#fff0f0] text-[#B91C1C]",
};

const statusLabel: Record<SubmissionStatus, string> = {
  approved: "Đã cộng điểm",
  pending_review: "Chờ duyệt",
  rejected: "Từ chối",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return <span className={`badge ${statusClass[status]}`}>{statusLabel[status]}</span>;
}
