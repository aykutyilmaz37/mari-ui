import type React from "react";
import { cn, type ColorRole, type Size } from "@mari-ui/core";
import { borderColorClass } from "../lib/colorClasses";
import type { InputShape, InputVariant } from "./types";

const SIZE_CLASS: Record<Size, string> = {
  sm: "text-xs px-2 py-1 h-6",
  md: "text-sm px-3 py-1.5 h-8",
  lg: "text-base px-4 py-2 h-10",
};

const TEXTAREA_SIZE_CLASS: Record<Size, string> = {
  sm: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

export function getSizeClasses(size: Size): string {
  return SIZE_CLASS[size];
}

export function getTextareaSizeClasses(size: Size): string {
  return TEXTAREA_SIZE_CLASS[size];
}

/** Eski "outlined"/"filled"/"borderless" değerlerini yeni eksene çevirir. */
export function resolveLegacyInputVariant(variant: InputVariant | "outlined" | "filled" | "borderless" | undefined): InputVariant {
  if (variant === "outlined") return "outline";
  if (variant === "filled") return "soft";
  if (variant === "borderless") return "ghost";
  return variant ?? "outline";
}

/**
 * Focus halkası rengi `color`'a bağlı — literal `focus-within:border-mari-*`
 * tablosu (bkz. checkbox/utils.ts'teki not: pseudo-class önekleri asla
 * runtime string birleştirmesiyle kurulmaz).
 */
const FOCUS_BORDER_CLASS: Record<ColorRole, string> = {
  primary: "focus-within:border-mari-primary-border",
  accent: "focus-within:border-mari-accent-border",
  success: "focus-within:border-mari-success-border",
  error: "focus-within:border-mari-error-border",
  warning: "focus-within:border-mari-warning-border",
  info: "focus-within:border-mari-info-border",
  neutral: "focus-within:border-mari-neutral-border",
};

export function getVariantClasses(variant: InputVariant, color: ColorRole): string {
  switch (variant) {
    case "outline":
      return cn("border bg-mari-surface text-mari-foreground", borderColorClass[color], FOCUS_BORDER_CLASS[color]);
    case "soft":
      return cn("border bg-mari-surface-alt text-mari-foreground", borderColorClass[color], FOCUS_BORDER_CLASS[color]);
    case "ghost":
      return "border-none bg-transparent";
    case "underlined":
      return cn("border-b bg-transparent rounded-none", borderColorClass[color], FOCUS_BORDER_CLASS[color]);
  }
}

export function getShapeClasses(shape: InputShape): string {
  return { square: "rounded-none", pill: "rounded-full px-4", default: "rounded-md" }[shape];
}

export function isClearable(allowClear: boolean | { clearIcon?: React.ReactNode } | undefined): boolean {
  return typeof allowClear === "boolean" ? allowClear : !!allowClear;
}

/** Checkbox/Radio'dakiyle aynı birleştirme: `status` artık ayrı bir eksen değil, `color`'ın kendisi. */
export function resolveInputColor(color: ColorRole | undefined, status: "error" | "warning" | undefined): ColorRole {
  return status ?? color ?? "primary";
}
