import React from "react";
import { cn, type Size } from "@mari-ui/core";
import { INPUT_SIZE_CLASS, skeletonFill } from "./utils";

export interface SkeletonInputProps {
  active?: boolean;
  size?: Size;
  className?: string;
}

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function SkeletonInput({ active = false, size = "md", className }: SkeletonInputProps) {
  return (
    <div aria-hidden className={cn(skeletonFill(active), INPUT_SIZE_CLASS[size], className)} />
  );
}
