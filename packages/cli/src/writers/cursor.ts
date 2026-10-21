import type { RulesPlatform } from "../manifest";
import { isDual, PLATFORM_GLOBS, scoped, singleFileBody, type PlatformBodies } from "./scope";
import type { FileTarget } from "./types";

const DESCRIPTIONS: Record<RulesPlatform, string> = {
  web: "mari-ui tasarım sistemi component kuralları",
  native: "mari-ui React Native (@mari-ui/native) component kuralları",
};

function frontmatter(description: string, globs: string): string {
  return ["---", `description: ${description}`, `globs: ${globs}`, "alwaysApply: false", "---", ""].join("\n");
}

/**
 * Cursor, `.cursor/rules/*.mdc`i (frontmatter + gövde) glob'a uyan dosyalar
 * açıkken bağlama ekler. Frontmatter dosyanın literal ilk baytları olmak
 * zorunda — bu yüzden `prefix` olarak (marker bloğunun DIŞINDA) yazılır
 * (bkz. `writers/claude.ts`teki aynı gerekçe — bir smoke test'te fiilen
 * frontmatter'ın marker'ın İÇİNE düşüp parser'ı bozduğu görüldü).
 *
 * `both`ta platform başına bir `.mdc`: glob platform uzantısıyla ayırır,
 * `description` ise ortak `.tsx` dosyalarında Cursor'ın doğru kuralı seçmesini sağlar.
 */
export function buildCursorTargets(bodies: PlatformBodies): FileTarget[] {
  if (!isDual(bodies)) {
    const description = bodies.native === undefined ? DESCRIPTIONS.web : DESCRIPTIONS.native;
    return [{ relativePath: ".cursor/rules/mari-ui.mdc", prefix: frontmatter(description, "**/*.tsx"), body: singleFileBody(bodies) }];
  }
  return (["web", "native"] as const).map((platform) => ({
    relativePath: `.cursor/rules/mari-ui-${platform}.mdc`,
    prefix: frontmatter(`${DESCRIPTIONS[platform]} — ${platform === "web" ? "web dosyaları" : "react-native / @mari-ui/native import eden dosyalar"}`, PLATFORM_GLOBS[platform]),
    body: scoped(platform, bodies[platform]),
  }));
}
