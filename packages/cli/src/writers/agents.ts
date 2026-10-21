import { singleFileBody, type PlatformBodies } from "./scope";
import type { FileTarget } from "./types";

/** Codex (ve `AGENTS.md` konvansiyonunu okuyan diğer ajanlar). `both`ta iki bölüm alt alta. */
export function buildAgentsTargets(bodies: PlatformBodies): FileTarget[] {
  return [{ relativePath: "AGENTS.md", body: singleFileBody(bodies) }];
}
