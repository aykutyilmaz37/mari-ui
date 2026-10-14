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
    // "latest" değil: CLI'ın kendi sürümüyle aynı aralık (beş paket birlikte sürümlenir).
    const cliVersion = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf8")).version;
    for (const dep of ["@mari-ui/components", "@mari-ui/core", "@mari-ui/tokens"]) expect(pkg.dependencies[dep]).toBe(`^${cliVersion}`);
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
    expect(second.alreadyHadDependencies).toHaveLength(3);
  });
});

describe("runInit — kişilik (Faz 21)", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => cleanupTempDir(dir));

  it("config yoksa özel tema seçimiyle oluşturur", () => {
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, theme: { kind: "custom", primary: "#0f766e" } });
    expect(result.configCreated).toBe(true);
    expect(JSON.parse(readFileSync(result.configPath, "utf8")).color.primary).toBe("#0f766e");
  });

  it("config varsa özel / varsayılan seçim ona DOKUNMAZ (değiştirmek `theme`in işi)", () => {
    writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify({ persona: "luxury" }), "utf8");
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, theme: { kind: "default" } });
    expect(result.configUpdated).toBe(false);
    expect(JSON.parse(readFileSync(result.configPath, "utf8"))).toEqual({ persona: "luxury" });
  });

  it("config yoksa yalnız { persona } yazar", () => {
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, theme: { kind: "persona", name: "playful" } });
    expect(result.configCreated).toBe(true);
    expect(JSON.parse(readFileSync(result.configPath, "utf8"))).toEqual({ persona: "playful" });
  });

  it("config varsa yalnız persona alanını ekler, diğer seçimlere dokunmaz", () => {
    writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify({ color: { primary: "#059669" }, density: { radius: "lg" } }), "utf8");
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, theme: { kind: "persona", name: "minimal" } });
    expect(result.configUpdated).toBe(true);
    const config = JSON.parse(readFileSync(result.configPath, "utf8"));
    expect(config).toEqual({ persona: "minimal", color: { primary: "#059669" }, density: { radius: "lg" } });
    expect(Object.keys(config)[0]).toBe("persona");
  });

  it("aynı kişilik zaten yazılıysa dosyaya dokunmaz", () => {
    writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify({ persona: "luxury" }), "utf8");
    const result = runInit({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, theme: { kind: "persona", name: "luxury" } });
    expect(result.configCreated).toBe(false);
    expect(result.configUpdated).toBe(false);
  });
});
