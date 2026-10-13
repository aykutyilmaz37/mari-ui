import { MOTION_FACTOR, SHADOW_DENSITY_FACTOR, type Theme } from "@mari-ui/tokens";
import type { ViewStyle } from "react-native";

/**
 * Faz 21 — kişiliğin hareket seviyesi (`theme.effects.motion`). Geçiş
 * animasyonlarının ms değerini çarpanla ölçekler (`off` = 0, `calm` = 1.4,
 * `lively` = 0.85). Yükleme göstergeleri, sayaçlar ve sürükleme fiziği bunu
 * KULLANMAZ — onlar işlev, kişilik değil. "Hareketi azalt" ayrıca geçerli.
 */
export function motionMs(theme: Theme, ms: number): number {
  return Math.round(ms * MOTION_FACTOR[theme.effects.motion]);
}

export interface ShadowSpec {
  opacity: number;
  radius: number;
  offsetY: number;
  /** Android `elevation`. */
  elevation: number;
}

/**
 * Faz 21 — kişiliğin gölge yoğunluğu (`theme.effects.shadow`). Web'deki gibi
 * geometri sabit, opaklık ölçeklenir; `none`da gölge ve Android elevation
 * tamamen kalkar (yüzey kenarlığıyla ayrışır).
 */
export function shadowStyle(theme: Theme, { opacity, radius, offsetY, elevation }: ShadowSpec): ViewStyle {
  const factor = SHADOW_DENSITY_FACTOR[theme.effects.shadow];
  if (factor === 0) return { shadowOpacity: 0, elevation: 0 };
  return {
    shadowColor: "#000",
    shadowOpacity: Math.min(1, opacity * factor),
    shadowRadius: radius,
    shadowOffset: { width: 0, height: offsetY },
    elevation: Math.round(elevation * Math.min(factor, 1.5)),
  };
}

