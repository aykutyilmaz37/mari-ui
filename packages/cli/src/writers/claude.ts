import type { FileTarget } from "./types";

/**
 * Claude Code, `.claude/skills/<isim>/SKILL.md`i (YAML frontmatter + gövde)
 * bir "skill" olarak okur. Frontmatter dosyanın LİTERAL İLK BAYTLARI olmak
 * zorunda — bu yüzden `prefix` olarak (marker bloğunun DIŞINDA) yazılır.
 *
 * `CLAUDE.md`ye de KISA bir işaretçi eklenir (plan: "+ CLAUDE.md içine kısa
 * işaretçi blok") — böylece proje kökünde `CLAUDE.md` okuyan biri (insan
 * veya ajan) skill'in var olduğunu fark eder; asıl içerik TEK yerde
 * (SKILL.md) durur, iki dosyaya kopyalanmaz.
 */
export function buildClaudeTargets(rulesBody: string): FileTarget[] {
  const frontmatter = [
    "---",
    "name: mari-ui",
    "description: mari-ui tasarım sistemi component'lerini doğru prop'larla, doğru import yollarıyla kullanmak için kurallar. Bir mari-ui component'i (Button, Input, Card, ...) eklerken veya düzenlerken bu skill'i kullan.",
    "---",
    "",
  ].join("\n");

  const claudeMdPointer = [
    "mari-ui tasarım sistemi kullanılıyor. Component eklerken/düzenlerken",
    "`.claude/skills/mari-ui/SKILL.md`teki kurallara bak (prop sözleşmesi,",
    "terk edilmiş prop'lar, anti-pattern'ler). O dosya `npx mari-ui sync`",
    "ile otomatik güncellenir, elle düzenlenmez.",
  ].join("\n");

  return [
    { relativePath: ".claude/skills/mari-ui/SKILL.md", prefix: frontmatter, body: rulesBody },
    { relativePath: "CLAUDE.md", body: claudeMdPointer },
  ];
}
