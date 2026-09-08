# @mari-ui/cli

Faz 7 — mari-ui'ı bir tüketici projesine kurar ve AI ajan kural dosyalarını (Claude Code, Codex, Cursor, Gemini, GitHub Copilot) `@mari-ui/components`in **gerçek** manifest'inden ve projenin **çözümlenmiş** temasından senkron tutar.

## Temel ilke

Kurallar elle yazılmaz. `packages/components/scripts/build-manifest.ts` (ts-morph ile `src/**/index.ts`i introspect eder) her component'in gerçek prop sözleşmesini, terk edilmiş prop'larını (JSDoc `@deprecated`'dan) ve `@mari-ui/core`'un beş paylaşılan eksenini (`ColorRole`/`Size`/`Variant`/`Radius`/`Placement`) `dist/manifest.json`a yazar. `@mari-ui/cli` bunu okuyup beş aracın formatına uygun tek bir içerik üretir — elle yazılan bir kural dosyası ilk sürümde eskiyip tam da düzeltmeye çalıştığımız kopukluğu (terk edilmiş prop'ların "güncel" sanılması) yeniden üretirdi.

## Komutlar

```bash
npx mari-ui init [--agents claude,codex,cursor,gemini,copilot] [--dir <yol>]
npx mari-ui sync [--agents ...] [--dir <yol>] [--check]
npx mari-ui theme [--dir <yol>] [--config <yol>] [--out <yol>] [--check]
```

- **`init`** — `package.json`a `@mari-ui/components`/`@mari-ui/core`/`@mari-ui/tokens`i ekler (zaten varsa dokunmaz), `mari-ui.config.json`ı varsayılan değerlerle oluşturur (zaten varsa dokunmaz — kullanıcının tema seçimini silmez), ve AI ajan kural dosyalarını yazar. **Component seçtirmez** — tek paket kurulur, kullanılmayan component'ler zaten `@mari-ui/components`in subpath export mimarisiyle bundle'a girmez.
- **`sync`** — Sadece kural dosyalarını tazeler (paket sürümü veya tema değişince). `--check` hiçbir şey YAZMAZ, bayat bir dosya varsa çıkış kodu `1` verir (CI için).
- **`theme`** — `mari-ui.config.json`dan `mari-ui-theme.css` (`:root`/`[data-theme="dark"]` CSS değişkenleri) ve `mari-ui-theme.ts` (native/başka platformlar için TS token objesi) üretir. `resolveThemeConfig`/`buildPlainThemeCss` — `@mari-ui/tokens`ın KENDİ varsayılan temasını üreten build script'iyle (`packages/tokens/scripts/build-css.ts`) AYNI fonksiyonlar; mantık ikinci kez yazılmadı.

## `<!-- mari-ui:start -->` / `<!-- mari-ui:end -->` işaretleri

`AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md` gibi dosyalar tüketicinin KENDİ amacıyla da yazdığı, paylaşılan dosyalardır. `sync` bu dosyalarda SADECE iki işaret arasını değiştirir — öncesi/sonrası hiç dokunulmadan kalır. Dosya hiç yoksa oluşturulur, marker taşımıyorsa blok sona eklenir.

`.claude/skills/mari-ui/SKILL.md` ve `.cursor/rules/mari-ui.mdc` İSTİSNA: bu ikisinin YAML frontmatter'ı, o araçların parser'ı gereği dosyanın LİTERAL İLK BAYTLARI olmak zorunda — bu yüzden frontmatter marker bloğunun DIŞINDA (önünde) sabit yazılır. (İlk denemede frontmatter yanlışlıkla marker'ın içine düşürülmüştü — bir smoke test'te fark edilip düzeltildi, bkz. git geçmişi.)

## Test kapsamı

Tüm komutlar (`init`/`sync`/`theme`) gerçek, izole geçici dizinlerde (`node:fs` + `node:os.tmpdir()`) ve `@mari-ui/components`in GERÇEK derlenmiş `manifest.json`ına karşı test edilir — sahte fixture'lar değil. İdempotency (iki kez çalıştırınca ikinci seferde değişiklik olmaması), kullanıcı içeriğinin korunması, ve `--check` modunun hiçbir şey yazmadığı ayrı ayrı doğrulanır.

## Bilinen sınırlama

`init`, bağımlılıkları `package.json`a EKLER ama paket yöneticisini (npm/yarn/pnpm) OTOMATİK ÇALIŞTIRMAZ — kurulum tamamlandıktan sonra `npx mari-ui sync`i tekrar çalıştırmanız gerekir (manifest, paket gerçekten `node_modules`e inene kadar okunamaz). CSS import'u da otomatik enjekte edilmez (projenin giriş noktasını güvenilir şekilde tahmin etmenin bir yolu yok) — `init` net bir talimat basar.
