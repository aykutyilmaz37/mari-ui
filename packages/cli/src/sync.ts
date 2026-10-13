import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { resolveThemeConfig } from "@mari-ui/tokens";
import { buildRulesContent, buildSkillContent } from "./buildRulesContent";
import { readConfig } from "./configFile";
import { loadManifestSafe } from "./manifest";
import { isMarkerBlockUpToDate, upsertMarkerBlock } from "./markerBlock";
import { buildAgentsTargets } from "./writers/agents";
import { buildClaudeTargets } from "./writers/claude";
import { buildCopilotTargets } from "./writers/copilot";
import { buildCursorTargets } from "./writers/cursor";
import { buildGeminiTargets } from "./writers/gemini";
import type { FileTarget } from "./writers/types";

export const ALL_AGENTS = ["claude", "codex", "cursor", "gemini", "copilot"] as const;
export type AgentName = (typeof ALL_AGENTS)[number];

/** `rules`: kısa içerik (her istekte okunan dosyalar). `skill`: Claude skill'inin zengin içeriği (Faz 17). */
export interface AgentRuleBodies {
  rules: string;
  skill: string;
}

const AGENT_BUILDERS: Record<AgentName, (bodies: AgentRuleBodies) => FileTarget[]> = {
  claude: ({ skill }) => buildClaudeTargets(skill),
  codex: ({ rules }) => buildAgentsTargets(rules),
  cursor: ({ rules }) => buildCursorTargets(rules),
  gemini: ({ rules }) => buildGeminiTargets(rules),
  copilot: ({ rules }) => buildCopilotTargets(rules),
};

export function planAgentRuleTargets(agents: readonly AgentName[], bodies: AgentRuleBodies): FileTarget[] {
  return agents.flatMap((agent) => AGENT_BUILDERS[agent](bodies));
}

/**
 * `target.prefix` varsa (SKILL.md/.mdc frontmatter'ı) marker mekanizmasının
 * TAMAMEN dışında tutulur — sadece prefix'ten SONRAKİ kısma upsert uygulanır,
 * sonra prefix baştan sabit eklenir. Bu olmadan frontmatter marker'ın İÇİNE
 * düşer ve o araçların YAML parser'ı dosyayı okuyamaz hale gelir (fiilen bir
 * smoke test'te yakalandı).
 */
function applyFileTarget(existingContent: string, target: FileTarget): string {
  if (!target.prefix) return upsertMarkerBlock(existingContent, target.body, target.relativePath);
  const existingWithoutPrefix = existingContent.startsWith(target.prefix) ? existingContent.slice(target.prefix.length) : existingContent;
  return target.prefix + upsertMarkerBlock(existingWithoutPrefix, target.body, target.relativePath);
}

function isFileTargetUpToDate(existingContent: string, target: FileTarget): boolean {
  if (!target.prefix) return isMarkerBlockUpToDate(existingContent, target.body);
  if (!existingContent.startsWith(target.prefix)) return false;
  return isMarkerBlockUpToDate(existingContent.slice(target.prefix.length), target.body);
}

export interface SyncOptions {
  targetDir: string;
  agents?: readonly AgentName[];
  /** Testler ve `--manifest` flag'i için — gerçek node_modules çözümlemesini atlar. */
  manifestPath?: string;
  configPath?: string;
  /** `true`: hiçbir şey YAZMAZ, sadece hangi dosyaların bayat olduğunu raporlar (CI). */
  check?: boolean;
}

export interface SyncResult {
  /** `check: true` iken: güncel olmayıp YAZILACAK OLAN dosyalar. `check` yokken: fiilen yazılan dosyalar. */
  changed: string[];
  upToDate: string[];
}

/**
 * Faz 7'nin çekirdek fonksiyonu: manifest + tema → tek gövde içerik → beş
 * aracın dosyalarına (marker bloğu korunarak) uygulanır. `init` ve `sync`
 * komutlarının İKİSİ DE bunu çağırır — aralarındaki tek fark `init`in ayrıca
 * `mari-ui.config.json`ı ve bağımlılıkları da kurmasıdır (bkz. `init.ts`).
 */
export function syncAgentRules(options: SyncOptions): SyncResult {
  const { targetDir, agents = ALL_AGENTS, manifestPath, configPath, check = false } = options;

  const manifest = loadManifestSafe(targetDir, manifestPath);
  const config = readConfig(targetDir, configPath);
  const resolved = resolveThemeConfig(config);
  const contentOptions = { manifest, theme: resolved.light, persona: config.persona };
  const targets = planAgentRuleTargets(agents, { rules: buildRulesContent(contentOptions), skill: buildSkillContent(contentOptions) });
  const result: SyncResult = { changed: [], upToDate: [] };

  for (const target of targets) {
    const filePath = join(targetDir, target.relativePath);
    const existing = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";

    if (check) {
      if (isFileTargetUpToDate(existing, target)) {
        result.upToDate.push(target.relativePath);
      } else {
        result.changed.push(target.relativePath);
      }
      continue;
    }

    const updated = applyFileTarget(existing, target);
    if (updated === existing) {
      result.upToDate.push(target.relativePath);
      continue;
    }
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, updated, "utf8");
    result.changed.push(target.relativePath);
  }

  return result;
}
