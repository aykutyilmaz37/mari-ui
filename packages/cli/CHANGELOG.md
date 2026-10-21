# @mari-ui/cli

## 0.5.0

### Minor Changes

- 82f1cd7: `sync` artık React Native projelerine native'e özgü AI kuralları yazıyor (`@mari-ui/native` manifest'inden): `StyleSheet` + token objesi, `onPress`, `accessibilityRole`/`accessibilityLabel`, metin `Text` içinde, router ile gezinme, web paketinden import yok. `both` platformunda iki gövde birden: Claude'da `mari-ui-web` ve `mari-ui-native` skill'leri, Cursor `.mdc` ve Copilot `applyTo` dosyaları glob'la ayrılır, AGENTS.md ve GEMINI.md'de iki bölüm alt alta. `both` için yeni `--native-manifest` bayrağı. Web projelerinin çıktısı değişmedi.
- f89e31e: CLI artık platform ayırıyor (web / native / ikisi). `init` platformu sorar (`--platform web|native|both`; sorulamıyorsa `package.json`dan tahmin eder) ve seçimi `mari-ui.config.json`a `platform` olarak yazar. Seçilmeyen platformun paketi kurulmaz: native projeye `@mari-ui/components` yerine `@mari-ui/native` eklenir. Native projede `sync` web kurallarını artık yazmaz (React Native kodunu yanıltıyordu), `theme` CSS üretmez ve Tailwind talimatı basılmaz. Native kural içeriği sonraki sürümde.

### Patch Changes

- 8b05157: README: platform seçimi (web / native / ikisi), `--platform` ve `--native-manifest` bayrakları, paket tablosu ve monorepo kullanımı.
- Updated dependencies [f89e31e]
  - @mari-ui/tokens@0.5.0

## 0.4.0

### Patch Changes

- 3b31a88: **Kırıcı (0.x minor):** kullanılmayan özelliklerin kodu artık `Table`/`Empty` kullanan herkese gelmiyor.

  - **Table:** `pagination`, `paginationMode` ve `TablePaginationConfig` kaldırıldı; yerine `footer` yuvası (çerçevenin altında, ayırıcıyla) ve `skeletonRows`. Tablo veriyi dilimlemez. Geçiş: `pagination={{ page, pageSize, total, onPageChange }}` → `footer={<Pagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={setPage} showTotal />}` (`@mari-ui/components/pagination`); istemci taraflıda `data={rows.slice((page - 1) * pageSize, page * pageSize)}`; iskelet satır sayısı için `skeletonRows={pageSize}`.
  - **Table:** `actions.onEditWithDrawer` (ve yalnız ona hizmet eden `actions.refetch`) kaldırıldı; yerine `actions.editRow(row)` — "Düzenle" düğmesi satırla çağrılır, Drawer/Modal'ı tüketici açar (bkz. Table → "Çekmecede Düzenleme" story'si).
  - **Empty (web + native):** `buttonText`/`onClick`/`href`/`buttonIcon` (native: `buttonText`/`onPress`/`buttonIcon`) kısayolu kaldırıldı; eylem `actions` yuvasına verilen `Button`. Geçiş: `<Empty buttonText="Tekrar dene" onClick={retry} />` → `<Empty actions={<Button onClick={retry}>Tekrar dene</Button>} />` (`size="sm"` Empty'de `size="sm"` buton; native iskelette `skeleton`'ı butona da verin).

  Neden (min+gz): Pagination, Drawer ve Empty → Button zinciri her tabloya/listeye/grafiğe geliyordu. `table` 24.50 → 18.18 KB, `empty` 10.75 → 8.80 KB, `list` 18.35 → 16.90 KB, `chart` 19.60 → 17.75 KB; native `empty` 6.84 → 4.35 KB.

- Updated dependencies [eacc3ad]
  - @mari-ui/tokens@0.4.0

## 0.3.1

### Patch Changes

- Updated dependencies [fac8f3d]
  - @mari-ui/tokens@0.3.1

## 0.3.0

### Minor Changes

- 2c78611: mari-ui.config.json: `color.tokens` / `color.darkTokens` ile tüm `--mari-color-*` token'ları (surface, border, neutral-solid, chart-1 …) birebir ezilebilir; CLI tema sihirbazı bu ezmeleri korur.

### Patch Changes

- Updated dependencies [2c78611]
  - @mari-ui/tokens@0.3.0

## 0.2.0

### Minor Changes

- 25db236: `npx @mari-ui/cli theme` artık temayı sorar: **Varsayılan (Yumuşak iris)**, hazır kişilikler (Kurumsal, Oyunbaz, Minimal, Editoryal, Lüks) ya da **Özel** (birincil/vurgu rengi, köşe yuvarlaklığı, yoğunluk). Config varsa "mevcut ayarı koru" seçeneği çıkar; seçim tema alanlarını baştan yazar, ek temalar ve büyük ekran ayarı korunur. `init` de config yokken aynı soruyu sorar. Sormadan kullanım için `--persona default|<kişilik>`, `--primary #hex`, `--accent #hex`, `--yes`; etkileşimli olmayan terminalde (CI, AI ajanları) soru sorulmaz.

  Kırıcı (programatik API): `runInit` seçeneği `persona` → `theme` (`ThemeChoice`).

### Patch Changes

- @mari-ui/tokens@0.2.0

## 0.1.3

### Patch Changes

- e5480a7: Editörde görünen tip açıklamaları (JSDoc) kullanıcıya yönelik hale getirildi: iç geliştirme geçmişi ("Faz …", "eskiden …", "kullanıcı kararı") tip dosyalarından çıkarıldı, kaynakta iç yorum olarak duruyor. Açıklaması kalmayan dışa açık bildirimlere (Calendar, Pagination, Switch, Textarea, `ColumnDef`, `Variant`, `Placement`…) kısa açıklama yazıldı.
- Updated dependencies [e5480a7]
  - @mari-ui/tokens@0.1.3

## 0.1.2

### Patch Changes

- 01c95ef: İlk gerçek kurulum (POC) bulguları: `body` artık temanın yüzey ve metin rengini alır (koyu temada sayfa tarayıcının kendi koyu zeminine düşüyordu). `init` bağımlılıkları `"latest"` yerine CLI'ın sürüm aralığıyla (`^x.y.z`) yazar. CLI'ın önerdiği tema CSS import yolu, dosyanın proje köküne yazıldığını hesaba katar (`../mari-ui-theme.css`).
- @mari-ui/tokens@0.1.2

## 0.1.1

### Patch Changes

- 6003ce1: npm sayfaları için kullanıcıya yönelik README'ler (iç geliştirme notları `DEVELOPMENT.md`'ye taşındı). Dokümanlarda ve CLI çıktılarında komut `npx @mari-ui/cli` oldu: `npx mari-ui`, npm'de başka birine ait `mari-ui` paketini arıyordu. CLI yardımından uygulanmamış `--with-theme` bayrağı kaldırıldı.
- Updated dependencies [6003ce1]
  - @mari-ui/tokens@0.1.1
