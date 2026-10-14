// Release iş akışının yayın adımı (`pnpm release`): yayınlanan her paketin
// npm'de olmayan sürümünü TASLAK olarak yükler (`npm stage publish`). Taslak,
// bir maintainer npmjs.com'da (Staged Packages → Approve) ya da
// `npm stage approve <id>` ile 2FA'yla onaylayınca yayınlanır.
//
// Neden `changeset publish` değil: changesets taslak yüklemeyi bilmiyor.
// Neden önce `pnpm pack`: `npm stage publish` pnpm'in `workspace:*`
// bağımlılıklarını gerçek sürüme çevirmez; `pnpm pack` çevirir.
//
// Kimlik: GitHub OIDC (trusted publishing) — token yok; provenance npm'ce eklenir.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

// changesets/action v2, yayın betiğinin `CHANGESETS_OUTPUT` dosyasına
// (ndjson `git-tag` olayları) yazmasını bekler; dosya yoksa uyarı verir.
// Taslak henüz yayın değil: olay yazılmaz → action "yayınlanmadı" sayar,
// etiket / GitHub Release açmaz.
if (process.env.CHANGESETS_OUTPUT) writeFileSync(process.env.CHANGESETS_OUTPUT, "");
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], ...opts }).trim();

/** Bu sürüm npm'de yayınlanmış mı? (404 → hayır) */
function isPublished(name, version) {
  try {
    return run("npm", ["view", `${name}@${version}`, "version"], { stdio: ["ignore", "pipe", "ignore"] }) === version;
  } catch {
    return false;
  }
}

/** Bu sürüm onay bekleyen bir taslak olarak zaten var mı? Okunamazsa `null`. */
function isStaged(name, version) {
  try {
    const list = JSON.parse(run("npm", ["stage", "list", name, "--json"], { stdio: ["ignore", "pipe", "ignore"] }) || "[]");
    const entries = Array.isArray(list) ? list : Object.values(list).flat();
    return entries.some((e) => e && (e.version === version || e.packageVersion === version));
  } catch {
    return null;
  }
}

const packages = readdirSync(join(ROOT, "packages"))
  .map((dir) => join(ROOT, "packages", dir))
  .filter((dir) => {
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      return !pkg.private && pkg.publishConfig?.access === "public";
    } catch {
      return false;
    }
  });

const outDir = mkdtempSync(join(tmpdir(), "mari-ui-stage-"));
let staged = 0;
for (const dir of packages) {
  const { name, version } = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  if (isPublished(name, version)) {
    console.log(`= ${name}@${version} npm'de yayınlanmış, atlanıyor.`);
    continue;
  }
  const already = isStaged(name, version);
  if (already) {
    console.log(`= ${name}@${version} zaten taslakta, onay bekliyor — atlanıyor.`);
    continue;
  }
  if (already === null) console.log(`! ${name}: taslak listesi okunamadı, yine de yükleniyor.`);
  const tarball = run("pnpm", ["pack", "--pack-destination", outDir], { cwd: dir }).split("\n").pop();
  try {
    run("npm", ["stage", "publish", tarball, "--access", "public", "--tag", "latest"], { stdio: "inherit" });
  } catch (error) {
    // Liste okunamadıysa en olası neden, sürümün zaten taslakta beklemesi: onaylanana
    // kadar her main push'unda iş akışı kırmızıya dönmesin. Liste okunduysa gerçek hata.
    if (already !== null) throw error;
    console.log(`! ${name}@${version} yüklenemedi (büyük ihtimalle zaten taslakta) — npmjs.com → Staged Packages'a bakın.`);
    continue;
  }
  console.log(`+ ${name}@${version} taslak olarak yüklendi — npmjs.com'da onaylayın.`);
  staged++;
}
console.log(staged ? `\n${staged} paket onay bekliyor: https://www.npmjs.com → Staged Packages` : "\nYüklenecek yeni sürüm yok.");
