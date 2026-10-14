import React from "react";
import { cn, type Size } from "@mari-ui/core";
import type { SkeletonButtonShape } from "./types";
import { getButtonSkeletonClass, skeletonFill } from "./utils";

export interface SkeletonButtonProps {
  active?: boolean;
  block?: boolean;
  /** Button'ın `shape`'iyle aynı: `default` / `pill` / `circle` / `square` (`round` = `pill`'in eski adı). */
  shape?: SkeletonButtonShape;
  size?: Size;
  className?: string;
}

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function SkeletonButton({ active = false, block = false, shape = "default", size = "md", className }: Readonly<SkeletonButtonProps>) {
  return <div aria-hidden className={cn(skeletonFill(active), getButtonSkeletonClass(size, shape, block), className)} />;
}
