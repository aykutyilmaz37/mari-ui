import type { FileTarget } from "./types";

/** Gemini CLI/Code Assist, proje kökündeki `GEMINI.md`i bağlam olarak okur. */
export function buildGeminiTargets(rulesBody: string): FileTarget[] {
  return [{ relativePath: "GEMINI.md", body: rulesBody }];
}
