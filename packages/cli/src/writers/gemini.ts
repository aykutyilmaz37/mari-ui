import { singleFileBody, type PlatformBodies } from "./scope";
import type { FileTarget } from "./types";

/** Gemini CLI/Code Assist, proje kökündeki `GEMINI.md`i bağlam olarak okur. `both`ta iki bölüm alt alta. */
export function buildGeminiTargets(bodies: PlatformBodies): FileTarget[] {
  return [{ relativePath: "GEMINI.md", body: singleFileBody(bodies) }];
}
