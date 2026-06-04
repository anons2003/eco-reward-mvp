import type { WasteType } from "@/core/entities/types";

export const WASTE_TYPES = ["plastic", "metal", "paper", "glass", "plastic_bottle", "metal_can", "cardboard", "glass_bottle", "organic", "hazardous", "unknown"] as const satisfies readonly WasteType[];
export const MVP_AUTO_WASTE_TYPES = ["plastic", "metal", "paper", "glass"] as const satisfies readonly WasteType[];
export const MVP_REVIEW_WASTE_TYPES = [...MVP_AUTO_WASTE_TYPES, "unknown"] as const satisfies readonly WasteType[];

export const WASTE_TYPE_LABELS: Record<WasteType, string> = {
  plastic: "Nhựa",
  metal: "Kim loại",
  paper: "Giấy",
  glass: "Thủy tinh",
  plastic_bottle: "Nhựa",
  metal_can: "Kim loại",
  cardboard: "Chưa phân loại",
  glass_bottle: "Thủy tinh",
  organic: "Chưa phân loại",
  hazardous: "Chưa phân loại",
  unknown: "Chưa phân loại",
};

export const WASTE_TYPE_DESCRIPTIONS: Record<WasteType, string> = {
  plastic: "Nhựa sạch/khô: chai PET/HDPE, ly/hộp nhựa, túi nilon, màng bọc; nhựa bẩn/lẫn loại để kiểm tra.",
  metal: "Kim loại sạch/khô: lon nhôm, lon thiếc, hộp đồ hộp, nắp kim loại; pin, bình xịt hoặc vật sắc nguy hại để kiểm tra.",
  paper: "Giấy, báo, vở, túi giấy, hộp sữa/hộp nước giấy sạch khô; giấy bẩn/ướt để kiểm tra.",
  glass: "Thủy tinh sạch và nguyên vẹn: chai, lọ, hũ, ly/cốc thủy tinh; gương, bóng đèn, gốm sứ hoặc mảnh vỡ để kiểm tra.",
  plastic_bottle: "Legacy alias của Nhựa. Dữ liệu mới dùng waste_type plastic.",
  metal_can: "Legacy alias của Kim loại. Dữ liệu mới dùng waste_type metal.",
  cardboard: "Loại legacy ngoài phạm vi MVP, cần admin kiểm tra thủ công.",
  glass_bottle: "Legacy alias của Thủy tinh. Dữ liệu mới dùng waste_type glass.",
  organic: "Loại legacy ngoài phạm vi MVP, cần admin kiểm tra thủ công.",
  hazardous: "Loại legacy ngoài phạm vi MVP, cần admin kiểm tra thủ công.",
  unknown: "Ngoài 4 nhóm MVP, ảnh không rõ, rác bẩn/ướt/nguy hại hoặc vật dễ nhầm cần admin kiểm tra.",
};

export const WASTE_TYPE_TONES: Record<WasteType, "blue" | "amber" | "green" | "red"> = {
  plastic: "blue",
  metal: "amber",
  glass: "blue",
  plastic_bottle: "blue",
  metal_can: "amber",
  paper: "green",
  cardboard: "amber",
  glass_bottle: "blue",
  organic: "amber",
  hazardous: "amber",
  unknown: "amber",
};

export function isWasteType(value: unknown): value is WasteType {
  return typeof value === "string" && (WASTE_TYPES as readonly string[]).includes(value);
}

export function canonicalWasteType(value: unknown): WasteType {
  if (value === "plastic_bottle") return "plastic";
  if (value === "metal_can") return "metal";
  if (value === "glass_bottle") return "glass";
  return isWasteType(value) ? value : "unknown";
}

export function isMvpAutoWasteType(value: unknown): boolean {
  return typeof value === "string" && (MVP_AUTO_WASTE_TYPES as readonly string[]).includes(value);
}

export function isMvpReviewWasteType(value: unknown): boolean {
  return typeof value === "string" && (MVP_REVIEW_WASTE_TYPES as readonly string[]).includes(value);
}

export function mvpWasteType(value: unknown): WasteType {
  const canonical = canonicalWasteType(value);
  return isMvpAutoWasteType(canonical) ? canonical : "unknown";
}

export function mvpWasteTypeLabel(value: unknown) {
  return WASTE_TYPE_LABELS[mvpWasteType(value)];
}
