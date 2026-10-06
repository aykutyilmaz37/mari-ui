# @mari-ui/native

mari-ui'ın React Native katmanı. `StyleSheet` + `@mari-ui/tokens`'ın platform-agnostic JS objesini kullanır — **NativeWind veya başka bir babel/metro eklentisi gerektirmez**. Karar gerekçesi: değerlendirme anında NativeWind v5 hâlâ pre-release'ti ve tüketiciye ek babel+metro kurulumu dayatıyordu; bu bir kütüphane için kabul edilemez bir maliyet (bkz. proje planı, Faz 5 kararları).

## Kapsam (Faz 5 — pilot)

Paket, Faz 5 pilotundaki **Button, Input, Card** bileşenlerini ve Faz 16.3'te eklenen **List**'i içerir; native Dalga 1a ile **Typography**, **Divider**, **Skeleton**/**SkeletonBlock**, **Tag**, **Badge**/**StatusBadge**, **Avatar**/**AvatarGroup** eklendi. Web'deki özellikler uygunsa aynı prop adı ve davranışla taşınır; web'e özgü DOM kavramları (`href`, `target`, `onClick`) native'e kopyalanmaz. Native'de karşılıkları (`onPress`, `onLongPress`, `accessibilityRole`) kullanılır. Boyut ve tipografi web değerlerine bağlı değildir: native kontroller ve veri gösterimi kendi native ölçeklerini kullanır. Kalan web component'leri native dalgalarında ele alınacak.

**Typography (Dalga 1):** Ölçek Apple HIG metin stilleri: gövde 17/22; `Title` 1–6 = Large Title 34 · Title 1 28 · Title 2 22 · Title 3 20 · Headline 17 · Subheadline 15. İç içe `Text` boyutu ebeveynden alır (RN stil mirası), yalnız renk/ağırlık değiştirir. `ellipsis` → `numberOfLines`. `Paragraph` iskeleti metin verilmişse satır sayısını metnin gerçek yüksekliğinden çıkarır (her genişlikte kaymasız). Ölçek `NativeConfigProvider` `typography` ile ezilir.

**Dalga 1a gösterim bileşenleri:** Ölçüler `nativeConfig` içinde (`avatar` 32/40/56, `badge` 16/20, `tag` 13/18 → 24pt), `NativeConfigProvider` ile ezilir. Divider düz çizgisi platform saç teli kalınlığında. Tag kapatma düğmesi `hitSlop` ile 44pt. Etiket/rozet gibi içeriği kadar olan öğeler `alignSelf: "flex-start"` kullanmaz (yatay satırda ebeveynin ortalamasını ezer) — `lib/Hug` deseni. Genel `Skeleton` satırları Typography ölçeğinde; `rows` beklenen satır sayısıyla eşleşmeli.

**Dalga 1b seçim bileşenleri (Checkbox, Radio/RadioGroup, Switch):** Kutu/daire M3 ölçüsünde (sm/md/lg 18/22/26, 2pt kenar), satırın tamamı dokunulabilir ve en az 44pt; Switch iOS UISwitch ölçüsü (md 51×31). Renk kuralları web ile aynı (`lib/selectionColors`): dinlenirken nötr `input` kenarı, `color` verilirse doğrulama rengi; Switch kapalıyken her renkte gri, topuz her zaman beyaz. `onChange` olay nesnesi değil değer verir (`boolean` ya da grup değeri). `RadioGroup` native'de varsayılan dikey. Durum hem `accessibilityState` hem `aria-*` ile verilir (react-native-web eski prop'u okumuyor).

**Dalga 1c giriş bileşenleri (Textarea, SearchInput, OtpInput, Field, Segmented):** Textarea ve SearchInput Input'un kutu/renk/odak kurallarını kullanır. OtpInput arkada TEK gerçek alan tutar (iOS `oneTimeCode`, Android `sms-otp` otomatik doldurma, yapıştırma); kutular görseldir, dar ekranda en az 32pt'ye daralır. `Field` içindeki kontrole etiketi erişilebilir ad, hatayı/ipucunu erişilebilir ipucu olarak verir; devre dışı, hata rengi ve iskelet de Field'dan gelir (Input, Textarea, OtpInput, Segmented, Checkbox, RadioGroup, Switch). Segmented iOS UISegmentedControl gibi (md 32pt, kayan seçim yüzeyi).

**Dalga 2a geri bildirim (Alert, Progress, Loading, Empty):** Alert error/warning'i ekran okuyucuda hemen, diğerlerini sırası gelince duyurur. Progress çizgi 4/6/10 (4 = iOS/M3), daire 48/80/120; değer metni durumu söyler ("%100, tamamlandı"). Loading belirsiz göstergede platformun `ActivityIndicator`'ını kullanır; satır içi / sarmalama (içerik yerinde, soluk, dokunmaya ve ekran okuyucuya kapalı) / tam ekran (`Modal`). Gizlenen her öğe hem `accessibilityElementsHidden` hem `aria-hidden` alır — react-native-web eskisini aria'ya çevirmiyor.

**Dalga 2b katmanlar (Modal, Dialog, BottomSheet, ActionSheet):** Modal web Modal'ının karşılığı; Dialog iOS uyarısı ölçülerinde kısa onay (kendi çizimimiz). BottomSheet ek paket olmadan (Animated + PanResponder) sürüklenir ve `snapPoints` duraklarında durur; panelin GÖRÜNEN YÜKSEKLİĞİ canlandırılır (kaydırma değil), böylece alt bölüm her durakta görünür ve içerik görünen alanda kayar. Durak verilmezse yükseklik başlık + içeriğin tam yüksekliği (`onContentSizeChange`) + alt bölümden hesaplanır. ActionSheet BottomSheet üzerine; seçilen eylem panel kapandıktan sonra (`onAfterClose`) çalışır — iOS, kapanmakta olan Modal varken yenisini göstermez. Karartma rengi `nativeColor` ile RN'nin anladığı `rgba()` biçimine çevrilir; pencere yüzeyleri koyu temada ince kenarlıkla ayrışır (`lib/overlay`).

**Dalga 2c Toast:** `ToastProvider` (uygulama kökünde) + `useToast()` → `showToast` / `dismiss` / `update`, web ile aynı API. Telefonda konum `top` / `bottom` (web köşe değerleri en yakın kenara eşlenir), kenar başına en fazla 3. Parmak üstündeyken sayaç durur, yana kaydırınca kapanır; ekran okuyucu açıkken eylemli Toast kendiliğinden kapanmaz, iOS'ta `announceForAccessibility` ile duyurulur. RN `Modal` değil, dokunuşu engellemeyen bir katman — açık bir Modal/BottomSheet'in altında kalır. Kenar payları `insets` ile (varsayılan iOS 54/34, Android durum çubuğu/16).

**List (Faz 16.3):** Native `List`, `ListItem` ve `ListItemMeta`, React Native `FlatList` üzerine kuruludur. `data`, `keyExtractor`, `ListHeaderComponent`, `ListFooterComponent`, `ListEmptyComponent`, `ItemSeparatorComponent`, `onEndReached`, `refreshing` ve `onRefresh` native adları korunur; `renderItem(item, index)` web'deki kullanım biçimini sürdürür. `infinite={{ hasMore, loading, onLoadMore, endMessage }}` web'deki sonsuz akış davranışını native `onEndReached` ile sağlar; kayıtları `onLoadMore` içinde `data`ya ekleyin. Alt bölüm yükleme göstergesi, erişilebilir bir “Daha fazla yükle” düğmesi ve isteğe bağlı bitiş mesajı sunar. Eşiği `onEndReachedThreshold` belirler (sonsuz akışta varsayılan `0.5`). `split` ayırıcıyı açıp kapatır, `skeleton` ilk yükleme yer tutucularını gösterir. Büyük listelerde sanallaştırma ve kaydırma davranışı `FlatList`'ten gelir.

## Native ölçü ölçeği

Web ile ortak kalan şey özellik ve renk/tema sözleşmesidir. Ölçüler platforma göre seçilir: buton ile alanlarda native kontrol yüksekliği ve dokunma hedefi, Card'da okunabilir yazı ve içerik yoğunluğu esas alınır. Örneğin Card `sm/md/lg` iç boşluğu 12/16/20dp; gövde `fontSize` değerleri native ölçeğinden 14/16/17'dir (React Native metin ölçeği kullanıcı erişilebilirlik ayarını izler). Bu değerler web Card'ının 12/24/32 dolgu ölçeğinden bağımsızdır. Varsayılan native ölçekler `src/nativeConfig.tsx` içindedir ve `NativeConfigProvider` ile uygulama düzeyinde özelleştirilebilir.

```tsx
import { NativeConfigProvider } from "@mari-ui/native";

<NativeConfigProvider config={{
  sizes: { md: { height: 48, fontSize: 17 } },
  card: { md: { padding: 18 } },
  list: { md: { rowPaddingVertical: 14, rowMinHeight: 52 } },
}}>
  <App />
</NativeConfigProvider>
```

Yalnızca verilen alanlar ezilir; diğer varsayılan ölçüler korunur. `<ThemeProvider>` ve native config birbirinden bağımsızdır.

Card'ın web'deki `cover`/`title`/`extra`/`footer`/`actions`, `bordered`/`inset`/`size`, `skeleton` özellikleri, `CardMeta`, `slotStyles`, `onPress`/`onLongPress`, devre dışı ve erişilebilirlik adları vardır. Kartın içindeki `actions` kendi düğmeleridir; kartın tamamı basılacaksa `onPress` kullanın, ikisini tek etkileşimde iç içe geçirmeyin. `hoverable` native'de basılma görünümünü açıp kapatır. `loading` geriye uyumlu eski addır.

## Storybook ve kategori düzeni

Native component story'leri web Storybook kenar çubuğunda `Native/Genel`, `Native/Veri Girişi`, `Native/Veri Gösterimi` gibi gruplara ayrılır. `native-studio` aynı dosyalardan kategorili bir component listesi üretir. Yeni story dosyaları component'in yanında kalır; kategori story başlığındaki `Native/<Kategori>/<Component>` yolundan gelir. Böylece web ve Expo önizlemesi aynı örnekleri ve grupları gösterir.

## Kurulum (tüketici tarafında)

```bash
pnpm add @mari-ui/native react-native
```

Başka hiçbir şey gerekmez — `ThemeProvider` bile OPSİYONELDİR:

```tsx
import { Button } from "@mari-ui/native";

<Button color="primary" onPress={() => {}}>Kaydet</Button>
```

`<ThemeProvider>` sarmalanmazsa `useTheme()` işletim sisteminin `useColorScheme()`ine göre `@mari-ui/tokens`'ın `lightTheme`/`darkTheme`'i arasında otomatik seçer — web'deki `prefers-color-scheme` davranışının native karşılığı. Sarmalamak sadece şu durumlarda gerekir: sistemi geçersiz kılmak (örn. "her zaman koyu tema" ayarı) veya tüketicinin kendi ürettiği bir 3. temayı (bkz. plan backlog madde 10 — light/dark ötesinde özel tema) uygulamak için:

```tsx
import { ThemeProvider } from "@mari-ui/native";
import { darkTheme } from "@mari-ui/tokens";

<ThemeProvider theme={darkTheme}>
  <App />
</ThemeProvider>
```

## Bildirimsel stil API'si — `useStyles`

Kendi component'inizi mari-ui token'larıyla stillendirmek isterseniz (örn. Faz 5'in kapsamadığı bir component'i kendi projenizde üretirken), `useStyles` aynı recipe/registry deseniyle dışa açılabilir hale getirilebilir — bugün sadece kütüphanenin kendi 3 pilot component'i tarafından dahili kullanılıyor:

```tsx
const styles = useStyles("button", { color: "primary", variant: "solid", size: "md", shape: "default", block: false, disabled: false });
```

Elle `StyleSheet.create` objesi kurulmaz; `color`/`variant` kombinasyonu `@mari-ui/core`'un `resolveColorVariant()`ından gelen SOYUT token referanslarına, `size` `componentSize` tablosuna göre çözülür — web'in Tailwind class'larıyla YAPTIĞI İŞİN AYNISINI burada `StyleSheet` nesneleri yapar, ikisi de aynı `@mari-ui/core`/`@mari-ui/tokens` kaynağından beslenir.

## Metro + pnpm monorepo çözümlemesi

Kök `pnpm-workspace.yaml` zaten `nodeLinker: hoisted` (Metro'nun symlink hassasiyeti için — bkz. [Expo'nun monorepo dokümantasyonu](https://docs.expo.dev/guides/monorepos/)). Bu paketi tüketen bir Expo/bare RN uygulaması bu monorepo'nun İÇİNDE yaşıyorsa, `metro.config.js`'e workspace kökünü eklemeniz gerekir:

```js
// apps/mobile/metro.config.js (örnek — bu repoda henüz böyle bir app yok)
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Metro'nun monorepo'daki paketleri (packages/native, packages/core, ...)
// görebilmesi için workspace kökünü de izlemesi gerekir.
config.watchFolders = [workspaceRoot];

// Hem app'in kendi node_modules'ü hem de hoisted workspace kökü aranmalı.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

module.exports = config;
```

**Bare RN CLI** (Expo değil) kullanan bir tüketici için aynı mantık `@react-native/metro-config`'in `getDefaultConfig()`iyle uygulanır — sadece `require` satırı değişir.

> **Doğrulanmadı:** Bu yapılandırma Expo'nun kendi dokümantasyonundan alınmıştır ve bu paketin build/typecheck/test'leri bu monorepo içinde yeşildir, ama gerçek bir Expo veya bare RN uygulamasında UÇTAN UCA (bir simülatör/cihazda gerçek render) henüz denenmedi — bkz. proje planının "Riskler" bölümü ("Metro + pnpm hassasiyeti... Faz 5'te gerçek bir Expo projesinde kanıtlanmadan 'çalışıyor' denmeyecek"). Bu, bu fazın açık kalan tek doğrulama boşluğudur.

## Test kapsamı — neden bazı dosyalar test edilmiyor

Bu paketin CI'ı **vitest** kullanıyor (monorepo'nun geri kalanıyla tutarlı olsun diye), ama React Native'in kendi paketi Flow söz dizimi içeriyor (`typeOf` gibi) ve bunu ancak Metro/Babel'in RN preset'i ayrıştırabiliyor — vitest'in altındaki esbuild/Rollup bunu ayrıştıramıyor (bu fiilen bu pakette denenip doğrulandı). Bu yüzden:

- **Test edilenler**: `react-native`'i sadece TİP olarak (`import type`) kullanan saf mantık dosyaları — `toPx`, `resolveColorToken`, `resolveColorVariantStyle`, ve üç recipe (`buttonRecipe`/`inputRecipe`/`cardRecipe`). Bunlar zaten stillerin doğruluğunu belirleyen asıl mantık.
- **Test edilMEyenler**: `react-native`'i ÇALIŞMA ZAMANINDA import eden dosyalar — `useTheme.ts` (`useColorScheme`), `useStyles.ts` (`StyleSheet.create`), ve üç component'in kendisi (`Button`/`Input`/`Card`, `View`/`Pressable`/`TextInput` importları). Bunlar `tsc`/`eslint` ile ve gerçek bir RN ortamında (yukarıdaki doğrulanmamış madde) doğrulanıyor. Gerçek bir component-render testi isteniyorsa `jest` + `jest-expo`/`@testing-library/react-native` gerekir — bu, vitest'in yerini almayan, monorepo'ya YENİ bir test koşucusu eklemek anlamına gelir; bu fazın kapsamı dışında bırakıldı, ileride gerçek bir Expo doğrulamasıyla birlikte ele alınabilir.

## İris teması ve tipografi

Renkler web ile aynı `lightTheme` / `darkTheme` kaynağından gelir. Input,
renk verilmediğinde nötr ve en az 3:1 kontrastlı `canvas.input` sınırını,
odakta iris rengini kullanır. `color="error"` gibi açık seçimler korunur.

Button/Input gövdesi **Geist**, Card başlığı **Manrope** ailesini kullanır.
Uygulamada bu fontları aynı aile adlarıyla kaydedin. Dosyalar
`@mari-ui/tokens/fonts/Geist.ttf` ve `@mari-ui/tokens/fonts/Manrope.ttf`
export'larında bulunur. Font yüklemesi kütüphanenin yan etkisi değildir;
Expo veya native projenizin font yükleme/kayıt yöntemini kullanın ve
kayıt tamamlanınca arayüzü gösterin. Ağırlık eşlemelerini cihazda doğrulayın.

Sistem fontu için ThemeProvider'a verilen temanın `fontFamily.sans` ve
`fontFamily.heading` alanlarını `"system-ui"` yapın. Native resolver bu değerde
`fontFamily` özelliğini boş bırakarak işletim sisteminin fontunu kullanır.
Özel kayıtlı font isimleri de desteklenir; CSS fallback listeleri RN'e taşınmaz.
