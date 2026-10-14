import type { ViewStyle } from "react-native";
import type { Theme } from "@mari-ui/tokens";
import { nativeColor } from "../theme/nativeColor";
import { shadowStyle } from "../theme/effects";

/** Pencere arkasındaki karartma — token RN'nin anladığı biçimde. */
export function scrimColor(theme: Theme): string {
  return nativeColor(theme.color.canvas.scrim);
}

/**
 * Pencere yüzeyi (Modal, Dialog, tam ekran Loading) — web `elevationClass.xl`
 * ile aynı ilke: ince kenarlık + gölge. Koyu temada yüzey sayfa zeminiyle aynı
 * tonda ve gölge görünmez; pencereyi zeminden ayıran kenarlıktır.
 */
export function overlaySurface(theme: Theme): ViewStyle {
  return {
    backgroundColor: theme.color.canvas.surface,
    borderWidth: 1,
    borderColor: theme.color.canvas.border,
    ...shadowStyle(theme, { opacity: 0.2, radius: 24, offsetY: 12, elevation: 12 }),
  };
}
