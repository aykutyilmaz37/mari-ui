import type React from "react";
import type { ColorRole, Placement } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type TooltipVariant = "solid" | "soft";

export interface TooltipProps extends SkeletonableProps {
  content: React.ReactNode;
  trigger: React.ReactNode;
  /**
   * 12 değerli yerleşim (`top`, `top-start`, `bottom-end`, `left` …). Tercih
   * edilen yönde yer yoksa karşı yöne döner; balon her zaman ekran içinde kalır.
   * Varsayılan: `top`.
   */
  placement?: Placement;
  /** Fare üzerine gelince açılma gecikmesi (ms) — üzerinden geçerken titremesin. Odakla açılış anlıktır. Varsayılan: 100. */
  openDelay?: number;
  /** Varsayılan: `neutral` (koyu tooltip). */
  color?: ColorRole;
  /** Varsayılan: `solid` (dolu, koyu balon — geleneksel tooltip görünümü). `soft` daha az göze batan, tonlanmış bir arka plan kullanır. */
  variant?: TooltipVariant;
  className?: string;
  triggerClassName?: string;
  style?: React.CSSProperties;
  alwaysVisible?: boolean;
  disabled?: boolean;
}
