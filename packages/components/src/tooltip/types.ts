import type React from "react";
import type { ColorRole, Placement } from "@mari-ui/core";

export type TooltipVariant = "solid" | "soft";

export interface TooltipProps {
  content: React.ReactNode;
  trigger: React.ReactNode;
  /**
   * Not: core'un 12 değerli `Placement` sözleşmesini kullanır ama bu
   * component şu an sadece 4 ana yönü (top/bottom/left/right) render eder —
   * `-start`/`-end` sonekleri temel yöne indirgenir. Gerçek floating-ui
   * tabanlı konumlandırma kapsam dışı (plan madde 10).
   */
  placement?: Placement;
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
