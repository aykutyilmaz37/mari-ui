import type React from "react";
import { cn, type Size } from "@mari-ui/core";
import type { AvatarShape, AvatarSize } from "./types";

/**
 * Preset boyutlar `rem` — 4K/yüksek-DPI ekranlarda `px` kök font'la
 * ölçeklenmediği için küçük kalıyordu. Değerler `@mari-ui/core` componentSize
 * yükseklikleriyle hizalı (h-6/h-8/h-10 = 1.5/2/2.5rem). `size` bir sayı
 * olarak verilirse (açık kaçış) `px` kabul edilir — çağıranın kararı.
 */
const SIZE_REM: Record<Size, string> = { sm: "1.5rem", md: "2rem", lg: "2.5rem" };

/**
 * ant.design'ın gerçek Avatar'ında (`getComputedStyle`) 24/32/40px kutular
 * için baş harf font-size'ı SABİT DEĞİL, kutuyla orantılı büyüyor
 * (14px/18px/24px = text-sm/text-lg/text-2xl — üçü de kutu boyutuyla tam
 * eşleşen temiz Tailwind adımları) ve kare şeklin köşe yarıçapı da aynı
 * şekilde ölçekleniyor (4/6/8px = rounded/rounded-md/rounded-lg). Eskiden
 * ikisi de sabitti (`text-sm`, `rounded-sm`) — `lg` avatarda baş harf küçük
 * kalıyor, kare köşeler orantısız kalınlaşmıyordu. Sayısal (özel px) boyutlar
 * için net bir ölçek yok — `md`'nin değerlerine düşülür.
 */
const INITIAL_FONT_SIZE_CLASS: Record<Size, string> = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };
const SQUARE_RADIUS_CLASS: Record<Size, string> = { sm: "rounded", md: "rounded-md", lg: "rounded-lg" };

export function getSizeStyle(size: AvatarSize): React.CSSProperties {
  const dimension = typeof size === "number" ? size : SIZE_REM[size];
  return { width: dimension, height: dimension };
}

export function getInitialFontClass(size: AvatarSize): string {
  return typeof size === "number" ? INITIAL_FONT_SIZE_CLASS.md : INITIAL_FONT_SIZE_CLASS[size];
}

export function getShapeClasses(shape: AvatarShape, size: AvatarSize): string {
  const squareRadius = typeof size === "number" ? SQUARE_RADIUS_CLASS.md : SQUARE_RADIUS_CLASS[size];
  return cn(
    "flex items-center justify-center overflow-hidden bg-mari-surface-alt shrink-0",
    shape === "circle" && "rounded-full",
    shape === "square" && squareRadius
  );
}

export function getInitial(alt: string): string {
  return alt.charAt(0).toUpperCase();
}
