import type React from "react";
import type { ColorRole } from "@mari-ui/core";

export interface RateProps {
  allowClear?: boolean;
  allowHalf?: boolean;
  autoFocus?: boolean;
  character?: React.ReactNode | ((props: RateProps) => React.ReactNode);
  className?: string;
  count?: number;
  defaultValue?: number;
  disabled?: boolean;
  value?: number;
  onBlur?: () => void;
  onChange?: (value: number) => void;
  onFocus?: () => void;
  onHoverChange?: (value: number) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Yıldız ikonunun boyutu. Varsayılan `"1.5rem"` (4K ekranlarda `px` ölçeklenmiyor). Sayı verilirse `px`. */
  characterSize?: number | string;
  /** Varsayılan: `warning` (amber — geleneksel "yıldız" rengi). */
  color?: ColorRole;
  /** İleri düzey kaçış: token yerine ham bir CSS rengi zorlar (inline style). */
  characterColor?: string;
}
