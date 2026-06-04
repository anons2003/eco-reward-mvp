import { describe, expect, it } from "vitest";
import { buildResultImpact } from "./result-impact";

describe("buildResultImpact", () => {
  it("derives CO2 from approved MVP waste type", () => {
    expect(buildResultImpact({ status: "approved", wasteType: "plastic", points: 10 })).toMatchObject({
      title: "Tác động đã ghi nhận",
      co2Label: "0,25 kg",
      pointsLabel: "+10 pts",
      showMetrics: true,
    });
  });

  it("canonicalizes legacy aliases before calculating impact", () => {
    expect(buildResultImpact({ status: "approved", wasteType: "glass_bottle", points: 9 }).co2Label).toBe("0,16 kg");
  });

  it("does not show environmental metrics before review is approved", () => {
    expect(buildResultImpact({ status: "pending_review", wasteType: "plastic", points: 10 })).toMatchObject({
      title: "Chưa ghi nhận tác động",
      co2Label: "0 kg",
      pointsLabel: "Chờ duyệt",
      showMetrics: false,
    });
  });

  it("does not count rejected submissions as impact", () => {
    expect(buildResultImpact({ status: "rejected", wasteType: "metal", points: 0 })).toMatchObject({
      title: "Không ghi nhận tác động",
      co2Label: "0 kg",
      pointsLabel: "0 pts",
      showMetrics: false,
    });
  });
});
