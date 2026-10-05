import { formatMustRules } from "../skillGuide";
import type { FileTarget } from "./types";

/**
 * Claude Code, `.claude/skills/<isim>/SKILL.md`i (YAML frontmatter + gövde)
 * bir "skill" olarak okur. Frontmatter dosyanın LİTERAL İLK BAYTLARI olmak
 * zorunda — bu yüzden `prefix` olarak (marker bloğunun DIŞINDA) yazılır.
 *
 * Faz 17: SKILL.md diğer araçlardan ZENGİN içerik alır (kısa kurallar +
 * sayfa kurma rehberi) — Claude onu yalnız ilgili işte yükler. Skill her
 * istekte yüklenmediği için kesin kurallar ayrıca `CLAUDE.md`ye de yazılır
 * (her oturumda okunur); ayrıntı yine tek yerde, SKILL.md'de.
 */
export function buildClaudeTargets(skillBody: string): FileTarget[] {
  const frontmatter = [
    "---",
    "name: mari-ui",
    "description: mari-ui tasarım sistemiyle sayfa, form ya da component kurarken kullan — component envanteri, prop sözleşmesi, kesin kurallar, sayfa kalıpları ve hangi durumda hangi component rehberi.",
    "---",
    "",
  ].join("\n");

  const claudeMd = [
    "## mari-ui",
    "",
    "Bu proje mari-ui tasarım sistemini kullanıyor. Sayfa, form ya da component",
    "kurarken `.claude/skills/mari-ui/SKILL.md` skill'ini kullan (envanter, prop",
    "sözleşmesi, sayfa kalıpları, component seçimi). Bu blok ve skill",
    "`npx mari-ui sync` ile otomatik güncellenir, elle düzenlenmez.",
    "",
    "Kesin kurallar:",
    "",
    formatMustRules(),
  ].join("\n");

  return [
    { relativePath: ".claude/skills/mari-ui/SKILL.md", prefix: frontmatter, body: skillBody },
    { relativePath: "CLAUDE.md", body: claudeMd },
  ];
}
