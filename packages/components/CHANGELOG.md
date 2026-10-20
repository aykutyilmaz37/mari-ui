# @mari-ui/components

## 0.4.0

### Minor Changes

- d4cd74b: `ImageGallery` kendi subpath'inde: `@mari-ui/native/image-gallery` ve `@mari-ui/components/image-gallery`. Native'de `@mari-ui/native/image` artık galeriyi (ve görünüm seçicisi Segmented'ı) taşımıyor: Metro tree-shaking yapmadığı için her Image/Upload kullanıcısı onu da indiriyordu (`image` 17.8 → 12.2 KB min+gz). Kök `@mari-ui/native` barrel'ı `ImageGallery`'yi vermeye devam ediyor. Web'de `@mari-ui/components/image` da `ImageGallery`'yi vermeye devam ediyor (orada tree-shaking zaten ayıklıyordu); yeni subpath iki platformda aynı import yolu için.
- d4cd74b: **Kırıcı (0.x minor):** `Input`, `Textarea` ve `SearchInput` artık `mask`/`replacement` ve `mentions` prop'larını almıyor. Bu özellikler iki yeni subpath'e taşındı:

  - `@mari-ui/components/masked-input` → `MaskedInput` (`mask` zorunlu, `replacement` isteğe bağlı)
  - `@mari-ui/components/mentions` → `MentionInput`, `MentionTextarea` (`mentions` zorunlu); `MentionsConfig`/`MentionOption` tipleri de buradan

  Geçiş: `<Input mask="…" />` → `<MaskedInput mask="…" />`, `<Input mentions={…} />` → `<MentionInput mentions={…} />`, `<Textarea mentions={…} />` → `<MentionTextarea mentions={…} />`. Geri kalan prop'lar, görünüm ve davranış aynı. Eski kullanım derleme hatası verir (sessizce yok sayılmaz).

  Neden: maske kütüphanesi (@react-input/mask) ve öneri paneli her `Input` kullanıcısına geliyordu; aynı entry'de kalsalar tree-shaking de onları atamıyordu. `import { Input }` 20.4 → 11.5 KB, `import { Textarea }` 20.4 → 12.3 KB min+gz; `@mari-ui/components/input` entry'sinin tamamı 22.2 → 14.1 KB.

- 3b31a88: **Kırıcı (0.x minor):** `Select` artık yalnız tekli seçim yapıyor; çoklu seçim (etiketler) yeni subpath'teki ayrı bileşende:

  - `@mari-ui/components/multi-select` → `MultiSelect` (`MultiSelectProps`: `value`/`defaultValue` dizi, `onChange(values, options)`, `maxTagCount`)

  Geçiş: `<Select mode="multiple" … />` → `<MultiSelect … />` (`mode` prop'u kaldırıldı; diğer prop'lar, görünüm, klavye ve erişilebilirlik aynı). `SelectSingleProps` → `SelectProps`, `SelectMultipleProps` → `MultiSelectProps`. Eski kullanım derleme hatası verir.

  Neden: `Select` (ve onu ay/yıl seçicisi olarak kullanan `Calendar`) çoklu modu hiç kullanmasa da `Tag` kodunu taşıyordu. `@mari-ui/components/select` 15.10 → 14.02 KB, `calendar` 20.64 → 20.21 KB min+gz. `TreeSelect` ve native `Select` `mode="multiple"` API'sini koruyor.

- 3b31a88: **Kırıcı (0.x minor):** kullanılmayan özelliklerin kodu artık `Table`/`Empty` kullanan herkese gelmiyor.

  - **Table:** `pagination`, `paginationMode` ve `TablePaginationConfig` kaldırıldı; yerine `footer` yuvası (çerçevenin altında, ayırıcıyla) ve `skeletonRows`. Tablo veriyi dilimlemez. Geçiş: `pagination={{ page, pageSize, total, onPageChange }}` → `footer={<Pagination currentPage={page} pageSize={pageSize} totalItems={total} onPageChange={setPage} showTotal />}` (`@mari-ui/components/pagination`); istemci taraflıda `data={rows.slice((page - 1) * pageSize, page * pageSize)}`; iskelet satır sayısı için `skeletonRows={pageSize}`.
  - **Table:** `actions.onEditWithDrawer` (ve yalnız ona hizmet eden `actions.refetch`) kaldırıldı; yerine `actions.editRow(row)` — "Düzenle" düğmesi satırla çağrılır, Drawer/Modal'ı tüketici açar (bkz. Table → "Çekmecede Düzenleme" story'si).
  - **Empty (web + native):** `buttonText`/`onClick`/`href`/`buttonIcon` (native: `buttonText`/`onPress`/`buttonIcon`) kısayolu kaldırıldı; eylem `actions` yuvasına verilen `Button`. Geçiş: `<Empty buttonText="Tekrar dene" onClick={retry} />` → `<Empty actions={<Button onClick={retry}>Tekrar dene</Button>} />` (`size="sm"` Empty'de `size="sm"` buton; native iskelette `skeleton`'ı butona da verin).

  Neden (min+gz): Pagination, Drawer ve Empty → Button zinciri her tabloya/listeye/grafiğe geliyordu. `table` 24.50 → 18.18 KB, `empty` 10.75 → 8.80 KB, `list` 18.35 → 16.90 KB, `chart` 19.60 → 17.75 KB; native `empty` 6.84 → 4.35 KB.

### Patch Changes

- 91dff47: `styles.css` küçüldü: 138.1 → 121.5 KB (minify), 20.3 → 18.4 KB min+gz. Artık yalnız yayınlanan `dist/*.js`in sınıflarını içeriyor (Tailwind'li host modu `tailwind.css` ile aynı küme); story/test dosyalarının, yorumlardaki örneklerin ve kullanılmayan iç kodun sınıfları çıktı. Bileşenlerin görünümü değişmedi — kalan kurallar eskisiyle aynı sırada. Not: kendi işaretlemenizde `styles.css`ten tesadüfen gelen bir Tailwind sınıfına güveniyorsanız (ör. `w-96`), Tailwind'li host modunu (`@mari-ui/components/tailwind.css`) kullanın.
- 3b31a88: Entry içi tree-shaking (Faz 4c): çok export'lu bir subpath'ten tek bir bileşen import edildiğinde kardeş export'lar artık bundle'a girmiyor. Modül seviyesindeki `forwardRef`/`createContext`/`cn` çağrıları `/* @__PURE__ */` işaretli, `X.displayName = …` atamaları kalktı (render fonksiyonu adlı: `forwardRef(function Button(…))` — React DevTools adı oradan okur), `Platform.OS`/token özellik erişimleri fonksiyona ya da satır içine alındı. Örnekler (min+gz): `import { Textarea }` 12.30 → 10.69 KB, `import { ImageViewer }` 19.58 → 16.45 KB, `import { MegaMenu }` 20.49 → 16.26 KB, `import { PieChart }` 14.18 → 11.93 KB, `import { CardMeta }` 9.46 → 7.53 KB; native `import { ListItem }` 7.56 → 1.66 KB.

  Bileşenlerin `displayName` özelliği artık atanmıyor (DevTools'ta ad aynı görünür). Kural yeni bileşenlerde de geçerli: eslint `pure-module-scope` (`@mari-ui/eslint-config/tree-shaking`) editörde, `pnpm size`daki "artık kod" testi CI'da yakalar.

- 23205ad: Input'u yalnız iç alan olarak kullanan bileşenler (AutoComplete, Slider, Transfer, Table, ColorPicker; dolayısıyla ThemeCustomizer) artık `mask` (@react-input/mask) ve `mentions` kodunu taşımıyor: her biri ~9 KB min+gz küçüldü (AutoComplete 21.1 → 12.2 KB, Slider 22.9 → 13.7 KB). (Public `Input`'un kendisi de bu özellikleri bıraktı; bkz. `MaskedInput` / `MentionInput` changeset'i.)
- d4cd74b: İç bağımlılık zincirleri kesildi: Skeleton artık Avatar bileşenini değil ortak avatar geometrisini (`lib`) kullanıyor, Select/Transfer/Mentions arama katlamasını (`foldForSearch`) AutoComplete'ten değil `lib`'den alıyor. Card, Modal, Drawer, Toast, Popover, List, Table ve iskelet kullanan diğer bileşenlerin bundle'ında avatar kodu yok. Görünüm ve API değişmedi.
- Updated dependencies [eacc3ad]
  - @mari-ui/tokens@0.4.0
  - @mari-ui/core@0.4.0

## 0.3.1

### Patch Changes

- fac8f3d: Açılır paneller (`Dropdown`, `Popover`, `Select`…) yapışkan menünün altında kalmıyor: z-index skalasında `dropdown` artık `sticky`'nin üstünde (sticky 1000, dropdown 1100). `Dropdown` sarmalayıcısı flex satırlarda dikey ortalanıyor (`self-center`), `DropdownTrigger` `inline-flex items-center` olduğundan fazladan satır boşluğu almıyor. `Image` önbellekten gelen görselde opaklık geçişini atlıyor ve yeni `fade={false}` prop'u var.
- Updated dependencies [fac8f3d]
  - @mari-ui/tokens@0.3.1
  - @mari-ui/core@0.3.1

## 0.3.0

### Patch Changes

- d36705a: İşletim sisteminin "hareketi azalt" tercihi artık tüm `duration-*` geçişlerini anında bitirir (`--mari-motion-scale: 0`); config'teki `motion` seviyesini ezer.
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
- Updated dependencies [e5480a7]
  - @mari-ui/tokens@0.1.3
  - @mari-ui/core@0.1.3

## 0.1.2

### Patch Changes

- 01c95ef: İlk gerçek kurulum (POC) bulguları: `body` artık temanın yüzey ve metin rengini alır (koyu temada sayfa tarayıcının kendi koyu zeminine düşüyordu). `init` bağımlılıkları `"latest"` yerine CLI'ın sürüm aralığıyla (`^x.y.z`) yazar. CLI'ın önerdiği tema CSS import yolu, dosyanın proje köküne yazıldığını hesaba katar (`../mari-ui-theme.css`).
- @mari-ui/core@0.1.2
  - @mari-ui/tokens@0.1.2

## 0.1.1

### Patch Changes

- 6003ce1: npm sayfaları için kullanıcıya yönelik README'ler (iç geliştirme notları `DEVELOPMENT.md`'ye taşındı). Dokümanlarda ve CLI çıktılarında komut `npx @mari-ui/cli` oldu: `npx mari-ui`, npm'de başka birine ait `mari-ui` paketini arıyordu. CLI yardımından uygulanmamış `--with-theme` bayrağı kaldırıldı.
- Updated dependencies [6003ce1]
  - @mari-ui/tokens@0.1.1
  - @mari-ui/core@0.1.1
