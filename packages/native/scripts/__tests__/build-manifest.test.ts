import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildManifest } from "../build-manifest";
import { discoverEntries } from "../entries";

const SRC = join(__dirname, "../../src");

// Tek bir ts-morph projesi tüm kaynağı tarar; coverage açıkken yavaş.
describe("native manifest (Faz B)", { timeout: 60_000 }, () => {
  const manifest = buildManifest();

  it("her subpath entry'si manifest'te en az bir component ile yer alır", () => {
    const importPaths = new Set(manifest.components.map((c) => c.importPath));
    for (const subpath of Object.keys(discoverEntries(SRC))) {
      if (subpath === "index") continue;
      expect(importPaths, subpath).toContain(`@mari-ui/native/${subpath}`);
    }
  });

  it("component'lerin prop listesi boş değil, requiresUseClient hep false", () => {
    for (const c of manifest.components) {
      expect(c.requiresUseClient, c.name).toBe(false);
      expect(c.props.length, c.name).toBeGreaterThan(0);
    }
    const button = manifest.components.find((c) => c.name === "Button");
    expect(button?.props.find((p) => p.name === "color")?.type).toBe("ColorRole | undefined");
    // React Native'in kendi prop'ları (List → FlatListProps mirası) girmez.
    const list = manifest.components.find((c) => c.name === "List");
    expect(list?.props.map((p) => p.name)).toContain("bordered");
    expect(list?.props.map((p) => p.name)).not.toContain("onEndReached");
  });

  it("eksenler core'dan gelir", () => {
    expect(manifest.axes.ColorRole).toContain("primary");
  });
});
