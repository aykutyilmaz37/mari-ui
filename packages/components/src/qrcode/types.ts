import type React from "react";
import type { SkeletonableProps } from "../lib/skeleton";

export type QRDotType = "square" | "rounded" | "dots" | "extra-rounded";
export type QRCornerSquareType = "square" | "extra-rounded" | "dot";
export type QRCornerDotType = "square" | "dot" | "heart";
export type QRErrorLevel = "L" | "M" | "Q" | "H";
export type QRStatus = "active" | "loading" | "expired" | "scanned";

export interface QRCodeProps extends SkeletonableProps {
  /** Kodlanacak metin (URL, Wi-Fi, vCard…). UTF-8 kodlanır — Türkçe karakter güvenli. */
  value: string;
  /** Kenar uzunluğu: sayı = px, metin = CSS (`"10rem"`). Varsayılan: `"10rem"`. */
  size?: number | string;
  /**
   * Hata düzeltme: L 7% / M 15% / Q 25% / H 30% hasara dayanır. Ortada ikon
   * varsa `H` kullanın. Varsayılan: ikon varsa `H`, yoksa `M`.
   */
  errorLevel?: QRErrorLevel;
  /** Modül (nokta) rengi. Varsayılan: nötr 950 (her temada koyu — okuyucular ters QR'ı çözemeyebilir). */
  color?: string;
  /** Verilirse sol üstten sağ alta gradyan. */
  colorEnd?: string;
  /** Zemin. Varsayılan: beyaz. `"transparent"` verilebilir (arkası açık renkli olmalı). */
  bgColor?: string;
  /** Konum işaretlerinin rengi. Varsayılan: `color`. */
  cornerColor?: string;
  dotType?: QRDotType;
  cornerSquareType?: QRCornerSquareType;
  cornerDotType?: QRCornerDotType;
  /** Ortadaki logo (görsel URL'si). */
  icon?: string;
  /** Logo kenarı, QR kenarına oranla (0.1–0.3). Varsayılan: `0.22`. */
  iconSize?: number;
  /** Kenar boşluğu (modül). Varsayılan: `2` (bordered'da kart dolgusu ek boşluk verir). */
  margin?: number;
  /** İnce kenarlıklı, yuvarlak köşeli kart içinde. Varsayılan: `true`. */
  bordered?: boolean;
  /**
   * `loading`: kod hazırlanıyor. `expired`: süresi doldu, "Yenile" gösterilir
   * (`onRefresh`). `scanned`: telefonda onay bekleniyor. Varsayılan: `active`.
   */
  status?: QRStatus;
  onRefresh?: () => void;
  /** Durum katmanını özel çizmek için. */
  statusRender?: (status: Exclude<QRStatus, "active">) => React.ReactNode;
  /** Erişilebilir ad. Varsayılan: `"QR kod"`. İçeriği metin olarak da verin (ör. altında URL). */
  "aria-label"?: string;
  className?: string;
}
