# @mari-ui/cli

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
