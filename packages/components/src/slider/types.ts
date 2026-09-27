import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";

/** Tek değer ya da aralık `[başlangıç, bitiş]`. Aralık verilince iki tutamaç çizilir. */
export type SliderValue = number | [number, number];
export type SliderIconItem = { icon: React.ReactNode; value: number };
export type SliderIconPosition = "top" | "bottom";

export interface SliderProps {
  value?: SliderValue;
  /** Uncontrolled başlangıç. Aralık için `[20, 80]` gibi bir dizi verin. Varsayılan: `0`. */
  defaultValue?: SliderValue;
  size?: Size;
  min?: number;
  max?: number;
  /** Adım. Ondalıklı olabilir (`0.5`). Varsayılan: `1`. */
  step?: number;
  vertical?: boolean;
  disabled?: boolean;
  /** Dolu kısım ve tutamaç rengi. Varsayılan: `primary`. */
  color?: ColorRole;
  /** `false`: değer baloncuğunu hiç gösterme. */
  tooltipVisible?: boolean;
  /** Baloncuk hover/odak beklemeden hep görünsün. */
  tooltipAlwaysVisible?: boolean;
  /** Baloncuktaki ve ekran okuyucudaki değer metni, ör. `(v) => \`${v} ₺\``. */
  formatValue?: (value: number) => React.ReactNode;
  /** Rayın altında etiketli işaretler: `{ 0: "0 ₺", 5000: "5.000 ₺" }`. */
  marks?: Record<number, React.ReactNode>;
  iconList?: SliderIconItem[];
  iconPosition?: SliderIconPosition;
  /** Yanında senkron sayı girişi (aralıkta iki giriş). */
  showInput?: boolean;
  /** Sürüklerken/tuşa basarken her değişimde. */
  onChange?: (value: number | [number, number]) => void;
  /**
   * Etkileşim bittiğinde (sürükleme bırakıldı, tuş bırakıldı) — ör. filtrede
   * her pikselde değil, sadece bırakınca istek atmak için.
   */
  onChangeEnd?: (value: number | [number, number]) => void;
  /**
   * Ekran okuyucu için ad. Aralıkta tutamaçlar "… (en az)" / "… (en çok)"
   * olarak adlandırılır; özelleştirmek için `thumbLabels`.
   */
  "aria-label"?: string;
  /** Aralık tutamaçlarının adları. Varsayılan: `[\`${aria-label} en az\`, \`${aria-label} en çok\`]`. */
  thumbLabels?: [string, string];
  className?: string;
}
