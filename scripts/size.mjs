#!/usr/bin/env node
// Bundle boyutu ölçümü + kilit + sızıntı testi (bundle performansı Faz 1, native: Faz 2).
//
// Her paket (`@mari-ui/components`, `@mari-ui/native`) için package.json
// `exports`'undaki HER JS subpath'i tüketici gibi bundle'lanır
// (`export * from "<paket>/<ad>"`), minify + gzip boyutu ölçülür. Peer'lar
// (react, react-dom, react-native, react-native-svg, embla…) external;
// dependency'ler (core, tokens, lucide, qrcode-generator…) bundle'a girer —
// tüketici onları da öder. Native'in kök barrel'ı (`@mari-ui/native`) ayrıca
// "tamamı" olarak ölçülür (Faz 2 öncesi her native tüketicinin ödediği bedel).
//
// Sızıntı testi: bir entry'nin dist bundle'ına giren chunk'ların sourcemap'lerinden
// hangi `src/<bileşen>/` klasörlerinin geldiği çıkarılır; bu küme, entry'nin
// KAYNAK import grafiğiyle (src/<klasör>/index.ts'in esbuild metafile'ı) karşılaştırılır.
// Kaynakta import edilmeyen bir bileşenin kodu dist'e giriyorsa = chunk sızıntısı.
// Native'de ayrıca: `createContext` çağıran her kaynak modül, her formatta (ESM/CJS)
// TEK bir dist dosyasında olmalı — iki kopya = iki ayrı context (Provider görünmez).
//
// Kullanım:
//   pnpm size              → ölç, limit + sızıntı kontrolü (CI)
//   pnpm size --update     → limitleri bugünkü boyut +%10 olarak yaz
//   pnpm size --report     → markdown rapor tablosu da bas
// Önce `pnpm turbo run build --filter=@mari-ui/components --filter=@mari-ui/native`.

import { build } from "esbuild";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LIMITS_FILE = join(ROOT, "size-limits.json");
const HEADROOM = 1.1;

const args = new Set(process.argv.slice(2));
const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));

// Peer'ların alt yollarını da (react/jsx-runtime, react-dom/client…) dışarıda tut.
const externalize = (peers) => peers.flatMap((p) => [p, `${p}/*`]);

/**
 * Ölçülen paketler. `folderToName`: src klasör adı → subpath adı (native'de
 * PascalCase klasörler kebab-case subpath; bkz. packages/native/scripts/entries.ts).
 * `infra`: bileşen sayılmayan entry'ler (bileşim/sızıntı listesine girmez).
 */
const PACKAGES = {
  components: {
    dir: join(ROOT, "packages/components"),
    folderToName: (f) => f,
    infra: [],
    banned: { button: ["transfer", "tree", "carousel", "table", "date-picker"] },
    textMarker: (c) => `mari-${c}`,
  },
  native: {
    dir: join(ROOT, "packages/native"),
    folderToName: (f) => f.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(),
    infra: ["theme", "config"],
    banned: { button: ["tree", "tree-select", "carousel", "qrcode", "image", "select", "upload", "sidebar"] },
    bannedDeps: { button: ["qrcode-generator"] },
    mainFields: ["react-native", "browser", "module", "main"],
  },
};

for (const pkg of Object.values(PACKAGES)) {
  const json = readJson(join(pkg.dir, "package.json"));
  pkg.name = json.name;
  pkg.external = externalize(Object.keys(json.peerDependencies ?? {}));
  pkg.entries = Object.entries(json.exports)
    .filter(([key, v]) => key !== "." && typeof v === "object" && v.import?.endsWith(".js"))
    .map(([key]) => key.replace(/^\.\//, ""));
  pkg.components = new Set(pkg.entries.filter((e) => !pkg.infra.includes(e)));
  // subpath adı → kaynak entry (src/<klasör>/index.ts)
  pkg.sourceEntry = new Map();
  for (const folder of readdirSync(join(pkg.dir, "src"))) {
    const index = join(pkg.dir, "src", folder, "index.ts");
    if (statSync(join(pkg.dir, "src", folder)).isDirectory() && existsSync(index)) {
      pkg.sourceEntry.set(pkg.folderToName(folder), index);
    }
  }
}

async function bundle({ contents, pkg, metafile = false }) {
  const result = await build({
    stdin: { contents, resolveDir: pkg.dir, loader: "js" },
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    ...(pkg.mainFields && { mainFields: pkg.mainFields }),
    target: "es2020",
    write: false,
    metafile,
    external: pkg.external,
    logLevel: "silent",
    loader: { ".css": "empty" },
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const code = result.outputFiles[0].contents;
  return { code, gz: gzipSync(code, { level: 9 }).length, min: code.length, metafile: result.metafile };
}

// dist chunk → içerdiği src/<bileşen> klasörleri (sourcemap'ten)
const chunkOwners = new Map();
function ownersOf(pkg, distFile) {
  if (chunkOwners.has(distFile)) return chunkOwners.get(distFile);
  const owners = new Set();
  const mapFile = `${distFile}.map`;
  if (existsSync(mapFile)) {
    for (const src of readJson(mapFile).sources) {
      const m = /(?:^|\/)src\/([^/]+)\//.exec(src);
      const name = m && pkg.folderToName(m[1]);
      if (name && pkg.components.has(name)) owners.add(name);
    }
  }
  chunkOwners.set(distFile, owners);
  return owners;
}

// Kaynakta gerçekten import edilen bileşen klasörleri (meşru kompozisyon).
async function sourceComponents(pkg, name) {
  const entry = pkg.sourceEntry.get(name);
  if (!entry) return null;
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
    external: pkg.external,
  });
  const found = new Set();
  for (const input of Object.keys(result.metafile.inputs)) {
    const m = /^src\/([^/]+)\//.exec(relative(pkg.dir, resolve(process.cwd(), input)));
    const comp = m && pkg.folderToName(m[1]);
    if (comp && pkg.components.has(comp)) found.add(comp);
  }
  return found;
}

const distInputsOf = (pkg, metafile) =>
  Object.keys(metafile.inputs)
    .map((p) => resolve(process.cwd(), p))
    .filter((p) => p.startsWith(join(pkg.dir, "dist")));

async function measure(pkg) {
  const rows = [];
  const leaks = [];
  for (const name of pkg.entries) {
    const { gz, min, metafile } = await bundle({ contents: `export * from ${JSON.stringify(`${pkg.name}/${name}`)};`, pkg, metafile: true });
    const distInputs = distInputsOf(pkg, metafile);
    const chunks = distInputs.filter((p) => /\/chunk-[^/]+\.js$/.test(p));
    const pulled = new Set(distInputs.flatMap((p) => [...ownersOf(pkg, p)]));
    pulled.delete(name);
    const legit = await sourceComponents(pkg, name);
    if (legit) {
      const leaked = [...pulled].filter((c) => !legit.has(c));
      if (leaked.length) leaks.push({ name, leaked });
    }
    const heavy = Object.entries(Object.values(metafile.outputs)[0].inputs)
      .filter(([p, v]) => v.bytesInOutput >= 2048 && !p.startsWith(`${relative(ROOT, pkg.dir)}/`))
      .sort((a, b) => b[1].bytesInOutput - a[1].bytesInOutput)
      .map(([p, v]) => `${p.replace(/^(node_modules|packages)\//, "").replace(/\/dist\/.*/, "")} ${(v.bytesInOutput / 1024).toFixed(0)}K`);
    rows.push({ name, gz, min, chunks, composes: [...pulled].sort(), heavy });
  }
  return { rows, leaks };
}

// Elle yazılmış, açık sızıntı iddiası: button tek başına ağır bileşen getirmemeli.
async function bannedCheck(pkg) {
  const problems = [];
  for (const [entry, banned] of Object.entries(pkg.banned)) {
    const { metafile, code } = await bundle({ contents: `export * from "${pkg.name}/${entry}";`, pkg, metafile: true });
    const owners = new Set(distInputsOf(pkg, metafile).flatMap((p) => [...ownersOf(pkg, p)]));
    const text = new TextDecoder().decode(code);
    const hits = banned.filter((c) => owners.has(c) || (pkg.textMarker && text.includes(pkg.textMarker(c))));
    const deps = (pkg.bannedDeps?.[entry] ?? []).filter((d) =>
      Object.keys(metafile.inputs).some((p) => p.includes(`node_modules/${d}/`)),
    );
    if (hits.length || deps.length) problems.push(`${pkg.name}/${entry} başka bileşen kodu içeriyor: ${[...hits, ...deps].join(", ")}`);
  }
  return problems;
}

// createContext çağıran her native kaynak modülü her formatta tek bir dist dosyasında mı?
function contextDuplicates(pkg) {
  const src = join(pkg.dir, "src");
  const contextFiles = [];
  const walk = (dir) => {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) {
        if (f !== "__tests__") walk(p);
      } else if (/\.tsx?$/.test(f) && !/\.(stories|test)\.tsx?$/.test(f) && /\bcreateContext[<(]/.test(readFileSync(p, "utf8"))) {
        contextFiles.push(relative(pkg.dir, p));
      }
    }
  };
  walk(src);
  const dist = join(pkg.dir, "dist");
  const problems = [];
  for (const ext of [".js", ".cjs"]) {
    const holders = new Map(contextFiles.map((f) => [f, []]));
    for (const file of readdirSync(dist).filter((f) => f.endsWith(`${ext}.map`))) {
      for (const s of readJson(join(dist, file)).sources) {
        const rel = relative(pkg.dir, resolve(dist, s));
        holders.get(rel)?.push(file.replace(/\.map$/, ""));
      }
    }
    for (const [f, files] of holders) {
      if (files.length !== 1) problems.push(`${f}: context ${ext} çıktısında ${files.length} kopya (${files.join(", ") || "yok"}) — tek olmalı`);
    }
  }
  return { count: contextFiles.length, problems };
}

async function measureNativeAll() {
  const { gz, min } = await bundle({ contents: 'export * from "@mari-ui/native";', pkg: PACKAGES.native });
  return { gz, min };
}

// ---- rapor / limit --------------------------------------------------------

const kb = (n) => `${(n / 1024).toFixed(2)} KB`;

function report(title, rows) {
  const sorted = [...rows].sort((a, b) => b.gz - a.gz);
  const median = sorted[Math.floor(sorted.length / 2)].gz;
  const lines = [
    `### ${title}`,
    "",
    "| # | Entry | min+gz | min | Paylaşılan chunk | Bileşimindeki bileşenler | Ağır dış girdiler (min) |",
    "|---:|---|---:|---:|---:|---|---|",
  ];
  sorted.forEach((r, i) => {
    const flag = r.gz > median * 3 ? " ⚠️" : "";
    lines.push(
      `| ${i + 1} | \`${r.name}\`${flag} | ${kb(r.gz)} | ${kb(r.min)} | ${r.chunks.length} | ${r.composes.join(", ") || "—"} | ${r.heavy.join(", ") || "—"} |`,
    );
  });
  lines.push("", `Medyan: ${kb(median)} · ⚠️ = medyanın 3 katından ağır (Faz 4 adayı)`);
  return lines.join("\n");
}

const sortedLimits = (obj) =>
  Object.fromEntries(
    Object.entries(obj)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => [k, Math.ceil(v * HEADROOM)]),
  );

function checkLimits(errors, label, current, limits) {
  for (const [name, gz] of Object.entries(current)) {
    const limit = limits?.[name];
    if (limit == null) errors.push(`${label}/${name}: limit yok — \`pnpm size --update\` çalıştırın.`);
    else if (gz > limit) errors.push(`${label}/${name}: ${kb(gz)} > limit ${kb(limit)}`);
  }
  for (const name of Object.keys(limits ?? {})) {
    if (!(name in current)) errors.push(`${label}/${name}: limit var ama entry yok — \`pnpm size --update\`.`);
  }
}

async function main() {
  const web = await measure(PACKAGES.components);
  const native = await measure(PACKAGES.native);
  const nativeAll = await measureNativeAll();
  const banned = [...(await bannedCheck(PACKAGES.components)), ...(await bannedCheck(PACKAGES.native))];
  const contexts = contextDuplicates(PACKAGES.native);

  const current = {
    components: Object.fromEntries(web.rows.map((r) => [r.name, r.gz])),
    native: Object.fromEntries(native.rows.map((r) => [r.name, r.gz])),
    nativeAll: nativeAll.gz,
  };

  if (args.has("--update")) {
    const limits = {
      $comment: "Bayt, min+gz. `pnpm size --update` bugünkü boyut +%10 ile yeniden yazar. nativeAll = kök barrel (@mari-ui/native) tamamı.",
      components: sortedLimits(current.components),
      native: sortedLimits(current.native),
      nativeAll: Math.ceil(current.nativeAll * HEADROOM),
    };
    writeFileSync(LIMITS_FILE, `${JSON.stringify(limits, null, 2)}\n`);
    console.log(`Limitler yazıldı: ${relative(ROOT, LIMITS_FILE)}`);
  }

  if (args.has("--report")) {
    console.log(`${report("Web (@mari-ui/components)", web.rows)}\n`);
    console.log(`${report("Native (@mari-ui/native)", native.rows)}\n`);
    console.log(`Native kök barrel \`@mari-ui/native\` tamamı: ${kb(nativeAll.gz)} min+gz (${kb(nativeAll.min)} min)\n`);
  }

  const errors = [...banned, ...contexts.problems];
  for (const { name, leaked } of [...web.leaks.map((l) => ({ ...l, pkg: "components" })), ...native.leaks.map((l) => ({ ...l, pkg: "native" }))]) {
    errors.push(`${name}: kaynakta import etmediği bileşen kodu dist'e sızmış → ${leaked.join(", ")}`);
  }

  const limits = existsSync(LIMITS_FILE) ? readJson(LIMITS_FILE) : null;
  if (!limits) {
    errors.push(`${relative(ROOT, LIMITS_FILE)} yok — \`pnpm size --update\` çalıştırın.`);
  } else {
    checkLimits(errors, "components", current.components, limits.components);
    checkLimits(errors, "native", current.native, typeof limits.native === "object" ? limits.native : null);
    if (limits.nativeAll == null) errors.push("nativeAll: limit yok — `pnpm size --update` çalıştırın.");
    else if (nativeAll.gz > limits.nativeAll) errors.push(`@mari-ui/native (tamamı): ${kb(nativeAll.gz)} > limit ${kb(limits.nativeAll)}`);
  }

  console.log(
    `${web.rows.length} web + ${native.rows.length} native entry ölçüldü, ${contexts.count} native context tekilliği denetlendi. Native tamamı: ${kb(nativeAll.gz)} min+gz.`,
  );
  if (errors.length) {
    console.error(`\n✖ ${errors.length} sorun:\n  ${errors.join("\n  ")}`);
    process.exit(1);
  }
  console.log("✔ Limitler, sızıntı ve context testi temiz.");
}

await main();
