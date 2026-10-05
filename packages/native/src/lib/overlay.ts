import type { ViewStyle } from "react-native";
import type { Theme } from "@mari-ui/tokens";
import { nativeColor } from "../theme/nativeColor";

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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  };
}
