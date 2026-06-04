import { canonicalWasteType, mvpWasteTypeLabel } from "@/core/points/point-rules";
import type { SubmissionStatus } from "@/core/entities/types";

const co2KgByWasteType: Record<string, number> = {
  plastic: 0.25,
  metal: 0.18,
  paper: 0.08,
  glass: 0.16,
};

function formatKg(value: number) {
  if (value <= 0) return "0 kg";
  return `${value.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} kg`;
}

export function buildResultImpact({
  points,
  status,
  wasteType,
}: {
  points: number;
  status: SubmissionStatus;
  wasteType: unknown;
}) {
  const canonical = canonicalWasteType(wasteType);
  const wasteLabel = mvpWasteTypeLabel(canonical);
  const co2Kg = co2KgByWasteType[canonical] ?? 0;

  if (status === "approved" && co2Kg > 0) {
    return {
      title: "Tác động đã ghi nhận",
      co2Label: formatKg(co2Kg),
      pointsLabel: `+${points.toLocaleString("vi-VN")} pts`,
      note: `Ước tính theo loại rác ${wasteLabel.toLowerCase()} đã xác minh. Chưa hiển thị kWh vì hệ thống chưa có công thức năng lượng riêng.`,
      showMetrics: true,
    };
  }

  if (status === "approved") {
    return {
      title: "Chưa có công thức tác động",
      co2Label: "0 kg",
      pointsLabel: `+${points.toLocaleString("vi-VN")} pts`,
      note: "Lượt gửi đã được duyệt, nhưng loại rác này chưa có công thức CO2 trong MVP.",
      showMetrics: true,
    };
  }

  if (status === "pending_review") {
    return {
      title: "Chưa ghi nhận tác động",
      co2Label: "0 kg",
      pointsLabel: "Chờ duyệt",
      note: "Số liệu môi trường chỉ được ghi nhận sau khi AI/admin xác minh và điểm được cộng.",
      showMetrics: false,
    };
  }

  return {
    title: "Không ghi nhận tác động",
    co2Label: "0 kg",
    pointsLabel: "0 pts",
    note: "Lượt gửi bị từ chối nên không được tính vào tác động môi trường.",
    showMetrics: false,
  };
}
