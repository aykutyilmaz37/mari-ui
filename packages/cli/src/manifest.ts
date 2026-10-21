import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

/**
 * `packages/components/scripts/build-manifest.ts`nin ürettiği `dist/
 * manifest.json`ın TypeScript karşılığı. Bilinçli olarak `@mari-ui/
 * components`ten RUNTIME import EDİLMEZ — CLI, TÜKETİCİ projesinin
 * `node_modules`ündeki (kendi projemizin değil) yayınlanmış paketi okur; bu
 * yüzden sadece bu JSON'un ŞEKLİNİ tip olarak tekrarlıyoruz.
 */
export interface ManifestPropInfo {
  name: string;
  type: string;
  optional: boolean;
  deprecated: boolean;
  deprecatedReason?: string;
}

export interface ManifestComponentInfo {
  name: string;
  importPath: string;
  requiresUseClient: boolean;
  props: ManifestPropInfo[];
}

export interface Manifest {
  version: number;
  axes: Record<string, string[]>;
  components: ManifestComponentInfo[];
}

/** Kural gövdesinin hedefi: `both` platformu bu ikisinden birer gövde üretir. */
export type RulesPlatform = "web" | "native";

/** Platformun manifest'ini taşıyan paket (bkz. `platform.ts` `WEB_PACKAGE`/`NATIVE_PACKAGE`). */
export const MANIFEST_PACKAGE: Record<RulesPlatform, string> = { web: "@mari-ui/components", native: "@mari-ui/native" };

/**
 * Platformun paketindeki `manifest.json`ı tüketici projesinin (`fromDir`)
 * `node_modules`ünden Node'un GERÇEK modül çözümlemesiyle bulur — `npx
 * mari-ui` gerçek bir tüketici projesinde çalıştığında bu, o projenin kendi
 * kurduğu sürümü okur. `explicitPath` sadece testler ve `--manifest` flag'i
 * için (bkz. `cli.ts`) — bir dosya sistemi node_modules çözümlemesi
 * kurmadan gerçek manifest içeriğine karşı test etmeyi sağlar.
 */
export function loadManifest(fromDir: string, explicitPath?: string, platform: RulesPlatform = "web"): Manifest {
  const manifestPath = explicitPath ?? createRequire(`${fromDir}/`).resolve(`${MANIFEST_PACKAGE[platform]}/manifest.json`);
  return JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
}

export class ManifestNotFoundError extends Error {
  constructor(fromDir: string, cause: unknown, platform: RulesPlatform = "web") {
    const pkg = MANIFEST_PACKAGE[platform];
    super(`[@mari-ui/cli] "${pkg}" bulunamadı (${fromDir} içinden aranırken). Önce "pnpm add ${pkg} @mari-ui/core @mari-ui/tokens" ile kurun, sonra tekrar deneyin.`);
    this.name = "ManifestNotFoundError";
    this.cause = cause;
  }
}

export function loadManifestSafe(fromDir: string, explicitPath?: string, platform: RulesPlatform = "web"): Manifest {
  try {
    return loadManifest(fromDir, explicitPath, platform);
  } catch (err) {
    throw new ManifestNotFoundError(fromDir, err, platform);
  }
}
