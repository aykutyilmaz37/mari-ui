import type { ViewStyle, TextStyle } from "react-native";
import type { ComponentSizeTokens } from "@mari-ui/core";
import { toPx } from "./toPx";

export interface ResolvedComponentSize {
  container: Required<Pick<ViewStyle, "height" | "paddingHorizontal" | "paddingVertical" | "borderRadius" | "gap">>;
  label: Required<Pick<TextStyle, "fontSize">>;
}

/**
 * `@mari-ui/core`'un platform-agnostic `componentSize` tablosunu (string CSS
 * uzunlukları) RN'in sayısal `StyleSheet` değerlerine çevirir. Bu, web'in
 * `sizeClass` sözlüğünün (bkz. `components/src/lib/sizeClasses.ts`) native
 * karşılığıdır — ikisi de AYNI `componentSize` kaynağından beslenir, iki
 * platformun boyut hissi birbirinden kopamaz.
 */
export function resolveComponentSize(size: ComponentSizeTokens): ResolvedComponentSize {
  return {
    container: {
      height: toPx(size.height),
      paddingHorizontal: toPx(size.paddingX),
      paddingVertical: toPx(size.paddingY),
      borderRadius: toPx(size.radius),
      gap: toPx(size.gap),
    },
    label: {
      fontSize: toPx(size.fontSize),
    },
  };
}
