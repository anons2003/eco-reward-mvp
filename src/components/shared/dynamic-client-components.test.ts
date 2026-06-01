import { describe, expect, test } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const appDir = join(process.cwd(), "src/app");
const dynamicModule = "src/components/shared/dynamic-client-components.tsx";

const directClientIslandImports = [
  "@/components/admin/admin-dashboard-motion",
  "@/components/admin/bin-management-actions",
  "@/components/admin/point-rule-management-actions",
  "@/components/admin/review-actions",
  "@/components/admin/reward-management-actions",
  "@/components/admin/user-management-actions",
  "@/components/user/avatar-upload-form",
  "@/components/user/capture-flow",
  "@/components/user/reward-redeem-button",
  "@/components/user/scan-form",
];

function listTsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return listTsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("route client islands", () => {
  test("existing app pages import lazy client islands through the dynamic module", () => {
    const offenders = listTsxFiles(appDir).flatMap((file) => {
      const source = readFileSync(file, "utf8");
      return directClientIslandImports
        .filter((specifier) => source.includes(`"${specifier}"`) || source.includes(`'${specifier}'`))
        .map((specifier) => `${relative(process.cwd(), file)} -> ${specifier}`);
    });

    expect(offenders).toEqual([]);
  });

  test("dynamic client module owns next/dynamic route island exports", () => {
    const source = readFileSync(join(process.cwd(), dynamicModule), "utf8");
    expect(source).toContain("next/dynamic");
    for (const specifier of directClientIslandImports) {
      expect(source).toContain(specifier);
    }
  });
});
