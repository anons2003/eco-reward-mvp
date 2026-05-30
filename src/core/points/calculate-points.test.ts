import { describe, expect, it } from "vitest";
import { calculatePoints } from "./calculate-points";

describe("calculatePoints", () => {
  it("returns configured points for supported waste types", () => {
    expect(calculatePoints("plastic_bottle")).toBe(10);
    expect(calculatePoints("metal_can")).toBe(12);
    expect(calculatePoints("paper")).toBe(6);
  });

  it("returns zero for unknown or hazardous waste", () => {
    expect(calculatePoints("unknown")).toBe(0);
    expect(calculatePoints("hazardous")).toBe(0);
  });
});
