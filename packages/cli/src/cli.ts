#!/usr/bin/env node
import { runInit } from "./init";
import { ALL_AGENTS, syncAgentRules, type AgentName } from "./sync";
import { runThemeCommand } from "./theme";

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
      "  sync    Kural dosyalarını (ve --with-theme ile tema çıktısını) güncel tema/manifest'e göre tazeler",
      "  theme   mari-ui.config.json'dan mari-ui-theme.css + mari-ui-theme.ts üretir",
      "",
      "Ortak bayraklar:",
      "  --dir <yol>       Hedef proje kökü (varsayılan: mevcut dizin)",
      "  --agents <liste>  Virgülle ayrılmış: claude,codex,cursor,gemini,copilot (varsayılan: hepsi)",
      "  --check           Hiçbir şey YAZMAZ; bayat dosya varsa çıkış kodu 1 (CI için)",
    ].join("\n")
  );
}

/**
 * Her komut kendi fonksiyonuna ayrıldı (Faz 8, SonarJS `cognitive-
 * complexity`) — hepsi tek bir `main()` switch'inde toplandığında bilişsel
 * karmaşıklık 25'e çıkıp izin verilen 15'i aşıyordu.
 */
function runInitCommand(args: ParsedArgs) {
  const result = runInit({ targetDir: args.dir, agents: args.agents, manifestPath: args.manifest });
  if (result.addedDependencies.length > 0) {
    console.log(`✓ package.json'a eklendi: ${result.addedDependencies.join(", ")}`);
  }
  console.log(result.configCreated ? `✓ ${result.configPath} oluşturuldu.` : `• ${result.configPath} zaten vardı, dokunulmadı.`);
  if (result.ruleFiles) {
    console.log(`✓ AI ajan kural dosyaları yazıldı: ${result.ruleFiles.changed.join(", ") || "(hepsi zaten güncel)"}`);
  } else {
    console.log("⚠ @mari-ui/components henüz kurulu değil — önce paket yöneticinizle kurulumu tamamlayın, sonra: npx mari-ui sync");
  }
  console.log('\nSon adım: "@mari-ui/components/styles.css"i projenizin global CSS giriş noktasına import edin.');
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
