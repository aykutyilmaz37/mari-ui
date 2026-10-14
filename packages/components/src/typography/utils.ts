import { cn, type ColorRole } from "@mari-ui/core";
import { textClass } from "../lib/colorClasses";
import type { TextWeight, TitleLevel, TypographyEllipsis } from "./types";

/*
 * Eskiden Typography'nin HİÇBİR varsayılan stili yoktu (font boyutu, ağırlık,
 * satır yüksekliği — hiçbiri). Bu, diğer component'lerin AŞIRI stillenmiş
 * olmasıyla tam ters bir dengesizlikti. Burada minimal ama tutarlı bir tip
 * skalası bağlanıyor; derin görsel yeniden tasarım kasıtlı olarak kapsam
 * dışı (plan madde 10 — kullanıcının sonraki fazlara bıraktığı iş).
 */
// Faz 15: h1/h2/h3 mobilde bir adım küçük başlar (375px'te 30px'lik h1 iki
// kelimede kırılıyordu); `text-balance` çok satırlı başlıkta satırları dengeler.
const TITLE_CLASS: Record<TitleLevel, string> = {
  1: "text-2xl sm:text-3xl font-semibold leading-tight tracking-tight",
  2: "text-xl sm:text-2xl font-semibold leading-tight tracking-tight",
  3: "text-lg sm:text-xl font-semibold leading-snug",
  4: "text-lg font-semibold leading-snug",
  5: "text-base font-semibold leading-normal",
  6: "text-sm font-semibold leading-normal",
};

const WEIGHT_CLASS: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const LINE_CLAMP_CLASS = { 2: "line-clamp-2", 3: "line-clamp-3", 4: "line-clamp-4", 5: "line-clamp-5" } as const;

/** `inline`: `Text` bir `<span>` — tek satır kısaltma için satır içi blok olmalı. */
export function getEllipsisClass(ellipsis: TypographyEllipsis | undefined, inline = false): string | undefined {
  if (!ellipsis) return undefined;
  if (ellipsis === true) return cn("truncate", inline && "inline-block max-w-full align-bottom");
  return cn(LINE_CLAMP_CLASS[ellipsis.rows], inline && "inline-block max-w-full");
}

export function getTitleBaseClass(level: TitleLevel): string {
  return cn("font-heading text-balance", TITLE_CLASS[level]);
}

export function getTitleClass(level: TitleLevel, color: ColorRole | undefined, className?: string, ellipsis?: TypographyEllipsis): string {
  return cn(getTitleBaseClass(level), color ? textClass[color] : "text-mari-foreground", getEllipsisClass(ellipsis), className);
}

/**
 * İç içe ternary yerine ayrık fonksiyon — `getTextClass`/`getParagraphClass`teki BİREBİR AYNI
 * mantığı da tek yerde topluyor (ikisi ayrı ayrı yazıyordu).
 */
function resolveMutedOrColorClass(muted: boolean | undefined, color: ColorRole | undefined): string {
  if (muted) return "text-mari-muted";
  return color ? textClass[color] : "text-mari-foreground";
}

export function getTextClass(
  color: ColorRole | undefined,
  weight: TextWeight | undefined,
  muted: boolean | undefined,
  className?: string,
  ellipsis?: TypographyEllipsis
): string {
  return cn("text-sm leading-normal", resolveMutedOrColorClass(muted, color), weight && WEIGHT_CLASS[weight], getEllipsisClass(ellipsis, true), className);
}

export const PARAGRAPH_BASE_CLASS = "text-sm leading-relaxed text-pretty";

export function getParagraphClass(color: ColorRole | undefined, muted: boolean | undefined, className?: string, ellipsis?: TypographyEllipsis): string {
  return cn(PARAGRAPH_BASE_CLASS, resolveMutedOrColorClass(muted, color), getEllipsisClass(ellipsis), className);
}
