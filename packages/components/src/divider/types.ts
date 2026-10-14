import type React from "react";
import type { Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

/** Çizgi stili — `@mari-ui/core`'un `Variant` (dolgu) ekseniyle KASITLI OLARAK ayrı: "dashed bir çizgi" bir dolgu stili değil, geometrik bir özellik. */
export type DividerLineStyle = "solid" | "dashed" | "dotted";
/*
 * Yön: yatay/dikey. Eskiden `type` adındaydı — component'in KENDİSİNİN tipini
 * ifade eder gibi yanıltıcıydı; `orientation` daha standart bir isim.
 */
/** Ayırıcının yönü: yatay ya da dikey. */
export type DividerOrientation = "horizontal" | "vertical";
/*
 * Yatay divider'da başlık metninin hizası. Eskiden aynı "orientation" adı
 * hem buna hem yön eksenine veriliyordu — ikisi ayrıştırıldı.
 */
/** Yatay ayırıcıda başlık metninin hizası. */
export type DividerLabelAlign = "start" | "center" | "end";

export interface DividerProps extends SkeletonableProps {
  children?: React.ReactNode;
  className?: string;
  lineStyle?: DividerLineStyle;
  orientation?: DividerOrientation;
  labelAlign?: DividerLabelAlign;
  labelMargin?: string | number;
  plain?: boolean;
  style?: React.CSSProperties;
  size?: Size;
  /** Sadece `orientation="vertical"` için. */
  height?: string | number;
}
