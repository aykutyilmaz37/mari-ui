# @mari-ui/tokens

## 0.4.0

### Patch Changes

- eacc3ad: Her bileşenin ödediği ortak taban küçüldü (Faz 4a). `@mari-ui/tokens` artık tree-shake ediliyor: modül seviyesindeki hesaplamalar `@__PURE__` işaretli, varsayılan `lightTheme`/`darkTheme` düz veri olarak geliyor (yalnız `spacing` import eden ~10 KB yerine ~0.2 KB alır). `cn()`, tailwind-merge'ün varsayılan config'i yerine bileşenlerin kullandığı sınıf gruplarına indirgenmiş bir config ile çalışıyor; bileşen ↔ tüketici className ezme sonucu tam twMerge ile birebir aynı. Tek fark: `cn()`'i kendi kodunda kullanan biri, hiçbir mari-ui bileşeninin kullanmadığı bir gruptaki (ör. `mask-*`, `scrollbar-*`) iki sınıfını verirse ikisi de korunur. Web divider 13.8 → 8.2 KB, button 15.7 → 10.2 KB; native button 9.0 → 6.0 KB (min+gz).

## 0.3.1

### Patch Changes

- fac8f3d: Açılır paneller (`Dropdown`, `Popover`, `Select`…) yapışkan menünün altında kalmıyor: z-index skalasında `dropdown` artık `sticky`'nin üstünde (sticky 1000, dropdown 1100). `Dropdown` sarmalayıcısı flex satırlarda dikey ortalanıyor (`self-center`), `DropdownTrigger` `inline-flex items-center` olduğundan fazladan satır boşluğu almıyor. `Image` önbellekten gelen görselde opaklık geçişini atlıyor ve yeni `fade={false}` prop'u var.

## 0.3.0

### Minor Changes

- 2c78611: mari-ui.config.json: `color.tokens` / `color.darkTokens` ile tüm `--mari-color-*` token'ları (surface, border, neutral-solid, chart-1 …) birebir ezilebilir; CLI tema sihirbazı bu ezmeleri korur.

## 0.2.0

No changes in this release.

## 0.1.3

### Patch Changes

- e5480a7: Editörde görünen tip açıklamaları (JSDoc) kullanıcıya yönelik hale getirildi: iç geliştirme geçmişi ("Faz …", "eskiden …", "kullanıcı kararı") tip dosyalarından çıkarıldı, kaynakta iç yorum olarak duruyor. Açıklaması kalmayan dışa açık bildirimlere (Calendar, Pagination, Switch, Textarea, `ColumnDef`, `Variant`, `Placement`…) kısa açıklama yazıldı.

## 0.1.2

No changes in this release.

## 0.1.1

### Patch Changes

- 6003ce1: npm sayfaları için kullanıcıya yönelik README'ler (iç geliştirme notları `DEVELOPMENT.md`'ye taşındı). Dokümanlarda ve CLI çıktılarında komut `npx @mari-ui/cli` oldu: `npx mari-ui`, npm'de başka birine ait `mari-ui` paketini arıyordu. CLI yardımından uygulanmamış `--with-theme` bayrağı kaldırıldı.
