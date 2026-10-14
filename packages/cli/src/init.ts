import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { ALL_AGENTS, syncAgentRules, type AgentName, type SyncResult } from "./sync";
import { configFilePath, writeConfig, writeDefaultConfigIfMissing, writePersonaConfig } from "./configFile";
import { configFromChoice, type ThemeChoice } from "./themeChoice";
import { ManifestNotFoundError } from "./manifest";
import { detectTailwind, type TailwindSetup } from "./tailwindSetup";

const REQUIRED_DEPENDENCIES = ["@mari-ui/components", "@mari-ui/core", "@mari-ui/tokens"] as const;

/**
 * Eklenen bağımlılıkların sürüm aralığı: CLI'ın kendi sürümü. Beş paket birlikte
 * sürümlenir (changesets `fixed`), yani `@mari-ui/cli@0.1.1` ile kurulan proje
 * `^0.1.1` alır. `"latest"` yazılsaydı kurulum tekrarlanabilir olmazdı.
 */
const DEPENDENCY_RANGE = `^${(createRequire(import.meta.url)("../package.json") as { version: string }).version}`;

export interface InitOptions {
  targetDir: string;
  agents?: readonly AgentName[];
  manifestPath?: string;
  /**
   * Tema seçimi (sihirbaz ya da `--persona` / `--primary`). Config yoksa bu
   * seçimle oluşturulur. Config varsa yalnız kişilik seçimi `persona` alanını
   * ekler/değiştirir (diğer alanlara dokunmaz); temayı baştan değiştirmek `theme` komutunun işi.
   */
  theme?: ThemeChoice;
}

export interface InitResult {
  addedDependencies: string[];
  alreadyHadDependencies: string[];
  configCreated: boolean;
  configPath: string;
  /** Kişilik seçildi ve var olan config'te `persona` alanı eklendi/değişti. */
  configUpdated: boolean;
  /**
   * `null` olması şu anlama gelir: bağımlılıklar `package.json`a EKLENDİ ama
   * henüz KURULMADI (`pnpm install` çalıştırılmadı) — bu yüzden `@mari-ui/
   * components/manifest.json` henüz `node_modules`te yok. Kural dosyaları
   * bağımlılıklar kurulduktan sonra `npx @mari-ui/cli sync` ile yazılabilir.
   * Sert bir hata yerine bu durumu AÇIKÇA taşımak, `init`in "bağımlılığı
   * ekle, sonra kur, sonra tekrar çalıştır" akışında hiç çökmemesini sağlar.
   */
  ruleFiles: SyncResult | null;
  /** Host'taki Tailwind kurulumu — CSS talimatı buna göre (bkz. `tailwindSetup.ts`). */
  tailwind: TailwindSetup;
  /** `package.json` tüketici projede yoksa (nadir ama olası) burada bir uyarı taşınır — dependency ekleme atlanır. */
  packageJsonMissing: boolean;
}

interface PackageJsonShape {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

/*
 * Tüketici projeye üç bağımlılığı ekler, `mari-ui.config.json`ı (varsa
 * DOKUNMADAN) oluşturur ve AI ajan kural dosyalarını yazar. Plan'ın kendi
 * ilkesi burada da geçerli: **component seçtirmez** — tek paket kurulur,
 * kullanılmayan component'ler zaten tree-shaking ile bundle'a girmez (bkz.
 * `@mari-ui/components`'in `sideEffects` ve subpath export mimarisi, Faz 3).
 */
/**
 * CSS import'u OTOMATİK YAPILMAZ (elle bir dosyaya eklemek gerekir) —
 * projenin `globals.css`/`app/layout.tsx` gibi giriş noktasını GÜVENİLİR
 * şekilde tahmin etmenin bir yolu yok; yanlış bir dosyaya eklemek sessizce
 * hiçbir şey yapmamaktan daha kötü. Bunun yerine net bir talimat basılır
 * (bkz. `cli.ts`teki `runInitCommand` çağrısının çıktısı).
 */
export function runInit(options: InitOptions): InitResult {
  const { targetDir, agents = ALL_AGENTS, manifestPath, theme } = options;
  const packageJsonPath = join(targetDir, "package.json");
  const packageJsonMissing = !existsSync(packageJsonPath);

  const addedDependencies: string[] = [];
  const alreadyHadDependencies: string[] = [];
  let tailwind: TailwindSetup = "none";

  if (!packageJsonMissing) {
    const raw = readFileSync(packageJsonPath, "utf8");
    const pkg = JSON.parse(raw) as PackageJsonShape;
    tailwind = detectTailwind(pkg);
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

  const written = writeInitialConfig(targetDir, theme);
  const { created: configCreated, path: configPath, updated: configUpdated } = written;

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

  return { addedDependencies, alreadyHadDependencies, configCreated, configUpdated, configPath, ruleFiles, packageJsonMissing, tailwind };
}

function writeInitialConfig(targetDir: string, theme: ThemeChoice | undefined): { created: boolean; updated: boolean; path: string } {
  if (!theme) return { ...writeDefaultConfigIfMissing(targetDir), updated: false };
  if (!existsSync(configFilePath(targetDir))) return { created: true, updated: false, path: writeConfig(targetDir, configFromChoice(theme)) };
  if (theme.kind === "persona") return writePersonaConfig(targetDir, theme.name);
  return { created: false, updated: false, path: configFilePath(targetDir) };
}
