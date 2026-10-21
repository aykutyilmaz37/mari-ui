# @mari-ui/cli — geliştirici notları

Kullanıcıya yönelik doküman: [README.md](README.md). Bu dosya iç tasarım kararlarının kaydıdır; npm paketine girmez.

Faz 7 — mari-ui'ı bir tüketici projesine kurar ve AI ajan kural dosyalarını (Claude Code, Codex, Cursor, Gemini, GitHub Copilot) `@mari-ui/components`in **gerçek** manifest'inden ve projenin **çözümlenmiş** temasından senkron tutar.

## Temel ilke

Kurallar elle yazılmaz. `packages/components/scripts/build-manifest.ts` (ts-morph ile `src/**/index.ts`i introspect eder) her component'in gerçek prop sözleşmesini, terk edilmiş prop'larını (JSDoc `@deprecated`'dan) ve `@mari-ui/core`'un beş paylaşılan eksenini (`ColorRole`/`Size`/`Variant`/`Radius`/`Placement`) `dist/manifest.json`a yazar. `@mari-ui/cli` bunu okuyup beş aracın formatına uygun tek bir içerik üretir — elle yazılan bir kural dosyası ilk sürümde eskiyip tam da düzeltmeye çalıştığımız kopukluğu (terk edilmiş prop'ların "güncel" sanılması) yeniden üretirdi.

Faz 17 — iki katman (`src/skillGuide.ts`, elle yazılı tasarım kararları): **kesin kurallar** (7 madde: önce mari-ui, sabit renk/px yok, skala dışı gölge/köşe/katman yok, yüklenme `skeleton` ile, erişilebilirlik temeli, linkler düz `<a href>` + `onNavigate`) TÜM araç dosyalarına ve `CLAUDE.md`ye girer — her istekte okunduğu için kısa. **Sayfa kurma rehberi** (iş akışı, uygulama iskeleti, sayfa kalıpları, "hangi durumda hangi component" tablosu, tema/ölçek, framework'ten bağımsız proje yapısı ilkeleri) YALNIZ Claude skill'ine (`SKILL.md`) girer; Claude onu ilgili işte yükler. Rehberde adı geçen her component'in gerçek manifest'te var olduğunu bir test denetler.

## Komutlar

```bash
npx @mari-ui/cli init [--platform web|native|both] [--agents claude,codex,cursor,gemini,copilot] [--dir <yol>]
npx @mari-ui/cli sync [--agents ...] [--manifest <yol>] [--native-manifest <yol>] [--dir <yol>] [--check]
npx @mari-ui/cli theme [--dir <yol>] [--config <yol>] [--out <yol>] [--check]
```

- **`init`** — platformu belirler (`--platform` → config'teki `platform` → etkileşimli soru → `package.json` tahmini; bkz. `src/platform.ts`), `package.json`a o platformun paketlerini (`dependenciesFor`: web → `@mari-ui/components`, native → `@mari-ui/native`, both → ikisi; hepsinde `@mari-ui/core`/`@mari-ui/tokens`) ekler (zaten varsa dokunmaz), `mari-ui.config.json`ı varsayılan değerlerle oluşturur (zaten varsa dokunmaz — kullanıcının tema seçimini silmez), ve AI ajan kural dosyalarını yazar. **Component seçtirmez** — tek paket kurulur, kullanılmayan component'ler zaten `@mari-ui/components`in subpath export mimarisiyle bundle'a girmez.
- **`sync`** — Sadece kural dosyalarını tazeler (paket sürümü veya tema değişince). `--check` hiçbir şey YAZMAZ, bayat bir dosya varsa çıkış kodu `1` verir (CI için).
- **`theme`** — `mari-ui.config.json`dan `mari-ui-theme.css` (`:root`/`[data-theme="dark"]` CSS değişkenleri) ve `mari-ui-theme.ts` (native/başka platformlar için TS token objesi) üretir. `resolveThemeConfig`/`buildPlainThemeCss` — `@mari-ui/tokens`ın KENDİ varsayılan temasını üreten build script'iyle (`packages/tokens/scripts/build-css.ts`) AYNI fonksiyonlar; mantık ikinci kez yazılmadı. **Faz 10** — config'e opsiyonel bir `themes` alanı eklenirse (`{"themes": {"brand": {"base": "light", "color": {"primary": "#a21caf"}}}}`), light/dark'ın ÖTESİNDE HER girdi de kendi `[data-theme="<isim>"]` bloğu olarak aynı CSS'e yazılır — bkz. `packages/tokens/README.md`.

## Platform ayrımı (Faz A–D)

`mari-ui.config.json`daki `platform` (`web | native | both`) `sync` ve `theme`in tek kaynağıdır; yoksa `package.json`dan tahmin edilir (`both` asla). Her kural gövdesi yalnız kendi paketinin manifest'inden üretilir; paket yoksa `ManifestNotFoundError` — yanlış platformun kuralı yazılmaz. `both`ta yazıcılar ikili çıktı üretir (`writers/scope.ts`: `PLATFORM_GLOBS`, `SCOPE_NOTES`). Seçilmeyen platformun paketi `foreignPackagesFor` ile yalnız uyarılır. Platform değişince eski yoldaki dosyalar silinmez. Monorepo'da her uygulama `--dir` ile ayrı kurulur. Kullanıcı dokümanı: [docs/kurulum-platformlar.md](../../docs/kurulum-platformlar.md).

## `<!-- mari-ui:start -->` / `<!-- mari-ui:end -->` işaretleri

`AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md` gibi dosyalar tüketicinin KENDİ amacıyla da yazdığı, paylaşılan dosyalardır. `sync` bu dosyalarda SADECE iki işaret arasını değiştirir — öncesi/sonrası hiç dokunulmadan kalır. Dosya hiç yoksa oluşturulur, marker taşımıyorsa blok sona eklenir.

`.claude/skills/mari-ui/SKILL.md` ve `.cursor/rules/mari-ui.mdc` İSTİSNA: bu ikisinin YAML frontmatter'ı, o araçların parser'ı gereği dosyanın LİTERAL İLK BAYTLARI olmak zorunda — bu yüzden frontmatter marker bloğunun DIŞINDA (önünde) sabit yazılır. (İlk denemede frontmatter yanlışlıkla marker'ın içine düşürülmüştü — bir smoke test'te fark edilip düzeltildi, bkz. git geçmişi.)

## Test kapsamı

Tüm komutlar (`init`/`sync`/`theme`) gerçek, izole geçici dizinlerde (`node:fs` + `node:os.tmpdir()`) ve `@mari-ui/components`in GERÇEK derlenmiş `manifest.json`ına karşı test edilir — sahte fixture'lar değil. İdempotency (iki kez çalıştırınca ikinci seferde değişiklik olmaması), kullanıcı içeriğinin korunması, ve `--check` modunun hiçbir şey yazmadığı ayrı ayrı doğrulanır.

## Bilinen sınırlama

`init`, bağımlılıkları `package.json`a EKLER ama paket yöneticisini (npm/yarn/pnpm) OTOMATİK ÇALIŞTIRMAZ — kurulum tamamlandıktan sonra `npx @mari-ui/cli sync`i tekrar çalıştırmanız gerekir (manifest, paket gerçekten `node_modules`e inene kadar okunamaz). CSS import'u da otomatik enjekte edilmez (projenin giriş noktasını güvenilir şekilde tahmin etmenin bir yolu yok) — `init` net bir talimat basar.
