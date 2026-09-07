import type React from "react";
import { cn, type Size } from "@mari-ui/core";
import type { AvatarShape, AvatarSize } from "./types";

const SIZE_PX: Record<Size, number> = { sm: 24, md: 32, lg: 40 };

export function getSizeStyle(size: AvatarSize): React.CSSProperties {
  const px = typeof size === "number" ? size : SIZE_PX[size];
  return { width: px, height: px };
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
