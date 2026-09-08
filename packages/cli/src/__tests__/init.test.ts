import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runInit } from "../init";
import { cleanupTempDir, makeTempDir, REAL_MANIFEST_PATH } from "./testUtils";

describe("runInit", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => cleanupTempDir(dir));

  it("package.json'a üç bağımlılığı da ekler, mevcut alanlara DOKUNMAZ", () => {
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "tuketici-proje", dependencies: { react: "^19.0.0" } }), "utf8");

    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(result.addedDependencies).toEqual(expect.arrayContaining(["@mari-ui/components", "@mari-ui/core", "@mari-ui/tokens"]));

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.name).toBe("tuketici-proje");
    expect(pkg.dependencies.react).toBe("^19.0.0");
    expect(pkg.dependencies["@mari-ui/components"]).toBeDefined();
  });

  it("bağımlılık ZATEN varsa üzerine yazmaz, 'zaten vardı' listesine koyar", () => {
    writeFileSync(join(dir, "package.json"), JSON.stringify({ dependencies: { "@mari-ui/components": "1.2.3" } }), "utf8");
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(result.alreadyHadDependencies).toContain("@mari-ui/components");

    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    expect(pkg.dependencies["@mari-ui/components"]).toBe("1.2.3"); // ezilmedi
  });

  it("package.json yoksa çökmez, sadece config + kural dosyalarını yazar", () => {
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(result.packageJsonMissing).toBe(true);
    expect(result.addedDependencies).toEqual([]);
    expect(existsSync(result.configPath)).toBe(true);
  });

  it("mari-ui.config.json ve AI ajan kural dosyalarının hepsini oluşturur", () => {
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(result.configCreated).toBe(true);
    expect(result.ruleFiles?.changed.length).toBeGreaterThan(0);
    expect(existsSync(join(dir, "AGENTS.md"))).toBe(true);
  });

  it("manifest bulunamazsa (kurulum henüz tamamlanmamış) ÇÖKMEZ — ruleFiles null döner", () => {
    const result = runInit({ targetDir: dir, manifestPath: join(dir, "hic-yok.json") });
    expect(result.ruleFiles).toBeNull();
    // yine de config oluşturulmuş olmalı — bağımlılık kurulumu bitmeden de bu kısım tamamlanabilir.
    expect(existsSync(result.configPath)).toBe(true);
  });

  it("iki kere çalıştırıldığında (idempotent): ikinci seferde config'e DOKUNMAZ, dependency'leri TEKRAR eklemez", () => {
    writeFileSync(join(dir, "package.json"), JSON.stringify({ dependencies: {} }), "utf8");
    runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    const second = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(second.configCreated).toBe(false);
    expect(second.addedDependencies).toEqual([]);
    expect(second.alreadyHadDependencies.length).toBe(3);
  });
});
