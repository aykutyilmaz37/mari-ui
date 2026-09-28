import type React from "react";
import { cn, type Size } from "@mari-ui/core";
import type { SkeletonAvatarShape } from "./types";
import { skeletonFill } from "../lib/skeleton";

/**
 * Eskiden `getSizeClassSkeleton` sayısal boyutlar için
 * `` `${prefix}-[${size}px]` `` gibi bir template literal üretiyordu — bu,
 * Tailwind'in derleme-zamanı tarayıcısı tarafından asla görülemeyen, çalışma
 * zamanında "üretilen" bir class'tı (bkz. plan Faz 3: bu repodaki en somut
 * "sessizce bozuk" örneklerden biri, Tag ve Loading ile birlikte).
 *
 * Doğru çözüm: SABİT bir boyut skalası (`sm`/`md`/`lg`) için literal
 * Tailwind class'ları, GERÇEKTEN KEYFİ (arbitrary) sayısal/string
 * genişlikler (`title.width`, `paragraph.width`) için ise class değil,
 * inline `style` — çünkü bunlar tüketicinin çalışma zamanı verisidir, bizim
 * derleme zamanımızda bilinemez; Tailwind'in JIT'i olası her değeri
 * önceden üretemez.
 */
export const AVATAR_SIZE_CLASS: Record<Size, string> = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export function getAvatarSizeStyleOrClass(size: number | Size | undefined): {
  className?: string;
  style?: React.CSSProperties;
} {
  if (typeof size === "number") return { style: { width: size, height: size } };
  return { className: AVATAR_SIZE_CLASS[size ?? "md"] };
}

export function getAvatarShapeClass(shape: SkeletonAvatarShape | undefined): string {
  if (shape === "circle") return "rounded-full";
  if (shape === "square") return "rounded-none";
  return "rounded-md";
}

/** Sabit enum olmayan (tüketici verisi) genişlikler için class değil stil döner. */
export function widthToStyle(width: number | string | undefined): React.CSSProperties | undefined {
  if (width === undefined) return undefined;
  return { width: typeof width === "number" ? `${width}px` : width };
}

/**
 * Faz 13.6: iskeletler gerçek bileşenlerin yüksekliğiyle hizalı (Button/Input
 * sm 24 / md 32 / lg 40px) — eskiden md input iskeleti 40px'ti, yüklenince
 * içerik 8px zıplıyordu.
 */
export const INPUT_SIZE_CLASS: Record<Size, string> = {
  sm: "h-6 w-full",
  md: "h-8 w-full",
  lg: "h-10 w-full",
};

export const BUTTON_SIZE_CLASS: Record<Size, string> = {
  sm: "h-6 w-16",
  md: "h-8 w-20",
  lg: "h-10 w-24",
};

export { skeletonFill };

export function getLineClass(round: boolean | undefined, extra?: string, active?: boolean): string {
  return cn(skeletonFill(active), round ? "rounded-full" : "rounded-md", extra);
}
