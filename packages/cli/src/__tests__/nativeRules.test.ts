import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadManifest, loadManifestSafe } from "../manifest";
import { NATIVE_GUIDE_COMPONENTS } from "../nativeGuide";
import { syncAgentRules } from "../sync";
import { cleanupTempDir, makeTempDir, REAL_MANIFEST_PATH, REAL_NATIVE_MANIFEST_PATH } from "./testUtils";

/** Native metinde adı bile geçmemeli: AI'a "kullanma" demek de web dünyasını çağırır. */
const WEB_ONLY_WORDS = ["Tailwind", "tailwind", "className", "href", "use client", "RSC"];

describe("native AI kuralları", () => {
  let dir: string;
  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => cleanupTempDir(dir));

  const writeConfig = (platform: string) => writeFileSync(join(dir, "mari-ui.config.json"), JSON.stringify({ platform }), "utf8");
  const read = (relativePath: string) => readFileSync(join(dir, relativePath), "utf8");

  it("native projede: native dosyaları yazılır, web'e özgü hiçbir kelime geçmez", () => {
    writeConfig("native");
    const result = syncAgentRules({ targetDir: dir, manifestPath: REAL_NATIVE_MANIFEST_PATH });
    expect(result.changed).toHaveLength(6);
    expect(result.changed).toEqual(
      expect.arrayContaining([".claude/skills/mari-ui-native/SKILL.md", "CLAUDE.md", "AGENTS.md", ".cursor/rules/mari-ui.mdc", "GEMINI.md", ".github/copilot-instructions.md"])
    );
    for (const file of result.changed) {
      const content = read(file);
      for (const word of WEB_ONLY_WORDS) expect(content, `${file} içinde "${word}"`).not.toContain(word);
      // Web paketi yalnız anti-pattern'in ❌ örneğinde geçer.
      const webImports = content.split("\n").filter((line) => line.includes("@mari-ui/components/"));
      for (const line of webImports) expect(line.startsWith("- ❌"), line).toBe(true);
    }
    expect(read("AGENTS.md")).toContain('import { Button } from "@mari-ui/native/button"');
    expect(read(".claude/skills/mari-ui-native/SKILL.md")).toContain("onPress");
    expect(read("CLAUDE.md")).toContain("accessibilityLabel");
  });

  it("native sync ikinci kez çalışınca her şey güncel (--check temiz)", () => {
    writeConfig("native");
    syncAgentRules({ targetDir: dir, manifestPath: REAL_NATIVE_MANIFEST_PATH });
    expect(syncAgentRules({ targetDir: dir, manifestPath: REAL_NATIVE_MANIFEST_PATH, check: true }).changed).toEqual([]);
  });

  it("both: iki gövde de yazılır — iki skill, glob'lu Cursor/Copilot dosyaları, tek dosyalılarda iki bölüm", () => {
    writeConfig("both");
    const result = syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, nativeManifestPath: REAL_NATIVE_MANIFEST_PATH });
    expect(result.changed).toEqual(
      expect.arrayContaining([
        ".claude/skills/mari-ui-web/SKILL.md",
        ".claude/skills/mari-ui-native/SKILL.md",
        ".cursor/rules/mari-ui-web.mdc",
        ".cursor/rules/mari-ui-native.mdc",
        ".github/instructions/mari-ui-web.instructions.md",
        ".github/instructions/mari-ui-native.instructions.md",
      ])
    );
    for (const file of ["AGENTS.md", "GEMINI.md", "CLAUDE.md"]) {
      const content = read(file);
      expect(content).toContain("**Hangi dosyalar için:** web kodu");
      expect(content).toContain("**Hangi dosyalar için:** React Native kodu");
    }
    expect(read("AGENTS.md")).toContain('from "@mari-ui/components/button"');
    expect(read("AGENTS.md")).toContain('from "@mari-ui/native/button"');
    expect(read(".cursor/rules/mari-ui-native.mdc")).toContain("globs: **/*.native.tsx");
    expect(read(".github/instructions/mari-ui-web.instructions.md").startsWith('---\napplyTo: "**/*.web.tsx"\n---\n')).toBe(true);
    const nativeSkill = read(".claude/skills/mari-ui-native/SKILL.md");
    for (const word of WEB_ONLY_WORDS) expect(nativeSkill).not.toContain(word);
    expect(syncAgentRules({ targetDir: dir, manifestPath: REAL_MANIFEST_PATH, nativeManifestPath: REAL_NATIVE_MANIFEST_PATH, check: true }).changed).toEqual([]);
  });

  it("native paketi kurulu değilse hata doğru paketi söyler", () => {
    expect(() => loadManifestSafe(dir, undefined, "native")).toThrow(/"@mari-ui\/native" bulunamadı/);
    expect(() => loadManifestSafe(dir, undefined, "web")).toThrow(/"@mari-ui\/components" bulunamadı/);
  });

  it("native rehberde adı geçen her component native manifest'te var", () => {
    const names = new Set(loadManifest(dir, REAL_NATIVE_MANIFEST_PATH, "native").components.map((c) => c.name));
    for (const name of NATIVE_GUIDE_COMPONENTS) expect(names.has(name), name).toBe(true);
  });
});
