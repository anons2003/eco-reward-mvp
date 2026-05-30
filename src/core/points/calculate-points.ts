import type { WasteType } from "@/core/entities/types";

export const POINTS_BY_WASTE_TYPE: Record<WasteType, number> = {
  plastic_bottle: 10,
  metal_can: 12,
  paper: 6,
  cardboard: 8,
  glass_bottle: 9,
  organic: 5,
  hazardous: 0,
  unknown: 0,
};

export function calculatePoints(wasteType: WasteType): number {
  return POINTS_BY_WASTE_TYPE[wasteType] ?? 0;
}
