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

export function getSizeStyle(size: AvatarSize): React.CSSProperties {
  const dimension = typeof size === "number" ? size : SIZE_REM[size];
  return { width: dimension, height: dimension };
}

export function getShapeClasses(shape: AvatarShape): string {
  return cn(
    "flex items-center justify-center overflow-hidden bg-mari-surface-alt shrink-0",
    shape === "circle" && "rounded-full",
    shape === "square" && "rounded-sm"
  );
}

export function getInitial(alt: string): string {
  return alt.charAt(0).toUpperCase();
}
