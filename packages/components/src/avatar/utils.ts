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

/*
 * Baş harf font-size'ı ve kare köşe yarıçapı kutuyla orantılı büyür. Faz 15'ten
 * beri baş harf İKİ harf ("AY") olabildiği için ant'ın tek-harf ölçeği
 * (14/18/24px) yerine kutunun ~%40'ı kullanılır: 24→10, 32→14, 40→16px.
 * Sayısal (özel px) boyutlarda `md`'nin değerlerine düşülür.
 */
const INITIAL_FONT_SIZE_CLASS: Record<Size, string> = { sm: "text-[0.625rem]", md: "text-sm", lg: "text-base" };
const SQUARE_RADIUS_CLASS: Record<Size, string> = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" };

export function getSizeStyle(size: AvatarSize): React.CSSProperties {
  const dimension = typeof size === "number" ? size : SIZE_REM[size];
  return { width: dimension, height: dimension };
}

export function getInitialFontClass(size: AvatarSize): string {
  return typeof size === "number" ? INITIAL_FONT_SIZE_CLASS.md : INITIAL_FONT_SIZE_CLASS[size];
}

/** Sadece geometri (şekil + radius) — iskelet ve "+N" avatarı da bunu kullanır. */
export function getShapeClasses(shape: AvatarShape, size: AvatarSize): string {
  const squareRadius = typeof size === "number" ? SQUARE_RADIUS_CLASS.md : SQUARE_RADIUS_CLASS[size];
  return cn("flex shrink-0 items-center justify-center overflow-hidden", shape === "circle" ? "rounded-full" : squareRadius);
}

/**
 * İlk + son kelimenin baş harfi ("Aykut Yılmaz" → "AY"); tek kelimede
 * tek harf. Büyük harf Türkçe kurallarıyla ("ilker" → "İ", "I" değil).
 */
export function getInitials(alt: string): string {
  const words = alt.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";
  return (first + last).toLocaleUpperCase("tr");
}
