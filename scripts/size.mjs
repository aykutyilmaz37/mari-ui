#!/usr/bin/env node
// Bundle boyutu ölçümü + kilit + sızıntı testi (bundle performansı Faz 1).
//
// Web: `@mari-ui/components` package.json `exports`'undaki HER JS subpath'i
// tüketici gibi bundle'lanır (`export * from "@mari-ui/components/<ad>"`),
// minify + gzip boyutu ölçülür. Peer'lar (react, react-dom, embla…) external;
// dependency'ler (core, tokens, lucide…) bundle'a girer — tüketici onları da öder.
// Native: `@mari-ui/native` tek bundle olarak ölçülür (Faz 2'nin taban çizgisi).
//
// Sızıntı testi: bir entry'nin dist bundle'ına giren chunk'ların sourcemap'lerinden
// hangi `src/<bileşen>/` klasörlerinin geldiği çıkarılır; bu küme, entry'nin
// KAYNAK import grafiğiyle (src/<ad>/index.ts'in esbuild metafile'ı) karşılaştırılır.
// Kaynakta import edilmeyen bir bileşenin kodu dist'e giriyorsa = chunk sızıntısı.
//
// Kullanım:
//   pnpm size              → ölç, limit + sızıntı kontrolü (CI)
//   pnpm size --update     → limitleri bugünkü boyut +%10 olarak yaz
//   pnpm size --report     → markdown rapor tablosu da bas
// Önce `pnpm turbo run build --filter=@mari-ui/components --filter=@mari-ui/native`.

import { build } from "esbuild";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WEB = join(ROOT, "packages/components");
const NATIVE = join(ROOT, "packages/native");
const LIMITS_FILE = join(ROOT, "size-limits.json");
const HEADROOM = 1.1;

const args = new Set(process.argv.slice(2));
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

function peersOf(pkgDir) {
  return Object.keys(readJson(join(pkgDir, "package.json")).peerDependencies ?? {});
}

// Peer'ların alt yollarını da (react/jsx-runtime, react-dom/client…) dışarıda tut.
const externalize = (peers) => peers.flatMap((p) => [p, `${p}/*`]);

async function bundle({ contents, resolveDir, external, platform = "browser", metafile = false, mainFields }) {
  const result = await build({
    stdin: { contents, resolveDir, loader: "js" },
    bundle: true,
    minify: true,
    format: "esm",
    platform,
    ...(mainFields && { mainFields }),
    target: "es2020",
    write: false,
    metafile,
    external,
    logLevel: "silent",
    loader: { ".css": "empty" },
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const code = result.outputFiles[0].contents;
  return { code, gz: gzipSync(code, { level: 9 }).length, min: code.length, metafile: result.metafile };
}

// ---- web ------------------------------------------------------------------

function webEntries() {
  const { exports } = readJson(join(WEB, "package.json"));
  return Object.entries(exports)
    .filter(([, v]) => typeof v === "object" && v.import?.endsWith(".js"))
    .map(([key, v]) => ({ name: key.replace(/^\.\//, ""), file: join(WEB, v.import) }));
}

const srcComponents = new Set(
  webEntries().map((e) => e.name),
);

// dist chunk → içerdiği src/<bileşen> klasörleri (sourcemap'ten)
const chunkOwners = new Map();
function ownersOf(distFile) {
  if (chunkOwners.has(distFile)) return chunkOwners.get(distFile);
  const owners = new Set();
  const mapFile = `${distFile}.map`;
  if (existsSync(mapFile)) {
    for (const src of readJson(mapFile).sources) {
      const m = /(?:^|\/)src\/([^/]+)\//.exec(src);
      if (m && srcComponents.has(m[1])) owners.add(m[1]);
    }
  }
  chunkOwners.set(distFile, owners);
  return owners;
}

// Kaynakta gerçekten import edilen bileşen klasörleri (meşru kompozisyon).
async function sourceComponents(name, external) {
  const entry = join(WEB, "src", name, "index.ts");
  if (!existsSync(entry)) return null;
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    metafile: true,
    platform: "browser",
    format: "esm",
    logLevel: "silent",
    loader: { ".css": "empty" },
    // Bağımlılıklar ölçüme değil grafiğe dair: hepsi dışarıda.
    packages: "external",
    external,
  });
  const found = new Set();
  for (const input of Object.keys(result.metafile.inputs)) {
    const m = /^src\/([^/]+)\//.exec(relative(WEB, resolve(process.cwd(), input)));
    if (m && srcComponents.has(m[1])) found.add(m[1]);
  }
  return found;
}

async function measureWeb() {
  const external = externalize(peersOf(WEB));
  const rows = [];
  const leaks = [];
  for (const { name, file } of webEntries()) {
    const spec = `@mari-ui/components/${name}`;
    const { gz, min, metafile } = await bundle({
      contents: `export * from ${JSON.stringify(spec)};`,
      resolveDir: WEB,
      external,
      metafile: true,
    });
    const distInputs = Object.keys(metafile.inputs)
      .map((p) => resolve(process.cwd(), p))
      .filter((p) => p.startsWith(join(WEB, "dist")));
    const chunks = distInputs
      .filter((p) => /\/chunk-[^/]+\.js$/.test(p))
      .map((p) => p.slice(p.lastIndexOf("/") + 1));
    const pulled = new Set(distInputs.flatMap((p) => [...ownersOf(p)]));
    pulled.delete(name);
    const legit = await sourceComponents(name, external);
    if (legit) {
      const leaked = [...pulled].filter((c) => !legit.has(c));
      if (leaked.length) leaks.push({ name, leaked });
    }
    const heavy = Object.entries(Object.values(metafile.outputs)[0].inputs)
      .filter(([p, v]) => v.bytesInOutput >= 2048 && !p.startsWith("packages/components/"))
      .sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput)
      .map(([p, v]) => `${p.replace(/^(node_modules|packages)\//, "").replace(/\/dist\/.*/, "")} ${(v.bytesInOutput / 1024).toFixed(0)}K`);
    rows.push({ name, gz, min, chunks, composes: [...pulled].sort(), heavy });
  }
  return { rows, leaks };
}

// Elle yazılmış, açık sızıntı iddiası: button tek başına ağır bileşen getirmemeli.
async function buttonLeakCheck() {
  const { metafile, code } = await bundle({
    contents: 'export * from "@mari-ui/components/button";',
    resolveDir: WEB,
    external: externalize(peersOf(WEB)),
    metafile: true,
  });
  const owners = new Set(
    Object.keys(metafile.inputs).flatMap((p) => [...ownersOf(resolve(process.cwd(), p))]),
  );
  const text = new TextDecoder().decode(code);
  const banned = ["transfer", "tree", "carousel", "table", "date-picker"];
  return banned.filter((c) => owners.has(c) || text.includes(`mari-${c}`));
}

// ---- native ---------------------------------------------------------------

async function measureNative() {
  const { gz, min } = await bundle({
    contents: 'export * from "@mari-ui/native";',
    resolveDir: NATIVE,
    external: externalize(peersOf(NATIVE)),
    platform: "browser",
    mainFields: ["react-native", "browser", "module", "main"],
  });
  return { name: "@mari-ui/native (tamamı)", gz, min };
}

// ---- rapor / limit --------------------------------------------------------

const kb = (n) => `${(n / 1024).toFixed(2)} KB`;

function report(rows, native) {
  const sorted = [...rows].sort((a, b) => b.gz - a.gz);
  const median = sorted[Math.floor(sorted.length / 2)].gz;
  const lines = [
    "| # | Bileşen | min+gz | min | Paylaşılan chunk | Bileşimindeki bileşenler | Ağır dış girdiler (min) |",
    "|---:|---|---:|---:|---:|---|---|",
  ];
  sorted.forEach((r, i) => {
    const flag = r.gz > median * 3 ? " ⚠️" : "";
    lines.push(
      `| ${i + 1} | \`${r.name}\`${flag} | ${kb(r.gz)} | ${kb(r.min)} | ${r.chunks.length} | ${r.composes.join(", ") || "—"} | ${r.heavy.join(", ") || "—"} |`,
    );
  });
  lines.push("", `Medyan: ${kb(median)} · ⚠️ = medyanın 3 katından ağır (Faz 4 adayı)`);
  lines.push("", `Native: \`@mari-ui/native\` tamamı ${kb(native.gz)} min+gz (${kb(native.min)} min)`);
  return lines.join("\n");
}

async function main() {
  const { rows, leaks } = await measureWeb();
  const native = await measureNative();
  const buttonLeaks = await buttonLeakCheck();

  const current = {
    components: Object.fromEntries(rows.map((r) => [r.name, r.gz])),
    native: native.gz,
  };

  if (args.has("--update")) {
    const limits = {
      $comment: "Bayt, min+gz. `pnpm size --update` bugünkü boyut +%10 ile yeniden yazar.",
      components: Object.fromEntries(
        Object.entries(current.components)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, Math.ceil(v * HEADROOM)]),
      ),
      native: Math.ceil(current.native * HEADROOM),
    };
    writeFileSync(LIMITS_FILE, `${JSON.stringify(limits, null, 2)}\n`);
    console.log(`Limitler yazıldı: ${relative(ROOT, LIMITS_FILE)}`);
  }

  if (args.has("--report")) console.log(`${report(rows, native)}\n`);

  const errors = [];
  if (buttonLeaks.length) errors.push(`button bundle'ı başka bileşen kodu içeriyor: ${buttonLeaks.join(", ")}`);
  for (const { name, leaked } of leaks) {
    errors.push(`${name}: kaynakta import etmediği bileşen kodu dist'e sızmış → ${leaked.join(", ")}`);
  }

  const limits = existsSync(LIMITS_FILE) ? readJson(LIMITS_FILE) : null;
  if (!limits) {
    errors.push(`${relative(ROOT, LIMITS_FILE)} yok — \`pnpm size --update\` çalıştırın.`);
  } else {
    for (const [name, gz] of Object.entries(current.components)) {
      const limit = limits.components[name];
      if (limit == null) errors.push(`${name}: limit yok — \`pnpm size --update\` çalıştırın.`);
      else if (gz > limit) errors.push(`${name}: ${kb(gz)} > limit ${kb(limit)}`);
    }
    for (const name of Object.keys(limits.components)) {
      if (!(name in current.components)) errors.push(`${name}: limit var ama entry yok — \`pnpm size --update\`.`);
    }
    if (native.gz > limits.native) errors.push(`@mari-ui/native: ${kb(native.gz)} > limit ${kb(limits.native)}`);
  }

  const total = rows.length;
  console.log(`${total} web entry + native ölçüldü. Native: ${kb(native.gz)} min+gz.`);
  if (errors.length) {
    console.error(`\n✖ ${errors.length} sorun:\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  console.log("✔ Limitler ve sızıntı testi temiz.");
}

await main();
