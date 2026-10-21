#!/usr/bin/env node
import { runInit } from "./init";
import { ALL_AGENTS, syncAgentRules, type AgentName } from "./sync";
import { runThemeCommand } from "./theme";
import { tailwindInstructions } from "./tailwindSetup";
import { personaNames, personas, type PersonaName } from "@mari-ui/tokens";
import { readConfigIfExists, writeConfig } from "./configFile";
import { choiceFromFlags, configFromChoice, describeConfig, parsePersonaFlag, type ThemeChoice } from "./themeChoice";
import { askPlatformChoice, askThemeChoice, WizardCancelled } from "./themeWizard";
import { configuredPlatform, detectPlatform, isPlatform, PLATFORM_LABELS, PLATFORMS, readPackageJson, type Platform } from "./platform";

/*
 * Kasıtlı olarak hiçbir argv-parsing kütüphanesi (commander/yargs/...) YOK —
 * sadece 3 komut ve az sayıda bayrak var, elle yazılmış ~30 satırlık bir
 * parser bir bağımlılık eklemekten daha az risk taşıyor (bkz. proje planının
 * genel "gereksiz bağımlılık ekleme" disiplini — `uuid`nin `crypto.
 * randomUUID()`e taşınması gibi).
 */

interface ParsedArgs {
  command: string;
  dir: string;
  agents?: AgentName[];
  check: boolean;
  config?: string;
  out?: string;
  manifest?: string;
  persona?: PersonaName | "default";
  primary?: string;
  accent?: string;
  platform?: Platform;
  /** Soru sorma: bayraklar ya da mevcut config kullanılır. */
  yes: boolean;
}

function parsePersona(value: string | undefined): PersonaName | "default" | undefined {
  const parsed = parsePersonaFlag(value);
  if (parsed) return parsed;
  console.warn(`[@mari-ui/cli] Bilinmeyen tema: ${value ?? "(boş)"}. Geçerli: default, ${personaNames.join(", ")}`);
  process.exitCode = 1;
  return undefined;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const parsed: ParsedArgs = { command, dir: process.cwd(), check: false, yes: false };

  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    switch (arg) {
      case "--dir":
        parsed.dir = rest[++i] ?? parsed.dir;
        break;
      case "--agents":
        parsed.agents = (rest[++i] ?? "")
          .split(",")
          .map((a) => a.trim())
          .filter((a): a is AgentName => (ALL_AGENTS as readonly string[]).includes(a));
        break;
      case "--check":
        parsed.check = true;
        break;
      case "--config":
        parsed.config = rest[++i];
        break;
      case "--out":
        parsed.out = rest[++i];
        break;
      case "--manifest":
        parsed.manifest = rest[++i];
        break;
      case "--persona":
        parsed.persona = parsePersona(rest[++i]);
        break;
      case "--primary":
        parsed.primary = rest[++i];
        break;
      case "--accent":
        parsed.accent = rest[++i];
        break;
      case "--platform": {
        const value = rest[++i];
        if (isPlatform(value)) {
          parsed.platform = value;
        } else {
          console.warn(`[@mari-ui/cli] Bilinmeyen platform: ${value ?? "(boş)"}. Geçerli: ${PLATFORMS.join(", ")}`);
          process.exitCode = 1;
        }
        break;
      }
      case "--yes":
      case "-y":
        parsed.yes = true;
        break;
      default:
        console.warn(`[@mari-ui/cli] Bilinmeyen bayrak yok sayıldı: ${arg}`);
    }
  }

  return parsed;
}

function printHelp() {
  console.log(
    [
      "mari-ui — mari-ui tasarım sistemi CLI'ı",
      "",
      "Komutlar:",
      "  init    Bağımlılıkları ekler, mari-ui.config.json oluşturur, AI ajan kural dosyalarını yazar",
      "  sync    Kural dosyalarını güncel tema/manifest'e göre tazeler",
      "  theme   Temayı seçtirir (varsayılan, hazır kişilik ya da özel) ve mari-ui-theme.css + mari-ui-theme.ts üretir",
      "",
      "Ortak bayraklar:",
      "  --dir <yol>       Hedef proje kökü (varsayılan: mevcut dizin)",
      "  --platform <ad>   web | native | both — init'te sorulmaz; seçilmeyen platformun paketi kurulmaz",
      "  --agents <liste>  Virgülle ayrılmış: claude,codex,cursor,gemini,copilot (varsayılan: hepsi)",
      "  --check           Hiçbir şey YAZMAZ; bayat dosya varsa çıkış kodu 1 (CI için)",
      "",
      "Tema bayrakları (init / theme — verilirse soru sorulmaz):",
      "  --persona <ad>    default (Yumuşak iris) ya da kişilik: " + personaNames.map((n) => n + " (" + personas[n].label + ")").join(", "),
      "  --primary <#hex>  Özel tema: marka rengi (örnek: #0f766e)",
      "  --accent <#hex>   Özel tema: vurgu rengi (isteğe bağlı)",
      "  -y, --yes         Hiç soru sorma: bayraklar ya da mevcut mari-ui.config.json kullanılır",
      "",
      "Soru yalnız etkileşimli terminalde sorulur; CI'da bayraklar ya da mevcut config kullanılır.",
    ].join("\n")
  );
}

/**
 * Her komut kendi fonksiyonuna ayrıldı — hepsi tek bir `main()` switch'inde toplandığında bilişsel
 * karmaşıklık 25'e çıkıp izin verilen 15'i aşıyordu.
 */
/** Etkileşimli terminal mi ve soru sorulabilir mi? (CI, boru, `--yes` → hayır) */
function canAsk(args: ParsedArgs): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY) && !args.yes && !args.check;
}

/** Bayraklardan tema seçimi; geçersiz renkte açıklayıcı hata verip çıkar. */
function flagChoice(args: ParsedArgs): ThemeChoice | undefined {
  try {
    return choiceFromFlags(args);
  } catch (err) {
    console.error(`✗ ${(err as Error).message}`);
    process.exit(1);
  }
}

async function runInitCommand(args: ParsedArgs) {
  if (process.exitCode) return;
  // Platform önce sorulur: hangi paketlerin kurulacağını ve kuralları belirler.
  let platform = args.platform ?? configuredPlatform(args.dir);
  if (!platform && canAsk(args)) platform = await askPlatformChoice(detectPlatform(readPackageJson(args.dir)));
  let theme = flagChoice(args);
  // Config yoksa ve bayrak verilmediyse temayı sor; varsa init ona dokunmaz (değiştirmek: `theme`).
  if (!theme && canAsk(args) && !readConfigIfExists(args.dir)) theme = (await askThemeChoice(undefined)) ?? undefined;
  const result = runInit({ targetDir: args.dir, agents: args.agents, manifestPath: args.manifest, theme, platform });
  console.log(`✓ Platform: ${PLATFORM_LABELS[result.platform]}`);
  if (result.foreignDependencies.length > 0) {
    console.log(`⚠ Bu platforma ait olmayan paket kurulu: ${result.foreignDependencies.join(", ")} — gerekmiyorsa kaldırın (ör. pnpm remove ${result.foreignDependencies.join(" ")}).`);
  }
  if (result.addedDependencies.length > 0) {
    console.log(`✓ package.json'a eklendi: ${result.addedDependencies.join(", ")}`);
  }
  console.log(configMessage(result));
  if (result.ruleFiles?.skipped) {
    console.log(NATIVE_RULES_PENDING);
  } else if (result.ruleFiles) {
    console.log(`✓ AI ajan kural dosyaları yazıldı: ${result.ruleFiles.changed.join(", ") || "(hepsi zaten güncel)"}`);
  } else {
    console.log("⚠ mari-ui paketleri henüz kurulu değil — önce paket yöneticinizle kurulumu tamamlayın, sonra: npx @mari-ui/cli sync");
  }
  if (result.platform !== "native") console.log(`\n${tailwindInstructions(result.tailwind).join("\n")}`);
}

const NATIVE_RULES_PENDING =
  "• Native proje: AI kural dosyaları henüz yazılmıyor (web kuralları React Native kodunu yanıltır). Native kuralları sonraki sürümde gelecek.";

function configMessage(result: ReturnType<typeof runInit>): string {
  if (result.configCreated) return `✓ ${result.configPath} oluşturuldu.`;
  if (result.configUpdated) return `✓ ${result.configPath} içinde kişilik güncellendi (diğer alanlara dokunulmadı).`;
  return `• ${result.configPath} zaten vardı, dokunulmadı.`;
}

function runSyncCommand(args: ParsedArgs) {
  const result = syncAgentRules({ targetDir: args.dir, agents: args.agents, manifestPath: args.manifest, check: args.check });
  if (result.skipped) {
    console.log(NATIVE_RULES_PENDING);
    return;
  }
  if (!args.check) {
    console.log(result.changed.length > 0 ? `✓ Güncellendi: ${result.changed.join(", ")}` : "• Zaten güncel, değişiklik yok.");
    return;
  }
  if (result.changed.length > 0) {
    console.error(`✗ Bayat: ${result.changed.join(", ")}`);
    process.exit(1);
  }
  console.log("✓ Tüm AI ajan kural dosyaları güncel.");
}

/**
 * `theme`: önce tema seçimi (bayrak → sihirbaz → mevcut config), sonra
 * çıktılar. Seçim config'in tema alanlarını baştan yazar; ek temalar (`themes`)
 * ve büyük ekran (`scale`) korunur. `--config` verildiyse o dosya kullanılır, sorulmaz.
 */
async function runThemeCliCommand(args: ParsedArgs) {
  if (process.exitCode) return;
  if (!args.config && !args.check) {
    const current = readConfigIfExists(args.dir);
    const choice = flagChoice(args) ?? (canAsk(args) ? await askThemeChoice(current) : undefined);
    if (choice) {
      const config = configFromChoice(choice, current);
      writeConfig(args.dir, config);
      console.log(`✓ Tema: ${describeConfig(config)} — mari-ui.config.json güncellendi.`);
    } else if (!current) {
      console.log("• mari-ui.config.json yok — varsayılan tema (Yumuşak iris) kullanılıyor.");
    }
  }
  const result = runThemeCommand({ targetDir: args.dir, configPath: args.config, outDir: args.out, check: args.check });
  if (!args.check) {
    if (!result.cssPath) {
      console.log(`✓ Yazıldı: ${result.themeTsPath}  (native: CSS üretilmez)`);
      return;
    }
    console.log(`✓ Yazıldı: ${result.cssPath}`);
    console.log(`✓ Yazıldı: ${result.themeTsPath}`);
    console.log(`\nGlobal CSS'inizde mari-ui CSS'inden SONRA import edin (örnek: src/index.css içinden):\n  @import "../mari-ui-theme.css";`);
    if (result.fontsUrl) console.log(`\nKişilik fontları (web) — <head>'e ekleyin:\n  <link rel="stylesheet" href="${result.fontsUrl}">`);
    return;
  }
  if (result.stale) {
    console.error(`✗ Bayat: ${[result.cssPath, result.themeTsPath].filter(Boolean).join(", ")}`);
    process.exit(1);
  }
  console.log("✓ Tema çıktıları güncel.");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  switch (args.command) {
    case "init":
      await runInitCommand(args);
      break;
    case "sync":
      runSyncCommand(args);
      break;
    case "theme":
      await runThemeCliCommand(args);
      break;
    default:
      printHelp();
      if (args.command !== "help") process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  // Sihirbazdan çıkış (Ctrl+C) hata değil; mesajı sihirbaz zaten bastı.
  if (err instanceof WizardCancelled) {
    process.exitCode = 130;
    return;
  }
  throw err;
});
