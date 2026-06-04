import type { WasteType } from "@/core/entities/types";

export const WASTE_TYPES = ["plastic_bottle", "metal_can", "paper", "cardboard", "glass_bottle", "organic", "hazardous", "unknown"] as const satisfies readonly WasteType[];
export const MVP_AUTO_WASTE_TYPES = ["plastic_bottle", "metal_can", "paper", "glass_bottle"] as const satisfies readonly WasteType[];
export const MVP_REVIEW_WASTE_TYPES = [...MVP_AUTO_WASTE_TYPES, "unknown"] as const satisfies readonly WasteType[];

export const WASTE_TYPE_LABELS: Record<WasteType, string> = {
  plastic_bottle: "Chai nhựa",
  metal_can: "Lon kim loại",
  paper: "Giấy",
  cardboard: "Carton",
  glass_bottle: "Thủy tinh",
  organic: "Hữu cơ",
  hazardous: "Nguy hại",
  unknown: "Chưa phân loại",
};

export const WASTE_TYPE_DESCRIPTIONS: Record<WasteType, string> = {
  plastic_bottle: "PET, HDPE và chai nhựa sạch sau phân loại.",
  metal_can: "Nhôm, sắt tây hoặc kim loại nhẹ tái chế.",
  paper: "Giấy văn phòng, báo, tạp chí khô.",
  cardboard: "Thùng carton, bìa cứng khô và đã gấp gọn.",
  glass_bottle: "Chai, lọ thủy tinh không vỡ, đã làm sạch.",
  organic: "Rác hữu cơ có thể xử lý sinh học.",
  hazardous: "Pin, hóa chất hoặc rác cần quy trình riêng.",
  unknown: "Ảnh chưa đủ dữ liệu để xác định loại rác.",
};

export const WASTE_TYPE_TONES: Record<WasteType, "blue" | "amber" | "green" | "red"> = {
  plastic_bottle: "blue",
  metal_can: "amber",
  paper: "green",
  cardboard: "green",
  glass_bottle: "blue",
  organic: "green",
  hazardous: "red",
  unknown: "amber",
};

export function isWasteType(value: unknown): value is WasteType {
  return typeof value === "string" && (WASTE_TYPES as readonly string[]).includes(value);
}

export function isMvpAutoWasteType(value: unknown): value is (typeof MVP_AUTO_WASTE_TYPES)[number] {
  return typeof value === "string" && (MVP_AUTO_WASTE_TYPES as readonly string[]).includes(value);
}

export function mvpWasteType(value: unknown): WasteType {
  return isMvpAutoWasteType(value) ? value : "unknown";
}

export function mvpWasteTypeLabel(value: unknown) {
  return WASTE_TYPE_LABELS[mvpWasteType(value)];
}
