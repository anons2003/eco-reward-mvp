import type { SubmissionStatus } from "@/core/entities/types";

const statusClass: Record<SubmissionStatus, string> = {
  approved: "bg-[#D1EEDD] text-[#006d37]",
  pending_review: "bg-[#fff4c2] text-[#904d00]",
  rejected: "bg-[#ffdad6] text-[#ba1a1a]",
};

const statusLabel: Record<SubmissionStatus, string> = {
  approved: "Đã cộng điểm",
  pending_review: "Chờ duyệt",
  rejected: "Từ chối",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return <span className={`badge ${statusClass[status]}`}>{statusLabel[status]}</span>;
}
