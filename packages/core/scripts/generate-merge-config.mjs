#!/usr/bin/env node
// `src/mergeConfig.generated.ts` üretir: tailwind-merge varsayılan config'inin
// yalnız mari-ui bileşenlerinin ihtiyaç duyduğu sınıf gruplarına indirgenmiş hâli
// (bundle performansı Faz 4a). Varsayılan config tek başına ~6.4 KB min+gz'dir ve
// `cn()` kullanan her web bileşeni onu öderdi.
//
// Tutulan gruplar — bileşen ↔ tüketici ezme davranışı tam twMerge ile BİREBİR kalsın diye:
//   1. Bileşen kaynağında (packages/components/src) geçen her sınıfın grubu.
//   2. Tutulan bir grupla iki yönde çakışan her grup: tüketicinin `p-2`'si bileşenin
//      `px-4`'ünü siler (p tutulur), tutulan `p` de kendinden önceki `pbe-0`'ı siler (pbe tutulur).
//   3. Tutulan bir grubun doğrulayıcısının "gölgesinde" kalan her grup: tailwind-merge
//      sınıfı önek ağacında arar; `text-shadow` düşseydi `text-shadow-lg` aynı ağaçtaki
//      `text-{isAny}` renk doğrulayıcısına takılıp "renk" sayılırdı.
// Kalan gruplardaki sınıflar tanınmaz ve olduğu gibi geçer: fark YALNIZ tüketicinin
// kendi sınıfları arasında, hiçbir bileşenin kullanmadığı bir grupta (ör. `mask-*`) görülür.
//
// Kullanım:
//   node scripts/generate-merge-config.mjs            → dosyayı yeniden yaz
//   node scripts/generate-merge-config.mjs --verify   → ek olarak bileşen sınıfı × Tailwind'in
//                                                        TÜM sınıf listesi çiftlerinde tam twMerge
//                                                        ile karşılaştır (~2 dk)
// Hızlı denetimler (dosya güncel mi + bileşen sınıfı çiftleri) `src/__tests__/mergeConfig.test.ts`'te.

/* global console, process */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createTailwindMerge, getDefaultConfig, validators } from "tailwind-merge";

const CORE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS_SRC = resolve(CORE, "../components/src");
export const OUT = join(CORE, "src/mergeConfig.generated.ts");

const config = getDefaultConfig();
const ALL_GROUPS = Object.keys(config.classGroups);
const conflictsOf = (g) => [...(config.conflictingClassGroups[g] ?? []), ...(config.conflictingClassGroupModifiers[g] ?? [])];

/** Bileşen kaynağındaki sınıf adayları (fazlası zararsız: tanınmayan aday hiçbir grubu tutmaz). */
export function collectCandidates(dir = COMPONENTS_SRC) {
  const found = new Set();
  const addTokens = (text) => {
    for (const token of text.split(/[\s"'`]+/)) {
      let t = token;
      while (",;)".includes(t.at(-1))) t = t.slice(0, -1);
      if (/^[!-]?[@a-z[*]/.test(t) && t.length < 120) found.add(t);
    }
  };
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx|css)$/.test(f)) addTokens(readFileSync(p, "utf8"));
    }
  };
  walk(dir);
  return [...found];
}

const mergerWith = (classGroups) =>
  createTailwindMerge(() => ({ ...config, cacheSize: 0, classGroups, conflictingClassGroups: {}, conflictingClassGroupModifiers: {} }));
/** Grup yokken de tekilleşen sınıflar (keyfi özellik `[mask-type:alpha]`) motorun işi, gruba ihtiyaç duymaz. */
const engineOnly = mergerWith({});
const recognizedBy = (merge, c) => merge(`${c} ${c}`) === c;

/** Varsayılan config'in tanıdığı (gruba düşen), değiştiricisiz bileşen sınıfları — eşdeğerlik testinin örneklemi. */
export function recognizedBases(candidates = collectCandidates()) {
  const full = createTailwindMerge(getDefaultConfig);
  const base = (c) => {
    let depth = 0;
    let start = 0;
    for (let i = 0; i < c.length; i++) {
      if (c[i] === "[") depth++;
      else if (c[i] === "]") depth--;
      else if (c[i] === ":" && depth === 0) start = i + 1;
    }
    return c.slice(start);
  };
  return [...new Set(candidates.map(base))].filter((c) => recognizedBy(full, c) && !recognizedBy(engineOnly, c));
}

function usedGroups(candidates) {
  const full = createTailwindMerge(getDefaultConfig);
  const grouped = candidates.filter((c) => recognizedBy(full, c) && !recognizedBy(engineOnly, c));
  return new Set(ALL_GROUPS.filter((g) => grouped.some((c) => recognizedBy(mergerWith({ [g]: config.classGroups[g] }), c))));
}

function themeKeyOf(getter) {
  let key;
  getter(new Proxy({}, { get: (_, k) => ((key = k), []) }));
  return key;
}

/**
 * Grubun ürettiği sınıf yolları (`paths`: `text-left`, `grid-cols`) ve doğrulayıcının
 * kalan parçaları kabul ettiği yollar (`open`: `{ text: [isAny] }` → `text`).
 */
function shapeOf(defs, prefix = "", out = { paths: new Set(), open: new Set() }) {
  const join = (a, b) => (a && b ? `${a}-${b}` : a || b);
  for (const d of defs) {
    if (typeof d === "string") out.paths.add(join(prefix, d));
    else if (typeof d === "function") {
      if (d.isThemeGetter) shapeOf(config.theme[themeKeyOf(d)] ?? [], prefix, out);
      // Kökteki tek doğrulayıcı (container-named) yalnız `@container/…`ı tanır, kimseyi gölgelemez.
      else if (prefix) out.open.add(prefix);
    } else for (const [key, sub] of Object.entries(d)) shapeOf(sub, join(prefix, key), out);
  }
  return out;
}

function closure(used) {
  const keep = new Set(used);
  const shape = Object.fromEntries(ALL_GROUPS.map((g) => [g, shapeOf(config.classGroups[g])]));
  for (let changed = true; changed; ) {
    changed = false;
    const open = [...keep].flatMap((g) => [...shape[g].open]);
    const conflictedByKept = new Set([...keep].flatMap(conflictsOf));
    for (const g of ALL_GROUPS) {
      if (keep.has(g)) continue;
      const shadowed = [...shape[g].paths, ...shape[g].open].some((p) => open.some((o) => p === o || p.startsWith(`${o}-`)));
      if (shadowed || conflictedByKept.has(g) || conflictsOf(g).some((c) => keep.has(c))) {
        keep.add(g);
        changed = true;
      }
    }
  }
  return keep;
}

// ---- serileştirme ---------------------------------------------------------

const validatorName = new Map(Object.entries(validators).map(([name, fn]) => [fn, name]));

/** Aynı ölçek (spacing, renk …) birçok grupta tekrarlanır: 2+ kez geçen dizi literal'i tek sabite çekilir. */
function createSerializer() {
  const pool = new Map();
  const themeKeys = new Set();
  const serialize = (value) => {
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "function") {
      if (value.isThemeGetter) {
        const key = themeKeyOf(value);
        themeKeys.add(key);
        return `t(${JSON.stringify(key)})`;
      }
      const name = validatorName.get(value);
      if (!name) throw new Error(`Tanınmayan doğrulayıcı: ${value.toString().slice(0, 80)}`);
      return `v.${name}`;
    }
    if (Array.isArray(value)) {
      const literal = `[${value.map(serialize).join(", ")}]`;
      if (literal.length < 24) return literal;
      const entry = pool.get(literal) ?? { name: `s${pool.size}`, count: 0 };
      entry.count++;
      pool.set(literal, entry);
      return `\0${entry.name}\0`;
    }
    const key = (k) => (/^[a-z_$][\w$]*$/i.test(k) ? k : JSON.stringify(k));
    return `{ ${Object.entries(value)
      .map(([k, v]) => `${key(k)}: ${serialize(v)}`)
      .join(", ")} }`;
  };
  const finish = () => {
    const byName = new Map([...pool].map(([literal, e]) => [e.name, { ...e, literal }]));
    const expand = (text) => text.replace(/\0(s\d+)\0/g, (_, n) => (byName.get(n).count > 1 ? n : expand(byName.get(n).literal)));
    const consts = [...byName.values()].filter((e) => e.count > 1).map((e) => `  const ${e.name} = ${expand(e.literal)};`);
    return { consts, expand };
  };
  return { serialize, themeKeys, finish };
}

export function buildConfigSource(candidates = collectCandidates()) {
  const used = usedGroups(candidates);
  const kept = closure(used);
  // Sıra ÖNEMLİ: aynı düğümde birden çok doğrulayıcı varsa önce kaydedilen grup kazanır
  // (`border-2` → border-w, border-color değil) — varsayılan config sırası korunur.
  const keep = ALL_GROUPS.filter((g) => kept.has(g));
  const { serialize, themeKeys, finish } = createSerializer();
  const groups = keep.map((g) => `      ${JSON.stringify(g)}: ${serialize(config.classGroups[g])},`);
  // Tema değerleri de tema getter'ı içerebilir; sabit noktaya kadar topla.
  const theme = new Map();
  while (themeKeys.size > theme.size) {
    for (const key of [...themeKeys].filter((k) => !theme.has(k))) theme.set(key, serialize(config.theme[key] ?? []));
  }
  const themeLines = [...theme].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `      ${JSON.stringify(k)}: ${v},`);
  const conflictLines = (map) =>
    Object.entries(map)
      .filter(([g]) => kept.has(g))
      .map(([g, list]) => [g, list.filter((c) => kept.has(c))])
      .filter(([, list]) => list.length)
      .map(([g, list]) => `      ${JSON.stringify(g)}: ${JSON.stringify(list)},`);
  const { consts, expand } = finish();

  const source = `// ÜRETİLMİŞ DOSYA — elle düzenlemeyin: \`pnpm --filter @mari-ui/core generate:merge-config\`
// (scripts/generate-merge-config.mjs). tailwind-merge varsayılan config'inin, mari-ui
// bileşenlerinin ihtiyaç duyduğu ${keep.length}/${ALL_GROUPS.length} sınıf grubuna indirgenmiş hâli.
import { fromTheme, validators as v, type Config } from "tailwind-merge";

const t = (key: string) => fromTheme<string>(key);

// Sabitler fonksiyonun İÇİNDE: modül seviyesinde çağrı kalmaz, \`cn\` kullanılmazsa hepsi bundle'dan düşer.
export function mergeConfig(): Config<string, string> {
${consts.join("\n")}
  return {
    cacheSize: ${config.cacheSize},
    theme: {
${expand(themeLines.join("\n"))}
    },
    classGroups: {
${expand(groups.join("\n"))}
    },
    conflictingClassGroups: {
${conflictLines(config.conflictingClassGroups).join("\n")}
    },
    conflictingClassGroupModifiers: {
${conflictLines(config.conflictingClassGroupModifiers).join("\n")}
    },
    postfixLookupClassGroups: ${JSON.stringify((config.postfixLookupClassGroups ?? []).filter((g) => kept.has(g)))},
    orderSensitiveModifiers: ${JSON.stringify(config.orderSensitiveModifiers)},
  };
}
`;
  return { used, keep, source };
}

/** Bileşen sınıfı × Tailwind v4'ün tüm sınıf listesi, iki sırada: indirgenmiş config = tam config mi? */
async function verifyAgainstTailwind(slimConfig) {
  const { __unstable__loadDesignSystem } = await import("tailwindcss");
  const twDir = dirname(fileURLToPath(import.meta.resolve("tailwindcss")));
  const css = readFileSync(join(twDir, "../theme.css"), "utf8");
  const classList = (await __unstable__loadDesignSystem(css)).getClassList().map(([c]) => c);
  const slim = createTailwindMerge(() => slimConfig);
  const full = createTailwindMerge(getDefaultConfig);
  const bases = recognizedBases();
  const mismatches = [];
  for (const a of bases) {
    for (const b of classList) {
      for (const pair of [`${a} ${b}`, `${b} ${a}`]) if (slim(pair) !== full(pair)) mismatches.push(pair);
    }
  }
  console.log(`${bases.length} bileşen sınıfı × ${classList.length} Tailwind sınıfı: ${mismatches.length} fark`);
  if (mismatches.length) {
    console.error(mismatches.slice(0, 20).join("\n"));
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { used, keep, source } = buildConfigSource();
  writeFileSync(OUT, source);
  console.log(`${used.size} grup kullanılıyor; çakışma/gölge kapanışıyla ${keep.length}/${ALL_GROUPS.length} grup → ${OUT}`);
  if (process.argv.includes("--verify")) {
    // Üretilen kaynağı değil, aynı seçimin canlı config'ini karşılaştırır; kaynak ↔ config eşliği birim testte.
    const kept = new Set(keep);
    const filterMap = (map) =>
      Object.fromEntries(Object.entries(map).filter(([g]) => kept.has(g)).map(([g, l]) => [g, l.filter((c) => kept.has(c))]));
    await verifyAgainstTailwind({
      ...config,
      classGroups: Object.fromEntries(keep.map((g) => [g, config.classGroups[g]])),
      conflictingClassGroups: filterMap(config.conflictingClassGroups),
      conflictingClassGroupModifiers: filterMap(config.conflictingClassGroupModifiers),
    });
  }
}
