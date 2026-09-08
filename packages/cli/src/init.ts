import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ALL_AGENTS, syncAgentRules, type AgentName, type SyncResult } from "./sync";
import { writeDefaultConfigIfMissing } from "./configFile";
import { ManifestNotFoundError } from "./manifest";

const REQUIRED_DEPENDENCIES = ["@mari-ui/components", "@mari-ui/core", "@mari-ui/tokens"] as const;

/** Şu an mari-ui'ın yayınlandığı sürüm aralığı — gerçek bir yayından sonra `package.json`daki sürümle senkron tutulacak. */
const DEPENDENCY_RANGE = "latest";

export interface InitOptions {
  targetDir: string;
  agents?: readonly AgentName[];
  manifestPath?: string;
}

export interface InitResult {
  addedDependencies: string[];
  alreadyHadDependencies: string[];
  configCreated: boolean;
  configPath: string;
  /**
   * `null` olması şu anlama gelir: bağımlılıklar `package.json`a EKLENDİ ama
   * henüz KURULMADI (`pnpm install` çalıştırılmadı) — bu yüzden `@mari-ui/
   * components/manifest.json` henüz `node_modules`te yok. Kural dosyaları
   * bağımlılıklar kurulduktan sonra `npx mari-ui sync` ile yazılabilir.
   * Sert bir hata yerine bu durumu AÇIKÇA taşımak, `init`in "bağımlılığı
   * ekle, sonra kur, sonra tekrar çalıştır" akışında hiç çökmemesini sağlar.
   */
  ruleFiles: SyncResult | null;
  /** `package.json` tüketici projede yoksa (nadir ama olası) burada bir uyarı taşınır — dependency ekleme atlanır. */
  packageJsonMissing: boolean;
}

interface PackageJsonShape {
  dependencies?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Tüketici projeye üç bağımlılığı ekler, `mari-ui.config.json`ı (varsa
 * DOKUNMADAN) oluşturur ve AI ajan kural dosyalarını yazar. Plan'ın kendi
 * ilkesi burada da geçerli: **component seçtirmez** — tek paket kurulur,
 * kullanılmayan component'ler zaten tree-shaking ile bundle'a girmez (bkz.
 * `@mari-ui/components`'in `sideEffects` ve subpath export mimarisi, Faz 3).
 *
 * CSS import'u OTOMATİK YAPILMAZ (elle bir dosyaya eklemek gerekir) —
 * projenin `globals.css`/`app/layout.tsx` gibi giriş noktasını GÜVENİLİR
 * şekilde tahmin etmenin bir yolu yok; yanlış bir dosyaya eklemek sessizce
 * hiçbir şey yapmamaktan daha kötü. Bunun yerine net bir talimat basılır
 * (bkz. `cli.ts`teki `runInitCommand` çağrısının çıktısı).
 */
export function runInit(options: InitOptions): InitResult {
  const { targetDir, agents = ALL_AGENTS, manifestPath } = options;
  const packageJsonPath = join(targetDir, "package.json");
  const packageJsonMissing = !existsSync(packageJsonPath);

  const addedDependencies: string[] = [];
  const alreadyHadDependencies: string[] = [];

  if (!packageJsonMissing) {
    const raw = readFileSync(packageJsonPath, "utf8");
    const pkg = JSON.parse(raw) as PackageJsonShape;
    pkg.dependencies ??= {};
    for (const dep of REQUIRED_DEPENDENCIES) {
      if (pkg.dependencies[dep]) {
        alreadyHadDependencies.push(dep);
      } else {
        pkg.dependencies[dep] = DEPENDENCY_RANGE;
        addedDependencies.push(dep);
      }
    }
    if (addedDependencies.length > 0) {
      writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    }
  }

  const { created: configCreated, path: configPath } = writeDefaultConfigIfMissing(targetDir);

  let ruleFiles: SyncResult | null;
  try {
    ruleFiles = syncAgentRules({ targetDir, agents, manifestPath });
  } catch (err) {
    if (err instanceof ManifestNotFoundError) {
      ruleFiles = null;
    } else {
      throw err;
    }
  }

  return { addedDependencies, alreadyHadDependencies, configCreated, configPath, ruleFiles, packageJsonMissing };
}
