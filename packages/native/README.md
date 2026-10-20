# @mari-ui/native

[mari-ui](https://github.com/aykutyilmaz37/mari-ui) tasarım sisteminin React Native component'leri. Web'deki `@mari-ui/components` ile aynı prop adları, aynı tema ve renk sözleşmesi; ölçüler ise dokunmatik ekrana göre (en az 44 pt dokunma hedefi, platform metin ölçeği).

- **~45 component** — form, gezinme, veri gösterimi, katmanlar (Modal, BottomSheet, Toast), görsel galerisi.
- **Sıfır kurulum** — `StyleSheet` + `@mari-ui/tokens`; NativeWind, babel ya da metro eklentisi gerekmez.
- **Açık / koyu tema** otomatik (işletim sistemi tercihi), WCAG AA kontrastı token'lardan.
- Her component'te **iskelet** (`skeleton`), erişilebilirlik (rol, ad, durum) ve hareket azaltma desteği.

## Kurulum

```bash
pnpm add @mari-ui/native @mari-ui/tokens react-native-svg
```

Peer bağımlılıklar: `react` ≥ 18.2, `react-native` ≥ 0.76, `react-native-svg` ≥ 15. Expo ile `npx expo install react-native-svg` kullanın.

## Kullanım

```tsx
import { Button } from "@mari-ui/native/button";
import { Input } from "@mari-ui/native/input";
import { Field } from "@mari-ui/native/field";

<Field label="E-posta">
  <Input type="email" placeholder="ornek@mari-ui.com" />
</Field>
<Button color="primary" onPress={save}>Kaydet</Button>
```

`ThemeProvider` isteğe bağlıdır; verilmezse tema cihazın açık/koyu ayarını izler.

### Bileşen başına import (önerilen)

Metro tree-shaking yapmaz: `import { Button } from "@mari-ui/native"` tüm paketi (~45 bileşen, ~96 KB min+gz) uygulamaya katar. Her bileşenin kendi subpath'i vardır ve yalnız o bileşeni (ve kullandığı ortak modülleri) getirir — Button tek başına ~9 KB min+gz. Yalnız Button kullanan bir Expo uygulamasında JS bundle'ı ~1,37 MB'tan ~0,91 MB'a iner.

| Subpath | İçerik |
|---|---|
| `@mari-ui/native/<bileşen>` | Klasör adının kebab-case'i: `button`, `input` (Textarea, SearchInput, OtpInput dahil), `input-number`, `tree-select`, `bottom-sheet` (ActionSheet dahil), `qrcode`, `toast` (ToastProvider, useToast)… |
| `@mari-ui/native/theme` | `ThemeProvider`, `useTheme`, `SafeAreaInsetsProvider`, `useSafeInsets`, `withFonts`, `useStyles`, `SkeletonBox` |
| `@mari-ui/native/config` | `NativeConfigProvider`, `useNativeConfig` |
| `@mari-ui/native` | Hepsi (geriye uyumlu barrel) |

Kök barrel ile subpath'ler aynı derlenmiş modülleri paylaşır; ikisini birlikte kullanmak context'i (tema, config, Toast) çoğaltmaz.

Subpath'ler package.json `exports` ile çözülür: Metro'da varsayılan olarak açık (React Native 0.79+ / Expo SDK 53+). Daha eski bir sürümde `metro.config.js`e `config.resolver.unstable_enablePackageExports = true` ekleyin ya da kök barrel'ı kullanın.

## Tema

```tsx
import { ThemeProvider } from "@mari-ui/native/theme";
import { darkTheme, resolveThemeConfig } from "@mari-ui/tokens";

// Her zaman koyu:
<ThemeProvider theme={darkTheme}><App /></ThemeProvider>

// Projenin mari-ui.config.json'ı (marka rengi, kişilik, ek temalar):
const { light, dark } = resolveThemeConfig(config);
<ThemeProvider theme={scheme === "dark" ? dark : light}><App /></ThemeProvider>
```

`npx @mari-ui/cli theme` aynı config'ten `mari-ui-theme.ts` üretir; içindeki temalar doğrudan `ThemeProvider`a verilebilir.

### Fontlar

Varsayılan `fonts="system"`: iOS'ta SF, Android'de Roboto — dosya yüklemek gerekmez. mari-ui'ın kendi aileleri için `fonts="brand"` verin ve fontları aynı adlarla yükleyin:

```tsx
import { useFonts } from "expo-font";

const [loaded] = useFonts({
  Geist: require("@mari-ui/tokens/fonts/Geist.ttf"),
  Manrope: require("@mari-ui/tokens/fonts/Manrope.ttf"),
  "Geist Mono": require("@mari-ui/tokens/fonts/GeistMono.ttf"),
});

<ThemeProvider theme={theme} fonts="brand">…</ThemeProvider>
```

Tasarım kişilikleri renk, köşe, gölge ve hareketi uygular; native'de font dosyası getirmez.

### Güvenli alan ve ölçüler

```tsx
import { NativeConfigProvider } from "@mari-ui/native/config";
import { ThemeProvider } from "@mari-ui/native/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

<ThemeProvider theme={theme} insets={useSafeAreaInsets()}>
  <NativeConfigProvider config={{ sizes: { md: { height: 48 } } }}>
    <App />
  </NativeConfigProvider>
</ThemeProvider>
```

`insets`, ekran kenarına değen bileşenlere (AppBar, BottomNavigation, BottomSheet, Toast…) çentik ve ev çubuğu payını verir. `NativeConfigProvider` varsayılan ölçüleri (yükseklik, dolgu, yazı boyutu) uygulama genelinde ezer; yalnız verilen alanlar değişir.

## İpucu: klavye ve kaydırma

Select / BottomSheet / Modal açan ekranın `ScrollView`una `keyboardShouldPersistTaps="handled"` verin; yoksa klavye açıkken paneldeki ilk dokunuş yalnız klavyeyi kapatır.

## Bağlantılar

- Component dokümanları ve örnekler: [mari-ui deposu](https://github.com/aykutyilmaz37/mari-ui#readme) (Storybook: `pnpm storybook`, "Native" grubu)
- Web component'leri: [`@mari-ui/components`](https://www.npmjs.com/package/@mari-ui/components)

Lisans: MIT.
