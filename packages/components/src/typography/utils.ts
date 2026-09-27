import { cn, type ColorRole } from "@mari-ui/core";
import { textClass } from "../lib/colorClasses";
import type { TextWeight, TitleLevel } from "./types";

/**
 * Eskiden Typography'nin HİÇBİR varsayılan stili yoktu (font boyutu, ağırlık,
 * satır yüksekliği — hiçbiri). Bu, diğer component'lerin AŞIRI stillenmiş
 * olmasıyla tam ters bir dengesizlikti. Burada minimal ama tutarlı bir tip
 * skalası bağlanıyor; derin görsel yeniden tasarım kasıtlı olarak kapsam
 * dışı (plan madde 10 — kullanıcının sonraki fazlara bıraktığı iş).
 */
const TITLE_CLASS: Record<TitleLevel, string> = {
  1: "text-3xl font-semibold leading-tight",
  2: "text-2xl font-semibold leading-tight",
  3: "text-xl font-semibold leading-snug",
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

export function getTitleClass(level: TitleLevel, color: ColorRole | undefined, className?: string): string {
  return cn("font-heading", TITLE_CLASS[level], color ? textClass[color] : "text-mari-foreground", className);
}

/**
 * İç içe ternary yerine ayrık fonksiyon (Faz 8, SonarJS `no-nested-
 * conditional`) — `getTextClass`/`getParagraphClass`teki BİREBİR AYNI
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
  className?: string
): string {
  return cn("text-sm leading-normal", resolveMutedOrColorClass(muted, color), weight && WEIGHT_CLASS[weight], className);
}

export function getParagraphClass(color: ColorRole | undefined, muted: boolean | undefined, className?: string): string {
  return cn("text-sm leading-relaxed", resolveMutedOrColorClass(muted, color), className);
}
