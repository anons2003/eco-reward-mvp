import { describe, expect, it } from "vitest";
import { calculatePoints } from "./calculate-points";

describe("calculatePoints", () => {
  it("returns configured points for supported waste types", () => {
    expect(calculatePoints("plastic")).toBe(10);
    expect(calculatePoints("metal")).toBe(12);
    expect(calculatePoints("glass")).toBe(9);
    expect(calculatePoints("paper")).toBe(6);
  });

  it("keeps legacy material aliases compatible", () => {
    expect(calculatePoints("plastic_bottle")).toBe(10);
    expect(calculatePoints("metal_can")).toBe(12);
    expect(calculatePoints("glass_bottle")).toBe(9);
  });

  it("returns zero for unknown or legacy waste types", () => {
    expect(calculatePoints("cardboard")).toBe(0);
    expect(calculatePoints("organic")).toBe(0);
    expect(calculatePoints("unknown")).toBe(0);
    expect(calculatePoints("hazardous")).toBe(0);
  });
});
