#!/usr/bin/env node
import { runInit } from "./init";
import { ALL_AGENTS, syncAgentRules, type AgentName } from "./sync";
import { runThemeCommand } from "./theme";
import { tailwindInstructions } from "./tailwindSetup";
import { personaNames, personas, type PersonaName } from "@mari-ui/tokens";

/**
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
  persona?: PersonaName;
}

function parsePersona(value: string | undefined): PersonaName | undefined {
  if (value && (personaNames as readonly string[]).includes(value)) return value as PersonaName;
  console.warn(`[@mari-ui/cli] Bilinmeyen kişilik: ${value ?? "(boş)"}. Geçerli: ${personaNames.join(", ")}`);
  process.exitCode = 1;
  return undefined;
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command = "help", ...rest] = argv;
  const parsed: ParsedArgs = { command, dir: process.cwd(), check: false };

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
      "  theme   mari-ui.config.json'dan mari-ui-theme.css + mari-ui-theme.ts üretir",
      "",
      "Ortak bayraklar:",
      "  --dir <yol>       Hedef proje kökü (varsayılan: mevcut dizin)",
      "  --agents <liste>  Virgülle ayrılmış: claude,codex,cursor,gemini,copilot (varsayılan: hepsi)",
      "  --check           Hiçbir şey YAZMAZ; bayat dosya varsa çıkış kodu 1 (CI için)",
      "",
      "init bayrakları:",
      "  --persona <ad>    Tasarım kişiliği: " + personaNames.map((n) => n + " (" + personas[n].label + ")").join(", "),
    ].join("\n")
  );
}

/**
 * Her komut kendi fonksiyonuna ayrıldı (Faz 8, SonarJS `cognitive-
 * complexity`) — hepsi tek bir `main()` switch'inde toplandığında bilişsel
 * karmaşıklık 25'e çıkıp izin verilen 15'i aşıyordu.
 */
function runInitCommand(args: ParsedArgs) {
  if (process.exitCode) return;
  const result = runInit({ targetDir: args.dir, agents: args.agents, manifestPath: args.manifest, persona: args.persona });
  if (result.addedDependencies.length > 0) {
    console.log(`✓ package.json'a eklendi: ${result.addedDependencies.join(", ")}`);
  }
  console.log(configMessage(result));
  if (result.ruleFiles) {
    console.log(`✓ AI ajan kural dosyaları yazıldı: ${result.ruleFiles.changed.join(", ") || "(hepsi zaten güncel)"}`);
  } else {
    console.log("⚠ @mari-ui/components henüz kurulu değil — önce paket yöneticinizle kurulumu tamamlayın, sonra: npx @mari-ui/cli sync");
  }
  console.log(`\n${tailwindInstructions(result.tailwind).join("\n")}`);
}

function configMessage(result: ReturnType<typeof runInit>): string {
  if (result.configCreated) return `✓ ${result.configPath} oluşturuldu.`;
  if (result.configUpdated) return `✓ ${result.configPath} içinde kişilik güncellendi (diğer alanlara dokunulmadı).`;
  return `• ${result.configPath} zaten vardı, dokunulmadı.`;
}

function runSyncCommand(args: ParsedArgs) {
  const result = syncAgentRules({ targetDir: args.dir, agents: args.agents, manifestPath: args.manifest, check: args.check });
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

function runThemeCliCommand(args: ParsedArgs) {
  const result = runThemeCommand({ targetDir: args.dir, configPath: args.config, outDir: args.out, check: args.check });
  if (!args.check) {
    console.log(`✓ Yazıldı: ${result.cssPath}`);
    console.log(`✓ Yazıldı: ${result.themeTsPath}`);
    if (result.fontsUrl) console.log(`\nKişilik fontları (web): <link rel="stylesheet" href="${result.fontsUrl}">`);
    return;
  }
  if (result.stale) {
    console.error(`✗ Bayat: ${result.cssPath}, ${result.themeTsPath}`);
    process.exit(1);
  }
  console.log("✓ Tema çıktıları güncel.");
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  switch (args.command) {
    case "init":
      runInitCommand(args);
      break;
    case "sync":
      runSyncCommand(args);
      break;
    case "theme":
      runThemeCliCommand(args);
      break;
    default:
      printHelp();
      if (args.command !== "help") process.exitCode = 1;
  }
}

main();
