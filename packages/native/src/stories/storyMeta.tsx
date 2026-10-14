/**
 * YALNIZ STORY'LER İÇİN — native story'lerinin ortak yardımcıları. Story'ler
 * tek kaynaktır: web Storybook'ta (react-native-web, "Native/…") ve
 * native-studio'da (Expo, telefonda) aynı dosyalar çizilir. Paket girişinden
 * (`src/index.ts`) dışa açılmaz, derlemeye girmez.
 *
 * Kurallar: story'ler yalnız `react-native` öğeleri kullanır (DOM yok);
 * Storybook çalışma zamanına bağlı bir şey (`useArgs` vb.) kullanmaz — native-studio
 * story'yi `render(args)` ile kendisi çağırır.
 */
import React from "react";
import { View } from "react-native";
import { darkTheme, lightTheme, personaNames, resolveThemeConfig, type PersonaName, type Theme } from "@mari-ui/tokens";
import { ThemeProvider } from "../theme/ThemeProvider";
import { SafeAreaInsetsProvider, type SafeAreaInsets } from "../theme/insets";
import { useTheme } from "../theme/useTheme";
import { Segmented } from "../Segmented";

interface ComponentDocInput {
  summary: string;
  whenToUse?: string[];
  whenNotToUse?: string[];
  /** Web sürümünden farkı (ör. "hover yok, onPress"). */
  vsWeb?: string;
}

const bullets = (title: string, items?: string[]) => {
  if (!items?.length) return "";
  const list = items.map((i) => "- " + i).join("\n");
  return `\n\n### ${title}\n\n${list}`;
};

/** Web component sayfalarıyla aynı düzen: özet → Ne Zaman Kullanılır / Kullanılmaz → web farkı. */
export function componentDoc(input: ComponentDocInput): string {
  return input.summary + bullets("Ne Zaman Kullanılır", input.whenToUse) + bullets("Ne Zaman Kullanılmaz", input.whenNotToUse) + (input.vsWeb ? `\n\n### Web'den farkı\n\n${input.vsWeb}` : "");
}

/**
 * Faz 21 — Playground gibi argümanla değişen story'ler için kodu argümandan üreten
 * fonksiyon. Storybook'un kendi JSX dökümü ref'leri `[Circular]`, ikon/loader gibi
 * fonksiyonları `() => {}` diye basıyordu; bu fonksiyon `source.transform`a bağlanır,
 * kod o anki argümanlarla temiz yazılır.
 */
export type StoryCode = (args: Record<string, unknown>) => string;

function literal(value: unknown, indent: string): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => literal(v, indent)).join(", ")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined && typeof v !== "function");
    const key = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k));
    const fields = entries.map(([k, v]) => key(k) + ": " + literal(v, indent));
    return "{ " + fields.join(", ") + " }";
  }
  return String(value);
}

/**
 * Argümanları JSX prop dizisine çevirir: `true` → `ad`, `false`/`undefined`/fonksiyon
 * atlanır, metin → `ad="…"`, diğerleri → `ad={…}`. `skip` ile elle yazılacak
 * prop'lar (ikon, handler, ref) çıkarılır; `defaults` ile varsayılana eşit değerler gizlenir.
 */
function propString(key: string, value: unknown): string {
  if (value === true) return key;
  if (typeof value === "string") return `${key}=${JSON.stringify(value)}`;
  return `${key}={${literal(value, "")}}`;
}

export function jsxProps(args: Record<string, unknown>, { skip = [], defaults = {} }: { skip?: string[]; defaults?: Record<string, unknown> } = {}): string {
  return Object.entries(args)
    .filter(([key, value]) => !skip.includes(key) && key !== "children" && value !== undefined && value !== false && typeof value !== "function" && !(key in defaults && defaults[key] === value))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => propString(key, value))
    .join(" ");
}

/** Story açıklaması + "Show code" kodu. Story seviyesinde `parameters` yazmayın — bunu ezer. */
function sourceOf(code: string | StoryCode | undefined) {
  if (typeof code === "function") return { source: { language: "tsx", transform: (_src: string, ctx: { args: Record<string, unknown> }) => code(ctx.args).trim() } };
  return code ? { source: { code: code.trim(), language: "tsx" } } : {};
}

export function storyDoc(description: string, code?: string | StoryCode) {
  return {
    parameters: {
      docs: {
        description: { story: description },
        ...sourceOf(code),
      },
    },
  };
}

/**
 * Web Storybook'un tema düğmesi (`globals.theme`) ya da native-studio'nun
 * anahtarları (`globals.theme`, `globals.fonts`, `globals.persona`) → ThemeProvider. Kişilik seçiliyse
 * kişiliğin fontları kullanılır (web'de Google Fonts'tan yüklenir; cihazda `expo-font` ile kaydedin). `globals.radius`:
 * studio çerçevesinin köşesi — zemin yuvarlanır, çerçeve kırpmaz (taşan
 * baloncuk/menü kesilmesin).
 */
/**
 * Web Storybook'ta font kişilikten gelir (temanın aileleri, sayfada yüklü) — `"brand"`.
 * native-studio kendi `globals.fonts` anahtarını geçer (cihazda yüklü fontlara göre).
 */
function storyFonts(fonts: string | undefined): "brand" | "system" {
  return fonts === "system" ? "system" : "brand";
}

const personaThemes = new Map<PersonaName, { light: Theme; dark: Theme }>();

/** Faz 21 — kişilik teması (kimlik sabit kalsın diye kişilik başına bir kez çözülür). */
function storyTheme(mode: string | undefined, persona: string | undefined): Theme {
  const dark = mode === "dark";
  if (!personaNames.includes(persona as PersonaName)) return dark ? darkTheme : lightTheme;
  const name = persona as PersonaName;
  let resolved = personaThemes.get(name);
  if (!resolved) {
    resolved = resolveThemeConfig({ persona: name });
    personaThemes.set(name, resolved);
  }
  return dark ? resolved.dark : resolved.light;
}

export function withNativeTheme(Story: () => React.ReactElement, context: { globals?: { theme?: string; fonts?: string; persona?: string; radius?: number; insets?: SafeAreaInsets } }) {
  return (
    <ThemeProvider theme={storyTheme(context.globals?.theme, context.globals?.persona)} fonts={storyFonts(context.globals?.fonts)} insets={context.globals?.insets}>
      <Canvas radius={context.globals?.radius}>
        <Story />
      </Canvas>
    </ThemeProvider>
  );
}

function Canvas({ children, radius }: { children: React.ReactNode; radius?: number }) {
  const theme = useTheme();
  return <View style={{ padding: 16, gap: 12, backgroundColor: theme.color.canvas.surface, alignItems: "flex-start", borderRadius: radius }}>{children}</View>;
}

/** "İskelet" story'lerinin ortak açıklaması (web ile aynı sözleşme). */
export const SKELETON_STORY_DOC =
  "Veri gelene kadar `skeleton`: component kendi boyutunda yer tutucu çizer (hafif nabız; hareket azaltma açıksa sabit), ekran okuyucudan gizlidir. Üstteki geçişle yüklü hale geçince yerleşim kaymaz.";

/**
 * Web'deki `SkeletonDemo`nun native karşılığı: üstte İskelet / Yüklendi
 * geçişi, altta component — iki hal arasında yerleşimin kaymadığı görülür.
 */
export function SkeletonDemo({ children }: { children: (skeleton: boolean) => React.ReactNode }) {
  const [skeleton, setSkeleton] = React.useState(true);
  // Web ile aynı düzen: geçiş ile component arası 16 (`gap-4`).
  return (
    <View style={{ gap: 16, alignSelf: "stretch", alignItems: "flex-start" }}>
      <Segmented
        size="sm"
        accessibilityLabel="Yükleme durumu"
        options={[
          { value: "skeleton", label: "İskelet" },
          { value: "loaded", label: "Yüklendi" },
        ]}
        value={skeleton ? "skeleton" : "loaded"}
        onChange={(v) => setSkeleton(v === "skeleton")}
      />
      <View style={{ alignSelf: "stretch" }}>{children(skeleton)}</View>
    </View>
  );
}

/** Story içinde yan yana / alt alta örnek dizmek için. */
export function Row({ children }: { children: React.ReactNode }) {
  // Web story'lerinin `flex flex-wrap gap-3` düzeni (12px) — karşılaştırma birebir olsun.
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" }}>{children}</View>;
}

export function Stack({ children }: { children: React.ReactNode }) {
  return <View style={{ gap: 10, alignSelf: "stretch" }}>{children}</View>;
}

/**
 * Story'yi tam genişliğe yayar (canvas öğeleri sola hizalı). Render içinde
 * sarmak yerine DEKORATÖR olarak verin: dekoratörler "Show code"a girmez,
 * kod yalnız component'in kendisini gösterir.
 */
export function withStretch(Story: () => React.ReactElement) {
  return (
    <View style={{ alignSelf: "stretch" }}>
      <Story />
    </View>
  );
}

/**
 * Story'deki çubuklar (AppBar, BottomNavigation) ekran kenarında değil, sayfa
 * içindeki bir çerçevede — güvenli alan payı almasınlar. Tam ekran katmanlar
 * (Sidebar, BottomSheet) bunu kullanmaz, gerçek çentiği görür.
 */
export function withoutInsets(Story: () => React.ReactElement) {
  return (
    <SafeAreaInsetsProvider insets={{ top: 0, bottom: 0, left: 0, right: 0 }}>
      <Story />
    </SafeAreaInsetsProvider>
  );
}

/** Web `max-w-sm` (384px) form genişliği — dekoratör olarak. */
export function withNarrow(Story: () => React.ReactElement) {
  return (
    <View style={{ width: "100%", maxWidth: 384 }}>
      <Story />
    </View>
  );
}
