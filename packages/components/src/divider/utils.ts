import type React from "react";
import { cn, type Size } from "@mari-ui/core";
import { fontSizeClass } from "../lib/sizeClasses";
import type { DividerLabelAlign, DividerLineStyle } from "./types";

export function getBaseClass(isHorizontal: boolean, size: Size | undefined, className?: string): string {
  return cn(
    "flex",
    // Divider'ın KENDİ varsayılan boşluğu var — yatayda dikey (`my-4`),
    // dikeyde yatay (`mx-3`) — böylece komşu içeriğe yapışmaz. `cn`
    // (twMerge) sayesinde tüketici `className`'iyle (`my-2`, `mx-0` …)
    // ezilebilir.
    isHorizontal ? "w-full items-center my-4" : "h-full flex-col justify-center mx-3",
    size && fontSizeClass[size],
    className
  );
}

/**
 * Çizgi stili class'ı — çizgiyi çizen elemana (kapsayıcıya DEĞİL) uygulanır.
 * `border-style` CSS'te `inherit` edilmez.
 */
export function getLineClass(lineStyle: DividerLineStyle | undefined): string {
  if (lineStyle === "dashed") return "border-dashed";
  if (lineStyle === "dotted") return "border-dotted";
  return "border-solid";
}

export function getLabelClass(plain: boolean | undefined, isHorizontal: boolean): string {
  return cn(
    // Faz 15: `whitespace-nowrap` kaldırıldı — 375px'te uzun bir etiket
    // kapsayıcıdan taşıp yatay kaydırma üretiyordu. Artık etiket kırılır ve
    // ortalanır; çizgi parçaları `min-w-6` ile görünür kalır.
    isHorizontal ? "min-w-0 px-3 text-center text-balance" : "py-2 whitespace-nowrap",
    // "text-muted-500" -> gerçek bir token değildi (tema'da hiç yoktu, sessizce
    // no-op'tu). Nötr rolün `text` slotu bunun yerine geçiyor.
    plain ? "text-mari-neutral" : "text-mari-foreground font-medium"
  );
}

export function getLabelMarginStyle(
  labelAlign: DividerLabelAlign | undefined,
  labelMargin: string | number | undefined,
  isHorizontal: boolean
): React.CSSProperties {
  if (labelAlign === "center" || !labelMargin || !isHorizontal) return {};
  const marginValue = typeof labelMargin === "number" ? `${labelMargin}px` : labelMargin;
  return labelAlign === "start" ? { marginRight: marginValue } : { marginLeft: marginValue };
}
