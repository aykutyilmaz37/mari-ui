import type { FileTarget } from "./types";

/** Codex (ve `AGENTS.md` konvansiyonunu okuyan diğer ajanlar). */
export function buildAgentsTargets(rulesBody: string): FileTarget[] {
  return [{ relativePath: "AGENTS.md", body: rulesBody }];
}
