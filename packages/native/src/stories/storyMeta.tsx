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
import { Pressable, Text, View } from "react-native";
import { darkTheme, lightTheme } from "@mari-ui/tokens";
import { ThemeProvider } from "../theme/ThemeProvider";
import { useTheme } from "../theme/useTheme";

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
 * anahtarları (`globals.theme`, `globals.fonts`) → ThemeProvider.
 */
export function withNativeTheme(Story: () => React.ReactElement, context: { globals?: { theme?: string; fonts?: string } }) {
  return (
    <ThemeProvider theme={context.globals?.theme === "dark" ? darkTheme : lightTheme} fonts={context.globals?.fonts === "brand" ? "brand" : "system"}>
      <Canvas>
        <Story />
      </Canvas>
    </ThemeProvider>
  );
}

function Canvas({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={{ padding: 16, gap: 12, backgroundColor: theme.color.canvas.surface, alignItems: "flex-start" }}>{children}</View>;
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
      <SegmentedStub
        label="Yükleme durumu"
        options={["İskelet", "Yüklendi"]}
        value={skeleton ? 0 : 1}
        onChange={(index) => setSkeleton(index === 0)}
      />
      <View style={{ alignSelf: "stretch" }}>{children(skeleton)}</View>
    </View>
  );
}

/**
 * YALNIZ STORY'LER — web `Segmented size="sm"` görünümü (tonlu iz, seçili
 * öğe yüzey rengi + hafif gölge). Native `Segmented` Dalga 1c'de gelince
 * bunun yerini alır.
 */
function SegmentedStub({ label, options, value, onChange }: { label: string; options: string[]; value: number; onChange: (index: number) => void }) {
  const theme = useTheme();
  const c = theme.color.canvas;
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: "row", padding: 2, borderRadius: 8, backgroundColor: c.surfaceAlt }}>
      {options.map((option, index) => {
        const selected = index === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(index)}
            hitSlop={{ top: 8, bottom: 8 }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: selected ? c.surface : "transparent",
              ...(selected ? { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : null),
            }}
          >
            <Text style={{ fontSize: 13, lineHeight: 18, fontWeight: "500", color: selected ? c.foreground : c.muted }}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * YALNIZ STORY'LER — web `Field`ın görünümü (etiket 14/500, alana 6px; ipucu /
 * hata 12px, üstten 6px). Native `Field` Dalga 1'de gelince bunun yerini alır.
 */
export function FieldStub({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  const theme = useTheme();
  const c = theme.color;
  const text = (size: number, color: string, weight: "400" | "500" = "400") => ({ fontSize: size, lineHeight: size === 14 ? 20 : 16, color, fontWeight: weight });
  return (
    <View style={{ gap: 6, alignSelf: "stretch" }}>
      <Text style={text(14, c.canvas.foreground, "500")}>{label}</Text>
      <View>
        {children}
        {hint ? <Text style={[text(12, c.canvas.muted), { marginTop: 6 }]}>{hint}</Text> : null}
        {error ? <Text style={[text(12, c.error.text), { marginTop: 6 }]}>{error}</Text> : null}
      </View>
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
