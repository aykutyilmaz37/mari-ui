import React from "react";
import { cn, type Size } from "@mari-ui/core";
import type { SkeletonButtonShape } from "./types";
import { BUTTON_SIZE_CLASS, skeletonFill } from "./utils";

export interface SkeletonButtonProps {
  active?: boolean;
  block?: boolean;
  shape?: SkeletonButtonShape;
  size?: Size;
  className?: string;
}

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function SkeletonButton({ active = false, block = false, shape = "default", size = "md", className }: SkeletonButtonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        skeletonFill(active),
        BUTTON_SIZE_CLASS[size],
        shape === "circle" && "rounded-full",
        shape === "round" && "rounded-lg",
        shape === "square" && "rounded-none",
        shape === "default" && "rounded-md",
        block && "w-full",
        className
      )}
    />
  );
}
