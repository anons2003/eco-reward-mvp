import { describe, expect, it } from "vitest";
import { mockAnalyzeImage } from "./mock-provider";

describe("mockAnalyzeImage", () => {
  it("returns deterministic demo analysis for the same URL", async () => {
    const first = await mockAnalyzeImage("https://example.com/plastic-demo.jpg");
    const second = await mockAnalyzeImage("https://example.com/plastic-demo.jpg");

    expect(first).toEqual(second);
    expect(first.confidence).toBeGreaterThanOrEqual(0.8);
    expect(first.wasteType).toBe("plastic_bottle");
  });
});
