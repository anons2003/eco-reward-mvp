const baseUrl = process.env.SMOKE_BASE_URL ?? "https://eco-reward-mvp.vercel.app";

const checks = [
  { path: "/", status: 200 },
  { path: "/login", status: 200 },
  { path: "/admin/login", status: 200 },
  { path: "/dashboard", status: 307, locationIncludes: "/login" },
  { path: "/admin/points", status: 307, locationIncludes: "/admin/login" },
];

let failed = false;

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
  const response = await fetch(url, { redirect: "manual" });
  const location = response.headers.get("location") ?? "";
  const statusMatches = response.status === check.status;
  const locationMatches = check.locationIncludes
    ? location.includes(check.locationIncludes)
    : true;

  if (!statusMatches || !locationMatches) {
    failed = true;
    console.error(
      [
        `FAIL ${check.path}`,
        `expected status ${check.status}, got ${response.status}`,
        check.locationIncludes
          ? `expected location containing ${check.locationIncludes}, got ${location || "(empty)"}`
          : undefined,
      ]
        .filter(Boolean)
        .join(" | "),
    );
  } else {
    console.log(`PASS ${check.path} -> ${response.status}`);
  }
}

if (failed) {
  process.exit(1);
}
