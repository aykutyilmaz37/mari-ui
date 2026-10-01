import type React from "react";
import type { ColorRole, Placement, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

/** Metin girişi ve `onChange` değerinin biçimi. */
export type ColorFormat = "hex" | "rgb" | "hsb";

/** HSB (HSV) + alfa: h 0–360, s/b 0–100, a 0–1. Seçicinin iç modeli. */
export interface Hsba {
  h: number;
  s: number;
  b: number;
  a: number;
}

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** `onChange`in ikinci argümanı: aynı rengin her biçimdeki karşılığı. */
export interface ColorInfo {
  hsba: Hsba;
  rgba: Rgba;
  /** `#rrggbb`; alfa < 1 ise `#rrggbbaa`. */
  hex: string;
  rgb: string;
  hsb: string;
}

export interface ColorPreset {
  /** Grup başlığı (ör. "Marka", "Son kullanılanlar"). */
  label: React.ReactNode;
  /** Kabul edilen her biçim: `#1677ff`, `rgb(…)`, `hsb(…)`. */
  colors: string[];
  /** Grup başlangıçta açık mı. Varsayılan: `true`. */
  defaultOpen?: boolean;
}

export interface ColorPickerProps extends SkeletonableProps {
  /** Renk metni (hex / `rgb()` / `hsb()`); `null` = renk yok (temizlenmiş). */
  value?: string | null;
  defaultValue?: string | null;
  /**
   * Her değişiklikte (sürüklerken de). Birinci argüman geçerli `format`taki
   * metin, temizlenince `null`.
   */
  onChange?: (value: string | null, color: ColorInfo | null) => void;
  /** Sürükleme bırakılınca / bir değer kesinleşince — ağır işler (kaydetme) için. */
  onChangeComplete?: (value: string | null, color: ColorInfo | null) => void;
  format?: ColorFormat;
  /** Varsayılan: `"hex"`. */
  defaultFormat?: ColorFormat;
  onFormatChange?: (format: ColorFormat) => void;
  /** Saydamlık kaydırıcısını ve girişini gizler; değer hep opak. */
  disabledAlpha?: boolean;
  /** Panelde "renk yok" seçeneği. Varsayılan: `false`. */
  allowClear?: boolean;
  /** Hazır renk grupları. */
  presets?: ColorPreset[];
  /** Tetikleyicide renk metni; fonksiyon verilirse metni kendiniz kurarsınız. */
  showText?: boolean | ((color: ColorInfo | null) => React.ReactNode);
  /** Varsayılan: `"click"`. */
  trigger?: "click" | "hover";
  /** Varsayılan: `"bottom-start"`. */
  placement?: Placement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Yükseklik Input/Select ile aynı: sm 24 / md 32 / lg 40px. Varsayılan: `md`. */
  size?: Size;
  /** Doğrulama durumu (`error`/`warning`) — kenarlık rengi. */
  color?: ColorRole;
  disabled?: boolean;
  id?: string;
  /** Native form gönderimi için gizli alanın adı. */
  name?: string;
  required?: boolean;
  /** Tetikleyicinin erişilebilir adı. Varsayılan: "Renk seç". */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
}
