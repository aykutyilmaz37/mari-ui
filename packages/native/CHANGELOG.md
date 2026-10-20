# @mari-ui/native

## 0.4.0

### Minor Changes

- d4cd74b: `ImageGallery` kendi subpath'inde: `@mari-ui/native/image-gallery` ve `@mari-ui/components/image-gallery`. Native'de `@mari-ui/native/image` artık galeriyi (ve görünüm seçicisi Segmented'ı) taşımıyor: Metro tree-shaking yapmadığı için her Image/Upload kullanıcısı onu da indiriyordu (`image` 17.8 → 12.2 KB min+gz). Kök `@mari-ui/native` barrel'ı `ImageGallery`'yi vermeye devam ediyor. Web'de `@mari-ui/components/image` da `ImageGallery`'yi vermeye devam ediyor (orada tree-shaking zaten ayıklıyordu); yeni subpath iki platformda aynı import yolu için.
- 1d1d102: Bileşen başına subpath export'ları: `@mari-ui/native/button`, `@mari-ui/native/input-number`, `@mari-ui/native/theme`, `@mari-ui/native/config`… Metro tree-shaking yapmadığı için kök barrel tüm paketi (~96 KB min+gz) getiriyordu; subpath yalnız o bileşeni getirir (Button ~9 KB). Kök `@mari-ui/native` geriye uyumlu olarak duruyor; ortak modüller paylaşılan chunk'larda, context'ler tek kopya.
- 3b31a88: **Kırıcı (0.x minor):** kullanılmayan özelliklerin kodu artık `Table`/`Empty` kullanan herkese gelmiyor.

  - **Table:** `pagination`, `paginationMode` ve `TablePaginationConfig` kaldırıldı; yerine `footer` yuvası (çerçevenin altında, ayırıcıyla) ve `skeletonRows`. Tablo veriyi dilimlemez. Geçiş: `pagination={{ page, pageSize, total, onPageChange }}` → `footer={<Pagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={setPage} showTotal />}` (`@mari-ui/components/pagination`); istemci taraflıda `data={rows.slice((page - 1) * pageSize, page * pageSize)}`; iskelet satır sayısı için `skeletonRows={pageSize}`.
  - **Table:** `actions.onEditWithDrawer` (ve yalnız ona hizmet eden `actions.refetch`) kaldırıldı; yerine `actions.editRow(row)` — "Düzenle" düğmesi satırla çağrılır, Drawer/Modal'ı tüketici açar (bkz. Table → "Çekmecede Düzenleme" story'si).
  - **Empty (web + native):** `buttonText`/`onClick`/`href`/`buttonIcon` (native: `buttonText`/`onPress`/`buttonIcon`) kısayolu kaldırıldı; eylem `actions` yuvasına verilen `Button`. Geçiş: `<Empty buttonText="Tekrar dene" onClick={retry} />` → `<Empty actions={<Button onClick={retry}>Tekrar dene</Button>} />` (`size="sm"` Empty'de `size="sm"` buton; native iskelette `skeleton`'ı butona da verin).

  Neden (min+gz): Pagination, Drawer ve Empty → Button zinciri her tabloya/listeye/grafiğe geliyordu. `table` 24.50 → 18.18 KB, `empty` 10.75 → 8.80 KB, `list` 18.35 → 16.90 KB, `chart` 19.60 → 17.75 KB; native `empty` 6.84 → 4.35 KB.

### Patch Changes

- 3b31a88: Entry içi tree-shaking (Faz 4c): çok export'lu bir subpath'ten tek bir bileşen import edildiğinde kardeş export'lar artık bundle'a girmiyor. Modül seviyesindeki `forwardRef`/`createContext`/`cn` çağrıları `/* @__PURE__ */` işaretli, `X.displayName = …` atamaları kalktı (render fonksiyonu adlı: `forwardRef(function Button(…))` — React DevTools adı oradan okur), `Platform.OS`/token özellik erişimleri fonksiyona ya da satır içine alındı. Örnekler (min+gz): `import { Textarea }` 12.30 → 10.69 KB, `import { ImageViewer }` 19.58 → 16.45 KB, `import { MegaMenu }` 20.49 → 16.26 KB, `import { PieChart }` 14.18 → 11.93 KB, `import { CardMeta }` 9.46 → 7.53 KB; native `import { ListItem }` 7.56 → 1.66 KB.

  Bileşenlerin `displayName` özelliği artık atanmıyor (DevTools'ta ad aynı görünür). Kural yeni bileşenlerde de geçerli: eslint `pure-module-scope` (`@mari-ui/eslint-config/tree-shaking`) editörde, `pnpm size`daki "artık kod" testi CI'da yakalar.

- Updated dependencies [eacc3ad]
  - @mari-ui/tokens@0.4.0
  - @mari-ui/core@0.4.0

## 0.3.1

### Patch Changes

- Updated dependencies [fac8f3d]
  - @mari-ui/tokens@0.3.1
  - @mari-ui/core@0.3.1

## 0.3.0

### Patch Changes

- Updated dependencies [2c78611]
  - @mari-ui/tokens@0.3.0
  - @mari-ui/core@0.3.0

## 0.2.0

### Patch Changes

- @mari-ui/core@0.2.0
  - @mari-ui/tokens@0.2.0

## 0.1.3

### Patch Changes

- e5480a7: Editörde görünen tip açıklamaları (JSDoc) kullanıcıya yönelik hale getirildi: iç geliştirme geçmişi ("Faz …", "eskiden …", "kullanıcı kararı") tip dosyalarından çıkarıldı, kaynakta iç yorum olarak duruyor. Açıklaması kalmayan dışa açık bildirimlere (Calendar, Pagination, Switch, Textarea, `ColumnDef`, `Variant`, `Placement`…) kısa açıklama yazıldı.
- 4ed7af9: Yayınlanan paketten `@mari-ui/native/stories` dışa aktarımı kaldırıldı: pakete girmeyen `src/` klasörünü gösteriyordu (yalnız monorepo içindeki native-studio kullanır).
- Updated dependencies [e5480a7]
  - @mari-ui/tokens@0.1.3
  - @mari-ui/core@0.1.3

## 0.1.2

### Patch Changes

- @mari-ui/core@0.1.2
  - @mari-ui/tokens@0.1.2

## 0.1.1

### Patch Changes

- 6003ce1: npm sayfaları için kullanıcıya yönelik README'ler (iç geliştirme notları `DEVELOPMENT.md`'ye taşındı). Dokümanlarda ve CLI çıktılarında komut `npx @mari-ui/cli` oldu: `npx mari-ui`, npm'de başka birine ait `mari-ui` paketini arıyordu. CLI yardımından uygulanmamış `--with-theme` bayrağı kaldırıldı.
- Updated dependencies [6003ce1]
  - @mari-ui/tokens@0.1.1
  - @mari-ui/core@0.1.1
