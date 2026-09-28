import type React from "react";
import type { Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type SegmentedValue = string | number;

export interface SegmentedOption {
  value: SegmentedValue;
  /** Görünen metin. Verilmezse `value`. */
  label?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Yalnız ikonlu seçenekte erişilebilir ad (ör. "Liste görünümü"). */
  "aria-label"?: string;
}

export interface SegmentedProps extends SkeletonableProps {
  /** Düz değerler (`["Gün", "Hafta"]`) ya da nesneler. */
  options: Array<SegmentedValue | SegmentedOption>;
  value?: SegmentedValue;
  /** Varsayılan: ilk etkin seçenek. */
  defaultValue?: SegmentedValue;
  onChange?: (value: SegmentedValue) => void;
  /** Kapsayıcının tamamını kaplar, dilimler eşit genişlikte. Varsayılan: `false`. */
  block?: boolean;
  /** Yükseklik Input/Select ile aynı: sm 24 / md 32 / lg 40px. Varsayılan: `md`. */
  size?: Size;
  disabled?: boolean;
  /** Native form gönderimi ve radyo grubu adı. Verilmezse otomatik üretilir. */
  name?: string;
  /** Grubun erişilebilir adı (ya da `aria-labelledby`). */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}
