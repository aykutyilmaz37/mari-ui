import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { discoverEntries, publishedExports, toSubpath, workspaceExports } from "../../scripts/entries";

const root = join(__dirname, "../..");
const src = join(root, "src");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const FIX = "→ `pnpm --filter @mari-ui/native sync:exports`";

describe("subpath export'ları (Faz 2)", () => {
  it(`package.json exports src'deki entry'lerle aynı ${FIX}`, () => {
    expect(pkg.exports).toEqual(workspaceExports(src));
  });

  it(`publishConfig.exports aynı, ./stories hariç ${FIX}`, () => {
    expect(pkg.publishConfig.exports).toEqual(publishedExports(src));
    expect(pkg.publishConfig.exports["./stories"]).toBeUndefined();
  });

  it("kök barrel her bileşen entry'sinin export'larını da verir", () => {
    const barrel = readFileSync(join(src, "index.ts"), "utf8");
    for (const [name, file] of Object.entries(discoverEntries(src))) {
      if (name === "index" || name === "theme" || name === "config") continue;
      const folder = file.split("/").at(-2);
      expect(barrel, name).toContain(`from "./${folder}"`);
    }
  });

  it("subpath adları web ile aynı kebab-case", () => {
    expect(toSubpath("InputNumber")).toBe("input-number");
    expect(toSubpath("QRCode")).toBe("qrcode");
    expect(toSubpath("BottomNavigation")).toBe("bottom-navigation");
  });
});
