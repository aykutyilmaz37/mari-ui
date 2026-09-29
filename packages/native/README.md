# @mari-ui/native

mari-ui'ın React Native katmanı. `StyleSheet` + `@mari-ui/tokens`'ın platform-agnostic JS objesini kullanır — **NativeWind veya başka bir babel/metro eklentisi gerektirmez**. Karar gerekçesi: değerlendirme anında NativeWind v5 hâlâ pre-release'ti ve tüketiciye ek babel+metro kurulumu dayatıyordu; bu bir kütüphane için kabul edilemez bir maliyet (bkz. proje planı, Faz 5 kararları).

## Kapsam (Faz 5 — pilot)

Sadece üç component: **Button, Input, Card**. Prop API'si web (`@mari-ui/components`) ile aynı beş eksende (`color`/`variant`/`size`/`shape`/`disabled`) konuşur; web'e özgü DOM kavramları (`href`, `target`, mouse event'leri) native'de yoktur ve uydurulmadı. Kalan 26 component (Faz 3'te web'de tamamlanan) için native karşılıkları henüz yazılmadı — bkz. proje planının "Sonraki fazlar" bölümündeki RN dalgaları (1: form, 2: overlay/geri bildirim, 3: gezinme/veri).

**List (Faz 16.3 notu):** web `List` yazıldı, native karşılığı bilinçli olarak sonraya bırakıldı (kullanıcı kararı). Prop sözleşmesi FlatList'e birebir taşınacak şekilde seçildi: `dataSource`→`data`, `renderItem(item, index)`, `rowKey`→`keyExtractor`, `header`/`footer`→`ListHeaderComponent`/`ListFooterComponent`, `empty`→`ListEmptyComponent`, `split`→`ItemSeparatorComponent`, `loadMore`→`onEndReached`. `ListItem`/`ListItemMeta` aynı adlarla `View` tabanlı yazılmalı.

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
