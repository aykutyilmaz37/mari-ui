import type { FileTarget } from "./types";

/** GitHub Copilot, `.github/copilot-instructions.md`i her isteğe otomatik ekler. */
export function buildCopilotTargets(rulesBody: string): FileTarget[] {
  return [{ relativePath: ".github/copilot-instructions.md", body: rulesBody }];
}
