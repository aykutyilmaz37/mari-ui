import type { FileTarget } from "./types";

/**
 * Cursor, `.cursor/rules/*.mdc`i (frontmatter + gövde) glob'a uyan dosyalar
 * açıkken bağlama ekler. Frontmatter dosyanın literal ilk baytları olmak
 * zorunda — bu yüzden `prefix` olarak (marker bloğunun DIŞINDA) yazılır
 * (bkz. `writers/claude.ts`teki aynı gerekçe — bir smoke test'te fiilen
 * frontmatter'ın marker'ın İÇİNE düşüp parser'ı bozduğu görüldü).
 */
export function buildCursorTargets(rulesBody: string): FileTarget[] {
  const frontmatter = ["---", "description: mari-ui tasarım sistemi component kuralları", "globs: **/*.tsx", "alwaysApply: false", "---", ""].join(
    "\n"
  );
  return [{ relativePath: ".cursor/rules/mari-ui.mdc", prefix: frontmatter, body: rulesBody }];
}
