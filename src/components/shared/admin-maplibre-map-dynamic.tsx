"use client";

import dynamic from "next/dynamic";

export const DynamicAdminMapLibreMap = dynamic<import("@/components/admin/admin-maplibre-map").AdminMapLibreMapProps>(
  () => import("@/components/admin/admin-maplibre-map").then((mod) => mod.AdminMapLibreMap),
  { ssr: false },
);
