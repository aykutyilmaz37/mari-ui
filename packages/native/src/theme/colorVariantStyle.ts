import type { ViewStyle, TextStyle } from "react-native";
import type { ColorVariantStyle } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { resolveColorToken } from "./resolveColorToken";

export interface ResolvedColorVariantStyle {
  container: Pick<ViewStyle, "backgroundColor" | "borderColor">;
  label: Pick<TextStyle, "color">;
  /**
   * `ColorVariantStyle.hoverBackground` web'de `:hover`e karşılık gelir.
   * React Native'de fare imleci yok — en yakın anlamı `Pressable`'ın
   * `pressed` durumudur. Component bunu `style={({ pressed }) => ...}`
   * içinde `pressedContainer` ile birleştirerek uygular; ayrı tutuluyor ki
   * "hover" ile "pressed" iki farklı etkileşim modeli olduğu açık kalsın.
   */
  pressedContainer: Pick<ViewStyle, "backgroundColor">;
}

/**
 * `@mari-ui/core`'un `resolveColorVariant()` çıktısını (soyut token
 * referansları) somut RN stil parçalarına çözer. Bu dosya SADECE tip-only
 * `react-native` import'u içerir (`ViewStyle`/`TextStyle`) — runtime'da
 * `react-native` paketini hiç yüklemez, bu yüzden vitest altında da test
 * edilebilir (bkz. `__tests__/colorVariantStyle.test.ts`).
 */
export function resolveColorVariantStyle(theme: Theme, style: ColorVariantStyle): ResolvedColorVariantStyle {
  return {
    container: {
      ...(style.background && { backgroundColor: resolveColorToken(theme, style.background) }),
      ...(style.border && { borderColor: resolveColorToken(theme, style.border) }),
    },
    label: {
      ...(style.foreground && { color: resolveColorToken(theme, style.foreground) }),
    },
    pressedContainer: {
      ...(style.hoverBackground && { backgroundColor: resolveColorToken(theme, style.hoverBackground) }),
    },
  };
}
