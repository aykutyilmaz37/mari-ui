import type { MustRule } from "./skillGuide";

/**
 * `skillGuide.ts`in React Native (`@mari-ui/native`) karşılığı. Aynı iki
 * katman: kısa `NATIVE_MUST_RULES` (her araç dosyasına ve `CLAUDE.md`ye) ve
 * yalnız Claude skill'ine giren `NATIVE_SKILL_GUIDE`.
 *
 * Bu metinde web'e özgü kavramlar (utility sınıfları, `<a>` bağlantıları,
 * sunucu bileşeni notları) bilerek ADIYLA geçmez: AI'a "kullanma" demek bile
 * yanlış dünyayı çağırıyor. Test, native çıktıda bu kelimelerin olmadığını
 * denetler. Component ve prop adları `@mari-ui/native` manifest'iyle aynı
 * tutulmalı (test denetler).
 */

export const NATIVE_MUST_RULES: readonly MustRule[] = [
  {
    title: "Önce mari-ui",
    rule: "İhtiyacı karşılayan bir `@mari-ui/native` component'i varsa (component envanterine bak) onu kullan. Yoksa projede yeni bir component yaz — ama `react-native` temel öğeleri ve mari-ui token'larıyla; ayrı bir stil dili icat etme.",
    why: "Tutarlılık, erişilebilirlik, güvenli alan ve tema desteği component'lerde zaten çözülmüş.",
  },
  {
    title: "Yalnız `@mari-ui/native`",
    rule: "Import'lar `@mari-ui/native/<subpath>`ten (ör. `@mari-ui/native/button`). `@mari-ui/components` web paketidir, bu kodda import edilmez.",
    why: "Web paketi DOM ve CSS bekler; React Native'de derlenmez ya da sessizce bozuk çizer.",
  },
  {
    title: "Stil `StyleSheet` + token objesi",
    rule: "Stil yalnız `style` prop'u ile verilir: düzen için `StyleSheet.create`, renk/boşluk/köşe için `useTheme()` (`@mari-ui/native/theme`) ya da `mari-ui-theme.ts`deki `mariTheme`. Sınıf adı dizesiyle stil verilmez; React Native bunu tanımaz.",
    why: "Tema değişince (koyu mod, kişilik, marka rengi) token'dan okunan stil kendiliğinden güncellenir.",
  },
  {
    title: "Sabit renk ve sabit boyut yok",
    rule: "Hex, `rgb()` ya da elle seçilmiş sayı (`padding: 13`) yazma. Renk `theme.color.<rol>.solid/subtle/text` ya da `theme.color.canvas.*`; boşluk `theme.spacing[n]`, köşe `theme.radius.*`. Bu değerler `\"1rem\"` gibi string'dir; tek bir proje yardımcısıyla sayıya çevir (bkz. rehber). Component'lerde önce `color`/`size`/`variant` prop'u.",
    why: "Sabit değer temayla birlikte değişmez; koyu modda ve başka kişilikte yanlış görünür.",
  },
  {
    title: "Metin her zaman `Text` içinde",
    rule: "Her metin `Title`, `Text` ya da `Paragraph` (`@mari-ui/native/typography`) içinde olur; `View` içine çıplak string ya da sayı koyma. Koşullu metinde `{count > 0 && …}` yerine üçlü ifade kullan.",
    why: "React Native `View` içindeki çıplak metinde hata verir; `{0 && …}` ekrana çıplak `0` basar.",
  },
  {
    title: "Etkileşim `onPress`, erişilebilirlik zorunlu",
    rule: "Dokunma olayı `onPress` / `onLongPress`. Kendi dokunulabilir öğende (`Pressable`) `accessibilityRole` ve `accessibilityLabel` zorunlu; yalnız ikonlu `Button`, `AppBarAction`, `FloatButton` için `accessibilityLabel` ver. Form kontrolü `Field` içinde ya da `accessibilityLabel` ile adlı.",
    why: "Ekran okuyucu (VoiceOver/TalkBack) adı ve rolü yalnız bu prop'lardan okur.",
  },
  {
    title: "Gezinme router'la",
    rule: "Sayfa geçişi router'ın gezinme fonksiyonuyla yapılır (ör. `onPress={() => router.push(\"/orders\")}`). `Sidebar` için `onNavigate`, `BottomNavigation` için `onChange` içinde router'ı çağır. Adres string'iyle çalışan bağlantı öğesi yok.",
    why: "React Native'de bağlantı etiketi yoktur; geçmiş, geri tuşu ve derin bağlantı router'da yönetilir.",
  },
  {
    title: "Yüklenme `skeleton` ile",
    rule: "Veri beklenirken component'in kendi `skeleton` prop'unu kullan (aynı boyutta iskelet çizer). Elle iskelet ya da tek başına spinner çizme.",
    why: "Ekran yüklenince yerleşim zıplamaz; tüm uygulamada aynı yükleme dili.",
  },
];

export function formatNativeMustRules(): string {
  return NATIVE_MUST_RULES.map((r, i) => `${i + 1}. **${r.title}.** ${r.rule} _Neden:_ ${r.why}`).join("\n");
}

export const NATIVE_ANTI_PATTERNS = [
  {
    title: "Ham hex/px değeri yazma",
    wrong: 'style={{ backgroundColor: "#2563eb", padding: 13 }}',
    right: 'color="primary" size="md"  ya da  style={{ backgroundColor: theme.color.primary.subtle, padding: px(theme.spacing[3]) }}',
    why: "Ham değer tema stüdyosunda renk ya da yoğunluk değişince GÜNCELLENMEZ; token her zaman güncel kalır.",
  },
  {
    title: "`View` içinde çıplak metin",
    wrong: "<View>Toplam: {total}</View>",
    right: "<View><Text>Toplam: {total}</Text></View>",
    why: "React Native çalışma anında hata verir (\"Text strings must be rendered within a <Text> component\").",
  },
  {
    title: "Web paketinden import",
    wrong: 'import { Button } from "@mari-ui/components/button"',
    right: 'import { Button } from "@mari-ui/native/button"',
    why: "Web paketi DOM öğeleri ve CSS üretir; mobil uygulamada çalışmaz.",
  },
  {
    title: "`dist/` veya `src/` içine derin import",
    wrong: 'import { Button } from "@mari-ui/native/dist/Button"',
    right: 'import { Button } from "@mari-ui/native/button"',
    why: "İç yapı bir sürüm sonrasında değişebilir; yalnız paketin `exports` haritasındaki subpath'ler kararlıdır.",
  },
  {
    title: "Adsız dokunulabilir öğe",
    wrong: "<Pressable onPress={onDelete}><TrashIcon /></Pressable>",
    right: '<Button icon={<TrashIcon />} variant="ghost" onPress={onDelete} accessibilityLabel="Sil" />',
    why: "Ekran okuyucu yalnız \"düğme\" der; kullanıcı neye bastığını bilemez.",
  },
] as const;

export const NATIVE_FREE_AREAS = `Kesin kurallar yalnız component kullanımı, token'lar ve erişilebilirlik içindir. Bunların dışı **serbest** — her uygulamayı aynı iskelete dökme:

- **Ekran düzeni ve kompozisyon:** bölüm sırası, yoğunluk ritmi, kart mı liste mi, yatay kaydırılan şeritler (\`Carousel\`) ekrana göre seçilir; "başlık + kart listesi" tek kalıp değildir.
- **İfade alanları:** karşılama ekranları, büyük görseller (\`Image\`), tipografi ağırlıklı başlıklar, giriş hareketleri kalıplaşmaz — token renkleri (\`theme.color.*\`), tema fontları ve kişiliğin hareket süreleriyle özgürce kurulur.
- **İçerik dili:** metinler, görsel seçimi ve ton uygulamanın hedef kitlesine göre; kişiliğin karakterini taşır.`;

/** Native rehberde adı geçen component'ler — test, hepsinin native manifest'te var olduğunu denetler. */
export const NATIVE_GUIDE_COMPONENTS = [
  "ThemeProvider",
  "ToastProvider",
  "AppBar",
  "AppBarAction",
  "BottomNavigation",
  "Sidebar",
  "Tabs",
  "Steps",
  "Card",
  "List",
  "Pagination",
  "Empty",
  "Alert",
  "Modal",
  "Dialog",
  "BottomSheet",
  "ActionSheet",
  "Popover",
  "Select",
  "Segmented",
  "RadioGroup",
  "Switch",
  "Checkbox",
  "Field",
  "Input",
  "Textarea",
  "Button",
  "FloatButton",
  "Statistic",
  "Masonry",
  "Title",
  "Text",
  "Paragraph",
  "Progress",
] as const;

export const NATIVE_SKILL_GUIDE = `## Ekran kurma rehberi (öneri)

Aşağıdakiler öneri: uygulamanın ihtiyacı ve kişiliği farklıysa sapabilirsin (bkz. Serbest alanlar), ama yukarıdaki kesin kurallar her zaman geçerli.

### Kurulum (kökte bir kez)

\`npx @mari-ui/cli theme\` projeye \`mari-ui-theme.ts\` yazar (\`mariTheme.light\` / \`mariTheme.dark\`). Kökte temayı ve güvenli alan paylarını ver:

\`\`\`tsx
import { useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeProvider } from "@mari-ui/native/theme";
import { ToastProvider } from "@mari-ui/native/toast";
import { mariTheme } from "./mari-ui-theme";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <ThemeProvider
      theme={scheme === "dark" ? mariTheme.dark : mariTheme.light}
      insets={insets}
    >
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
\`\`\`

Marka fontları için \`fonts="brand"\` ver ve fontları önce \`expo-font\` ile yükle (kayıt adları \`BRAND_FONT_FAMILIES\`); vermezsen platform fontu kullanılır.

### Kendi component'inde token kullanımı

Token boyutları \`"1rem"\`, \`"8px"\` gibi string'dir; React Native sayı ister. Projede tek bir yardımcı tut:

\`\`\`ts
// src/theme/px.ts
export const px = (value: string) =>
  value.endsWith("rem")
    ? Number.parseFloat(value) * 16
    : Number.parseFloat(value);
\`\`\`

\`\`\`tsx
import { StyleSheet, View } from "react-native";
import { useTheme } from "@mari-ui/native/theme";
import { Button } from "@mari-ui/native/button";
import { Text } from "@mari-ui/native/typography";
import { px } from "../theme/px";

export function EmptyCart({ onShop }: { onShop: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.box,
        {
          backgroundColor: theme.color.canvas.surfaceAlt,
          gap: px(theme.spacing[3]),
          padding: px(theme.spacing[4]),
          borderRadius: px(theme.radius.lg),
        },
      ]}
    >
      <Text muted>Sepetiniz boş.</Text>
      <Button color="primary" onPress={onShop}>
        Alışverişe başla
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({ box: { alignItems: "center" } });
\`\`\`

\`StyleSheet.create\` düzen (flex, hizalama) için; renk ve ölçü temadan okunduğu için satır içi verilir.

### Proje tasarım brief'i (yeni projede ya da ilk ekranda bir kez)

Kopya görünümün kaynağı component'ler değil, her projede aynı tema + aynı ekran iskeletidir. İlk ekrandan önce kısa bir brief çıkar (kullanıcıya sor ya da isteğinden türet ve onaylat):

1. **Hedef kitle ve amaç:** kim kullanacak, uygulamayı ne için açıyor.
2. **Ton:** güven veren / enerjik / sade / okumaya odaklı / prestijli.
3. **Referanslar:** kullanıcının beğendiği 2–3 uygulama; neyini beğendiği.
4. **Kişilik seç:** \`corporate\`, \`playful\`, \`minimal\`, \`editorial\`, \`luxury\` ya da varsayılan. \`npx @mari-ui/cli theme --persona <ad>\` (tamamen kendi rengi: \`--primary #hex\`) — bayraklı çalıştır, etkileşimli soru soramazsın; sonra \`npx @mari-ui/cli sync\`.
5. **Düzen yönü:** kişiliğe uygun bir ekran dili seç ve tüm ekranlarda tutarlı uygula.

Brief'i projenin README'sine (ya da bir \`docs/design-brief.md\`ye) kısa not olarak yaz.

### Bir ekran isteğinde iş akışı

1. **Ekranın türünü belirle:** liste, detay, form, panel, ayarlar.
2. **Envanterden parçaları seç;** eksik kalan için proje component'i yaz (kesin kural 1).
3. **Dört durumu da kur:** yükleniyor (\`skeleton\`), boş (\`Empty\`), hata (\`Alert\` ya da \`Empty\` + yeniden dene düğmesi), dolu.
4. **Cihazı düşün:** çentik ve alt çubuk (güvenli alan), klavye açıkken görünür kalan alanlar, küçük ekranda tek sütun, başparmak erişimindeki birincil eylem.
5. **Metinleri gerçekçi yaz** ve ekran başlığını \`AppBar\` \`title\` ile ver.

### Uygulama iskeleti

- **Üst çubuk:** \`AppBar\` (\`title\`, geri için \`onBack\`, sağda \`actions\` içinde \`AppBarAction\` — her birine \`accessibilityLabel\`).
- **Ana bölümler (3–5):** \`BottomNavigation\` (\`items\`: \`key\`, \`label\`, \`icon\`); \`onChange\`te router'a geç.
- **Çok bölümlü menü:** \`Sidebar\` (çekmece); \`onNavigate\` ile router'a geç.
- **Ekran içi gruplar:** \`Tabs\`; sıralı süreç \`Steps\`.

### Ekran kalıpları

- **Liste ekranı:** \`AppBar\` + arama \`Input\` + \`List\` (\`data\`, \`renderItem\`; sonsuz akış için \`infinite\`); birincil eylem \`FloatButton\`. Sayfalı veri gerekiyorsa \`Pagination\`.
- **Detay ekranı:** \`AppBar\` (\`onBack\`), içerik \`Card\`'larda, alt kümeler \`Tabs\`.
- **Form ekranı:** her alan \`Field\` içinde (\`label\`, \`hint\`, \`error\`); \`Input\` / \`Textarea\` / \`Select\`; çok adımlıysa \`Steps\`; birincil düğme altta ve tek (\`block\`).
- **Panel:** \`Statistic\` kartları, farklı yükseklikte kartlar için \`Masonry\`, ilerleme için \`Progress\`.
- **Ayarlar:** bölüm başına \`Card\`; anlık tercihler \`Switch\`.

### Component seçimi

| Durum | Kullan | Kullanma |
|---|---|---|
| Kısa karar ya da onay | \`Dialog\` / \`Modal\` | Uzun form için Modal |
| Alttan açılan içerik, filtre, uzun seçim | \`BottomSheet\` | Tek bir onay sorusu için BottomSheet |
| Eylem menüsü (düzenle, paylaş, sil…) | \`ActionSheet\` | Değer seçimi → \`Select\` |
| Tetikleyiciye bağlı kısa içerik | \`Popover\` | |
| 2–5 seçenekten biri, hepsi görünsün | \`Segmented\` ya da \`RadioGroup\` | Uzun liste → \`Select\` |
| Anında uygulanan aç/kapa | \`Switch\` | Gönderilecek formda onay → \`Checkbox\` |
| İşlem sonrası geçici bildirim | \`useToast().showToast({ title, type })\` | Kalıcı uyarı → \`Alert\` |
| Kayıt yok / sonuç yok | \`Empty\` (\`actions\` ile) | Boş ekran |

### Tema

- Kişilik (\`persona\`) renk, font, köşe, boşluk ve hareketi birlikte seçer; \`mari-ui.config.json\` değişince \`npx @mari-ui/cli theme --yes\` ve \`npx @mari-ui/cli sync\`. Kodda tema değeri sabitleme.
- Koyu mod: \`ThemeProvider\`a doğru temayı vermek yeter; component'ler ve \`useTheme()\` değerleri ona göre döner, ayrıca renk dalı yazma.
`;
