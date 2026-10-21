import { describe, expect, it } from "vitest";
import { lightTheme, resolveThemeConfig } from "@mari-ui/tokens";
import { buildRulesContent, buildSkillContent } from "../buildRulesContent";
import { loadManifest } from "../manifest";
import { GUIDE_COMPONENTS, MUST_RULES, SKILL_GUIDE } from "../skillGuide";
import { buildClaudeTargets } from "../writers/claude";
import type { FileTarget } from "../writers/types";
import { REAL_MANIFEST_PATH } from "./testUtils";

describe("Faz 17 — kesin kurallar ve skill rehberi", () => {
  const manifest = loadManifest(process.cwd(), REAL_MANIFEST_PATH);
  const options = { manifest, theme: lightTheme };

  it("rehberde adı geçen her component gerçek manifest'te var (uydurma ad yok)", () => {
    const names = new Set(manifest.components.map((c) => c.name));
    expect(GUIDE_COMPONENTS.filter((name) => !names.has(name))).toEqual([]);
  });

  it("rehberde `X` biçiminde geçen büyük harfli adlar GUIDE_COMPONENTS listesinde", () => {
    const mentioned = new Set([...SKILL_GUIDE.matchAll(/`([A-Z][A-Za-z]+)`/g)].map((m) => m[1] ?? ""));
    const listed = new Set<string>(GUIDE_COMPONENTS);
    expect([...mentioned].filter((name) => !listed.has(name))).toEqual([]);
  });

  it("kısa içerik kesin kuralları içerir, rehberi içermez", () => {
    const rules = buildRulesContent(options);
    expect(rules).toContain("## Kesin kurallar");
    for (const r of MUST_RULES) expect(rules).toContain(r.title);
    expect(rules).not.toContain("## Sayfa kurma rehberi");
  });

  it("skill içeriği = kısa içerik + rehber", () => {
    const skill = buildSkillContent(options);
    expect(skill.startsWith(buildRulesContent(options))).toBe(true);
    expect(skill).toContain("## Sayfa kurma rehberi");
  });

  it("Claude: SKILL.md zengin içerik, CLAUDE.md kesin kuralları ve skill işaretçisini taşır", () => {
    const [skillFile, claudeMd] = buildClaudeTargets({ web: buildSkillContent(options) }) as [FileTarget, FileTarget];
    expect(skillFile.body).toContain("## Sayfa kurma rehberi");
    expect(claudeMd.relativePath).toBe("CLAUDE.md");
    expect(claudeMd.body).toContain(".claude/skills/mari-ui/SKILL.md");
    for (const r of MUST_RULES) expect(claudeMd.body).toContain(r.title);
    expect(claudeMd.body).not.toContain("## Component envanteri");
  });
});

describe("Faz 21 — kişilik ve serbest alanlar", () => {
  const manifest = loadManifest(process.cwd(), REAL_MANIFEST_PATH);

  it("kurallar serbest alanları ve projenin kişiliğini anlatır", () => {
    const rules = buildRulesContent({ manifest, theme: resolveThemeConfig({ persona: "luxury" }).light, persona: "luxury" });
    expect(rules).toContain("## Serbest alanlar");
    expect(rules).toContain("**Lüks** (`luxury`)");
    expect(rules).toContain("Cormorant Garamond");
  });

  it("kişilik yoksa varsayılan anlatılır; SKILL tasarım brief'i adımını içerir", () => {
    const skill = buildSkillContent({ manifest, theme: lightTheme });
    expect(skill).toContain("Varsayılan (Yumuşak iris)");
    expect(skill).toContain("### Proje tasarım brief'i");
    expect(skill).toContain("theme --persona");
  });
});
