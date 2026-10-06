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
import { darkTheme, lightTheme } from "@mari-ui/tokens";
import { ThemeProvider } from "../theme/ThemeProvider";
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

/** Story açıklaması + "Show code" kodu. Story seviyesinde `parameters` yazmayın — bunu ezer. */
export function storyDoc(description: string, code?: string) {
  return {
    parameters: {
      docs: {
        description: { story: description },
        ...(code ? { source: { code: code.trim(), language: "tsx" } } : {}),
      },
    },
  };
}

/**
 * Web Storybook'un tema düğmesi (`globals.theme`) ya da native-studio'nun
 * anahtarları (`globals.theme`, `globals.fonts`) → ThemeProvider. `globals.radius`:
 * studio çerçevesinin köşesi — zemin yuvarlanır, çerçeve kırpmaz (taşan
 * baloncuk/menü kesilmesin).
 */
export function withNativeTheme(Story: () => React.ReactElement, context: { globals?: { theme?: string; fonts?: string; radius?: number } }) {
  return (
    <ThemeProvider theme={context.globals?.theme === "dark" ? darkTheme : lightTheme} fonts={context.globals?.fonts === "brand" ? "brand" : "system"}>
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

/** Web `max-w-sm` (384px) form genişliği — dekoratör olarak. */
export function withNarrow(Story: () => React.ReactElement) {
  return (
    <View style={{ width: "100%", maxWidth: 384 }}>
      <Story />
    </View>
  );
}
