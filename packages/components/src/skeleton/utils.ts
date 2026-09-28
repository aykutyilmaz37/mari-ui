import type React from "react";
import { cn, type Size } from "@mari-ui/core";
import type { SkeletonButtonShape } from "./types";
import { skeletonFill } from "../lib/skeleton";

export { getShapeClasses as getAvatarShapeClasses, getSizeStyle as getAvatarSizeStyle } from "../avatar/utils";

/**
 * Faz 15.6 — iskelet parçalarının geometrisi GERÇEK bileşenlerden gelir ki
 * yüklenince zıplamasın. Eskiden kendi tabloları vardı ve kaymıştı:
 * - Avatar iskeleti 32/48/64px, varsayılanı yuvarlatılmış kareydi; Avatar
 *   24/32/40px ve varsayılanı daire → artık `avatar/utils`'in kendisi.
 * - Button/Input `sm` iskeleti `rounded-md`, gerçeği `rounded-sm` (lib
 *   `sizeClass`).
 * - `SkeletonButton shape="circle"` 80×32 bir hap çiziyordu; Button'ın
 *   `circle`'ı kare-daire.
 *
 * Sabit enum olmayan (tüketici verisi) genişlikler class değil inline stil —
 * Tailwind derleme zamanında olası her değeri üretemez.
 */

/** lib `sizeClass` ile aynı yükseklik + radius (Button, Input). */
const CONTROL_BOX_CLASS: Record<Size, string> = {
  sm: "h-6 rounded-sm",
  md: "h-8 rounded-md",
  lg: "h-10 rounded-md",
};

export const INPUT_SIZE_CLASS: Record<Size, string> = {
  sm: cn(CONTROL_BOX_CLASS.sm, "w-full"),
  md: cn(CONTROL_BOX_CLASS.md, "w-full"),
  lg: cn(CONTROL_BOX_CLASS.lg, "w-full"),
};

const BUTTON_WIDTH_CLASS: Record<Size, string> = { sm: "w-16", md: "w-20", lg: "w-24" };
/** Button `circle` = kare-daire: genişlik = yükseklik. */
const CIRCLE_SIZE_CLASS: Record<Size, string> = { sm: "size-6", md: "size-8", lg: "size-10" };

/** Button'ın `getShapeClasses`'ıyla aynı şekiller (`round` = eski ad, `pill`). */
export function getButtonSkeletonClass(size: Size, shape: SkeletonButtonShape, block: boolean): string {
  if (shape === "circle") return cn(CIRCLE_SIZE_CLASS[size], "rounded-full");
  return cn(
    CONTROL_BOX_CLASS[size],
    block ? "w-full" : BUTTON_WIDTH_CLASS[size],
    (shape === "pill" || shape === "round") && "rounded-full",
    shape === "square" && "rounded-none"
  );
}

export function widthToStyle(width: number | string | undefined): React.CSSProperties | undefined {
  if (width === undefined) return undefined;
  return { width: typeof width === "number" ? `${width}px` : width };
}

export { skeletonFill };

export function getLineClass(round: boolean | undefined, extra?: string, active?: boolean): string {
  return cn(skeletonFill(active), round ? "rounded-full" : "rounded-md", extra);
}
