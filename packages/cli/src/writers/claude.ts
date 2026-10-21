import type { RulesPlatform } from "../manifest";
import { formatNativeMustRules } from "../nativeGuide";
import { formatMustRules } from "../skillGuide";
import { isDual, SCOPE_NOTES, type PlatformBodies } from "./scope";
import type { FileTarget } from "./types";

/**
 * Claude Code, `.claude/skills/<isim>/SKILL.md`i (YAML frontmatter + gövde)
 * bir "skill" olarak okur. Frontmatter dosyanın LİTERAL İLK BAYTLARI olmak
 * zorunda — bu yüzden `prefix` olarak (marker bloğunun DIŞINDA) yazılır.
 *
 * SKILL.md diğer araçlardan ZENGİN içerik alır (kısa kurallar +
 * sayfa kurma rehberi) — Claude onu yalnız ilgili işte yükler. Skill her
 * istekte yüklenmediği için kesin kurallar ayrıca `CLAUDE.md`ye de yazılır
 * (her oturumda okunur); ayrıntı yine tek yerde, SKILL.md'de.
 */
export function buildClaudeTargets(bodies: PlatformBodies): FileTarget[] {
  if (isDual(bodies)) return buildDualTargets(bodies);
  if (bodies.native !== undefined) return buildNativeTargets(bodies.native);
  return buildWebTargets(bodies.web ?? "");
}

function skillFrontmatter(name: string, description: string): string {
  return ["---", `name: ${name}`, `description: ${description}`, "---", ""].join("\n");
}

const WEB_SKILL_DESCRIPTION =
  "mari-ui tasarım sistemiyle sayfa, form ya da component kurarken kullan — component envanteri, prop sözleşmesi, kesin kurallar, sayfa kalıpları ve hangi durumda hangi component rehberi.";
const NATIVE_SKILL_DESCRIPTION =
  "mari-ui React Native (@mari-ui/native) ile ekran, form ya da component kurarken kullan — component envanteri, prop sözleşmesi, kesin kurallar, ekran kalıpları ve component seçimi.";

const SKILL_PATHS: Record<RulesPlatform, string> = {
  web: ".claude/skills/mari-ui-web/SKILL.md",
  native: ".claude/skills/mari-ui-native/SKILL.md",
};

function buildWebTargets(skillBody: string): FileTarget[] {
  const claudeMd = [
    "## mari-ui",
    "",
    "Bu proje mari-ui tasarım sistemini kullanıyor. Sayfa, form ya da component",
    "kurarken `.claude/skills/mari-ui/SKILL.md` skill'ini kullan (envanter, prop",
    "sözleşmesi, sayfa kalıpları, component seçimi). Bu blok ve skill",
    "`npx @mari-ui/cli sync` ile otomatik güncellenir, elle düzenlenmez.",
    "",
    "Kesin kurallar:",
    "",
    formatMustRules(),
  ].join("\n");

  return [
    { relativePath: ".claude/skills/mari-ui/SKILL.md", prefix: skillFrontmatter("mari-ui", WEB_SKILL_DESCRIPTION), body: skillBody },
    { relativePath: "CLAUDE.md", body: claudeMd },
  ];
}

function buildNativeTargets(skillBody: string): FileTarget[] {
  const claudeMd = [
    "## mari-ui (React Native)",
    "",
    "Bu proje mari-ui'ın React Native katmanını (`@mari-ui/native`) kullanıyor.",
    `Ekran, form ya da component kurarken \`${SKILL_PATHS.native}\` skill'ini kullan`,
    "(envanter, prop sözleşmesi, ekran kalıpları, component seçimi). Bu blok ve skill",
    "`npx @mari-ui/cli sync` ile otomatik güncellenir, elle düzenlenmez.",
    "",
    "Kesin kurallar:",
    "",
    formatNativeMustRules(),
  ].join("\n");

  return [
    { relativePath: SKILL_PATHS.native, prefix: skillFrontmatter("mari-ui-native", NATIVE_SKILL_DESCRIPTION), body: skillBody },
    { relativePath: "CLAUDE.md", body: claudeMd },
  ];
}

/** `both`: iki ayrı skill; `CLAUDE.md`de iki bölüm, her birinin başında "hangi dosyalar için" notu. */
function buildDualTargets(bodies: Required<PlatformBodies>): FileTarget[] {
  const claudeMd = [
    "## mari-ui",
    "",
    "Bu proje mari-ui'ı hem web (`@mari-ui/components`) hem React Native (`@mari-ui/native`)",
    `için kullanıyor. Web kodunda \`${SKILL_PATHS.web}\`, React Native kodunda`,
    `\`${SKILL_PATHS.native}\` skill'ini kullan. Bu blok ve skill'ler`,
    "`npx @mari-ui/cli sync` ile otomatik güncellenir, elle düzenlenmez.",
    "",
    "### Web",
    "",
    SCOPE_NOTES.web,
    "",
    "Kesin kurallar:",
    "",
    formatMustRules(),
    "",
    "### React Native",
    "",
    SCOPE_NOTES.native,
    "",
    "Kesin kurallar:",
    "",
    formatNativeMustRules(),
  ].join("\n");

  return [
    { relativePath: SKILL_PATHS.web, prefix: skillFrontmatter("mari-ui-web", WEB_SKILL_DESCRIPTION), body: `${SCOPE_NOTES.web}\n\n${bodies.web}` },
    { relativePath: SKILL_PATHS.native, prefix: skillFrontmatter("mari-ui-native", NATIVE_SKILL_DESCRIPTION), body: `${SCOPE_NOTES.native}\n\n${bodies.native}` },
    { relativePath: "CLAUDE.md", body: claudeMd },
  ];
}
