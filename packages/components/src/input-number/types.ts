import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";
import type { InputShape, InputVariant } from "../input/types";

export interface InputNumberProps extends SkeletonableProps {
  /** Değer; boş alan `null`. */
  value?: number | null;
  defaultValue?: number | null;
  /**
   * Her geçerli değişiklikte (yazarken, adımda, temizlenince `null`). Yazarken
   * min/max dışına çıkan değer de bildirilir; alandan çıkınca (blur/Enter)
   * sınıra çekilip yeniden bildirilir.
   */
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Artır/azalt adımı. Shift ya da PageUp/PageDown ile 10 katı. Varsayılan: `1`. */
  step?: number;
  /** Sabit ondalık basamak (ör. para için 2). Verilmezse yazılan kadar. */
  precision?: number;
  /** Binlik ayıracı (1.234.567). Varsayılan: `true`. */
  grouping?: boolean;
  /** Biçimlendirme yereli. Varsayılan: `"tr-TR"` (virgül ondalık, nokta binlik). */
  locale?: string;
  /** Solda sabit metin/ikon, ör. `"₺"`. Ekran okuyucuya değerle birlikte okunur (düz metinse). */
  prefix?: React.ReactNode;
  /** Sağda sabit metin/ikon, ör. `"%"`, `"kg"`. */
  suffix?: React.ReactNode;
  /** Artır/azalt düğmeleri. Varsayılan: `true`. */
  controls?: boolean;
  /** Düğmelerin erişilebilir adları. Varsayılan: "Artır" / "Azalt". */
  incrementLabel?: string;
  decrementLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  size?: Size;
  variant?: InputVariant;
  shape?: InputShape;
  /** Doğrulama durumu (`error`/`warning`) ya da vurgu rengi — Input'la aynı kural. */
  color?: ColorRole;
  id?: string;
  name?: string;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}
