import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { syncAgentRules } from "../sync";
import { MARKER_START } from "../markerBlock";
import { cleanupTempDir, makeTempDir, REAL_MANIFEST_PATH } from "./testUtils";

describe("syncAgentRules (gerçek manifest.json'a karşı, izole bir dizinde)", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => cleanupTempDir(dir));

  it("hiç dosya yokken: beş aracın da dosyalarını sıfırdan oluşturur", () => {
    const result = syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(result.changed).toEqual(
      expect.arrayContaining([".claude/skills/mari-ui/SKILL.md", "CLAUDE.md", "AGENTS.md", ".cursor/rules/mari-ui.mdc", "GEMINI.md", ".github/copilot-instructions.md"])
    );
    for (const relativePath of result.changed) {
      expect(existsSync(join(dir, relativePath))).toBe(true);
    }
  });

  it("AGENTS.md'de kullanıcının ÖNCEDEN yazdığı içerik korunur", () => {
    writeFileSync(join(dir, "AGENTS.md"), "# Benim ajan talimatlarım\n\nBaşka bir konu hakkında notlar.\n", "utf8");
    syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    const content = readFileSync(join(dir, "AGENTS.md"), "utf8");
    expect(content).toContain("Benim ajan talimatlarım");
    expect(content).toContain(MARKER_START);
  });

  it("agents filtresi verilirse SADECE o araçların dosyalarını yazar", () => {
    const result = syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, agents: ["codex"] });
    expect(result.changed).toEqual(["AGENTS.md"]);
    expect(existsSync(join(dir, "GEMINI.md"))).toBe(false);
  });

  it("iki kere art arda çalıştırılırsa ikinci seferde HİÇBİR ŞEY değişmez (idempotent)", () => {
    syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    const second = syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    expect(second.changed).toEqual([]);
    expect(second.upToDate.length).toBeGreaterThan(0);
  });

  it("check: true iken HİÇBİR DOSYA YAZMAZ, sadece raporlar", () => {
    const result = syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, check: true });
    expect(result.changed.length).toBeGreaterThan(0); // hiç dosya yok, hepsi "bayat"
    expect(existsSync(join(dir, "AGENTS.md"))).toBe(false); // ama fiilen yazılmadı
  });

  it("check: true, dosyalar zaten güncelken: hiçbir şeyi bayat göstermez", () => {
    syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH });
    const result = syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, check: true });
    expect(result.changed).toEqual([]);
  });

  it("@mari-ui/components henüz kurulu değilse (yanlış manifestPath) açık bir ManifestNotFoundError fırlatır", () => {
    expect(() => syncAgentRules({ targetDir: dir, manifestPath: join(dir, "yok-boyle-bir-dosya.json") })).toThrow();
  });
});

describe("SKILL.md ve .mdc frontmatter'ı marker bloğunun DIŞINDA kalır (regresyon)", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => cleanupTempDir(dir));

  it("SKILL.md tam olarak '---' ile başlar (frontmatter marker'ın İÇİNE düşmemiş)", () => {
    syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, agents: ["claude"] });
    const content = readFileSync(join(dir, ".claude/skills/mari-ui/SKILL.md"), "utf8");
    expect(content.startsWith("---\n")).toBe(true);
    expect(content).toContain(MARKER_START);
    expect(content.indexOf("---")).toBeLessThan(content.indexOf(MARKER_START));
  });

  it(".cursor/rules/mari-ui.mdc de aynı şekilde '---' ile başlar", () => {
    syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, agents: ["cursor"] });
    const content = readFileSync(join(dir, ".cursor/rules/mari-ui.mdc"), "utf8");
    expect(content.startsWith("---\n")).toBe(true);
  });

  it("ikinci sync'te frontmatter TEKRARLANMAZ (idempotent, prefix duplicate olmaz)", () => {
    syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, agents: ["claude"] });
    const second = syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, agents: ["claude"] });
    expect(second.changed).toEqual([]);
    const content = readFileSync(join(dir, ".claude/skills/mari-ui/SKILL.md"), "utf8");
    expect(content.match(/^---$/gm)?.length).toBe(2); // frontmatter'ın açılış+kapanış çizgisi, bir kere
  });
});
