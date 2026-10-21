import { isDual, PLATFORM_GLOBS, scoped, singleFileBody, type PlatformBodies } from "./scope";
import type { FileTarget } from "./types";

/**
 * GitHub Copilot, `.github/copilot-instructions.md`i her isteğe otomatik ekler.
 * `both`ta bunun yerine `applyTo` glob'lu iki `.instructions.md` yazılır;
 * frontmatter `prefix` olarak marker bloğunun dışında kalır (bkz. `types.ts`).
 */
export function buildCopilotTargets(bodies: PlatformBodies): FileTarget[] {
  if (!isDual(bodies)) return [{ relativePath: ".github/copilot-instructions.md", body: singleFileBody(bodies) }];
  return (["web", "native"] as const).map((platform) => ({
    relativePath: `.github/instructions/mari-ui-${platform}.instructions.md`,
    prefix: ["---", `applyTo: "${PLATFORM_GLOBS[platform]}"`, "---", ""].join("\n"),
    body: scoped(platform, bodies[platform]),
  }));
}
