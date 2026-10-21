import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { resolveThemeConfig } from "@mari-ui/tokens";
import { buildRulesContent, buildSkillContent } from "./buildRulesContent";
import { readConfig } from "./configFile";
import { loadManifestSafe, type RulesPlatform } from "./manifest";
import { isMarkerBlockUpToDate, upsertMarkerBlock } from "./markerBlock";
import { buildAgentsTargets } from "./writers/agents";
import { buildClaudeTargets } from "./writers/claude";
import { buildCopilotTargets } from "./writers/copilot";
import { buildCursorTargets } from "./writers/cursor";
import { buildGeminiTargets } from "./writers/gemini";
import type { PlatformBodies } from "./writers/scope";
import type { FileTarget } from "./writers/types";
import { resolvePlatform, type Platform } from "./platform";

export const ALL_AGENTS = ["claude", "codex", "cursor", "gemini", "copilot"] as const;
export type AgentName = (typeof ALL_AGENTS)[number];

/**
 * `rules`: kısa içerik (her istekte okunan dosyalar). `skill`: Claude skill'inin
 * zengin içeriği. Platform başına birer gövde; `both`ta ikisi de dolu.
 */
export interface AgentRuleBodies {
  rules: PlatformBodies;
  skill: PlatformBodies;
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
  /**
   * Testler ve `--manifest` flag'i için — gerçek node_modules çözümlemesini atlar.
   * Platformun kendi manifest'i: web → `@mari-ui/components`, native → `@mari-ui/native`.
   * `both`ta web manifest'i; native'inki `nativeManifestPath`.
   */
  manifestPath?: string;
  /** Yalnız `both`ta: `@mari-ui/native` manifest'i (`--native-manifest`). */
  nativeManifestPath?: string;
  configPath?: string;
  /** `true`: hiçbir şey YAZMAZ, sadece hangi dosyaların bayat olduğunu raporlar (CI). */
  check?: boolean;
}

export interface SyncResult {
  /** `check: true` iken: güncel olmayıp YAZILACAK OLAN dosyalar. `check` yokken: fiilen yazılan dosyalar. */
  changed: string[];
  upToDate: string[];
  platform: Platform;
}

const RULES_PLATFORMS: Record<Platform, readonly RulesPlatform[]> = { web: ["web"], native: ["native"], both: ["web", "native"] };

/*
 * Faz 7'nin çekirdek fonksiyonu: manifest + tema → tek gövde içerik → beş
 * aracın dosyalarına (marker bloğu korunarak) uygulanır. `init` ve `sync`
 * komutlarının İKİSİ DE bunu çağırır — aralarındaki tek fark `init`in ayrıca
 * `mari-ui.config.json`ı ve bağımlılıkları da kurmasıdır (bkz. `init.ts`).
 */
export function syncAgentRules(options: SyncOptions): SyncResult {
  const { targetDir, agents = ALL_AGENTS, manifestPath, nativeManifestPath, configPath, check = false } = options;
  const platform = resolvePlatform(targetDir);
  const config = readConfig(targetDir, configPath);
  const resolved = resolveThemeConfig(config);
  const bodies: AgentRuleBodies = { rules: {}, skill: {} };
  // Her gövde yalnız kendi paketinin manifest'inden; paket yoksa açık hata (yanlış platformun kuralı asla yazılmaz).
  for (const rulesPlatform of RULES_PLATFORMS[platform]) {
    const explicitPath = rulesPlatform === "native" && platform === "both" ? nativeManifestPath : manifestPath;
    const manifest = loadManifestSafe(targetDir, explicitPath, rulesPlatform);
    const contentOptions = { manifest, theme: resolved.light, persona: config.persona, platform: rulesPlatform };
    bodies.rules[rulesPlatform] = buildRulesContent(contentOptions);
    bodies.skill[rulesPlatform] = buildSkillContent(contentOptions);
  }
  const targets = planAgentRuleTargets(agents, bodies);
  const result: SyncResult = { changed: [], upToDate: [], platform };

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
