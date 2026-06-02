import { describe, expect, it } from "vitest";
import { buildLocationGroups, filterLocationGroups, normalizeSearchText, type LocationGroupBin, type LocationGroupLocation } from "./admin-location-groups";

const locations: LocationGroupLocation[] = [
  {
    id: "location-1",
    name: "Chợ Hàn",
    address: "119 Trần Phú, Hải Châu, Đà Nẵng",
    district: "Hải Châu",
    ward: "Hải Châu 1",
    lat: 16.0681,
    lng: 108.2247,
  },
  {
    id: "location-2",
    name: "Công viên Biển Đông",
    address: "Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
    district: "Sơn Trà",
    ward: "Phước Mỹ",
    lat: 16.0732,
    lng: 108.2458,
  },
];

const bins: LocationGroupBin[] = [
  {
    id: "bin-1",
    name: "Thùng phân loại Chợ Hàn A",
    qr_code: "SEATECH-BIN-HAN-A",
    location_id: "location-1",
    location_name: "Chợ Hàn",
    active: true,
  },
  {
    id: "bin-2",
    name: "Thùng ven biển",
    qr_code: "SEATECH-BIN-BIEN-DONG",
    location_id: "location-2",
    location_name: "Công viên Biển Đông",
    active: false,
  },
];

describe("admin location groups", () => {
  it("normalizes Vietnamese text for smart search", () => {
    expect(normalizeSearchText("Đà Nẵng - Hải Châu")).toBe("da nang hai chau");
  });

  it("filters groups by district, address, bin name, and qr code", () => {
    const groups = buildLocationGroups(locations, bins);

    expect(filterLocationGroups(groups, "hai chau")).toHaveLength(1);
    expect(filterLocationGroups(groups, "119 tran phu")[0]?.location.name).toBe("Chợ Hàn");
    expect(filterLocationGroups(groups, "bin bien dong")[0]?.location.name).toBe("Công viên Biển Đông");
    expect(filterLocationGroups(groups, "phan loai")[0]?.location.name).toBe("Chợ Hàn");
  });

  it("sorts unfiltered groups by number of linked bins", () => {
    const groups = buildLocationGroups(locations, [...bins, { ...bins[0], id: "bin-3", qr_code: "SEATECH-BIN-HAN-B" }]);

    expect(filterLocationGroups(groups, "")[0]?.location.name).toBe("Chợ Hàn");
  });
});
