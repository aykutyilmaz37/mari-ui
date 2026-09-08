/** `@mari-ui/cli`'ın programatik (test edilebilir) yüzeyi — `cli.ts` bunun ince bir argv sarmalayıcısı. */
export { runInit, type InitOptions, type InitResult } from "./init";
export { syncAgentRules, ALL_AGENTS, type AgentName, type SyncOptions, type SyncResult } from "./sync";
export { runThemeCommand, type ThemeCommandOptions, type ThemeCommandResult } from "./theme";
export { readConfig, writeDefaultConfigIfMissing, DEFAULT_CONFIG, CONFIG_FILE_NAME } from "./configFile";
export { loadManifest, loadManifestSafe, ManifestNotFoundError, type Manifest } from "./manifest";
export { buildRulesContent } from "./buildRulesContent";
export { upsertMarkerBlock, isMarkerBlockUpToDate, MARKER_START, MARKER_END } from "./markerBlock";
