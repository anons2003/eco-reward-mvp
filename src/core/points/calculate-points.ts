import type { WasteType } from "@/core/entities/types";
import { canonicalWasteType } from "./point-rules";

export const POINTS_BY_WASTE_TYPE: Record<WasteType, number> = {
  plastic: 10,
  metal: 12,
  glass: 9,
  plastic_bottle: 10,
  metal_can: 12,
  paper: 6,
  cardboard: 0,
  glass_bottle: 9,
  organic: 0,
  hazardous: 0,
  unknown: 0,
};

export function calculatePoints(wasteType: WasteType): number {
  return POINTS_BY_WASTE_TYPE[canonicalWasteType(wasteType)] ?? 0;
}
