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
import { Button } from "../Button/Button";

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
  return (
    <Stack>
      <Row>
        <Button size="sm" variant={skeleton ? "solid" : "outline"} color="neutral" onPress={() => setSkeleton(true)}>
          İskelet
        </Button>
        <Button size="sm" variant={skeleton ? "outline" : "solid"} color="neutral" onPress={() => setSkeleton(false)}>
          Yüklendi
        </Button>
      </Row>
      {children(skeleton)}
    </Stack>
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
