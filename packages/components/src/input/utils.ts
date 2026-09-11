import type React from "react";
import { cn, type ColorRole, type Size } from "@mari-ui/core";
import { borderColorClass } from "../lib/colorClasses";
import { sizeClass } from "../lib/sizeClasses";
import type { InputShape, InputVariant } from "./types";

/**
 * Kendi `SIZE_CLASS`/`TEXTAREA_SIZE_CLASS` tabloları vardı — `lib.sizeClass`
 * ile SAYISAL OLARAK zaten birebir aynıydı (yükseklik/padding/font). Faz 13
 * gereği tek kaynağa bağlandı; rakip tablo silindi.
 */
export function getSizeClasses(size: Size): string {
  return sizeClass[size];
}

/** Textarea çok satırlı olduğu için sabit `h-*` almaz — geri kalan (padding/font/gap/radius) aynı ölçekten. */
export function getTextareaSizeClasses(size: Size): string {
  return cn(sizeClass[size], "h-auto");
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

/**
 * Kullanıcı geri bildirimi (Faz 13): `color` verilmediyse (yani gerçek bir
 * doğrulama durumu YOKSA) dinlenme halindeki kenarlık HER ZAMAN nötr/gri
 * olmalı (`border-mari-input` — Faz 13.0a'da tam bunun için eklenen ama o
 * zamana kadar hiç tüketilmeyen token) — eskiden varsayılan `"primary"`e
 * düşüp her input'u sürekli mavi gösteriyordu. Odaklanınca `primary`e döner.
 * `color` AÇIKÇA verildiyse (örn. `error`/`warning` doğrulama durumu) o renk
 * dinlenme halinde de kalıcıdır — odak beklemeden görünür olmalı.
 */
export function getVariantClasses(variant: InputVariant, color: ColorRole | undefined): string {
  const restBorderClass = color ? borderColorClass[color] : "border-mari-input";
  const focusBorderClass = FOCUS_BORDER_CLASS[color ?? "primary"];

  switch (variant) {
    case "outline":
      return cn("border bg-mari-surface text-mari-foreground", restBorderClass, focusBorderClass);
    case "soft":
      return cn("border bg-mari-surface-alt text-mari-foreground", restBorderClass, focusBorderClass);
    case "ghost":
      return "border-none bg-transparent";
    case "underlined":
      return cn("border-b bg-transparent rounded-none", restBorderClass, focusBorderClass);
  }
}

export function getShapeClasses(shape: InputShape): string {
  return { square: "rounded-none", pill: "rounded-full px-4", default: "rounded-md" }[shape];
}

export function isClearable(allowClear: boolean | { clearIcon?: React.ReactNode } | undefined): boolean {
  return typeof allowClear === "boolean" ? allowClear : !!allowClear;
}

/**
 * Checkbox/Radio'dakiyle aynı birleştirme: `status` artık ayrı bir eksen
 * değil, `color`'ın kendisi. `undefined` dönebilir — bu "renk AÇIKÇA
 * verilmedi, varsayılan (nötr/gri dinlenme + odakta primary) davranış
 * geçerli" anlamına gelir (bkz. `getVariantClasses`). Eskiden burada
 * `?? "primary"` vardı, bu da "verilmedi" ile "primary açıkça seçildi"
 * ayrımını kaybediyor, her input'u sürekli mavi gösteriyordu.
 */
export function resolveInputColor(color: ColorRole | undefined, status: "error" | "warning" | undefined): ColorRole | undefined {
  return status ?? color;
}
