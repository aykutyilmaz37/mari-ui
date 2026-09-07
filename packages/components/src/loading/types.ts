import type { ColorRole } from "@mari-ui/core";

export interface LoadingProps {
  /** Spin animasyonunun dolgu (fill) rengi. Varsayılan: `info`. */
  color?: ColorRole;
  /** Arka plan halkasının rengi. Varsayılan: `neutral`. */
  trackColor?: ColorRole;
}
